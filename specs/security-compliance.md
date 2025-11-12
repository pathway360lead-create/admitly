# Security & Compliance Specification

## Overview
Comprehensive security and compliance specification for the Nigeria Student Data Services Platform, covering authentication, authorization, data protection, and NDPR compliance.

---

## 1. Authentication & Authorization

### 1.1 Supabase Auth Configuration

**Authentication Methods:**
```javascript
// Email/Password
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'SecureP@ssw0rd!',
  options: {
    data: {
      full_name: 'John Doe',
      state: 'Lagos'
    }
  }
})

// OAuth (Google)
const { data, error } = await supabase.auth.signInWithOAuth({
  provider: 'google',
  options: {
    redirectTo: 'https://admitly.com.ng/auth/callback'
  }
})

// Magic Link (Passwordless)
const { data, error } = await supabase.auth.signInWithOtp({
  email: 'user@example.com',
  options: {
    emailRedirectTo: 'https://admitly.com.ng/auth/confirm'
  }
})
```

### 1.2 Password Requirements

**Policy:**
- Minimum 8 characters
- At least one uppercase letter
- At least one lowercase letter
- At least one number
- At least one special character
- Not in common passwords list
- Not similar to email

**Implementation:**
```python
# validation/password.py
import re
from typing import Tuple

COMMON_PASSWORDS = [
    'password', '12345678', 'password123', 'qwerty', ...
]

def validate_password(password: str, email: str = None) -> Tuple[bool, str]:
    """Validate password against policy"""

    if len(password) < 8:
        return False, "Password must be at least 8 characters"

    if not re.search(r'[A-Z]', password):
        return False, "Password must contain uppercase letter"

    if not re.search(r'[a-z]', password):
        return False, "Password must contain lowercase letter"

    if not re.search(r'\d', password):
        return False, "Password must contain number"

    if not re.search(r'[!@#$%^&*(),.?":{}|<>]', password):
        return False, "Password must contain special character"

    if password.lower() in COMMON_PASSWORDS:
        return False, "Password is too common"

    if email and email.split('@')[0].lower() in password.lower():
        return False, "Password cannot contain email"

    return True, "Password is valid"
```

### 1.3 JWT Token Management

**Token Structure:**
```json
{
  "sub": "user-uuid",
  "email": "user@example.com",
  "role": "premium",
  "aud": "authenticated",
  "exp": 1704902400,
  "iat": 1704816000,
  "app_metadata": {
    "subscription_status": "active",
    "subscription_tier": "monthly"
  }
}
```

**Token Verification (FastAPI):**
```python
# auth/jwt.py
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import jwt, JWTError
import httpx

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verify JWT token and extract user info"""
    token = credentials.credentials

    try:
        # Get Supabase JWT public key
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{SUPABASE_URL}/auth/v1/jwks")
            jwks = response.json()

        # Verify token
        payload = jwt.decode(
            token,
            jwks,
            algorithms=["RS256"],
            audience="authenticated"
        )

        return {
            "user_id": payload["sub"],
            "email": payload["email"],
            "role": payload.get("role", "student")
        }

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )

# Protected route example
@app.get("/api/v1/users/me")
async def get_profile(current_user: dict = Depends(get_current_user)):
    return current_user
```

### 1.4 Session Management

**Configuration:**
- Access token TTL: 1 hour
- Refresh token TTL: 7 days (web), 30 days (mobile)
- Automatic refresh before expiry
- Revoke tokens on logout
- Revoke all sessions on password change

**Implementation:**
```typescript
// auth/session.ts
import { supabase } from './supabase'

// Auto-refresh tokens
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Token refreshed:', session)
  }
  if (event === 'SIGNED_OUT') {
    // Clear local storage
    localStorage.clear()
  }
})

// Logout (revoke tokens)
async function logout() {
  await supabase.auth.signOut()
}

// Logout all devices
async function logoutAllDevices() {
  await supabase.auth.admin.signOut(userId, 'global')
}
```

### 1.5 OTP for Sensitive Actions

**Use Cases:**
- Payment confirmation
- Profile deletion
- Email/phone change
- Subscription cancellation

