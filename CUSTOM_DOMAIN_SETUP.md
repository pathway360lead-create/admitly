# Custom Domain Setup Guide for Admitly Platform

**Date:** November 27, 2025
**Domain:** admitly.com.ng
**Status:** ✅ Backend CORS Updated | ⏳ DNS & Render Configuration Pending

---

## Overview

This guide provides step-by-step instructions to configure the custom domain `admitly.com.ng` for the Admitly platform. The backend has been updated to accept requests from the custom domain. You now need to configure DNS records and Render settings.

---

## Prerequisites Completed ✅

- [x] **CORS Configuration Updated** - Backend now accepts requests from:
  - `https://admitly.com.ng`
  - `https://www.admitly.com.ng`
  - `https://admitly-web.onrender.com` (current production)
  - `http://localhost:5173` (development)

### Files Modified:
1. ✅ `services/api/.env` - CORS_ORIGINS updated (line 15)
2. ✅ `services/api/core/config.py` - Default CORS_ORIGINS updated (lines 46-53)
3. ✅ `services/api/.env.example` - Documentation updated (line 42)

---

## What You Need

Before starting, ensure you have access to:

1. **Domain Registrar Account** - Where you purchased admitly.com.ng
2. **Render Dashboard** - https://dashboard.render.com
3. **Domain Credentials** - Login details for your domain registrar

---

## Step-by-Step Configuration

### Phase 1: Configure DNS Records (Domain Registrar)

#### Step 1.1: Log in to Your Domain Registrar

1. Go to your domain registrar's website (e.g., Namecheap, GoDaddy, etc.)
2. Log in with your credentials
3. Navigate to DNS Management or Domain Settings for `admitly.com.ng`

#### Step 1.2: Configure DNS Records

You need to create **4 DNS records**:

**Record 1: Main Domain (Frontend)**
```
Type: CNAME
Name: @ (or leave blank for root domain)
Value: admitly-web.onrender.com
TTL: 3600 (1 hour) or Auto
```

**Record 2: WWW Subdomain (Frontend)**
```
Type: CNAME
Name: www
Value: admitly-web.onrender.com
TTL: 3600 (1 hour) or Auto
```

**Record 3: API Subdomain (Backend)**
```
Type: CNAME
Name: api
Value: admitly-api.onrender.com
TTL: 3600 (1 hour) or Auto
```

**Record 4: Search Subdomain (Meilisearch)**
```
Type: CNAME
Name: search
Value: admitly-search.onrender.com
TTL: 3600 (1 hour) or Auto
```

#### Step 1.3: Verify DNS Configuration

After saving the DNS records, verify them using:

**Windows (Command Prompt):**
```bash
nslookup admitly.com.ng
nslookup www.admitly.com.ng
nslookup api.admitly.com.ng
nslookup search.admitly.com.ng
```

**Note:** DNS propagation can take 15 minutes to 48 hours. Most registrars propagate within 1-2 hours.

---

### Phase 2: Configure Render Custom Domains

You need to configure custom domains for 3 Render services.

#### Step 2.1: Configure Frontend Custom Domain

1. Log in to Render Dashboard: https://dashboard.render.com
2. Navigate to **admitly-web** service
3. Click **Settings** tab
4. Scroll to **Custom Domains** section
5. Click **Add Custom Domain**
6. Enter: `admitly.com.ng`
7. Click **Add**
8. Repeat steps 5-7 to add: `www.admitly.com.ng`
9. Wait for SSL certificates to be issued (automatic, takes 1-5 minutes)

**Expected Result:**
- ✅ `admitly.com.ng` → Green checkmark with SSL
- ✅ `www.admitly.com.ng` → Green checkmark with SSL

#### Step 2.2: Configure Backend API Custom Domain

1. In Render Dashboard, navigate to **admitly-api** service
2. Click **Settings** tab
3. Scroll to **Custom Domains** section
4. Click **Add Custom Domain**
5. Enter: `api.admitly.com.ng`
6. Click **Add**
7. Wait for SSL certificate to be issued (automatic, 1-5 minutes)

**Expected Result:**
- ✅ `api.admitly.com.ng` → Green checkmark with SSL

#### Step 2.3: Configure Meilisearch Custom Domain (Optional)

1. In Render Dashboard, navigate to **admitly-search** service
2. Click **Settings** tab
3. Scroll to **Custom Domains** section
4. Click **Add Custom Domain**
5. Enter: `search.admitly.com.ng`
6. Click **Add**
7. Wait for SSL certificate to be issued

**Expected Result:**
- ✅ `search.admitly.com.ng` → Green checkmark with SSL

---

### Phase 3: Update Environment Variables in Render

After custom domains are configured, you must update environment variables.

#### Step 3.1: Update Backend Environment Variables

1. Navigate to **admitly-api** service in Render
2. Click **Environment** tab
3. Update the following variables:

**Update CORS_ORIGINS:**
```
CORS_ORIGINS=http://localhost:5173,http://localhost:3000,https://admitly-web.onrender.com,https://admitly.com.ng,https://www.admitly.com.ng
```

**Add/Update these if needed:**
```
ENVIRONMENT=production
DEBUG=False
```

