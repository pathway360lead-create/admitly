# Payment Integration Specification (Paystack)

## Overview
Complete Paystack payment integration specification for subscription billing on the Nigeria Student Data Services Platform.

---

## 1. Paystack Configuration

### 1.1 Account Setup
- **Website:** https://paystack.com
- **Account Type:** Business
- **Business Name:** Admitly
- **Settlement Account:** Nigerian bank account

### 1.2 API Keys
```bash
# Test Environment
PAYSTACK_PUBLIC_KEY_TEST=pk_test_xxxxx
PAYSTACK_SECRET_KEY_TEST=sk_test_xxxxx

# Production Environment
PAYSTACK_PUBLIC_KEY=pk_live_xxxxx
PAYSTACK_SECRET_KEY=sk_live_xxxxx
```

---

## 2. Subscription Tiers

### 2.1 Pricing
| Tier | Price (Naira) | Price (Kobo) | Duration | Features |
|------|---------------|--------------|----------|----------|
| Free | ₦0 | 0 | Forever | Search, browse, compare |
| Monthly | ₦1,500 | 150,000 | 30 days | AI chat, alerts, exports |
| Yearly | ₦15,000 | 1,500,000 | 365 days | AI chat, alerts, exports, save ₦3,000 |

### 2.2 Paystack Fees
- **Card payments:** 1.5% + ₦100 (capped at ₦2,000)
- **Bank transfer:** ₦50 flat fee
- **USSD:** ₦50 flat fee

**Example:**
- Monthly (₦1,500): Fee = ₦100 (₦1,500 * 1.5% = ₦22.50, minimum is ₦100)
- Yearly (₦15,000): Fee = ₦325 (₦15,000 * 1.5% + ₦100 = ₦325)

---

## 3. Payment Flow

### 3.1 Standard Flow

```
┌─────────────┐
│   User      │
│ selects     │
│ Premium     │
└──────┬──────┘
       │
       ▼
┌─────────────────────┐
│ Frontend initiates  │
│ payment             │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Backend creates     │
│ transaction record  │
│ & calls Paystack    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Paystack returns    │
│ authorization_url   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User redirected to  │
│ Paystack checkout   │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User completes      │
│ payment (card/bank) │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Paystack webhook    │
│ notifies backend    │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ Backend verifies    │
│ payment & grants    │
│ premium access      │
└──────┬──────────────┘
       │
       ▼
┌─────────────────────┐
│ User redirected     │
│ back with success   │
└─────────────────────┘
```

---

## 4. Implementation

### 4.1 Initialize Payment (Frontend)

```typescript
// services/payment.ts
import { supabase } from './supabase';

export async function initializePayment(tier: 'monthly' | 'yearly') {
  try {
    // Call backend to initialize payment
    const response = await fetch('/api/v1/payments/initialize', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({ subscription_tier: tier })
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    // Redirect to Paystack checkout
    window.location.href = data.data.authorization_url;

  } catch (error) {
    console.error('Payment initialization failed:', error);
    throw error;
  }
}

// Usage in component
function PricingCard({ tier }: { tier: 'monthly' | 'yearly' }) {
  const [loading, setLoading] = useState(false);

  const handleSubscribe = async () => {
    setLoading(true);
    try {
      await initializePayment(tier);
    } catch (error) {
      toast.error('Payment initialization failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <button onClick={handleSubscribe} disabled={loading}>
      {loading ? 'Processing...' : `Subscribe ${tier}`}
    </button>
  );
}
```

### 4.2 Initialize Payment (Backend)

