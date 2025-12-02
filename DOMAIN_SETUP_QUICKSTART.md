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
