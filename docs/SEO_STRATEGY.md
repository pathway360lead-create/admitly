# SEO Audit and Strategy Report

**Date:** December 15, 2025
**Target:** ScholarData (Educational Directory for Nigerian Institutions)

## 1. Executive Summary
The current web application is a Single Page Application (SPA) built with React and Vite. While it offers a modern user experience, it currently lacks critical technical SEO elements required for search engines to index and rank the content effectively.

**Critical Findings:**
- **Missing Dynamic Metadata:** All pages currently share the same static title and description from `index.html`.
- **No Sitemap/Robots:** Search engines have no map of the site structure.
- **Client-Side Rendering (CSR):** Without pre-rendering or dynamic meta tag injection, many crawlers (especially social media bots) will see a blank page.

**Top Priority:** Implement `react-helmet-async` for dynamic meta tags and generate a `sitemap.xml`.

---

## 2. Technical SEO Strategy

### A. Dynamic Meta Tags (High Priority)
**Problem:** The `<title>` and `<meta name="description">` are static. A user searching for "University of Lagos" sees the generic "Admitly" title.
**Solution:**
1.  **Install `react-helmet-async`**.
2.  Create a `<SEO />` component that accepts `title`, `description`, `image`, and `type` props.
3.  Wrap the app in `HelmetProvider` in `main.tsx`.
4.  Use `<SEO />` in every page component.

**Example Implementation:**
```tsx
// components/SEO.tsx
import { Helmet } from 'react-helmet-async';

export const SEO = ({ title, description, image, url }) => (
  <Helmet>
    <title>{title} | Admitly</title>
    <meta name="description" content={description} />
    <meta property="og:title" content={title} />
    <meta property="og:description" content={description} />
    {/* ... other tags */}
  </Helmet>
);
```

### B. Crawlability & Indexing
**Problem:** No `robots.txt` or `sitemap.xml`.
**Solution:**
1.  **create `public/robots.txt`:**
    ```text
    User-agent: *
    Allow: /
    Sitemap: https://admitly.com.ng/sitemap.xml
    ```
2.  **Generate `sitemap.xml`:**
    - Since this is a dynamic site, you should generate the sitemap on the **backend** (e.g., an endpoint `/sitemap.xml` that queries the database for all institutions and programs and returns XML).
    - Or, use a build-time script if the data changes infrequently.

### C. URL Structure
**Status:** ✅ Good.
- You are using `/institutions/:slug` and `/programs/:slug` in `App.tsx`.
- **Recommendation:** Ensure slugs are "clean" (lowercase, hyphens, no special chars). e.g., `university-of-lagos` instead of `University%20Of%20Lagos`.

### D. Structured Data (Schema.org)
**Problem:** Zero structured data. Google doesn't "know" a page represents a University.
**Solution:** Inject JSON-LD into the `<head>` using Helmet.
- **Institutions:** Use `EducationalOrganization` schema.
- **Programs:** Use `Course` or `EducationalOccupationalProgram` schema.
- **Search:** Use `WebSite` schema with `potentialAction` for sitelinks search box.

---

## 3. On-Page SEO & Content Strategy

### A. Keyword Targeting (Nigeria Focus)
Based on research, target these high-volume keywords:
- **Primary:** "Universities in Nigeria", "Best universities in Nigeria", "JAMB admission requirements".
- **Secondary:** "Federal universities in [State]", "Private universities school fees".
- **Program Specific:** "Nursing schools in Nigeria", "Computer Science universities".

### B. Template Optimization
Optimize the specific pages as follows:

**1. Institution Detail Page (`/institutions/:slug`)**
- **Title:** `[Institution Name] - Admission, Courses, and Fees | Admitly`
- **H1:** `[Institution Name]`
- **Content:** Ensure these sections exist as H2s: "Courses Offered", "Admission Requirements", "School Fees", "Location".

**2. Program Detail Page (`/programs/:slug`)**
- **Title:** `[Program Name] at [Institution Name] - Requirements | Admitly`
- **H1:** `[Program Name]`
- **Description:** "Study [Program] at [Institution]. Learn about JAMB cutoff marks, O'level requirements, and tuition fees."

### C. Internal Linking
- **Related Programs:** On a program page, link to "Other programs at [Institution]".
- **Location Hubs:** Create "Universities in Lagos" pages listing all Lagos schools, linking to their detail pages.

---

## 4. Performance (Core Web Vitals)
**Status:** Vite is generally fast, but CSR has an initial load cost.
**Recommendations:**
- **Image Optimization:** Ensure institution logos and banners use `WebP` format and have `width/height` attributes to prevent Layout Shift (CLS).
- **Code Splitting:** React Router `lazy` loading is recommended for routes (already standard in many Vite templates, verify `React.lazy` usage).

---

## 5. Implementation Roadmap

| Phase | Task | Impact | Effort |
|-------|------|--------|--------|
| **1** | Install & Configure `react-helmet-async` | ⭐⭐⭐⭐⭐ (Critical) | Low |
| **2** | Add `robots.txt` & Basic `sitemap.xml` | ⭐⭐⭐⭐⭐ (Critical) | Low |
| **3** | Implement Dynamic Titles for Inst/Prog Pages | ⭐⭐⭐⭐ | Medium |
| **4** | Add JSON-LD Schema | ⭐⭐⭐ | Medium |
| **5** | Create "State/Location" Landing Pages | ⭐⭐⭐ | High |