```python
# routes/payments.py
from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
import httpx
import os
from datetime import datetime, timedelta
import uuid

router = APIRouter(prefix="/api/v1/payments", tags=["payments"])

PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')
PAYSTACK_BASE_URL = "https://api.paystack.co"

class InitializePaymentRequest(BaseModel):
    subscription_tier: str  # 'monthly' or 'yearly'

class InitializePaymentResponse(BaseModel):
    transaction_id: str
    paystack_reference: str
    authorization_url: str
    access_code: str
    amount: int  # in kobo

@router.post("/initialize", response_model=InitializePaymentResponse)
async def initialize_payment(
    request: InitializePaymentRequest,
    current_user: dict = Depends(get_current_user)
):
    """Initialize payment with Paystack"""
    user_id = current_user['user_id']
    user_email = current_user['email']

    # Determine amount based on tier
    amounts = {
        'monthly': 150000,  # ₦1,500 in kobo
        'yearly': 1500000   # ₦15,000 in kobo
    }

    if request.subscription_tier not in amounts:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid subscription tier"
        )

    amount = amounts[request.subscription_tier]
    reference = f"txn_{uuid.uuid4().hex[:16]}"

    # Create transaction record in database (status: pending)
    transaction = supabase.table('transactions').insert({
        'id': str(uuid.uuid4()),
        'user_id': user_id,
        'amount': amount,
        'currency': 'NGN',
        'description': f'{request.subscription_tier.capitalize()} subscription',
        'paystack_reference': reference,
        'status': 'pending',
        'subscription_tier': request.subscription_tier,
        'metadata': {
            'callback_url': f"https://admitly.com.ng/payment/callback?reference={reference}"
        }
    }).execute()

    transaction_id = transaction.data[0]['id']

    # Initialize payment with Paystack
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYSTACK_BASE_URL}/transaction/initialize",
            headers={
                'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}',
                'Content-Type': 'application/json'
            },
            json={
                'email': user_email,
                'amount': amount,  # in kobo
                'reference': reference,
                'callback_url': f"https://admitly.com.ng/payment/callback",
                'metadata': {
                    'user_id': user_id,
                    'subscription_tier': request.subscription_tier,
                    'transaction_id': transaction_id
                },
                'channels': ['card', 'bank', 'ussd', 'mobile_money']
            }
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to initialize payment with Paystack"
        )

    paystack_data = response.json()['data']

    return InitializePaymentResponse(
        transaction_id=transaction_id,
        paystack_reference=reference,
        authorization_url=paystack_data['authorization_url'],
        access_code=paystack_data['access_code'],
        amount=amount
    )
```

### 4.3 Verify Payment

```python
# routes/payments.py
@router.get("/verify/{reference}")
async def verify_payment(
    reference: str,
    current_user: dict = Depends(get_current_user)
):
    """Verify payment with Paystack"""

    # Verify with Paystack API
    async with httpx.AsyncClient() as client:
        response = await client.get(
            f"{PAYSTACK_BASE_URL}/transaction/verify/{reference}",
            headers={'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}'}
        )

    if response.status_code != 200:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Payment verification failed"
        )

    paystack_data = response.json()['data']

    # Check payment status
    if paystack_data['status'] != 'success':
        return {
            'success': False,
            'message': 'Payment not successful',
            'status': paystack_data['status']
        }

    # Get transaction from database
    transaction = supabase.table('transactions').select('*').eq(
        'paystack_reference', reference
    ).single().execute()

    if not transaction.data:
        raise HTTPException(status_code=404, detail="Transaction not found")

    txn = transaction.data

    # Check if already processed
    if txn['status'] == 'success':
        return {
            'success': True,
            'message': 'Payment already processed',
            'transaction_id': txn['id']
        }

    # Calculate subscription dates
    tier = txn['subscription_tier']
    start_date = datetime.now()
    end_date = start_date + timedelta(days=30 if tier == 'monthly' else 365)

    # Update transaction status
    supabase.table('transactions').update({
        'status': 'success',
        'paystack_transaction_id': paystack_data['id'],
        'payment_method': paystack_data['channel'],
        'paid_at': paystack_data['paid_at'],
        'subscription_start_date': start_date.isoformat(),
        'subscription_end_date': end_date.isoformat()
    }).eq('id', txn['id']).execute()

    # Update user subscription
    supabase.table('user_profiles').update({
        'subscription_status': 'active',
        'subscription_tier': tier,
        'subscription_start_date': start_date.isoformat(),
        'subscription_end_date': end_date.isoformat(),
        'role': 'premium'
    }).eq('id', txn['user_id']).execute()

    # Send confirmation email
    send_subscription_confirmation_email(txn['user_id'], tier, end_date)

    return {
        'success': True,
        'data': {
            'transaction_id': txn['id'],
            'status': 'success',
            'amount': txn['amount'],
            'subscription_start_date': start_date.isoformat(),
            'subscription_end_date': end_date.isoformat()
        }
    }
```

