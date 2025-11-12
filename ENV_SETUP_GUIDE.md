# Environment Variables Setup Guide

## ✅ Current Status

### Configured Services
- ✅ **Supabase** - Fully configured with your credentials
- ✅ **GitHub** - Token configured for CI/CD

### Pending Setup (⏳)
- ⏳ **Meilisearch** - Search engine (needs local installation)
- ⏳ **Redis** - Caching and queues (needs local installation)
- ⏳ **AI Services** - Gemini/Claude API keys
- ⏳ **Paystack** - Payment gateway (test account)
- ⏳ **SendGrid** - Email service (optional for dev)
- ⏳ **Monitoring** - Sentry/PostHog (optional for dev)

---

## 📋 Environment Files Created

1. **`.env`** - Main development environment (✅ Ready to use)
2. **`services/api/.env`** - Backend-specific variables (✅ Ready to use)
3. **`.env.production`** - Production environment template (⏳ Update when deploying)

---

## 🚀 Quick Start (Development)

### 1. You're Ready to Run!

Your Supabase is already configured. You can start development immediately:

```bash
# Install dependencies
pnpm install

# Start frontend
pnpm dev:web
# Opens at http://localhost:5173

# Start backend (in another terminal)
cd services/api
python -m venv venv
venv\Scripts\activate  # Windows
pip install -r requirements.txt
uvicorn main:app --reload
# Opens at http://localhost:8000
```

### 2. Optional: Set Up Local Services

For full functionality, install these services locally:

#### Meilisearch (Search Engine)
```bash
# Windows (via PowerShell)
iwr https://github.com/meilisearch/meilisearch/releases/latest/download/meilisearch-windows-amd64.exe -OutFile meilisearch.exe
.\meilisearch.exe --master-key="masterKey"
# Runs at http://localhost:7700
```

#### Redis (Caching)
```bash
# Using Docker (easiest)
docker run -d -p 6379:6379 redis:alpine

# Or install directly
# Download from: https://redis.io/docs/getting-started/installation/install-redis-on-windows/
```

---

## 🔑 Getting API Keys

### 1. Google Gemini (AI - Free Tier Available)
1. Go to: https://makersuite.google.com/app/apikey
2. Click "Get API Key"
3. Copy key and replace `your-gemini-api-key` in `.env`

### 2. Anthropic Claude (AI - Free Trial)
1. Go to: https://console.anthropic.com/
2. Create account and get API key
3. Copy key and replace `your-claude-api-key` in `.env`

### 3. Paystack (Payment - TEST Mode)
1. Go to: https://dashboard.paystack.com/signup
2. Create account
3. Go to Settings → Developer/API
4. Copy TEST keys (starts with `sk_test_` and `pk_test_`)
5. Replace in `.env`:
   - `PAYSTACK_SECRET_KEY=sk_test_...`
   - `PAYSTACK_PUBLIC_KEY=pk_test_...`

### 4. SendGrid (Email - Optional)
1. Go to: https://signup.sendgrid.com/
2. Create free account (100 emails/day)
3. Create API key
4. Replace `your-sendgrid-api-key` in `.env`

**Note:** You can skip SendGrid for now and use Supabase Auth emails.

---

## 🧪 Testing Your Setup

### Test Supabase Connection
```bash
# In Python
python
>>> from supabase import create_client
>>> supabase = create_client("https://jvmmexjbnolzukhdhwds.supabase.co", "your-anon-key")
>>> print("✅ Connected!")
```

### Test API Server
```bash
cd services/api
uvicorn main:app --reload

# Visit: http://localhost:8000/docs
# You should see the FastAPI Swagger UI
```

### Test Frontend
```bash
pnpm dev:web

# Visit: http://localhost:5173
# You should see the React app
```

---

## 📦 What Each Service Does

| Service | Purpose | Required for MVP? |
|---------|---------|-------------------|
| **Supabase** | Database, Auth, Storage | ✅ YES |
| **Meilisearch** | Fast search across programs | ✅ YES |
| **Redis** | Caching, rate limiting | ✅ YES |
| **Gemini/Claude** | AI recommendations | 🟡 Phase 3 only |
| **Paystack** | Payment processing | 🟡 Phase 3 only |
| **SendGrid** | Email notifications | 🟡 Phase 2 only |
| **Sentry** | Error tracking | ⚪ Optional |
| **PostHog** | Analytics | ⚪ Optional |

---

## ⚠️ Important Security Notes

1. **Never commit `.env` to Git** - It's already in `.gitignore`
2. **Use TEST keys in development** - Never use production Paystack keys locally
3. **Rotate keys if exposed** - If you accidentally commit keys, regenerate them immediately
4. **Different keys for production** - Use `.env.production` with different values

---

## 🔄 Updating Environment Variables

### For Local Development
Edit `.env` file directly

### For Render (Production)
1. Go to Render Dashboard
2. Select your service
3. Go to "Environment" tab
4. Add/update variables
5. Service will auto-redeploy

---

## 🆘 Troubleshooting

### Issue: "Module not found" errors
**Solution:** Run `pnpm install` in root

### Issue: "Supabase connection failed"
**Solution:** Check your `.env` file has correct Supabase URL and keys

### Issue: "Redis connection refused"
**Solution:** Make sure Redis is running: `docker ps` (should show redis container)

### Issue: "Meilisearch not found"
**Solution:** Install and run Meilisearch locally (see instructions above)

### Issue: "CORS errors in browser"
**Solution:** Make sure API is running on port 8000 and frontend on 5173

---

## 📚 Next Steps

After setting up environment variables:

1. **✅ Done** - Environment configured
2. **⏳ Next** - Set up database schema (Option B)
3. **⏳ Then** - Create Render services (Option C)
4. **⏳ Finally** - Start coding features!

---

## 🔗 Useful Links

- **Supabase Dashboard:** https://app.supabase.com/project/jvmmexjbnolzukhdhwds
- **GitHub Repository:** https://github.com/pathway360lead-create/admitly
- **Render Dashboard:** https://dashboard.render.com/
- **API Documentation (local):** http://localhost:8000/docs

---

**Last Updated:** January 2025
**Status:** Development Environment Ready ✅
