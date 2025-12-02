# Render Custom Domain Setup Guide

**Platform:** Render (render.com)
**Date:** November 27, 2025
**Prerequisite:** DNS records configured in TrustHost (see TRUSTHOST_DNS_SETUP.md)
**Estimated Time:** 20-30 minutes

---

## 📋 Overview

This guide walks you through configuring custom domains in your Render dashboard for all 3 Admitly services:
1. **admitly-web** (Frontend) → www.admitly.com.ng
2. **admitly-api** (Backend) → api.admitly.com.ng
3. **admitly-search** (Meilisearch) → search.admitly.com.ng

---

## ✅ Prerequisites

Before starting, ensure:
- [x] DNS records configured in TrustHost (completed Step 1-10)
- [x] DNS propagated (wait at least 30 minutes after TrustHost configuration)
- [x] Render account credentials
- [x] This guide open

---

## 🎯 Part 1: Log in to Render

### Step 1: Open Render Dashboard

1. Open your web browser (Chrome, Firefox, or Edge)
2. Go to: **https://dashboard.render.com**
3. Click **"Sign In"** (top-right corner)

### Step 2: Sign In

1. **If you signed up with GitHub:**
   - Click "Sign in with GitHub"
   - Authorize if prompted

2. **If you signed up with Email:**
   - Enter your email address
   - Enter your password
   - Click "Sign In"

**Trouble Signing In?**
- Forgot password? Click "Forgot password?" link
- Can't access email? Contact Render support
- Account locked? Check your email for verification

---

## 🎯 Part 2: Configure Frontend (admitly-web)

### Step 3: Open admitly-web Service

1. After signing in, you'll see your Render Dashboard
2. Look for a list of your services (Web Services, Static Sites, etc.)
3. Find and click on: **admitly-web**
4. This opens the service details page

**Can't find admitly-web?**
- Use the search bar at the top
- Check "Web Services" or "Static Sites" category
- Make sure you're in the correct team/workspace

### Step 4: Navigate to Settings

1. On the admitly-web service page, look for tabs at the top:
   - **Events** | **Logs** | **Shell** | **Settings** | **Environment**
2. Click on the **Settings** tab
3. Scroll down to find **"Custom Domains"** section

**What you should see:**
```
┌─────────────────────────────────────────────────────┐
│ Custom Domains                                      │
├─────────────────────────────────────────────────────┤
│ Add a custom domain to this service                 │
│                                                     │
│ [Add Custom Domain]                                 │
│                                                     │
│ • admitly-web.onrender.com (Render domain)         │
└─────────────────────────────────────────────────────┘
```

### Step 5: Add First Custom Domain (www.admitly.com.ng)

1. Click the **[Add Custom Domain]** button
2. A dialog box will appear asking for domain name
3. In the input field, type: **www.admitly.com.ng**
4. Click **"Save"** or **"Add"** or **"Continue"**

**What happens next:**
- Render will verify DNS configuration
- This may take 1-5 minutes
- You'll see a status indicator

**Status Indicators:**
- 🟡 **Verifying...** = Render is checking DNS
- ✅ **Verified** = DNS is correct
- ❌ **Verification Failed** = DNS issue (see troubleshooting)

### Step 6: Wait for SSL Certificate

After domain verification:

1. Render automatically requests an SSL certificate from Let's Encrypt
2. This takes 1-10 minutes (usually 2-5 minutes)
3. You'll see progress: "Requesting certificate..."
4. When complete, you'll see:

```
✅ www.admitly.com.ng
   Status: Active
   SSL: Secure
```

**⏳ If it's taking longer than 10 minutes:**
- Check DNS propagation at dnschecker.org
- Ensure DNS points to admitly-web.onrender.com
- Try refreshing the Render page

### Step 7: Add Root Domain (admitly.com.ng) - OPTIONAL

**⚠️ Only do this if you successfully created a CNAME for @ in TrustHost**

If TrustHost allowed you to create a CNAME for the root domain:

1. Click **[Add Custom Domain]** again
2. Type: **admitly.com.ng** (without www)
3. Click **"Save"**
4. Wait for verification and SSL (1-10 minutes)

**If this fails:**
- It's okay! Users can access via www.admitly.com.ng
- Root domain (admitly.com.ng) is optional
- You can set up a redirect later

---

## 🎯 Part 3: Configure Backend API (admitly-api)

### Step 8: Navigate Back to Services

1. Click the Render logo (top-left) to go back to dashboard
2. Or click **"Dashboard"** in the navigation