4. Click **Save Changes**
5. Render will automatically redeploy the service

#### Step 3.2: Update Frontend Environment Variables

1. Navigate to **admitly-web** service in Render
2. Click **Environment** tab
3. Update the following variables:

**Update API URL:**
```
VITE_API_URL=https://api.admitly.com.ng
```

**Update Meilisearch URL (if using custom domain):**
```
VITE_MEILISEARCH_HOST=https://search.admitly.com.ng
```

4. Click **Save Changes**
5. Render will automatically redeploy the service

---

### Phase 4: Test Custom Domain Configuration

After DNS propagation and Render configuration, test all endpoints.

#### Test 4.1: Test Frontend

Open your browser and visit:
```
https://admitly.com.ng
https://www.admitly.com.ng
```

**Expected Result:**
- ✅ Website loads successfully
- ✅ HTTPS with valid SSL certificate (green padlock)
- ✅ No mixed content warnings

#### Test 4.2: Test Backend API

Open your browser or use curl:
```bash
# Test health endpoint
curl https://api.admitly.com.ng/health

# Expected output:
{"status":"healthy","environment":"production","version":"1.0.0"}
```

**Test in browser:**
```
https://api.admitly.com.ng/health
https://api.admitly.com.ng/docs
```

**Expected Result:**
- ✅ API responds successfully
- ✅ HTTPS with valid SSL certificate
- ✅ Swagger docs load at /docs

#### Test 4.3: Test CORS

Open the frontend at `https://admitly.com.ng` and:

1. Open browser DevTools (F12)
2. Navigate to any page that makes API calls (e.g., Institutions page)
3. Check **Network** tab for API requests
4. Verify no CORS errors in **Console** tab

**Expected Result:**
- ✅ API requests succeed (200 OK)
- ✅ No CORS errors
- ✅ Response headers include `access-control-allow-origin`

#### Test 4.4: Test Search

```bash
# Test Meilisearch
curl https://search.admitly.com.ng/health

# Expected output:
{"status":"available"}
```

**Expected Result:**
- ✅ Meilisearch responds successfully
- ✅ HTTPS with valid SSL certificate

---

## Troubleshooting

### Issue 1: DNS Not Resolving

**Symptom:** `nslookup admitly.com.ng` returns NXDOMAIN or no results

**Solutions:**
1. **Wait Longer:** DNS propagation can take up to 48 hours
2. **Check TTL:** Lower TTL values propagate faster (3600 = 1 hour)
3. **Flush DNS Cache:**
   ```bash
   # Windows
   ipconfig /flushdns

   # Mac/Linux
   sudo dscacheutil -flushcache
   ```
4. **Use DNS Checker:** https://dnschecker.org to check propagation globally
5. **Verify Records:** Log back into domain registrar and verify records are saved

---

### Issue 2: Render Shows "Verification Failed"

**Symptom:** Render custom domain shows red X or "Verification Failed"

**Solutions:**
1. **Verify DNS Records:**
   - Ensure CNAME points to correct Render hostname
   - Check for typos in CNAME value
   - Remove any A records for the same subdomain
2. **Wait for DNS Propagation:** Render checks DNS every few minutes
3. **Remove and Re-add:** Delete the custom domain in Render and add it again
4. **Check Domain Registrar:**
   - Some registrars require CNAME flattening for root domain
   - Contact registrar support if issues persist

---

### Issue 3: SSL Certificate Not Issued

**Symptom:** Render shows domain but no SSL certificate (http only)

**Solutions:**
1. **Wait:** SSL provisioning takes 1-10 minutes
2. **Check DNS:** SSL won't issue until DNS is fully propagated
3. **Verify Ownership:** Ensure you own the domain
4. **Contact Render Support:** If SSL doesn't issue after 1 hour

---

### Issue 4: CORS Errors After Custom Domain

**Symptom:** Browser console shows CORS errors when accessing custom domain

**Solutions:**
1. **Verify Backend CORS:** Check that CORS_ORIGINS includes custom domain
   ```bash
   # SSH into Render or check logs
   echo $CORS_ORIGINS
   ```
2. **Update Render Environment Variables:** Ensure CORS_ORIGINS is updated in Render dashboard
3. **Restart Backend Service:** Click **Manual Deploy** → **Deploy latest commit**
4. **Check Browser Cache:** Hard refresh (Ctrl+Shift+R) or clear cache
5. **Verify Environment Variable Format:**
   ```
   CORS_ORIGINS=https://admitly.com.ng,https://www.admitly.com.ng
   # NOT:
   CORS_ORIGINS=admitly.com.ng  # Missing https://
   ```

---

### Issue 5: Frontend Can't Connect to API

**Symptom:** Frontend loads but API calls fail with network errors

**Solutions:**
1. **Check API URL:** Verify VITE_API_URL in frontend environment variables
   ```
   VITE_API_URL=https://api.admitly.com.ng
   # NOT:
   VITE_API_URL=http://api.admitly.com.ng  # Wrong protocol
   ```
