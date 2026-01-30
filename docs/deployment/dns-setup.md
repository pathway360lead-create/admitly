# TrustHost DNS Configuration Guide for admitly.com.ng

**Domain Registrar:** TrustHost (trusthost.com.ng)
**Domain:** admitly.com.ng
**Date:** November 27, 2025
**Estimated Time:** 30-45 minutes

---

## 📋 Overview

This guide provides **exact step-by-step instructions** for configuring DNS records on TrustHost for your Admitly platform. Follow each step carefully.

---

## ✅ Before You Start - Prerequisites

Make sure you have:

- [x] TrustHost account login credentials (email/password)
- [x] Access to admitly.com.ng domain in TrustHost
- [x] This guide open
- [x] Notepad open to copy/paste DNS values

**Render Service URLs (you'll need these):**
```
Frontend: admitly-web.onrender.com
Backend:  admitly-api.onrender.com
Search:   admitly-search.onrender.com
```

---

## 🎯 Part 1: Log in to TrustHost

### Step 1: Open TrustHost Website

1. Open your web browser (Chrome, Firefox, or Edge)
2. Go to: **https://www.trusthost.com.ng**
3. Click **"Client Login"** or **"Sign In"** button (usually top-right corner)

### Step 2: Log In to Your Account

1. Enter your **Email Address** (the one you used to purchase the domain)
2. Enter your **Password**
3. Click **"Login"** or **"Sign In"**

**Trouble Logging In?**
- If you forgot password, click "Forgot Password" and check your email
- If you can't access your email, contact TrustHost support: +234 816 882 7678

---

## 🎯 Part 2: Access Domain Management

### Step 3: Navigate to Domain Management

After logging in, you'll see a dashboard. Now:

1. Look for a menu item called **"Domains"** or **"My Domains"**
2. Click on it
3. You should see a list of your domains
4. Find **admitly.com.ng** in the list
5. Click on **"Manage"** or **"Manage Domain"** next to admitly.com.ng

**Alternative Path:**
- Some TrustHost accounts show domains on the main dashboard
- Look for "admitly.com.ng" and click directly on it

### Step 4: Open DNS Management

Once you're viewing the admitly.com.ng domain page:

1. Look for a tab or button labeled one of these:
   - **"DNS Management"**
   - **"Manage DNS"**
   - **"DNS Zone"**
   - **"DNS Records"**
   - **"Name Servers"**

2. Click on it to open the DNS management page

**What You Should See:**
- A page with existing DNS records (A records, NS records, etc.)
- Buttons to "Add Record" or "Add New Record"
- Possibly some default TrustHost DNS records

---

## 🎯 Part 3: Delete Old Records (IMPORTANT!)

### Step 5: Remove Conflicting A Records

Before adding new CNAME records, you must **delete any existing A records** for the root domain and www subdomain.

**Look for these records and DELETE them if they exist:**

| Type | Name | Value | Action |
|------|------|-------|--------|
| A | @ | (any IP address) | ❌ DELETE |
| A | www | (any IP address) | ❌ DELETE |
| A | * | (any IP address) | ❌ DELETE |

**How to Delete:**
1. Find the record in the list
2. Look for a "Delete" button, "X" icon, or trash icon next to it
3. Click the delete button
4. Confirm deletion when prompted

**⚠️ IMPORTANT:**
- DO NOT delete NS (Name Server) records - these are required!
- DO NOT delete MX (Mail) records if you use email
- ONLY delete A records for @, www, and * (wildcard)

**Example of what to keep:**
- NS records (ns1.trusthost.com.ng, ns2.trusthost.com.ng)
- SOA record
- Any MX records if you have email

---

## 🎯 Part 4: Add CNAME Records

Now you'll add 4 CNAME records. Follow the exact format below.

### Step 6: Add Record 1 - Main Domain (admitly.com.ng)

**⚠️ NOTE FOR TRUSTHOST:**
TrustHost may NOT allow CNAME records on the root domain (@). If you get an error, see "Alternative Setup" section below.

**Try this first:**

1. Click **"Add Record"** or **"Add New Record"** button
2. Fill in the form:

```
Record Type: CNAME
Name/Host: @ (or leave blank, or type "admitly.com.ng")
Value/Points To: admitly-web.onrender.com
TTL: 3600 (or "1 Hour" or "Automatic")
```

3. Click **"Save"** or **"Add Record"**

**Did you get an error?**
- Error: "CNAME not allowed on root domain" → See Alternative Setup below
- If successful, continue to Step 7

---

### 📝 Alternative Setup (If CNAME on @ Fails)

If TrustHost doesn't allow CNAME on the root domain, use this method:

**Method: Contact TrustHost Support to Enable CNAME Flattening**

1. **Open a Support Ticket:**
   - Go to TrustHost support page
   - Or call: +234 816 882 7678
   - Or email: support@trusthost.com.ng
   - Or use live chat if available

2. **Send This Message:**
   ```
   Subject: Enable CNAME Flattening for admitly.com.ng

   Hello TrustHost Support,

   I need to set up CNAME records for my root domain admitly.com.ng
   to point to a Render hosting service.

   Domain: admitly.com.ng
   Request: Please enable CNAME flattening or ALIAS record support
   for my domain.

   Target: admitly-web.onrender.com

   Alternatively, if your system doesn't support this, please advise
   on how to point my root domain to a CNAME target.

   Thank you.
   ```

3. **Wait for Response:** Usually 1-24 hours
4. **Follow their instructions** when they respond

**Temporary Workaround:**
While waiting for support, you can use **www.admitly.com.ng** as your main domain and skip the root domain for now.

---

### Step 7: Add Record 2 - WWW Subdomain

This record is critical and should work without issues.

1. Click **"Add Record"** or **"Add New Record"** button
2. Fill in the form **EXACTLY** as shown:

```
Record Type: CNAME
Name/Host: www
Value/Points To: admitly-web.onrender.com
TTL: 3600
```

**Important Details:**
- Name should be just **"www"** (without quotes)
- DO NOT include ".admitly.com.ng" after www
- Value should be **"admitly-web.onrender.com"** (without https://)
- DO NOT add a dot (.) at the end

3. Click **"Save"** or **"Add Record"**
4. ✅ Verify it appears in your DNS records list

---

### Step 8: Add Record 3 - API Subdomain

This record points your API to the backend service.

1. Click **"Add Record"** or **"Add New Record"** button
2. Fill in the form **EXACTLY** as shown:

```
Record Type: CNAME
Name/Host: api
Value/Points To: admitly-api.onrender.com
TTL: 3600
```

**Important Details:**
- Name should be just **"api"** (without quotes)
- DO NOT include ".admitly.com.ng" after api
- Value should be **"admitly-api.onrender.com"** (without https://)
- DO NOT add a dot (.) at the end

3. Click **"Save"** or **"Add Record"**
4. ✅ Verify it appears in your DNS records list

---

### Step 9: Add Record 4 - Search Subdomain

This record points your search to Meilisearch service.

1. Click **"Add Record"** or **"Add New Record"** button
2. Fill in the form **EXACTLY** as shown:

```
Record Type: CNAME
Name/Host: search
Value/Points To: admitly-search.onrender.com
TTL: 3600
```

**Important Details:**
- Name should be just **"search"** (without quotes)
- DO NOT include ".admitly.com.ng" after search
- Value should be **"admitly-search.onrender.com"** (without https://)
- DO NOT add a dot (.) at the end

3. Click **"Save"** or **"Add Record"**
4. ✅ Verify it appears in your DNS records list

---

## 🎯 Part 5: Verify DNS Records in TrustHost

### Step 10: Review All Records

After adding all records, your DNS zone should look like this:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | @ (or blank) | admitly-web.onrender.com | 3600 |
| CNAME | www | admitly-web.onrender.com | 3600 |
| CNAME | api | admitly-api.onrender.com | 3600 |
| CNAME | search | admitly-search.onrender.com | 3600 |
| NS | @ | ns1.trusthost.com.ng | (default) |
| NS | @ | ns2.trusthost.com.ng | (default) |

**✅ Checklist:**
- [ ] 4 CNAME records visible in DNS zone
- [ ] No typos in subdomain names (www, api, search)
- [ ] No typos in Render URLs (.onrender.com)
- [ ] No A records for @, www, api, or search
- [ ] NS records still present (don't delete these!)

---

## 🎯 Part 6: Wait for DNS Propagation

### Step 11: Understand DNS Propagation

After saving DNS records, they need time to propagate globally.

**DNS Propagation Timeline:**
- **Fastest:** 15-30 minutes (if TTL is low)
- **Typical:** 1-2 hours
- **Maximum:** 24-48 hours (rare)

**What happens during propagation:**
- DNS servers worldwide update their caches
- Some regions see changes faster than others
- You may see the old site, then new site, then old site again (this is normal)

### Step 12: Check DNS Propagation Status

**Method 1: Use Online DNS Checker**

1. Open your browser
2. Go to: **https://dnschecker.org**
3. Enter: **www.admitly.com.ng**
4. Select record type: **CNAME**
5. Click **"Search"**
6. You should see **"admitly-web.onrender.com"** as the result
7. Check multiple locations (Lagos, London, New York, etc.)

**What to look for:**
- ✅ Green checkmarks = DNS propagated in that region
- ❌ Red X or old values = Still propagating
- Gray/blank = Server timeout (normal during propagation)

**Repeat for:**
- api.admitly.com.ng → Should show admitly-api.onrender.com
- search.admitly.com.ng → Should show admitly-search.onrender.com

---

**Method 2: Use Command Prompt (Windows)**

1. Press **Windows Key + R**
2. Type: **cmd**
3. Press **Enter**
4. In the black window, type these commands one by one:

```bash
nslookup www.admitly.com.ng
nslookup api.admitly.com.ng
nslookup search.admitly.com.ng
```

**What you should see:**
```
Server:  [Your DNS Server]
Address:  [IP Address]

Non-authoritative answer:
Name:    admitly-web.onrender.com
Address:  [IP addresses]
Aliases:  www.admitly.com.ng
```

**If you see this, DNS is working! ✅**

**If you see "can't find" or "non-existent domain":**
- DNS hasn't propagated yet - wait 15-30 minutes and try again

---

**Method 3: Flush Your Local DNS Cache**

Sometimes your computer caches old DNS records. Flush it:

**Windows:**
```bash
# Open Command Prompt as Administrator
# (Right-click CMD → Run as Administrator)

ipconfig /flushdns
```

**You should see:**
```
Windows IP Configuration
Successfully flushed the DNS Resolver Cache.
```

Now try visiting www.admitly.com.ng in your browser.

---

## 🎯 Part 7: Common TrustHost Issues & Solutions

### Issue 1: "CNAME not allowed on apex/root domain"

**Symptom:** Error when trying to add CNAME for @ or root

**Solution:**
1. **Option A - Use WWW as Primary:**
   - Skip the @ CNAME record
   - Use www.admitly.com.ng as your main URL
   - Set up a redirect later (see below)

2. **Option B - Contact TrustHost Support:**
   - Request CNAME flattening or ALIAS records
   - They may set it up manually for you

3. **Option C - Use A Records (Advanced):**
   - Get the IP address from Render support
   - Create A record for @ pointing to that IP
   - Note: IP may change, CNAME is preferred

---

### Issue 2: Changes Not Saving

**Symptom:** You click "Save" but records don't appear

**Solutions:**
1. **Check for Error Messages:**
   - Look for red error text after clicking Save
   - Common errors: Invalid format, duplicate record

2. **Refresh the Page:**
   - Press F5 or Ctrl+R
   - Check if records now appear

3. **Try Different Browser:**
   - Sometimes browser cache causes issues
   - Try Chrome, Firefox, or Edge

4. **Log Out and Log Back In:**
   - Click "Logout"
   - Log in again
   - Navigate back to DNS management

---

### Issue 3: Old Records Won't Delete

**Symptom:** A records remain even after deleting

**Solutions:**
1. **Hard Refresh:**
   - Press Ctrl + Shift + R
   - Check if record is really gone

2. **Wait 5 Minutes:**
   - TrustHost may have a delay in processing
   - Check back after 5 minutes

3. **Contact Support:**
   - If record persists, contact TrustHost
   - They can delete it manually

---

### Issue 4: "Domain Locked" Message

**Symptom:** Can't make changes, see "Domain is locked" message

**Solutions:**
1. **Unlock Domain:**
   - In domain management, look for "Domain Lock" or "Transfer Lock"
   - Change status to "Unlocked" or "Disabled"
   - Note: Keep it locked after DNS changes for security

2. **Contact TrustHost:**
   - They can unlock it for you
   - Usually done within 1 hour

---

### Issue 5: Subdomain Not Working After 24 Hours

**Symptom:** DNS checker shows propagation, but site doesn't load

**Possible Causes:**
1. **Typo in DNS Record:**
   - Check for spaces, dots, or wrong characters
   - Re-check: admitly-web.onrender.com (no spaces!)

2. **Wrong Record Type:**
   - Make sure you created CNAME, not A record
   - Delete and recreate if wrong type

3. **Render Not Configured:**
   - DNS is working, but Render doesn't know about domain yet
   - Continue to Render configuration (Part 8)

---

## 🎯 Part 8: Screenshot of Expected TrustHost DNS Zone

**Your TrustHost DNS management page should look similar to this:**

```
┌─────────────────────────────────────────────────────────────────┐
│ DNS Records for admitly.com.ng                                  │
├──────┬────────┬──────────────────────────────┬──────┬──────────┤
│ Type │ Name   │ Value/Target                  │ TTL  │ Actions  │
├──────┼────────┼──────────────────────────────┼──────┼──────────┤
│ NS   │ @      │ ns1.trusthost.com.ng         │ 3600 │ [View]   │
│ NS   │ @      │ ns2.trusthost.com.ng         │ 3600 │ [View]   │
│ SOA  │ @      │ ns1.trusthost.com.ng ...     │ 3600 │ [View]   │
│ CNAME│ www    │ admitly-web.onrender.com     │ 3600 │ [Edit][x]│
│ CNAME│ api    │ admitly-api.onrender.com     │ 3600 │ [Edit][x]│
│ CNAME│ search │ admitly-search.onrender.com  │ 3600 │ [Edit][x]│
└──────┴────────┴──────────────────────────────┴──────┴──────────┘
```

**Important Notes:**
- ✅ 3 CNAME records visible (www, api, search)
- ✅ NS records present (don't delete!)
- ✅ No A records for www, api, or search
- ✅ Values end with .onrender.com
- ⚠️ Root domain (@) CNAME may be missing if not supported

---

## 📞 TrustHost Support Contact

If you encounter any issues:

**TrustHost Nigeria Contact:**
- **Website:** https://www.trusthost.com.ng
- **Phone:** +234 816 882 7678
- **Email:** support@trusthost.com.ng
- **Live Chat:** Available on their website (usually bottom-right)
- **WhatsApp:** Check their website for WhatsApp support

**Support Hours:**
- Monday - Friday: 9:00 AM - 5:00 PM WAT
- Saturday: 10:00 AM - 2:00 PM WAT
- Sunday: Closed (emergency support via email)

**When Contacting Support:**
- Mention domain: admitly.com.ng
- Explain you're setting up CNAME records
- Provide this guide if needed
- Be patient - response within 1-24 hours

---

## ✅ DNS Configuration Complete!

Once you've:
- ✅ Added 3-4 CNAME records (www, api, search, and optionally @)
- ✅ Deleted conflicting A records
- ✅ Verified DNS propagation with dnschecker.org
- ✅ Waited at least 30 minutes

**You're ready for the next step: Render Configuration!**

---

## 🎯 Next Steps

After DNS is configured and propagated:

1. **Configure Render Dashboard** → See `RENDER_SETUP_GUIDE.md` (I'll create this next)
2. **Update Environment Variables** → See `CUSTOM_DOMAIN_SETUP.md`
3. **Test All Endpoints** → See verification checklist
4. **Update PROJECT_STATUS.md** → Mark custom domain as ✅ CONFIGURED

---

## 📝 Quick Reference Card

**Save this for easy reference:**

```
Domain: admitly.com.ng

DNS Records to Add:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
1. www    → CNAME → admitly-web.onrender.com
2. api    → CNAME → admitly-api.onrender.com
3. search → CNAME → admitly-search.onrender.com
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TTL: 3600 (1 hour)

Test URLs after propagation:
- https://www.admitly.com.ng
- https://api.admitly.com.ng/health
- https://search.admitly.com.ng/health

DNS Checker: https://dnschecker.org
```

---

**Last Updated:** November 27, 2025
**Status:** Ready for configuration
**Estimated Time:** 30-45 minutes
**Next:** Configure Render (I'll create guide next)