### Step 9: Open admitly-api Service

1. Find and click on: **admitly-api** in your services list
2. This opens the API service details page

### Step 10: Add API Custom Domain

1. Click the **Settings** tab
2. Scroll down to **"Custom Domains"** section
3. Click **[Add Custom Domain]** button
4. In the input field, type: **api.admitly.com.ng**
5. Click **"Save"**

**Wait for:**
- ✅ DNS Verification (1-5 minutes)
- ✅ SSL Certificate issuance (1-10 minutes)

**When complete, you'll see:**
```
✅ api.admitly.com.ng
   Status: Active
   SSL: Secure
```

---

## 🎯 Part 4: Configure Search (admitly-search)

### Step 11: Navigate Back to Services

1. Click the Render logo or "Dashboard" to go back

### Step 12: Open admitly-search Service

1. Find and click on: **admitly-search** in your services list
2. This opens the Meilisearch service details page

### Step 13: Add Search Custom Domain

1. Click the **Settings** tab
2. Scroll down to **"Custom Domains"** section
3. Click **[Add Custom Domain]** button
4. In the input field, type: **search.admitly.com.ng**
5. Click **"Save"**

**Wait for:**
- ✅ DNS Verification (1-5 minutes)
- ✅ SSL Certificate issuance (1-10 minutes)

**When complete, you'll see:**
```
✅ search.admitly.com.ng
   Status: Active
   SSL: Secure
```

---

## 🎯 Part 5: Update Environment Variables

Now that custom domains are configured, you need to update environment variables so services know about the new URLs.

### Step 14: Update Backend Environment Variables (admitly-api)

1. Go back to **admitly-api** service
2. Click the **Environment** tab (not Settings!)
3. Look for the list of environment variables
4. Find **CORS_ORIGINS** variable

**Option A: CORS_ORIGINS Already Exists**

1. Click the **Edit** button (pencil icon) next to CORS_ORIGINS
2. Update the value to:
```
http://localhost:5173,http://localhost:3000,https://admitly-web.onrender.com,https://www.admitly.com.ng,https://admitly.com.ng
```
3. Click **"Save"**

**Option B: CORS_ORIGINS Doesn't Exist**

1. Click **[Add Environment Variable]** button
2. Key: `CORS_ORIGINS`
3. Value:
```
http://localhost:5173,http://localhost:3000,https://admitly-web.onrender.com,https://www.admitly.com.ng,https://admitly.com.ng
```
4. Click **"Save"**

**Also Update (if not already set):**

| Key | Value |
|-----|-------|
| ENVIRONMENT | `production` |
| DEBUG | `False` |

5. After saving all changes, click **"Save Changes"** at the bottom
6. Render will automatically redeploy the service (takes 2-5 minutes)

### Step 15: Update Frontend Environment Variables (admitly-web)

1. Go to **admitly-web** service
2. Click the **Environment** tab
3. Update or add these variables:

**Update VITE_API_URL:**

1. Find **VITE_API_URL** variable
2. Click Edit
3. Change value to: `https://api.admitly.com.ng`
4. Click Save

**Update VITE_MEILISEARCH_HOST:**

1. Find **VITE_MEILISEARCH_HOST** variable
2. Click Edit
3. Change value to: `https://search.admitly.com.ng`
4. Click Save

**Update VITE_SUPABASE_URL (if needed):**

1. Verify it's set correctly (should not change)
2. Value should be your Supabase project URL

5. Click **"Save Changes"** at the bottom
6. Render will redeploy frontend (2-5 minutes)

---

## 🎯 Part 6: Verify All Services

### Step 16: Check Deployment Status

After updating environment variables, Render automatically redeploys services.

**For each service (admitly-api, admitly-web, admitly-search):**

1. Go to the service page
2. Click the **Events** tab
3. Look for "Deploy succeeded" message
4. This confirms service is running with new configuration

**Timeline:**
- Backend (admitly-api): 2-5 minutes
- Frontend (admitly-web): 2-5 minutes
- Search (admitly-search): 1-3 minutes

### Step 17: Test Custom Domains

Once all services show "Deploy succeeded", test each domain:

**Test 1: Frontend (www.admitly.com.ng)**

1. Open browser
2. Go to: **https://www.admitly.com.ng**
3. ✅ Website should load with green padlock (SSL)

**Test 2: API (api.admitly.com.ng)**