### 4.4 Webhook Handler

```python
# routes/webhooks.py
import hmac
import hashlib
from fastapi import APIRouter, Request, HTTPException, status

router = APIRouter(prefix="/api/v1/webhooks", tags=["webhooks"])

PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')

async def verify_paystack_signature(request: Request):
    """Verify Paystack webhook signature"""
    signature = request.headers.get('x-paystack-signature')
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    body = await request.body()

    # Compute HMAC SHA-512
    mac = hmac.new(
        PAYSTACK_SECRET_KEY.encode('utf-8'),
        msg=body,
        digestmod=hashlib.sha512
    )
    expected_signature = mac.hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True

@router.post("/paystack")
async def paystack_webhook(
    request: Request,
    verified: bool = Depends(verify_paystack_signature)
):
    """Handle Paystack webhooks"""
    data = await request.json()
    event = data['event']
    payload = data['data']

    logger.info(f"Paystack webhook received: {event}")

    if event == 'charge.success':
        await handle_charge_success(payload)

    elif event == 'charge.failed':
        await handle_charge_failed(payload)

    elif event == 'subscription.disable':
        await handle_subscription_disable(payload)

    return {"status": "success"}

async def handle_charge_success(payload: dict):
    """Handle successful payment"""
    reference = payload['reference']

    # Update transaction
    supabase.table('transactions').update({
        'status': 'success',
        'paystack_transaction_id': payload['id'],
        'payment_method': payload['channel'],
        'paid_at': payload['paid_at']
    }).eq('paystack_reference', reference).execute()

    # Get transaction to update user
    txn = supabase.table('transactions').select('*').eq(
        'paystack_reference', reference
    ).single().execute()

    if txn.data:
        # Grant premium access
        tier = txn.data['subscription_tier']
        duration = 30 if tier == 'monthly' else 365

        supabase.table('user_profiles').update({
            'subscription_status': 'active',
            'subscription_tier': tier,
            'role': 'premium',
            'subscription_start_date': datetime.now().isoformat(),
            'subscription_end_date': (datetime.now() + timedelta(days=duration)).isoformat()
        }).eq('id', txn.data['user_id']).execute()

        # Send confirmation email
        send_subscription_confirmation_email(txn.data['user_id'], tier)

async def handle_charge_failed(payload: dict):
    """Handle failed payment"""
    reference = payload['reference']

    supabase.table('transactions').update({
        'status': 'failed',
        'metadata': {'failure_reason': payload.get('message')}
    }).eq('paystack_reference', reference).execute()

async def handle_subscription_disable(payload: dict):
    """Handle subscription cancellation"""
    # Implementation for recurring subscriptions (future feature)
    pass
```

---

## 5. Payment Callback Page

```typescript
// pages/payment/callback.tsx
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';

export default function PaymentCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const reference = searchParams.get('reference');

  const [status, setStatus] = useState<'verifying' | 'success' | 'failed'>('verifying');
  const [message, setMessage] = useState('Verifying payment...');

  useEffect(() => {
    if (!reference) {
      router.push('/pricing');
      return;
    }

    verifyPayment();
  }, [reference]);

  const verifyPayment = async () => {
    try {
      const response = await fetch(`/api/v1/payments/verify/${reference}`, {
        headers: {
          'Authorization': `Bearer ${(await supabase.auth.getSession()).data.session?.access_token}`
        }
      });

      const data = await response.json();

      if (data.success) {
        setStatus('success');
        setMessage('Payment successful! Welcome to Premium.');

        // Refresh session to update user role
        await supabase.auth.refreshSession();

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          router.push('/dashboard');
        }, 3000);
      } else {
        setStatus('failed');
        setMessage('Payment verification failed. Please contact support.');
      }

    } catch (error) {
      setStatus('failed');
      setMessage('An error occurred. Please contact support.');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-lg">{message}</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="text-green-600 text-6xl mb-4">✓</div>
            <h1 className="text-2xl font-bold mb-2">Payment Successful!</h1>
            <p className="text-gray-600">{message}</p>
            <p className="text-sm text-gray-500 mt-4">Redirecting to dashboard...</p>
          </>
        )}

        {status === 'failed' && (
          <>
            <div className="text-red-600 text-6xl mb-4">✗</div>
            <h1 className="text-2xl font-bold mb-2">Payment Failed</h1>
            <p className="text-gray-600">{message}</p>
            <button
              onClick={() => router.push('/pricing')}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg"
            >
              Try Again
            </button>
          </>
        )}
      </div>
    </div>
  );
}
```

