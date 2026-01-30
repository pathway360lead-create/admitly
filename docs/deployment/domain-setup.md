# Domain Setup Guide

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


---

## Quick Start Guide

# Custom Domain Setup - Quick Start Guide

**Domain:** admitly.com.ng (TrustHost)
**Platform:** Render
**Estimated Total Time:** 1-2 hours
**Date:** November 27, 2025

---

## 📋 Overview

Follow this checklist to configure your custom domain. Each checkbox = one step complete.

**Documents You'll Need:**
- 📄 TRUSTHOST_DNS_SETUP.md (DNS configuration)
- 📄 RENDER_SETUP_GUIDE.md (Render configuration)
- 📄 This checklist

---

## ✅ Phase 1: Backend Preparation (COMPLETED ✅)

**Status: Already done by Claude Code!**

- [x] Backend CORS updated to accept custom domain
- [x] Configuration files updated
- [x] Backend tested and verified
- [x] Documentation created

**You can skip Phase 1 - it's done!**

---

## ✅ Phase 2: TrustHost DNS Configuration (30-45 min)

**Document:** `TRUSTHOST_DNS_SETUP.md`

### Part A: Login and Access

- [ ] Open https://www.trusthost.com.ng
- [ ] Log in with your credentials
- [ ] Navigate to "Domains" or "My Domains"
- [ ] Click "Manage" next to admitly.com.ng
- [ ] Open "DNS Management" or "DNS Zone"

### Part B: Delete Old Records