2. **Test API Directly:** Visit https://api.admitly.com.ng/health in browser
3. **Check Mixed Content:** Ensure frontend is https:// and API is https://
4. **Redeploy Frontend:** After updating environment variables, redeploy
5. **Check Browser Console:** Look for specific error messages

---

### Issue 6: "This site can't be reached"

**Symptom:** Browser shows DNS_PROBE_FINISHED_NXDOMAIN

**Solutions:**
1. **DNS Not Propagated:** Wait longer for DNS propagation
2. **Wrong DNS Records:** Verify CNAME records are correct
3. **Check Registrar:** Some registrars require additional steps for CNAME
4. **Try Different DNS Server:**
   ```bash
   # Use Google DNS to test
   nslookup admitly.com.ng 8.8.8.8
   ```

---

## Verification Checklist

After completing all steps, verify:

- [ ] **DNS Records Created:**
  - [ ] admitly.com.ng → admitly-web.onrender.com
  - [ ] www.admitly.com.ng → admitly-web.onrender.com
  - [ ] api.admitly.com.ng → admitly-api.onrender.com
  - [ ] search.admitly.com.ng → admitly-search.onrender.com

- [ ] **Render Custom Domains Configured:**
  - [ ] admitly.com.ng (Frontend)
  - [ ] www.admitly.com.ng (Frontend)
  - [ ] api.admitly.com.ng (Backend)
  - [ ] search.admitly.com.ng (Meilisearch)

- [ ] **SSL Certificates Issued:**
  - [ ] admitly.com.ng - Green padlock
  - [ ] www.admitly.com.ng - Green padlock
  - [ ] api.admitly.com.ng - Green padlock
  - [ ] search.admitly.com.ng - Green padlock

- [ ] **Environment Variables Updated:**
  - [ ] Backend CORS_ORIGINS includes custom domains
  - [ ] Frontend VITE_API_URL points to api.admitly.com.ng
  - [ ] Frontend VITE_MEILISEARCH_HOST points to search.admitly.com.ng

- [ ] **All Services Redeployed:**
  - [ ] Backend redeployed after CORS update
  - [ ] Frontend redeployed after API URL update

- [ ] **Testing Complete:**
  - [ ] https://admitly.com.ng loads successfully
  - [ ] https://api.admitly.com.ng/health returns 200
  - [ ] https://search.admitly.com.ng/health returns 200
  - [ ] No CORS errors in browser console
  - [ ] API calls from frontend work correctly

---

## Expected Timeline

| Task | Duration | Notes |
|------|----------|-------|
| DNS Record Creation | 5-10 minutes | Actual configuration time |
| DNS Propagation | 15 min - 48 hours | Usually 1-2 hours |
| Render Domain Verification | 1-10 minutes | After DNS propagates |
| SSL Certificate Issuance | 1-10 minutes | Automatic |
| Environment Variable Updates | 5 minutes | Plus redeploy time |
| Service Redeployment | 2-5 minutes per service | Automatic |
| **Total Estimated Time** | **30 min - 48 hours** | Most likely: 1-2 hours |

---

## Post-Configuration Tasks

After custom domain is live:

1. **Update Documentation:**
   - [ ] Update README.md with new URLs
   - [ ] Update PROJECT_STATUS.md (custom domain: ✅ CONFIGURED)

2. **Update External Links:**
   - [ ] Update any marketing materials
   - [ ] Update social media links
   - [ ] Update email signatures

3. **Set Up Redirects (Optional):**
   - [ ] Redirect admitly-web.onrender.com → admitly.com.ng
   - [ ] Redirect admitly-api.onrender.com → api.admitly.com.ng

4. **Monitor:**
   - [ ] Check uptime monitoring
   - [ ] Verify SSL certificate expiration (Render auto-renews)
   - [ ] Monitor DNS records for any changes

---

## Support & Resources

**Render Documentation:**
- Custom Domains: https://render.com/docs/custom-domains
- SSL Certificates: https://render.com/docs/tls
- Environment Variables: https://render.com/docs/environment-variables

**DNS Tools:**
- DNS Checker: https://dnschecker.org
- DNS Lookup: https://mxtoolbox.com/DNSLookup.aspx
- SSL Checker: https://www.sslshopper.com/ssl-checker.html

**Render Support:**
- Dashboard: https://dashboard.render.com
- Support: support@render.com
- Community: https://community.render.com

**Admitly Resources:**
- GitHub: https://github.com/pathway360lead-create/admitly
- Documentation: See `/specs/` folder
- Status: PROJECT_STATUS.md

---

## Summary

**Backend Changes Completed ✅:**
- CORS configuration updated to accept custom domain requests
- Configuration files updated (.env, config.py, .env.example)
- Backend tested and verified working

**Your Action Items ⏳:**
1. Configure DNS records at your domain registrar (15 minutes)
2. Add custom domains in Render dashboard (10 minutes)
3. Update environment variables in Render (5 minutes)
4. Test all endpoints (10 minutes)
5. Update PROJECT_STATUS.md when complete

**Estimated Total Time:** 1-2 hours (including DNS propagation)

---

**Last Updated:** November 27, 2025
**Status:** Ready for DNS and Render configuration
**Next Step:** Configure DNS records at domain registrar