**Implementation:**
```python
# auth/otp.py
import random
import string
from datetime import datetime, timedelta

def generate_otp(length: int = 6) -> str:
    """Generate numeric OTP"""
    return ''.join(random.choices(string.digits, k=length))

def send_otp(user_id: str, action: str) -> str:
    """Send OTP via email"""
    otp = generate_otp()
    expires_at = datetime.now() + timedelta(minutes=5)

    # Store in database
    supabase.table('otp_codes').insert({
        'user_id': user_id,
        'code': otp,
        'action': action,
        'expires_at': expires_at.isoformat(),
        'used': False
    }).execute()

    # Send email (via Supabase edge function or external service)
    send_email(user_id, f"Your OTP: {otp}")

    return otp

def verify_otp(user_id: str, code: str, action: str) -> bool:
    """Verify OTP"""
    result = supabase.table('otp_codes').select('*').match({
        'user_id': user_id,
        'code': code,
        'action': action,
        'used': False
    }).execute()

    if not result.data:
        return False

    otp = result.data[0]

    # Check expiry
    if datetime.fromisoformat(otp['expires_at']) < datetime.now():
        return False

    # Mark as used
    supabase.table('otp_codes').update({
        'used': True
    }).eq('id', otp['id']).execute()

    return True
```

---

## 2. Row Level Security (RLS)

### 2.1 RLS Policies by Role

**Data Access Matrix:**

| Table | Anonymous | Student | Premium | Counselor | Institution Admin | Internal Admin |
|-------|-----------|---------|---------|-----------|-------------------|----------------|
| Institutions (published) | Read | Read | Read | Read | Read | Read/Write |
| Programs (published) | Read | Read | Read | Read | Read | Read/Write |
| User Profiles | - | Own | Own | Own | Own | All |
| Bookmarks | - | Own | Own | Own | Own | All |
| AI Conversations | - | - | Own | - | - | All |
| Transactions | - | Own | Own | Own | Own | All |
| Change Log | - | - | - | - | Read (own inst) | All |
| Staging Tables | - | - | - | - | Write (own inst) | All |

### 2.2 Policy Implementation

**Public Read (Anonymous):**
```sql
-- Anyone can read published institutions
CREATE POLICY "Public read published institutions"
ON public.institutions
FOR SELECT
TO public
USING (
  status = 'published'
  AND deleted_at IS NULL
);

-- Anyone can read published programs
CREATE POLICY "Public read published programs"
ON public.programs
FOR SELECT
TO public
USING (
  status = 'published'
  AND deleted_at IS NULL
  AND EXISTS (
    SELECT 1 FROM public.institutions
    WHERE id = programs.institution_id
    AND status = 'published'
  )
);
```

**Student Policies:**
```sql
-- Students can read their own profile
CREATE POLICY "Students read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

-- Students can update their own profile
CREATE POLICY "Students update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id AND role IN ('student', 'premium'));

-- Students can manage own bookmarks
CREATE POLICY "Students manage own bookmarks"
ON public.user_bookmarks
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Students can read own search history
CREATE POLICY "Students read own search history"
ON public.user_search_history
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Students can create search history
CREATE POLICY "Students create search history"
ON public.user_search_history
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);
```

**Premium User Policies:**
```sql
-- Premium users can access AI conversations
CREATE POLICY "Premium access AI conversations"
ON public.ai_conversations
FOR SELECT
TO authenticated
USING (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND subscription_status = 'active'
  )
);

-- Premium users can create AI conversations
CREATE POLICY "Premium create AI conversations"
ON public.ai_conversations
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = user_id
  AND EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND subscription_status = 'active'
  )
);
```

**Institution Admin Policies:**
```sql
-- Institution admins can read own institution data
CREATE POLICY "Institution admins read own data"
ON public.institutions
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'institution_admin'
    AND (metadata->>'institution_id')::uuid = institutions.id
  )
);

-- Institution admins can submit updates to staging
CREATE POLICY "Institution admins submit updates"
ON staging.institutions
FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'institution_admin'
    AND (metadata->>'institution_id')::uuid = staging.institutions.id
  )
);
```