- [ ] Look for existing A records for @ or www
- [ ] Delete any A records for @ (root domain)
- [ ] Delete any A records for www
- [ ] Keep NS records (don't delete!)
- [ ] Keep MX records if you have email

### Part C: Add CNAME Records

**Record 1: WWW Subdomain (Critical)**
- [ ] Click "Add Record"
- [ ] Type: CNAME
- [ ] Name: www
- [ ] Value: admitly-web.onrender.com
- [ ] TTL: 3600
- [ ] Click "Save"
- [ ] ✅ Verify record appears in DNS list

**Record 2: API Subdomain (Critical)**
- [ ] Click "Add Record"
- [ ] Type: CNAME
- [ ] Name: api
- [ ] Value: admitly-api.onrender.com
- [ ] TTL: 3600
- [ ] Click "Save"
- [ ] ✅ Verify record appears in DNS list

**Record 3: Search Subdomain (Critical)**
- [ ] Click "Add Record"
- [ ] Type: CNAME
- [ ] Name: search
- [ ] Value: admitly-search.onrender.com
- [ ] TTL: 3600
- [ ] Click "Save"
- [ ] ✅ Verify record appears in DNS list

**Record 4: Root Domain (Optional - may not work)**
- [ ] Try to add CNAME for @ or root
- [ ] If error occurs, skip this step (it's okay!)
- [ ] If successful, great! If not, use www as main domain

### Part D: Verify DNS Configuration

- [ ] All 3-4 CNAME records visible in TrustHost
- [ ] No typos in subdomain names
- [ ] No typos in .onrender.com values
- [ ] No A records conflicting with CNAMEs

### Part E: Wait for DNS Propagation

- [ ] Wait at least 30 minutes (go get coffee! ☕)
- [ ] Open https://dnschecker.org
- [ ] Check www.admitly.com.ng → should show admitly-web.onrender.com
- [ ] Check api.admitly.com.ng → should show admitly-api.onrender.com
- [ ] Check search.admitly.com.ng → should show admitly-search.onrender.com
- [ ] All showing green checkmarks globally? Proceed to Phase 3!

**⏳ If DNS not propagated:**
- Wait another 30 minutes
- Check again
- Maximum wait: 24-48 hours (rare)

---

## ✅ Phase 3: Render Configuration (20-30 min)

**Document:** `RENDER_SETUP_GUIDE.md`

**Prerequisites:**
- [x] DNS records created in TrustHost (Phase 2 complete)
- [x] DNS propagated (30+ minutes passed)
- [x] dnschecker.org shows green checkmarks

### Part A: Login

- [ ] Open https://dashboard.render.com
- [ ] Sign in with GitHub or email
- [ ] Verify you can see your services

### Part B: Configure Frontend (admitly-web)

- [ ] Click on "admitly-web" service
- [ ] Go to "Settings" tab
- [ ] Scroll to "Custom Domains" section
- [ ] Click "Add Custom Domain"
- [ ] Enter: www.admitly.com.ng
- [ ] Click "Save"
- [ ] Wait for verification (1-5 minutes)
- [ ] Wait for SSL certificate (1-10 minutes)
- [ ] ✅ Status: Active | SSL: Secure

**Optional - Add Root Domain:**
- [ ] Click "Add Custom Domain" again
- [ ] Enter: admitly.com.ng (no www)
- [ ] If fails, skip (it's okay!)
- [ ] If works, wait for SSL

### Part C: Configure Backend (admitly-api)

- [ ] Go back to Dashboard
- [ ] Click on "admitly-api" service
- [ ] Go to "Settings" tab
- [ ] Click "Add Custom Domain"
- [ ] Enter: api.admitly.com.ng
- [ ] Click "Save"
- [ ] Wait for verification and SSL (2-10 minutes)
- [ ] ✅ Status: Active | SSL: Secure

### Part D: Configure Search (admitly-search)

- [ ] Go back to Dashboard
- [ ] Click on "admitly-search" service
- [ ] Go to "Settings" tab
- [ ] Click "Add Custom Domain"
- [ ] Enter: search.admitly.com.ng
- [ ] Click "Save"
- [ ] Wait for verification and SSL (2-10 minutes)
- [ ] ✅ Status: Active | SSL: Secure

### Part E: Update Backend Environment Variables

- [ ] Go to "admitly-api" service
- [ ] Click "Environment" tab
- [ ] Find or add CORS_ORIGINS variable
- [ ] Update value to include: https://www.admitly.com.ng,https://admitly.com.ng
- [ ] Verify ENVIRONMENT = production
- [ ] Verify DEBUG = False
- [ ] Click "Save Changes"
- [ ] Wait for service to redeploy (2-5 minutes)
- [ ] Check "Events" tab for "Deploy succeeded"

### Part F: Update Frontend Environment Variables

- [ ] Go to "admitly-web" service
- [ ] Click "Environment" tab
- [ ] Update VITE_API_URL to: https://api.admitly.com.ng
- [ ] Update VITE_MEILISEARCH_HOST to: https://search.admitly.com.ng
- [ ] Click "Save Changes"
- [ ] Wait for service to redeploy (2-5 minutes)
- [ ] Check "Events" tab for "Deploy succeeded"

---

## ✅ Phase 4: Testing & Verification (10 min)

### Test 1: Frontend

- [ ] Open browser
- [ ] Go to: https://www.admitly.com.ng
- [ ] ✅ Website loads
- [ ] ✅ Green padlock (SSL) visible in address bar
- [ ] ✅ No browser warnings

### Test 2: Backend API

- [ ] Open browser
- [ ] Go to: https://api.admitly.com.ng/health
- [ ] ✅ Shows: `{"status":"healthy","environment":"production","version":"1.0.0"}`
- [ ] ✅ Green padlock visible

### Test 3: API Documentation

- [ ] Go to: https://api.admitly.com.ng/docs
- [ ] ✅ Swagger UI loads
- [ ] ✅ Can see list of endpoints

### Test 4: Search Service

- [ ] Go to: https://search.admitly.com.ng/health
- [ ] ✅ Shows: `{"status":"available"}`
- [ ] ✅ Green padlock visible

### Test 5: CORS (Frontend ↔ Backend)

- [ ] Go to https://www.admitly.com.ng
- [ ] Press F12 to open DevTools
- [ ] Click "Console" tab
- [ ] Click on "Institutions" or any data page
- [ ] ✅ No red CORS errors in console
- [ ] Click "Network" tab
- [ ] ✅ API calls showing 200 OK status
- [ ] ✅ API calls going to api.admitly.com.ng

### Test 6: Complete User Flow

- [ ] Create a test account
- [ ] Search for institutions
- [ ] View institution details
- [ ] Add to bookmarks (if working)
- [ ] ✅ Everything works smoothly

---

## ✅ Phase 5: Final Steps & Documentation

### Update Project Documentation

- [ ] Open PROJECT_STATUS.md
- [ ] Update custom domain status from ⏳ to ✅
- [ ] Update URLs in deployment section
- [ ] Save file

### Update README (if exists)

- [ ] Update production URL to https://www.admitly.com.ng
- [ ] Update API URL to https://api.admitly.com.ng
- [ ] Save file

### Commit Changes to Git

- [ ] Open terminal
- [ ] Run: `git status` (verify changes)
- [ ] Run: `git add .`
- [ ] Run: `git commit -m "feat: Configure custom domain admitly.com.ng with TrustHost and Render"`
- [ ] Run: `git push origin main`

### Verify Auto-deployment

- [ ] Go to Render Dashboard
- [ ] Check all services
- [ ] ✅ All showing "Deploy succeeded" with latest commit

---

## 🎉 SUCCESS CHECKLIST

### DNS Configuration
- [x] Backend CORS configured
- [ ] TrustHost DNS records created (3-4 CNAMEs)
- [ ] DNS propagated globally
- [ ] No conflicting A records

### Render Configuration
- [ ] www.admitly.com.ng → admitly-web (SSL ✓)
- [ ] api.admitly.com.ng → admitly-api (SSL ✓)
- [ ] search.admitly.com.ng → admitly-search (SSL ✓)
- [ ] Environment variables updated
- [ ] All services redeployed

### Testing
- [ ] Frontend loads at custom domain
- [ ] API responds at custom domain
- [ ] Search responds at custom domain
- [ ] All SSL certificates valid
- [ ] No CORS errors
- [ ] Complete user flow works

### Documentation
- [ ] PROJECT_STATUS.md updated
- [ ] README.md updated (if exists)
- [ ] Changes committed to git
- [ ] Changes deployed to Render

---

## 📊 Troubleshooting Quick Reference

| Issue | Quick Fix | Full Solution |
|-------|-----------|---------------|
| DNS not resolving | Wait 30-60 min | See TRUSTHOST_DNS_SETUP.md Part 7 |
| Render verification failed | Check DNS propagation | See RENDER_SETUP_GUIDE.md Part 7, Issue 1 |
| SSL not issued | Wait 10 min | See RENDER_SETUP_GUIDE.md Part 7, Issue 2 |
| CORS errors | Check CORS_ORIGINS | See RENDER_SETUP_GUIDE.md Part 7, Issue 4 |
| Frontend can't reach API | Check VITE_API_URL | See RENDER_SETUP_GUIDE.md Part 7, Issue 4 |

---

## 📞 Support Contacts

**TrustHost:**
- Phone: +234 816 882 7678
- Email: support@trusthost.com.ng
- Website: https://www.trusthost.com.ng

**Render:**
- Email: support@render.com
- Docs: https://render.com/docs
- Community: https://community.render.com

**Admitly Platform:**
- GitHub: https://github.com/pathway360lead-create/admitly
- Issues: Use GitHub Issues for bugs

---

## 📝 Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Backend Prep | - | ✅ Done |
| Phase 2: TrustHost DNS | 30-45 min | ⏳ Your task |
| DNS Propagation (wait) | 30 min - 48 hrs | ⏳ Automatic |
| Phase 3: Render Setup | 20-30 min | ⏳ Your task |
| Phase 4: Testing | 10 min | ⏳ Your task |
| Phase 5: Documentation | 10 min | ⏳ Your task |
| **Total Active Work** | **70-95 min** | |
| **Total Wall Time** | **1-2 hours** | (typical) |

---

## 🎯 Current Status

**As of November 27, 2025:**

✅ **Backend Ready:** CORS configured for custom domain
⏳ **Your Next Step:** Configure DNS in TrustHost (Phase 2)

**Start Here:** Open `TRUSTHOST_DNS_SETUP.md` and begin Phase 2!

---

## 💡 Pro Tips

1. **Do phases in order** - Don't skip ahead
2. **Wait for DNS** - Rushing causes issues
3. **Double-check URLs** - No typos in .onrender.com
4. **Test thoroughly** - Don't skip testing phase
5. **Use incognito mode** - When testing (avoids cache)
6. **Keep guides open** - Reference detailed guides as needed
7. **Take screenshots** - Of TrustHost and Render for records
8. **Don't panic** - DNS propagation can take time

---

## 📱 Mobile-Friendly Checklist

Save this page or print it to check off as you go!

```
□ Phase 1 (done already)
□ Phase 2: TrustHost Setup
  □ Login
  □ Delete old records
  □ Add www CNAME
  □ Add api CNAME
  □ Add search CNAME
  □ Wait for DNS propagation
□ Phase 3: Render Setup
  □ Add frontend domain
  □ Add API domain
  □ Add search domain
  □ Update environment variables
□ Phase 4: Testing
  □ Test all URLs
  □ Verify SSL
  □ Check CORS
□ Phase 5: Documentation
  □ Update docs
  □ Commit changes
□ Done! 🎉
```

---

**Last Updated:** November 27, 2025
**Status:** Ready to begin Phase 2
**Next Action:** Open TRUSTHOST_DNS_SETUP.md
**Estimated Time:** 1-2 hours total