1. Open browser
2. Go to: **https://api.admitly.com.ng/health**
3. ✅ Should show:
```json
{"status":"healthy","environment":"production","version":"1.0.0"}
```

**Test 3: Search (search.admitly.com.ng)**

1. Open browser
2. Go to: **https://search.admitly.com.ng/health**
3. ✅ Should show:
```json
{"status":"available"}
```

**Test 4: CORS (API calls from Frontend)**

1. Open **https://www.admitly.com.ng**
2. Press F12 to open DevTools
3. Click "Console" tab
4. Navigate to any page with data (e.g., Institutions page)
5. ✅ No CORS errors should appear
6. ✅ API calls should succeed (check Network tab)

---

## 🎯 Part 7: Common Render Issues & Solutions

### Issue 1: "Verification Failed" for Custom Domain

**Symptom:** Red X next to custom domain, says "Verification Failed"

**Solutions:**

1. **Check DNS Propagation:**
   - Go to https://dnschecker.org
   - Enter your subdomain (e.g., www.admitly.com.ng)
   - Select CNAME
   - Verify it shows admitly-web.onrender.com

2. **Wait Longer:**
   - DNS may not be fully propagated
   - Wait 1-2 hours and check again
   - Render checks DNS every few minutes

3. **Verify DNS Record in TrustHost:**
   - Log back into TrustHost
   - Verify CNAME record exists and is correct
   - Check for typos in subdomain or value

4. **Remove and Re-add:**
   - In Render, click the X to remove failed domain
   - Wait 5 minutes
   - Add domain again

### Issue 2: SSL Certificate Not Issued