**Internal Admin Policies:**
```sql
-- Internal admins can access everything
CREATE POLICY "Internal admins full access"
ON public.institutions
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE id = auth.uid()
    AND role = 'internal_admin'
  )
);

-- Repeat for all tables
```

---

## 3. API Security

### 3.1 Rate Limiting

**Configuration:**
```python
# middleware/rate_limit.py
from fastapi import Request, HTTPException, status
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter
import redis.asyncio as redis

# Initialize Redis
redis_client = redis.from_url("redis://localhost:6379")
await FastAPILimiter.init(redis_client)

# Rate limit decorator
rate_limiter = RateLimiter(times=100, hours=1)

# Apply to routes
@app.get("/api/v1/institutions", dependencies=[Depends(rate_limiter)])
async def list_institutions():
    pass

# Dynamic rate limits based on user role
async def get_rate_limit(request: Request):
    user = request.state.user  # Set by auth middleware

    if user.get('role') == 'internal_admin':
        return None  # No limit

    if user.get('subscription_status') == 'active':
        return RateLimiter(times=5000, hours=1)  # Premium

    if user.get('role') == 'student':
        return RateLimiter(times=1000, hours=1)  # Student

    return RateLimiter(times=100, hours=1)  # Anonymous
```

### 3.2 CORS Policy

```python
# main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://admitly.com.ng",
        "https://www.admitly.com.ng",
        "https://admin.admitly.com.ng",
        "http://localhost:3000",  # Development
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "PATCH", "DELETE"],
    allow_headers=["*"],
    expose_headers=["X-RateLimit-Limit", "X-RateLimit-Remaining"],
    max_age=3600,
)
```

### 3.3 Input Validation

**Pydantic Models:**
```python
# schemas/validators.py
from pydantic import BaseModel, Field, validator, EmailStr
from typing import Optional

class CreateUserRequest(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    full_name: str = Field(..., min_length=2, max_length=100)
    phone_number: Optional[str] = Field(None, regex=r'^\+234\d{10}$')
    state: str

    @validator('state')
    def validate_state(cls, v):
        nigerian_states = ['Lagos', 'Ogun', 'Oyo', ...]  # 37 states
        if v not in nigerian_states:
            raise ValueError('Invalid Nigerian state')
        return v

    @validator('password')
    def validate_password(cls, v):
        is_valid, message = validate_password(v)
        if not is_valid:
            raise ValueError(message)
        return v

class SearchRequest(BaseModel):
    query: str = Field(..., min_length=2, max_length=200)
    page: int = Field(1, ge=1, le=1000)
    page_size: int = Field(20, ge=1, le=100)
    filters: Optional[dict] = {}

    @validator('query')
    def sanitize_query(cls, v):
        # Remove SQL injection attempts
        forbidden = ['--', ';', 'DROP', 'DELETE', 'UPDATE', 'INSERT']
        for keyword in forbidden:
            if keyword.lower() in v.lower():
                raise ValueError('Invalid search query')
        return v.strip()
```

### 3.4 SQL Injection Prevention

**Use Parameterized Queries:**
```python
# ❌ BAD - Vulnerable to SQL injection
query = f"SELECT * FROM institutions WHERE name = '{user_input}'"

# ✅ GOOD - Parameterized query
query = "SELECT * FROM institutions WHERE name = %s"
cursor.execute(query, (user_input,))

# ✅ BETTER - Use ORM (SQLAlchemy)
institutions = db.query(Institution).filter(
    Institution.name == user_input
).all()

# ✅ BEST - Use Supabase client (built-in protection)
result = supabase.table('institutions').select('*').eq('name', user_input).execute()
```

### 3.5 XSS Prevention

**Output Encoding:**
```python
# API responses are automatically JSON-encoded (safe)
# For HTML rendering (if any), use templating engines with auto-escaping

from markupsafe import escape

def render_description(description: str) -> str:
    """Escape HTML to prevent XSS"""
    return escape(description)

# Frontend: React automatically escapes
// ✅ SAFE - React escapes by default
<div>{institution.description}</div>

// ❌ DANGEROUS - dangerouslySetInnerHTML
<div dangerouslySetInnerHTML={{ __html: institution.description }} />

// ✅ SAFE - Use DOMPurify for rich text
import DOMPurify from 'dompurify';
<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(description) }} />
```