---

## 6. Subscription Management

### 6.1 Check Subscription Status

```python
# utils/subscription.py
from datetime import datetime

def is_subscription_active(user_profile: dict) -> bool:
    """Check if user subscription is active"""
    if user_profile['subscription_status'] != 'active':
        return False

    end_date = datetime.fromisoformat(user_profile['subscription_end_date'])
    return end_date > datetime.now()

# Middleware to check premium access
async def require_premium(current_user: dict = Depends(get_current_user)):
    """Require premium subscription"""
    profile = supabase.table('user_profiles').select('*').eq(
        'id', current_user['user_id']
    ).single().execute()

    if not is_subscription_active(profile.data):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Premium subscription required"
        )

    return current_user

# Protected route
@app.post("/api/v1/ai/conversations")
async def create_conversation(
    current_user: dict = Depends(require_premium)
):
    # Premium-only feature
    pass
```

### 6.2 Cancel Subscription

```typescript
// services/subscription.ts
export async function cancelSubscription() {
  const { data, error } = await supabase
    .table('user_profiles')
    .update({
      subscription_status: 'cancelled',
      // End date remains the same (subscription active until expiry)
    })
    .eq('id', userId);

  if (error) throw error;

  return data;
}
```

### 6.3 Renew Subscription (Automatic)

```python
# jobs/subscription_renewal.py
from apscheduler.schedulers.asyncio import AsyncIOScheduler

scheduler = AsyncIOScheduler()

@scheduler.scheduled_job('cron', hour='0', minute='0')  # Daily at midnight
async def check_expiring_subscriptions():
    """Check for expiring subscriptions and send reminders"""

    # Find subscriptions expiring in 7 days
    seven_days = (datetime.now() + timedelta(days=7)).isoformat()

    expiring_soon = supabase.table('user_profiles').select('*').eq(
        'subscription_status', 'active'
    ).lte('subscription_end_date', seven_days).execute()

    for user in expiring_soon.data:
        # Send renewal reminder email
        send_renewal_reminder(user['id'], user['subscription_end_date'])

@scheduler.scheduled_job('cron', hour='1', minute='0')  # Daily at 1 AM
async def expire_subscriptions():
    """Expire subscriptions that have ended"""

    now = datetime.now().isoformat()

    expired = supabase.table('user_profiles').select('*').eq(
        'subscription_status', 'active'
    ).lt('subscription_end_date', now).execute()

    for user in expired.data:
        # Update status
        supabase.table('user_profiles').update({
            'subscription_status': 'expired',
            'role': 'student'  # Downgrade to free tier
        }).eq('id', user['id']).execute()

        # Send expiry notification
        send_expiry_notification(user['id'])

scheduler.start()
```

---

## 7. Transaction History

```python
# routes/payments.py
@router.get("/transactions")
async def get_transactions(
    current_user: dict = Depends(get_current_user),
    page: int = 1,
    page_size: int = 20
):
    """Get user transaction history"""
    offset = (page - 1) * page_size

    result = supabase.table('transactions').select('*').eq(
        'user_id', current_user['user_id']
    ).order('created_at', desc=True).range(offset, offset + page_size - 1).execute()

    return {
        'success': True,
        'data': result.data,
        'pagination': {
            'page': page,
            'page_size': page_size,
            'total': len(result.data)
        }
    }
```

---

## 8. Email Notifications