**Symptom:** Domain verified but no SSL certificate (gray lock or http://)

**Solutions:**

1. **Wait Longer:**
   - SSL can take up to 10 minutes
   - Refresh Render page to check status

2. **Check Domain Status:**
   - Ensure domain shows "Verified"
   - SSL won't issue if verification failed

3. **Check Rate Limits:**
   - Let's Encrypt has rate limits
   - If you tried adding domain multiple times, wait 1 hour

4. **Contact Render Support:**
   - If no SSL after 1 hour, open support ticket
   - Provide domain name and service name

### Issue 3: "Deploy Failed" After Updating Variables

**Symptom:** Service shows "Deploy failed" in Events tab

**Solutions:**

1. **Check Logs:**
   - Click "Logs" tab
   - Look for error messages (usually at the bottom)
   - Common errors:
     - Environment variable format errors
     - Missing required variables

2. **Verify Variable Format:**
   - CORS_ORIGINS should be comma-separated (no spaces)
   - URLs should include `https://` or `http://`
   - No trailing slashes

3. **Rollback Environment Variables:**
   - Click "Environment" tab
   - Revert to previous working values
   - Save and let service redeploy

4. **Manual Deploy:**
   - Go to service page
   - Click "Manual Deploy" button
   - Select "Deploy latest commit"

### Issue 4: Frontend Loads But Can't Connect to API

**Symptom:** Website loads but gets network errors for API calls

**Solutions:**

1. **Check API URL:**
   - In admitly-web Environment tab
   - Verify VITE_API_URL = `https://api.admitly.com.ng`
   - Should have `https://` (not http://)
   - No trailing slash

2. **Check CORS:**
   - Go to admitly-api Environment tab
   - Verify CORS_ORIGINS includes `https://www.admitly.com.ng`
   - Check for typos

3. **Test API Directly:**
   - Visit https://api.admitly.com.ng/health
   - If this fails, API domain not configured correctly
   - If this works, it's a CORS issue

4. **Clear Browser Cache:**
   - Hard refresh: Ctrl + Shift + R
   - Or use incognito mode
   - Old cached files may have old API URL

### Issue 5: Mixed Content Warnings

**Symptom:** Browser console shows "Mixed content" errors

**Solution:**
- All URLs must use `https://`
- Check VITE_API_URL in frontend environment
- Check VITE_MEILISEARCH_HOST
- Ensure no `http://` (without s) in production

---

## 🎯 Part 8: Optional - Set Up Redirects

### Redirect www to non-www (or vice versa)

If you want all traffic to use ONE domain:

**Option A: Redirect to www (Recommended)**

Render automatically redirects admitly.com.ng → www.admitly.com.ng if both are configured. No action needed!

**Option B: Redirect to non-www**

Contact Render support to set up reverse redirect.

### Redirect Old Render URLs

If you want admitly-web.onrender.com to redirect to www.admitly.com.ng:

1. This requires custom code in your frontend
2. Add this to your frontend (not recommended, unnecessary complexity)
3. Most users just use custom domain and Render URL works alongside it

---

## 📊 Expected Render Dashboard State

After completing all steps, here's what you should see:

**admitly-web Service:**
```
┌──────────────────────────────────────────────────┐
│ Custom Domains                                   │
├──────────────────────────────────────────────────┤
│ ✅ www.admitly.com.ng                           │
│    Status: Active | SSL: Secure                  │
│                                                  │
│ ✅ admitly.com.ng (optional)                    │
│    Status: Active | SSL: Secure                  │
│                                                  │
│ • admitly-web.onrender.com                      │
│   (Default Render domain)                        │
└──────────────────────────────────────────────────┘

Environment Variables:
├─ VITE_API_URL: https://api.admitly.com.ng
├─ VITE_MEILISEARCH_HOST: https://search.admitly.com.ng
├─ VITE_SUPABASE_URL: https://jvmmexjbnolzukhdhwds.supabase.co
└─ VITE_SUPABASE_ANON_KEY: eyJh...
```

**admitly-api Service:**
```
┌──────────────────────────────────────────────────┐
│ Custom Domains                                   │
├──────────────────────────────────────────────────┤
│ ✅ api.admitly.com.ng                           │
│    Status: Active | SSL: Secure                  │
│                                                  │
│ • admitly-api.onrender.com                      │
│   (Default Render domain)                        │
└──────────────────────────────────────────────────┘

Environment Variables:
├─ CORS_ORIGINS: http://localhost:5173,...,https://www.admitly.com.ng
├─ ENVIRONMENT: production
├─ DEBUG: False
├─ SUPABASE_URL: https://jvmmexjbnolzukhdhwds.supabase.co
└─ ...
```

**admitly-search Service:**
```
┌──────────────────────────────────────────────────┐
│ Custom Domains                                   │
├──────────────────────────────────────────────────┤
│ ✅ search.admitly.com.ng                        │
│    Status: Active | SSL: Secure                  │
│                                                  │
│ • admitly-search.onrender.com                   │
│   (Default Render domain)                        │
└──────────────────────────────────────────────────┘
```

---

## ✅ Render Configuration Complete!

Once you see:
- ✅ All custom domains showing green checkmarks
- ✅ All SSL certificates showing "Secure"
- ✅ All services deployed successfully
- ✅ All test URLs working

**You're done with Render configuration! 🎉**

---

## 📞 Render Support

If you need help:

**Render Support:**
- **Dashboard:** https://dashboard.render.com
- **Support:** support@render.com
- **Docs:** https://render.com/docs
- **Community:** https://community.render.com
- **Status:** https://status.render.com

**Support Ticket:**
1. Go to dashboard.render.com
2. Click your profile icon (top-right)
3. Click "Support"
4. Click "Submit a request"
5. Fill in details and submit

**Response Time:**
- Free tier: 24-48 hours
- Paid tier: 4-24 hours
- Critical issues: Faster response

---

## 📝 Quick Summary

**What We Did:**
1. ✅ Logged into Render dashboard
2. ✅ Added custom domain to admitly-web (www.admitly.com.ng)
3. ✅ Added custom domain to admitly-api (api.admitly.com.ng)
4. ✅ Added custom domain to admitly-search (search.admitly.com.ng)
5. ✅ Waited for SSL certificates (automatic)
6. ✅ Updated environment variables
7. ✅ Verified all services deployed
8. ✅ Tested all custom domains

**What You Can Do Now:**
- ✅ Access platform at https://www.admitly.com.ng
- ✅ API available at https://api.admitly.com.ng
- ✅ Search works at https://search.admitly.com.ng
- ✅ All traffic encrypted with SSL
- ✅ Platform fully functional on custom domain

---

## 🎯 Next Steps

1. **Test Everything:**
   - Visit https://www.admitly.com.ng
   - Create account, search institutions, etc.
   - Verify no errors in browser console

2. **Update Documentation:**
   - Update README.md with new URLs
   - Update PROJECT_STATUS.md (mark custom domain ✅)

3. **Update Marketing:**
   - Update social media links
   - Update email signatures
   - Update business cards/flyers

4. **Set Up Monitoring:**
   - Monitor uptime
   - Check SSL expiration (Render auto-renews)
   - Watch error logs

---

**Last Updated:** November 27, 2025
**Status:** Ready for configuration
**Prerequisite:** DNS configured in TrustHost
**Estimated Time:** 20-30 minutes