### 3.6 CSRF Protection

**Implementation:**
```python
# middleware/csrf.py
from fastapi import Request, HTTPException, status
from itsdangerous import URLSafeTimedSerializer
import os

SECRET_KEY = os.getenv('SECRET_KEY')
csrf_serializer = URLSafeTimedSerializer(SECRET_KEY)

def generate_csrf_token() -> str:
    """Generate CSRF token"""
    return csrf_serializer.dumps('csrf_token', salt='csrf')

def verify_csrf_token(token: str) -> bool:
    """Verify CSRF token"""
    try:
        csrf_serializer.loads(token, salt='csrf', max_age=3600)
        return True
    except:
        return False

# Middleware
async def csrf_middleware(request: Request, call_next):
    if request.method in ['POST', 'PUT', 'PATCH', 'DELETE']:
        token = request.headers.get('X-CSRF-Token')
        if not token or not verify_csrf_token(token):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Invalid CSRF token"
            )
    response = await call_next(request)
    return response

app.middleware('http')(csrf_middleware)
```

---

## 4. Data Protection

### 4.1 TLS Configuration

**Requirements:**
- TLS 1.2 minimum (prefer TLS 1.3)
- Strong cipher suites only
- HSTS enabled
- Certificate from trusted CA (Let's Encrypt)

**Render Configuration:**
```yaml
# Render automatically provides TLS
# Custom domain with automatic SSL
services:
  - type: web
    name: api-server
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "uvicorn main:app --host 0.0.0.0 --port $PORT"
    domains:
      - api.admitly.com.ng
    envVars:
      - key: FORCE_HTTPS
        value: "true"
```

**HTTP Headers:**
```python
# middleware/security_headers.py
@app.middleware("http")
async def add_security_headers(request: Request, call_next):
    response = await call_next(request)
    response.headers["Strict-Transport-Security"] = "max-age=31536000; includeSubDomains"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    response.headers["X-XSS-Protection"] = "1; mode=block"
    response.headers["Referrer-Policy"] = "strict-origin-when-cross-origin"
    response.headers["Content-Security-Policy"] = "default-src 'self'"
    return response
```

### 4.2 Encryption at Rest

**Supabase:** Automatic encryption at rest (AES-256)

**Sensitive Fields:**
```sql
-- Encrypt PII fields using pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Encrypt phone numbers
ALTER TABLE user_profiles
ADD COLUMN phone_number_encrypted BYTEA;

-- Function to encrypt
CREATE OR REPLACE FUNCTION encrypt_phone(phone TEXT)
RETURNS BYTEA AS $$
BEGIN
  RETURN pgp_sym_encrypt(phone, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to decrypt
CREATE OR REPLACE FUNCTION decrypt_phone(encrypted BYTEA)
RETURNS TEXT AS $$
BEGIN
  RETURN pgp_sym_decrypt(encrypted, current_setting('app.encryption_key'));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 4.3 PII Handling

**Personal Identifiable Information:**
- Full name
- Email address
- Phone number
- Payment information (via Paystack - not stored)

**Best Practices:**
```python
# Hash sensitive fields when logging
import hashlib

def hash_email(email: str) -> str:
    """Hash email for logging"""
    return hashlib.sha256(email.encode()).hexdigest()[:16]

# ❌ BAD
logger.info(f"User logged in: {user.email}")

# ✅ GOOD
logger.info(f"User logged in: {hash_email(user.email)}")

# Mask phone numbers
def mask_phone(phone: str) -> str:
    """Mask phone number: +234801234567 -> +234****4567"""
    if len(phone) < 8:
        return phone
    return phone[:-4].replace(phone[4:-4], '****') + phone[-4:]
```

### 4.4 Data Retention Policy

**User Data:**
- Active accounts: Retained indefinitely
- Deleted accounts: 30-day grace period, then permanent deletion
- Anonymized analytics: 2 years

**Logs:**
- Application logs: 90 days
- Security logs: 1 year
- Audit logs: 7 years

**Backups:**
- Daily backups: 7 days
- Weekly backups: 4 weeks
- Monthly backups: 12 months

---

## 5. Payment Security (Paystack)

### 5.1 Webhook Verification

```python
# webhooks/paystack.py
import hmac
import hashlib
from fastapi import Request, HTTPException, status

PAYSTACK_SECRET_KEY = os.getenv('PAYSTACK_SECRET_KEY')

async def verify_paystack_signature(request: Request):
    """Verify Paystack webhook signature"""
    signature = request.headers.get('x-paystack-signature')
    if not signature:
        raise HTTPException(status_code=401, detail="Missing signature")

    body = await request.body()

    # Compute HMAC
    mac = hmac.new(
        PAYSTACK_SECRET_KEY.encode(),
        msg=body,
        digestmod=hashlib.sha512
    )
    expected_signature = mac.hexdigest()

    if not hmac.compare_digest(signature, expected_signature):
        raise HTTPException(status_code=401, detail="Invalid signature")

    return True

@app.post("/api/v1/webhooks/paystack")
async def paystack_webhook(
    request: Request,
    verified: bool = Depends(verify_paystack_signature)
):
    data = await request.json()
    event = data['event']

    if event == 'charge.success':
        # Process successful payment
        handle_payment_success(data['data'])

    return {"status": "success"}
```

### 5.2 Transaction Integrity

**Idempotency:**
```python
# Prevent duplicate payment processing
async def process_payment(reference: str):
    # Check if already processed
    existing = supabase.table('transactions').select('*').eq(
        'paystack_reference', reference
    ).execute()

    if existing.data:
        return {"status": "already_processed"}

    # Process payment (atomic operation)
    async with db.transaction():
        # 1. Create transaction record
        # 2. Update user subscription
        # 3. Send confirmation email
        pass
```

---

## 6. NDPR Compliance

### 6.1 User Consent

**Privacy Policy:**
- Clear, concise language
- Explain data collection practices
- List third-party services (Supabase, Paystack, Gemini/Claude)
- User rights (access, deletion, portability)

**Consent Implementation:**
```typescript
// components/ConsentBanner.tsx
export function ConsentBanner() {
  const [accepted, setAccepted] = useState(false);

  const handleAccept = async () => {
    await supabase.table('user_consents').insert({
      user_id: user.id,
      consent_type: 'privacy_policy',
      version: '1.0',
      ip_address: userIP,
      user_agent: navigator.userAgent,
      accepted_at: new Date().toISOString()
    });
    setAccepted(true);
  };

  return (
    <div className="consent-banner">
      <p>We use cookies and collect data. See our <Link to="/privacy">Privacy Policy</Link>.</p>
      <button onClick={handleAccept}>Accept</button>
    </div>
  );
}
```

### 6.2 Right to Access Data

**Implementation:**
```python
# routes/gdpr.py
@app.get("/api/v1/users/me/data-export")
async def export_user_data(current_user: dict = Depends(get_current_user)):
    """Export all user data (NDPR compliance)"""
    user_id = current_user['user_id']

    # Collect all user data
    data = {
        'profile': get_profile(user_id),
        'bookmarks': get_bookmarks(user_id),
        'search_history': get_search_history(user_id),
        'alerts': get_alerts(user_id),
        'transactions': get_transactions(user_id),
        'ai_conversations': get_ai_conversations(user_id)
    }

    # Generate JSON file
    filename = f"user_data_{user_id}_{datetime.now().isoformat()}.json"

    return JSONResponse(
        content=data,
        headers={
            'Content-Disposition': f'attachment; filename="{filename}"'
        }
    )
```

### 6.3 Right to Deletion

**Implementation:**
```python
@app.delete("/api/v1/users/me")
async def delete_account(
    otp: str,
    current_user: dict = Depends(get_current_user)
):
    """Delete user account (NDPR compliance)"""
    user_id = current_user['user_id']

    # Verify OTP
    if not verify_otp(user_id, otp, 'delete_account'):
        raise HTTPException(status_code=401, detail="Invalid OTP")

    # Soft delete (30-day grace period)
    supabase.table('user_profiles').update({
        'deleted_at': datetime.now().isoformat(),
        'email': f"deleted_{user_id}@admitly.com.ng"  # Anonymize
    }).eq('id', user_id).execute()

    # Schedule permanent deletion (30 days)
    scheduler.add_job(
        permanently_delete_user,
        'date',
        run_date=datetime.now() + timedelta(days=30),
        args=[user_id]
    )

    return {"message": "Account scheduled for deletion"}
```

### 6.4 Data Breach Notification

**Protocol:**
1. Detect breach (automated monitoring)
2. Contain breach (isolate affected systems)
3. Assess impact (affected users, data types)
4. Notify authorities (within 72 hours)
5. Notify users (within 72 hours)
6. Document incident
7. Implement preventive measures

**Notification Template:**
```python
async def notify_data_breach(affected_users: list, breach_details: dict):
    """Notify users of data breach"""
    for user in affected_users:
        send_email(
            to=user.email,
            subject="Important Security Notice",
            body=f"""
            Dear {user.full_name},

            We are writing to inform you of a security incident that may have affected your account.

            What happened:
            {breach_details['description']}

            What information was involved:
            {breach_details['affected_data']}

            What we're doing:
            {breach_details['mitigation']}

            What you should do:
            - Change your password immediately
            - Enable two-factor authentication
            - Monitor your account for suspicious activity

            If you have questions, contact us at security@admitly.com.ng

            Sincerely,
            Admitly Security Team
            """
        )
```

---

## 7. Scraping Ethics & Legal

### 7.1 Robots.txt Compliance

**Checker:**
```python
from urllib.robotparser import RobotFileParser
import requests

def is_scraping_allowed(url: str, user_agent: str = "AdmitlyBot/1.0") -> bool:
    """Check if scraping is allowed"""
    try:
        rp = RobotFileParser()
        rp.set_url(f"{url}/robots.txt")
        rp.read()
        return rp.can_fetch(user_agent, url)
    except:
        return True  # If robots.txt unavailable, proceed cautiously
```

### 7.2 Rate Limiting (Politeness)

**Configuration:**
```python
# scrapy settings
DOWNLOAD_DELAY = 2  # 2 seconds between requests
CONCURRENT_REQUESTS_PER_DOMAIN = 1  # 1 concurrent request per domain
RANDOMIZE_DOWNLOAD_DELAY = True  # Add jitter
AUTOTHROTTLE_ENABLED = True  # Automatic throttling
AUTOTHROTTLE_TARGET_CONCURRENCY = 1.0
```

### 7.3 Attribution

**Footer on every page:**
```html
<footer>
  Data sourced from official institutional websites.
  Last updated: 2025-01-09.
  <a href="https://unilag.edu.ng">University of Lagos</a>
  | <a href="/data-sources">View all sources</a>
</footer>
```

### 7.4 Takedown Requests

**Process:**
1. Institution contacts us via email
2. Verify request (from official email)
3. Review data in question
4. Remove or update data within 48 hours
5. Notify requester

**Implementation:**
```python
@app.post("/api/v1/admin/takedown-request")
async def submit_takedown_request(request: TakedownRequest):
    """Submit a takedown request"""
    # Create ticket in admin dashboard
    # Notify internal team
    # Track SLA (48 hours)
    pass
```

---

## 8. Secrets Management

### 8.1 Environment Variables

**Structure:**
```bash
# .env (never commit to git)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
MEILISEARCH_URL=http://...
MEILISEARCH_KEY=masterKey
PAYSTACK_PUBLIC_KEY=pk_test_...
PAYSTACK_SECRET_KEY=sk_test_...
GEMINI_API_KEY=...
CLAUDE_API_KEY=...
SECRET_KEY=random-secret-for-csrf
SENTRY_DSN=https://...
```

**Render Configuration:**
- Store secrets in Render dashboard (encrypted)
- Use environment variable groups
- Rotate keys quarterly

### 8.2 API Key Rotation

**Schedule:**
- Paystack keys: Yearly
- AI API keys: Quarterly
- Supabase service key: Yearly
- Database credentials: Yearly

**Process:**
1. Generate new key
2. Update in Render dashboard
3. Deploy new version
4. Verify functionality
5. Revoke old key (after grace period)

---

## 9. Monitoring & Incident Response

### 9.1 Security Logging

**Events to Log:**
```python
# Log authentication events
logger.info(f"Login successful: {hash_email(user.email)}, IP: {request.client.host}")
logger.warning(f"Login failed: {hash_email(email)}, IP: {request.client.host}")

# Log authorization failures
logger.warning(f"Unauthorized access attempt: {endpoint}, User: {user_id}, IP: {ip}")

# Log payment events
logger.info(f"Payment initiated: {transaction_id}, Amount: {amount}")
logger.info(f"Payment completed: {transaction_id}, Status: {status}")

# Log data exports
logger.info(f"Data export requested: User: {user_id}, Type: {export_type}")

# Log account deletions
logger.info(f"Account deleted: User: {user_id}, Reason: {reason}")
```

### 9.2 Intrusion Detection

**Anomaly Detection:**
```python
# Detect unusual activity
async def detect_anomalies(user_id: str):
    # Multiple failed login attempts
    failed_logins = get_failed_login_count(user_id, window='1h')
    if failed_logins > 5:
        alert_security_team(f"Multiple failed logins: {user_id}")
        temporarily_lock_account(user_id)

    # Unusual location
    last_login_location = get_last_login_location(user_id)
    current_location = get_current_location()
    if distance(last_login_location, current_location) > 1000:  # 1000 km
        send_login_alert(user_id)

    # API abuse
    api_requests = get_api_request_count(user_id, window='1h')
    if api_requests > 10000:
        rate_limit_user(user_id)
```

### 9.3 Incident Response Plan

**Roles:**
- Incident Commander: CTO
- Security Lead: Security Engineer
- Communications: Product Manager

**Steps:**
1. **Detection** (automated alerts)
2. **Containment** (isolate affected systems)
3. **Investigation** (root cause analysis)
4. **Eradication** (remove threat)
5. **Recovery** (restore services)
6. **Post-Incident Review** (lessons learned)

---

## 10. Penetration Testing Checklist

### Pre-Launch Security Audit:

- [ ] Authentication bypass attempts
- [ ] SQL injection testing (all inputs)
- [ ] XSS testing (all inputs)
- [ ] CSRF testing (all state-changing operations)
- [ ] Authorization checks (all protected routes)
- [ ] Rate limiting effectiveness
- [ ] Payment flow security (Paystack integration)
- [ ] API key exposure (client-side code)
- [ ] Dependency vulnerabilities (npm audit, pip check)
- [ ] HTTPS enforcement
- [ ] Security headers (HSTS, CSP, etc.)
- [ ] Password strength enforcement
- [ ] Session management (timeout, logout)
- [ ] File upload validation (if any)
- [ ] Error message information leakage
- [ ] Database backup encryption
- [ ] Secrets exposure (environment variables)
- [ ] Third-party service security (Supabase, Paystack)
- [ ] Mobile app security (if applicable)
- [ ] Admin panel access controls

**Tools:**
- OWASP ZAP
- Burp Suite
- SQLMap
- npm audit
- Snyk
- GitHub Dependabot

---

## Compliance Summary

| Requirement | Status | Implementation |
|-------------|--------|----------------|
| NDPR - User Consent | ✅ | Consent banner + database tracking |
| NDPR - Right to Access | ✅ | Data export API |
| NDPR - Right to Deletion | ✅ | Account deletion with grace period |
| NDPR - Data Breach Notification | ✅ | Automated notification system |
| PCI DSS | N/A | Paystack handles card data |
| TLS Encryption | ✅ | Render automatic SSL |
| Password Security | ✅ | Strong policy + bcrypt hashing |
| Rate Limiting | ✅ | Redis-based per-user limits |
| SQL Injection Protection | ✅ | Parameterized queries + ORM |
| XSS Protection | ✅ | React auto-escaping + CSP |
| CSRF Protection | ✅ | Token-based middleware |

---

## Next Steps
1. Implement RLS policies in Supabase
2. Configure rate limiting
3. Set up security logging
4. Write privacy policy
5. Implement consent management
6. Set up incident response team
7. Schedule penetration testing
8. Train team on security best practices