### 8.1 Payment Confirmation
```python
# services/email.py
def send_subscription_confirmation_email(user_id: str, tier: str, end_date: datetime):
    """Send subscription confirmation email"""
    user = get_user(user_id)

    subject = "Welcome to Admitly Premium!"
    body = f"""
    Hi {user.full_name},

    Thank you for subscribing to Admitly Premium ({tier})!

    Your subscription is now active and will expire on {end_date.strftime('%B %d, %Y')}.

    You now have access to:
    ✓ AI-powered career guidance
    ✓ Personalized program recommendations
    ✓ Deadline alerts
    ✓ Exportable reports
    ✓ Priority support

    Get started: https://admitly.com.ng/dashboard

    Questions? Reply to this email or visit our help center.

    Best regards,
    The Admitly Team
    """

    send_email(user.email, subject, body)
```

### 8.2 Renewal Reminder
```python
def send_renewal_reminder(user_id: str, end_date: str):
    """Send renewal reminder"""
    user = get_user(user_id)

    subject = "Your Admitly Premium subscription expires soon"
    body = f"""
    Hi {user.full_name},

    Your Admitly Premium subscription will expire on {end_date}.

    To continue enjoying premium features, please renew your subscription:
    https://admitly.com.ng/pricing

    Best regards,
    The Admitly Team
    """

    send_email(user.email, subject, body)
```

---

## 9. Refund Policy

**Policy:**
- 7-day money-back guarantee
- No questions asked
- Refund processed within 5-7 business days

**Implementation:**
```python
@router.post("/refund/{transaction_id}")
async def request_refund(
    transaction_id: str,
    reason: str,
    current_user: dict = Depends(get_current_user)
):
    """Request refund"""
    # Get transaction
    txn = supabase.table('transactions').select('*').eq('id', transaction_id).single().execute()

    # Verify ownership
    if txn.data['user_id'] != current_user['user_id']:
        raise HTTPException(status_code=403, detail="Unauthorized")

    # Check if within 7 days
    paid_at = datetime.fromisoformat(txn.data['paid_at'])
    if (datetime.now() - paid_at).days > 7:
        raise HTTPException(status_code=400, detail="Refund period expired")

    # Initiate refund with Paystack
    async with httpx.AsyncClient() as client:
        response = await client.post(
            f"{PAYSTACK_BASE_URL}/refund",
            headers={'Authorization': f'Bearer {PAYSTACK_SECRET_KEY}'},
            json={
                'transaction': txn.data['paystack_transaction_id'],
                'amount': txn.data['amount'],
                'merchant_note': f"Refund requested: {reason}"
            }
        )

    if response.status_code == 200:
        # Update transaction
        supabase.table('transactions').update({
            'status': 'refunded',
            'metadata': {'refund_reason': reason}
        }).eq('id', transaction_id).execute()

        # Revoke premium access
        supabase.table('user_profiles').update({
            'subscription_status': 'cancelled',
            'role': 'student'
        }).eq('id', current_user['user_id']).execute()

        return {'success': True, 'message': 'Refund initiated'}

    raise HTTPException(status_code=500, detail="Refund failed")
```

---

## 10. Testing

### 10.1 Paystack Test Cards

**Success:**
- Card: `4084 0840 8408 4081`
- CVV: `408`
- Expiry: Any future date
- PIN: `0000`
- OTP: `123456`

**Insufficient Funds:**
- Card: `5060 6666 6666 6666 666`

**Declined:**
- Card: `5078 5078 5078 5078 04`

### 10.2 Test Workflow
```bash
# 1. Initialize payment
curl -X POST http://localhost:8000/api/v1/payments/initialize \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"subscription_tier": "monthly"}'

# 2. Complete payment on Paystack (manually in browser)

# 3. Verify payment
curl http://localhost:8000/api/v1/payments/verify/$REFERENCE \
  -H "Authorization: Bearer $TOKEN"

# 4. Check user subscription
curl http://localhost:8000/api/v1/users/me \
  -H "Authorization: Bearer $TOKEN"
```

---

## Next Steps
1. Set up Paystack account
2. Get API keys (test & production)
3. Implement payment initialization
4. Set up webhook endpoint
5. Test with test cards
6. Implement subscription management
7. Set up email notifications
8. Go live with production keys
