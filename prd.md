# Product Requirements Document
# Nigeria Student Data Services Platform (Admitly)

**Version:** 2.0
**Last Updated:** January 11, 2025
**Status:** Implementation Ready
**Target Launch:** November 30, 2025

---

## Executive Summary

Admitly is a comprehensive platform that centralizes verified educational data for Nigerian students, helping them discover, compare, and plan their educational journey across universities, polytechnics, colleges, and pre-degree programs. The platform aggregates data from 50+ institutions (expanding to 200+), provides AI-powered guidance, and delivers real-time updates on admissions, deadlines, and costs.

**Key Differentiators:**
- Centralized, verified data from institutional sources
- Real-time deadline tracking and alerts
- AI-powered personalized recommendations
- Comprehensive cost breakdowns and budgeting tools
- Career insights linked to program outcomes
- Mobile-first PWA with offline support

---

## Table of Contents

1. [Product Vision & Goals](#product-vision--goals)
2. [Market & User Research](#market--user-research)
3. [User Personas & Use Cases](#user-personas--use-cases)
4. [Feature Requirements](#feature-requirements)
5. [Technical Architecture](#technical-architecture)
6. [Data Strategy](#data-strategy)
7. [AI & Premium Features](#ai--premium-features)
8. [Pricing & Business Model](#pricing--business-model)
9. [Implementation Roadmap](#implementation-roadmap)
10. [Success Metrics](#success-metrics)
11. [Risk Mitigation](#risk-mitigation)
12. [Compliance & Legal](#compliance--legal)

---

## Product Vision & Goals

### Vision Statement
To be Nigeria's most trusted and comprehensive platform for educational decision-making, empowering every student with accurate, timely information to make informed choices about their academic future.

### Product Goals

**Phase 1 (MVP - Weeks 1-14):**
- Launch with 50 verified institutions (federal universities, state universities, polytechnics, JUPEB centers)
- Achieve 1,000 beta users with 70%+ data freshness
- Web app + PWA with core features (search, compare, deadlines)
- Admin portal for content management

**Phase 2 (Scale - Months 4-6):**
- Expand to 200+ institutions
- Mobile app store deployment (iOS + Android)
- Alert notification system
- 10,000+ active users

**Phase 3 (Premium - Months 7-9):**
- AI-powered recommendations and guidance
- Premium subscription tier (₦1,500/month or ₦15,000/year)
- Payment integration via Paystack
- 500+ premium subscribers

**Phase 4 (Growth - Ongoing):**
- Institutional partnerships and verification
- Localization (Yoruba, Hausa, Igbo)
- Advanced analytics and reporting
- 50,000+ users, 1,000+ premium subscribers

---

## Market & User Research

### Market Opportunity

**Target Market:**
- 1.8 million JAMB candidates annually (Nigeria)
- 400,000+ candidates seeking polytechnic/college admissions
- 100,000+ pre-degree/JUPEB candidates
- Parents, guardians, school counselors

**Problem Statement:**
- Information fragmentation: Data scattered across 170+ institution websites
- Outdated information: Websites not updated regularly
- Lack of comparison tools: No way to compare programs side-by-side
- Missed deadlines: No centralized calendar or alerts
- Information asymmetry: Students in rural areas lack access to guidance

**Solution Impact:**
- Time savings: Reduce research time from weeks to hours
- Better decisions: Data-driven program selection
- Reduced costs: Avoid application fees for unsuitable programs
- Increased access: Level the playing field for all students

---

## User Personas & Use Cases

### Persona 1: UTME Candidate (Primary)
**Name:** Chidinma, 18, Lagos
**Goal:** Find the best Computer Science program within budget in Lagos/Ogun
**Pain Points:**
- Overwhelmed by 50+ universities offering CS
- Unsure which programs accept her UTME score (235)
- Worried about missing application deadlines
- Parents concerned about tuition costs

**Use Cases:**
1. Search for CS programs in Lagos with UTME cutoff ≤ 235
2. Compare tuition, duration, and accreditation across 3 programs
3. Set up deadline alerts for shortlisted programs
4. Use AI advisor to get personalized recommendations
5. Generate application checklist with required documents

### Persona 2: OND Seeker (Secondary)
**Name:** Ibrahim, 19, Kano
**Goal:** Find an affordable polytechnic for Electrical Engineering ND
**Pain Points:**
- Confusion about polytechnic vs university pathways
- Limited guidance on career prospects for ND vs HND
- Family budget constraints (₦200,000/year max)
- Needs to understand accommodation costs in different cities

**Use Cases:**
1. Filter polytechnics by state and tuition range
2. View cost breakdown including accommodation
3. Explore career paths for Electrical Engineering (ND/HND/BEng)
4. Compare 3 polytechnics side-by-side
5. Bookmark programs and share with parents

### Persona 3: Parent/Guardian (Secondary)
**Name:** Mrs. Okafor, 45, Entrepreneur
**Goal:** Help daughter choose a reputable program within family budget
**Pain Points:**
- Wants to ensure institution is accredited
- Concerned about hidden costs
- Needs assurance of graduate employment prospects
- Wants to understand ROI of education investment

**Use Cases:**
1. Filter by accreditation status (NUC/NBTE fully accredited)
2. View total cost projection (4-5 years)
3. Check graduate employment rates and outcomes
4. Verify institution contact details
5. Export comparison report to share with family

### Persona 4: School Counselor (Tertiary)
**Name:** Mr. Adebayo, 35, Secondary School Counselor
**Goal:** Guide 100+ SS3 students through program selection
**Pain Points:**
- Time-consuming to research for each student
- Needs curated lists for different student profiles
- Requires up-to-date deadline information
- Wants to track application status

**Use Cases:**
1. Create saved searches for common student profiles
2. Receive weekly digest of deadline updates
3. Export program lists for workshops
4. Access printable comparison charts
5. Subscribe to institution updates

### Persona 5: Institution Administrator (Tertiary)
**Name:** Dr. Amaka, 42, Admissions Officer
**Goal:** Ensure institutional data is accurate and up-to-date
**Pain Points:**
- Platform data may become outdated
- Wants to showcase programs to prospective students
- Needs analytics on student interest trends

**Use Cases:**
1. Submit data updates via admin portal
2. Review and approve platform listing
3. View analytics on program page views
4. Update application deadlines in real-time
5. Respond to student inquiries via verified contacts

---

## Feature Requirements

### 1. Search & Discovery

**Global Search**
- **Functionality:** Typo-tolerant full-text search across institutions and programs
- **Tech:** Meilisearch with sub-50ms response time
- **Features:**
  - Autocomplete with suggestions
  - Synonym support (university→uni, polytechnic→poly)
  - Search history (authenticated users)
  - Recent searches (local storage)
- **Filters:**
  - Institution type (federal/state/private university, polytechnic, college, JUPEB)
  - State/region (36 states + FCT)
  - Degree type (undergraduate, ND, HND, pre-degree, JUPEB)
  - Tuition range (₦0-₦500k+)
  - Accreditation status
  - Application status (open/closing soon/closed)
  - Mode (full-time, part-time, online)
- **Sorting:** Relevance, name, tuition (low-high), cutoff score, deadline proximity
- **View Modes:** Grid, list, map view
- **Pagination:** 20 items per page, load more or traditional pagination

**Advanced Filters**
- Duration (years)
- Acceptance rate
- Program modality (on-campus, online, hybrid)
- Available scholarships
- Direct entry acceptance
- Post-UTME requirement

**Search Performance:**
- Initial load: <200ms (p95)
- Filter application: <50ms
- Autocomplete: <100ms
- Cache: 5-minute TTL on search results

### 2. Institution Profiles

**Overview Tab**
- Name, logo, accreditation badges
- Type, state, city, address with map
- Founded year, ownership
- Website, email, phone, social media links
- Description and mission statement
- Verification status and last updated timestamp
- Quick stats: program count, acceptance rate range, tuition range

**Programs Tab**
- Searchable, filterable list of all programs
- Grouped by faculty/department
- Quick view: degree type, duration, tuition, cutoff
- Click through to program details

**Admissions Tab**
- General admission requirements
- Important dates and milestones
- Application process overview
- Post-UTME information (if applicable)
- Direct entry requirements
- Historical cutoff trends (chart)
- Acceptance rate by year

**Costs Tab**
- Tuition breakdown by program level
- Mandatory fees (acceptance, registration, departmental)
- Optional fees (accommodation, lab, library)
- Payment schedule and methods
- Available scholarships and financial aid
- Cost of living estimates for city
- Budget calculator (interactive)

**Contacts Tab**
- Admissions office contact
- Departmental focal persons
- Verified badge for contacts
- Office hours and location
- Social media handles
- Disclaimer about third-party verification

**Insights Tab** (Premium Feature)
- Popularity trend (views, bookmarks over time)
- Graduate employment rates
- Top employers of graduates
- Student satisfaction metrics (future)

**Actions**
- Bookmark institution
- Compare (add to comparison tray)
- Share (social media, link copy)
- Report outdated information

### 3. Program Profiles

**Hero Section**
- Program name, degree type, qualification
- Institution name and logo (linked)
- Duration, mode, accreditation badge
- Deadline countdown (if open)
- Quick actions: compare, bookmark, share

**Overview Tab**
- Detailed description
- Learning outcomes
- Curriculum summary
- Accreditation details
- Course structure (if available)

**Requirements Tab**
- UTME minimum score and subject combination
- O'Level requirements (number of credits, subjects)
- Post-UTME details
- Direct entry qualifications
- Special requirements (age limit, medical fitness, etc.)
- **Eligibility Checker:** Interactive tool where user inputs scores and receives instant feedback

**Timeline Tab**
- Application window (start/end dates)
- Screening/Post-UTME date
- Admission list release date
- Acceptance fee deadline
- Registration dates
- Visual timeline with countdowns

**Costs Tab**
- Tuition per year (itemized)
- Acceptance fee
- Departmental fees
- Lab/practical fees (if applicable)
- Total cost projection (full program duration)
- **Budget Calculator:** Interactive tool with cost breakdown and comparisons

**Career Outlook Tab**
- Job titles and roles
- Salary ranges (Nigeria, Africa, Global)
- Demand trend (growing/stable/declining)
- Top employers
- Required skills and certifications
- Career progression paths
- Labor market data sources cited

**Similar Programs**
- Recommendations based on field, location, tuition

**Application Checklist** (Premium Feature)
- Step-by-step application guide
- Document requirements
- Important dates
- Tips and reminders
- Export as PDF

### 4. Compare Tool

**Comparison Table**
- Side-by-side comparison of up to 3 programs or institutions
- Criteria rows:
  - Name and institution
  - Location and distance from user (if location shared)
  - Tuition and total cost
  - Duration
  - Cutoff scores
  - Acceptance rate
  - Requirements
  - Application deadline
  - Career outcomes (salary, employment rate)
- Highlight differences
- Visual indicators for better/worse values
- Export comparison (PDF/CSV - premium)
- Share comparison (unique URL)

**Comparison Tray**
- Sticky bottom bar with selected items
- Quick remove/add
- View comparison button
- Persistent across sessions (local storage)

**Comparison Analytics** (tracked)
- Most compared programs
- Comparison drop-off points

### 5. Deadlines & Alerts

**Deadlines Calendar**
- Monthly/weekly calendar view
- Deadline types: application start/end, screening, admission list, registration
- Color-coded by status (open, closing soon, closed)
- Filter by institution, program, state
- Subscribe to calendar (iCal export)

**Deadline Countdown**
- Days/hours until deadline
- Visual urgency indicators
- "Closing Soon" badge (≤7 days)

**Alert System** (Authenticated Users)
- Create custom alerts for:
  - Institution updates
  - Program deadlines
  - Cost changes
  - New programs
  - Cutoff releases
- Delivery channels:
  - Email notifications
  - Push notifications (PWA/mobile)
  - In-app notifications
- Alert frequency: real-time, daily digest, weekly summary
- Manage alerts in user dashboard

### 6. User Dashboard (Authenticated)

**Profile Management**
- Edit personal information
- Update preferences (notifications, location, interests)
- View subscription status and manage billing

**Bookmarks**
- Saved institutions and programs
- Add notes to bookmarks
- Organize into collections (premium)
- Share bookmarks with others

**Search History**
- Recent searches
- Saved searches with notifications
- Clear history option

**Alerts**
- Active alerts list
- Alert history
- Create/edit/delete alerts

**Application Tracker** (Premium Feature)
- Track application status for multiple programs
- Document checklist
- Payment tracking
- Reminders and notifications

**AI Chat History** (Premium Feature)
- Past conversations with AI advisor
- Export conversations
- Starred recommendations

### 7. AI Guidance (Premium Feature)

**AI Advisor Chat**
- **Tech:** Google Gemini (primary), Anthropic Claude (secondary), Llama 3.1 (fallback)
- **Budget:** ₦5,000/month (~$6 USD)
- **Features:**
  - Natural language conversation
  - Context-aware recommendations
  - Cite sources from platform data
  - Streaming responses (server-sent events)
  - Conversation history
  - Export chat as PDF

**Personalized Recommendations**
- Input: User profile (budget, location preferences, interests, UTME score, career goals)
- Output: Ranked list of programs with explanations
- Factors considered:
  - Eligibility (cutoff scores, requirements)
  - Budget constraints
  - Location preferences
  - Career alignment
  - Acceptance probability
  - Graduate outcomes
- **Explainability:** Detailed reasoning for each recommendation

**Application Planning**
- Generate personalized application timeline
- Task checklist with deadlines
- Document preparation guide
- Fee payment schedule
- Interview preparation tips

**Career Guidance**
- Explore career paths by field of study
- Skills gap analysis
- Recommended certifications
- Internship opportunities
- Salary expectations

**What-If Analysis**
- Scenario comparison: "What if I increase my budget by ₦100k?"
- Alternative pathways: ND→HND→BEng vs direct BSc
- Location tradeoffs: Lagos (high cost) vs Oyo (lower cost)

**Limitations & Disclaimers**
- AI advisor is not a replacement for official guidance
- Users should verify critical information with institutions
- AI output may contain errors; always cite sources
- Privacy: conversations are private, opt-in for storage

### 8. Admin Portal (Internal Staff)

**Dashboard**
- Key metrics: users, institutions, data freshness, scraper health
- Recent activity feed
- Alerts for critical issues

**Content Management**
- **Review Queue:**
  - Scraped data awaiting approval
  - Conflict detection (e.g., fee changed by >20%)
  - Approve/reject with notes
  - Bulk actions
- **Manual Entry:**
  - Add/edit institutions
  - Add/edit programs
  - Add/edit deadlines, costs
- **Version History:**
  - View change log for any entity
  - Rollback capability
  - Compare versions

**Scraper Monitoring**
- Scraper job status (success/failed)
- Last run time and duration
- Error logs and debugging
- Manual trigger scrapers
- Schedule configuration

**User Management**
- View user list and profiles
- Manage roles (student, premium, counselor, institution_admin, internal_admin)
- Suspend/activate accounts
- View user activity logs

**Analytics**
- User engagement metrics (DAU, MAU, retention)
- Search analytics (top queries, zero-result queries)
- Program popularity (views, bookmarks, comparisons)
- Premium conversion funnel
- Revenue metrics (MRR, ARR, churn)

**Institution Partnerships**
- Manage verified institutions
- Approve institution admin access
- Communication tools

---

## Technical Architecture

### Technology Stack

**Frontend**
- **Web:** React 18 + TypeScript, Vite
- **Mobile:** React Native + Expo
- **UI Framework:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand (global), React Query (server state)
- **Routing:** React Router (web), Expo Router (mobile)
- **Deployment:** Render (static sites + CDN)

**Backend**
- **API Framework:** FastAPI (Python 3.11+)
- **Database:** Supabase (PostgreSQL 15+)
- **Authentication:** Supabase Auth (JWT, OAuth, Magic Link)
- **Storage:** Supabase Storage (files, attachments)
- **Real-time:** Supabase Realtime (admin dashboard)
- **Search Engine:** Meilisearch (self-hosted on Render)
- **Cache:** Redis (rate limiting, API caching)
- **Deployment:** Render (web service + background workers)

**Data Pipeline**
- **Scraping:** Scrapy + Playwright
- **Scheduling:** APScheduler + Redis Queue
- **Deployment:** Render Background Workers

**Third-Party Services**
- **Payment:** Paystack (Nigerian payment gateway)
- **AI:** Google Gemini, Anthropic Claude, Llama 3.1
- **Email:** Supabase (SMTP) or SendGrid
- **Monitoring:** Sentry (error tracking)
- **Analytics:** PostHog (product analytics)

**Infrastructure**
- **Hosting:** Render (API + workers + frontend)
- **Database:** Supabase (managed PostgreSQL)
- **CDN:** Render CDN + Cloudflare (optional)
- **Domain:** admitly.com.ng

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                         │
├─────────────────────────────────────────────────────────┤
│ React Web App │ React Native Mobile │ Admin Portal     │
│   (Render)    │   (Expo + PWA)     │   (Render)       │
└───────┬───────┴───────────┬────────┴────────┬──────────┘
        │                   │                 │
        └───────────────────┼─────────────────┘
                            │
                   ┌────────▼────────┐
                   │   Render CDN    │
                   │ (Static Sites)  │
                   └────────┬────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼──────┐   ┌────────▼──────┐   ┌───────▼──────┐
│  Supabase    │   │  FastAPI      │   │ Meilisearch  │
│  (DB + Auth) │◄──│  on Render    │◄──│  on Render   │
└───────┬──────┘   └────────┬──────┘   └──────────────┘
        │                   │
        │          ┌────────▼──────────┐
        │          │ Render Workers    │
        │          │ (Scrapers + Jobs) │
        │          └────────┬──────────┘
        │                   │
        └───────────────────┼────────────────┐
                            │                │
                   ┌────────▼───────┐  ┌─────▼──────┐
                   │  Supabase      │  │  External  │
                   │  Storage       │  │  APIs      │
                   │  (Files/Docs)  │  │  Gemini    │
                   └────────────────┘  │  Claude    │
                                       │  Paystack  │
                                       └────────────┘
```

### Database Schema

**Core Tables (12+):**
1. `user_profiles` - User accounts and preferences
2. `institutions` - Institution profiles
3. `institution_contacts` - Focal persons
4. `programs` - Program listings
5. `program_requirements` - Entry requirements
6. `program_cutoffs` - Historical cutoff scores
7. `application_windows` - Deadlines and dates
8. `costs` - Tuition and fees
9. `city_cost_of_living` - Living expenses by city
10. `scholarships` - Financial aid information
11. `career_insights` - Job prospects and salaries
12. `user_bookmarks` - Saved programs/institutions
13. `user_search_history` - Search queries
14. `user_alerts` - Alert subscriptions
15. `notifications` - In-app notifications
16. `ai_conversations` - Chat history
17. `ai_messages` - Chat messages
18. `ai_recommendations` - AI-generated recommendations
19. `transactions` - Payment records
20. `change_log` - Audit trail for data changes

**Staging Tables:**
- Mirror production tables for approval workflow
- Used by scrapers and institution admins

**Row Level Security (RLS):**
- All tables protected by RLS policies
- Role-based access control (anonymous, student, premium, counselor, institution_admin, internal_admin)
- Users can only access their own data
- Public data (published institutions/programs) accessible to all

**Full Schema:** See `/specs/database-schema.md`

### API Architecture

**REST API Endpoints (70+):**
- **Institutions:** List, get details, get programs
- **Programs:** List, get details, search
- **Search:** Global search, autocomplete
- **Compare:** Compare programs/institutions
- **Deadlines:** List windows, calendar view
- **Alerts:** Create, list, update, delete
- **Users:** Profile, bookmarks, search history
- **AI:** Conversations, messages, recommendations
- **Payments:** Initialize, verify, transactions
- **Admin:** Review queue, approve/reject, analytics

**API Standards:**
- RESTful design with JSON payloads
- JWT Bearer authentication (Supabase)
- Rate limiting by role (100-5,000 req/hr)
- Pagination (cursor-based)
- Filtering, sorting, field selection
- Consistent error responses
- OpenAPI/Swagger documentation

**Full API Spec:** See `/specs/api-specification.md`

### Performance & Scalability

**Caching Strategy:**
1. **CDN (Render):** Static assets (images, CSS, JS) - 1 year TTL
2. **API Cache (Redis):** Search results (5 min), profiles (15 min), analytics (1 hr)
3. **Browser Cache:** Service Worker for PWA, offline fallback
4. **Database Cache:** Materialized views refreshed nightly

**Scalability Targets:**
- 10,000 concurrent users
- 1,000 requests/second (API)
- <200ms response time (p95)
- <50ms search latency (p95)
- 99.9% uptime

**Optimization Techniques:**
- Code splitting and lazy loading
- Image optimization (WebP, lazy load)
- Virtual scrolling for large lists
- Database read replicas
- Horizontal scaling (Render auto-scaling)

**Full Architecture:** See `/specs/system-architecture.md`

---

## Data Strategy

### Data Sources

**Primary Sources (50 Institutions for MVP):**

**Federal Universities (10):**
1. University of Ibadan (UI)
2. University of Lagos (UNILAG)
3. Obafemi Awolowo University (OAU)
4. Ahmadu Bello University (ABU)
5. University of Nigeria, Nsukka (UNN)
6. University of Benin (UNIBEN)
7. Federal University of Technology, Akure (FUTA)
8. University of Calabar (UNICAL)
9. Bayero University Kano (BUK)
10. Federal University of Technology, Minna (FUTMINNA)

**State Universities (5):**
11. Lagos State University (LASU)
12. Rivers State University (RSU)
13. Ekiti State University (EKSU)
14. Osun State University (UNIOSUN)
15. Ambrose Alli University (AAU)

**Private Universities (5):**
16. Covenant University
17. Babcock University
18. American University of Nigeria (AUN)
19. Afe Babalola University (ABUAD)
20. Bowen University

**Polytechnics (15):**
21. Yaba College of Technology (YABATECH)
22. Federal Polytechnic, Nekede
23. Kaduna Polytechnic
24. Federal Polytechnic, Ilaro
25. The Polytechnic, Ibadan
26-35. (Additional polytechnics)

**Colleges of Education (5):**
36-40. (Federal colleges)

**Specialized Institutions (5):**
41-45. (NDA, Maritime, Aviation, Police Academy, etc.)

**JUPEB/Pre-degree Centers (5):**
46-50. (JUPEB centers at major universities)

**Secondary Sources:**
- NUC (National Universities Commission) - Accreditation status
- NBTE (National Board for Technical Education) - Polytechnic accreditation
- JAMB - Cutoff scores and admission statistics
- Official social media channels
- Government press releases

**Tertiary Sources:**
- Labor market APIs for career data
- Salary surveys (Glassdoor, PayScale)
- Alumni networks (LinkedIn)

### Data Collection Pipeline

**Scraping Strategy:**
- **Frequency:**
  - High-change (deadlines, admissions): Daily during admission season, weekly off-season
  - Moderate-change (fees, programs): Biweekly
  - Low-change (profiles, contacts): Quarterly
- **Technology:** Scrapy (structured data) + Playwright (JavaScript-heavy sites)
- **Politeness:**
  - Respect robots.txt
  - Rate limiting (1-2 req/second per domain)
  - Randomized user agents
  - Request delays (2-5 seconds)
  - Off-peak hours scraping
- **Storage:** HTML snapshots stored in Supabase Storage for debugging

**Data Normalization:**
- Standardize dates (ISO 8601)
- Convert currency to kobo (₦1 = 100 kobo)
- Normalize phone numbers (+234 format)
- Clean and trim text fields
- Extract structured data from unstructured text

**Data Validation:**
- Schema validation (Pydantic models)
- Business rule validation (reasonable ranges)
- Duplicate detection (content hashing)
- Link validation (check URLs)
- Conflict detection (e.g., fee changed >20%)

**Staging & Approval Workflow:**
1. Scraped data lands in `staging_*` tables
2. Automated validation checks
3. Flagged items go to review queue (admin portal)
4. Admin approves/rejects with notes
5. Approved data promoted to production tables
6. Change logged in `change_log` table
7. Search index updated (Meilisearch)
8. Subscribers notified (if relevant)

**Data Quality KPIs:**
- **Freshness:** >85% of pages updated within SLA
- **Completeness:** >90% of required fields populated
- **Accuracy:** <5% discrepancy rate vs official sources
- **Timeliness:** <72 hours from change detection to publish

**Full Pipeline Spec:** See `/specs/data-pipeline.md`

### Data Governance

**Ethical Scraping:**
- Only scrape publicly accessible pages
- No login bypass or CAPTCHA circumvention
- Honor robots.txt and meta tags
- Attribute data sources with links
- Respect institution takedown requests
- Cache only summaries, link to originals

**Legal Compliance:**
- Fair use of publicly available data
- No copyright infringement
- Clear disclaimers about third-party data
- Institutional verification workflow
- Terms of service for platform usage

**Data Retention:**
- User data: Retained until account deletion (NDPR compliance)
- Scraped data: Retained indefinitely with version history
- HTML snapshots: 90-day retention for debugging
- Search history: 1-year retention (or user-requested deletion)
- Change logs: Permanent audit trail

---

## AI & Premium Features

### AI Service Architecture

**Model Selection:**
- **Primary:** Google Gemini 1.5 Flash (cost-effective, fast)
- **Secondary:** Anthropic Claude 3 Sonnet (complex reasoning)
- **Fallback:** Llama 3.1 via Ollama (offline, cost control)

**AI Budget:** ₦5,000/month (~$6 USD)

**Cost Optimization:**
- Prompt caching (Redis, 1-hour TTL)
- Token limits (500 tokens/request)
- Rate limiting (10 requests/day for free, unlimited for premium)
- Use smaller model for simple queries
- Fallback to templates when budget exhausted

### Premium Features

**Tier Comparison:**

| Feature | Free | Premium |
|---------|------|---------|
| Search & Browse | ✅ | ✅ |
| Compare (up to 3) | ✅ | ✅ |
| View Profiles | ✅ | ✅ |
| Bookmarks | ✅ (10 max) | ✅ (Unlimited) |
| Deadline Calendar | ✅ | ✅ |
| Alerts | ❌ | ✅ |
| AI Chat | ❌ | ✅ |
| AI Recommendations | ❌ | ✅ |
| Application Planner | ❌ | ✅ |
| Export Reports (PDF/CSV) | ❌ | ✅ |
| Offline Access (PWA) | Limited | Full |
| Priority Support | ❌ | ✅ |

**Pricing:**
- **Free:** ₦0 forever
- **Monthly Premium:** ₦1,500/month
- **Yearly Premium:** ₦15,000/year (save ₦3,000)

**Premium Value Proposition:**
- Save 10+ hours of research time (worth ₦10,000+ at student wage)
- Avoid costly application mistakes (₦5,000+ in wasted fees)
- Increase admission chances with AI guidance (priceless)
- Peace of mind with deadline alerts (no missed opportunities)

---

## Pricing & Business Model

### Revenue Streams

**1. Premium Subscriptions (Primary Revenue)**
- Monthly: ₦1,500/user/month
- Yearly: ₦15,000/user/year
- Target: 1,000 premium users by Year 1 (₦18M ARR)

**2. Institutional Partnerships (Future)**
- Verified badge: ₦50,000/year
- Featured placement: ₦20,000/month
- Analytics dashboard: ₦30,000/year
- Direct application integration: Custom pricing

**3. Affiliate Revenue (Future)**
- JAMB registration links
- Textbook and study materials
- Student accommodation
- Educational loans

**4. B2B Services (Future)**
- School counselor licenses (₦100,000/year for 500 students)
- Education consultancy partnerships
- White-label solutions for states/agencies

### Cost Structure

**Monthly Operating Costs:**

| Category | Service | Cost |
|----------|---------|------|
| **Infrastructure** | | |
| | Supabase Pro | $25 |
| | Render (API) | $21 |
| | Render (Workers) | $21 |
| | Render (Frontend) | $7 |
| | Meilisearch | $15 |
| **Subtotal Infrastructure** | | **$89** |
| **Services** | | |
| | AI (Gemini/Claude) | ₦5,000 ($6) |
| | Paystack | 1.5% per transaction |
| | Sentry | Free (5k events) |
| | Email (SendGrid) | Free (100/day) |
| **Subtotal Services** | | **~$6** |
| **TOTAL** | | **~$95/month (~₦152,000)** |

**Break-even Analysis:**
- Monthly costs: ₦152,000
- Premium subscription: ₦1,500/month
- Break-even: 102 premium subscribers
- Target: 500 subscribers by Month 9 (₦750k MRR)

**Revenue Projections (Conservative):**

| Month | Users | Premium | MRR | Costs | Profit |
|-------|-------|---------|-----|-------|--------|
| 3 (MVP Launch) | 1,000 | 50 (5%) | ₦75k | ₦152k | -₦77k |
| 6 (Phase 2) | 10,000 | 300 (3%) | ₦450k | ₦152k | ₦298k |
| 9 (Phase 3) | 25,000 | 750 (3%) | ₦1.1M | ₦180k | ₦920k |
| 12 (Year 1) | 50,000 | 1,500 (3%) | ₦2.25M | ₦220k | ₦2.03M |

**Funding Requirements:**
- **Seed Capital:** ₦2M (~$2,500)
  - 6 months operating costs: ₦1M
  - Marketing budget: ₦500k
  - Contingency: ₦500k
- **Runway:** 12 months to profitability
- **Path to Sustainability:** Achieve 200+ premium users by Month 6

---

## Implementation Roadmap

### Phase 0: Discovery ✅ COMPLETE (Weeks 1-3)

**Objectives:**
- ✅ Finalize PRD and technical specifications
- ✅ Make technology stack decisions
- ✅ Create institution priority list (50 for MVP)
- ⏳ Legal review (NDPR compliance, terms of service)
- ⏳ Initial institution outreach (partnerships)

**Deliverables:**
- ✅ PRD (this document)
- ✅ Technical specifications (8 documents in `/specs/`)
- ✅ Database schema
- ✅ API specification
- ⏳ Privacy policy and terms of service

---

### Phase 1: MVP (Weeks 1-14) - **CURRENT STATUS: Week 4**

**Goal:** Launch with 50 institutions, web app + PWA, 1,000 beta users

**Overall Progress: 45%**
- Frontend: 45% complete (basic structure, using mock data)
- Backend: 0% complete (not started)
- Data Pipeline: 0% complete (not started)
- Infrastructure: 10% complete (basic setup only)

#### **Weeks 1-2: Infrastructure Setup** - ✅ PARTIALLY COMPLETE
- ✅ Create Supabase project (database + auth + storage)
- ✅ Set up Render account (API + workers)
- ⏳ Configure domain (admitly.com.ng) and SSL - PENDING
- ✅ Set up GitHub repository (monorepo with pnpm)
- ⏳ Configure CI/CD pipeline (GitHub Actions) - PENDING
- [ ] Deploy Meilisearch to Render
- [ ] Set up Redis for caching
- [ ] Configure monitoring (Sentry, Render metrics)

**Deliverables:**
- ✅ Development environment configured
- ⏳ Staging and production environments - PENDING
- ⏳ Automated deployment pipeline - PENDING

#### **Weeks 3-4: Backend Development**
- [ ] Implement database schema with RLS policies
- [ ] Set up FastAPI project structure
- [ ] Implement authentication (Supabase Auth integration)
- [ ] Implement core API endpoints:
  - Institutions (list, get, search)
  - Programs (list, get, search)
  - User profile management
- [ ] Set up rate limiting (Redis)
- [ ] Write unit tests (Pytest)
- [ ] Deploy to Render staging

**Deliverables:**
- Functional API with 20+ endpoints
- 80%+ test coverage

#### **Weeks 5-6: Data Pipeline**
- [ ] Set up Scrapy project structure
- [ ] Implement scrapers for top 10 institutions
- [ ] Implement normalization and validation pipelines
- [ ] Set up staging database and approval workflow
- [ ] Configure APScheduler for job scheduling
- [ ] Deploy scrapers to Render workers
- [ ] Test scraping and data quality

**Deliverables:**
- Working scrapers for 10 institutions
- 1,000+ programs in database
- Data freshness >70%

#### **Weeks 7-8: Frontend Development (Web)** - ⚠️ PARTIALLY COMPLETE (Week 4)
- ✅ Set up React project (Vite + TypeScript)
- ✅ Implement design system (Tailwind + shadcn/ui)
- ⚠️ Build core pages:
  - ✅ Home page with search (basic)
  - ⚠️ Search results with filters (NO FILTERS)
  - ⚠️ Institution profile (basic, missing tabs)
  - ⚠️ Program profile (basic, missing tabs)
  - ✅ Compare tool (working with mock data)
  - ✅ Dashboard page (complete structure)
  - ⚠️ Deadlines page (basic list only)
- ✅ Implement authentication UI (login, register)
- ❌ Integrate with backend API (USING MOCK DATA)
- ⏳ Deploy to Render staging - PENDING

**Deliverables:**
- ⚠️ Functional web app with 13 pages (using mock data)
- ⚠️ Responsive design (partial implementation)

**CRITICAL ISSUES:**
- ❌ No backend API integration
- ❌ No search filters
- ❌ Profile pages missing 80% of features
- ❌ No PWA implementation

#### **Weeks 9-10: PWA & Mobile Optimization**
- [ ] Set up React Native (Expo) project
- [ ] Share components between web and mobile
- [ ] Implement PWA features:
  - Service Worker for offline support
  - App manifest for installability
  - Push notification registration
- [ ] Test on iOS and Android devices
- [ ] Deploy PWA to Render

**Deliverables:**
- Installable PWA
- Basic React Native app (Expo)

#### **Weeks 11-12: Admin Portal & Testing**
- [ ] Build admin dashboard (React)
- [ ] Implement review queue UI
- [ ] Implement manual data entry forms
- [ ] Implement analytics dashboard
- [ ] End-to-end testing (Playwright)
- [ ] Performance testing (Lighthouse, WebPageTest)
- [ ] Security testing (OWASP Top 10)
- [ ] User acceptance testing (10 beta users)

**Deliverables:**
- Functional admin portal
- 90+ Lighthouse score
- 0 critical security vulnerabilities

#### **Weeks 13-14: Beta Launch Preparation**
- [ ] Expand to 50 institutions (scrapers + manual entry)
- [ ] Final QA and bug fixes
- [ ] Deploy to production
- [ ] Onboard 100 beta users
- [ ] Monitor performance and stability
- [ ] Collect user feedback
- [ ] Iterate based on feedback

**Deliverables:**
- Production-ready platform with 50 institutions
- 1,000+ active programs
- 100+ beta users
- Feedback report

**Success Criteria (Phase 1):**
- ✅ 50 institutions with complete data
- ✅ Data freshness >70%
- ✅ 1,000 beta users onboarded
- ✅ <2s page load time (p95)
- ✅ 99% uptime
- ✅ NPS >50

---

### Phase 2: Scale & Alerts (Months 4-6)

**Goal:** Expand to 200+ institutions, add alerts, grow to 10,000 users

**Key Features:**
- [ ] Expand scraping to 200+ institutions
- [ ] Implement alert notification system
  - Email notifications (SendGrid)
  - Push notifications (Firebase)
  - In-app notifications
- [ ] Deploy mobile apps to App Store and Play Store
- [ ] Implement advanced filters and search
- [ ] Add deadline calendar improvements
- [ ] Performance optimization:
  - Database indexing
  - Caching layers
  - Code splitting
- [ ] Marketing campaign:
  - Social media presence (Twitter, Instagram, Facebook)
  - School partnerships (counselors)
  - JAMB registration period promotion
- [ ] Customer support setup (email, in-app chat)

**Success Criteria (Phase 2):**
- ✅ 200+ institutions
- ✅ Data freshness >85%
- ✅ 10,000+ active users
- ✅ 500+ daily active users
- ✅ Mobile apps approved and published
- ✅ <1s page load time (p95)

---

### Phase 3: AI & Premium (Months 7-9)

**Goal:** Launch AI features, premium tier, payment integration

**Key Features:**
- [ ] Implement AI recommendation engine
  - Gemini API integration
  - Claude API integration
  - Prompt engineering and testing
- [ ] Build AI chat interface
  - Streaming responses
  - Conversation history
  - Citations and sources
- [ ] Implement Paystack payment integration
  - Initialize payment
  - Webhook handling
  - Subscription management
- [ ] Build premium features:
  - Application planner
  - Export reports
  - Unlimited bookmarks
- [ ] Pricing page and checkout flow
- [ ] Email marketing for premium conversion
- [ ] Analytics and A/B testing for pricing

**Success Criteria (Phase 3):**
- ✅ AI chat functional and accurate
- ✅ Premium subscription live
- ✅ 500+ premium subscribers
- ✅ ₦750k MRR
- ✅ <10% churn rate
- ✅ Premium conversion >5%

---

### Phase 4: Growth & Partnerships (Months 10-12+)

**Goal:** Institutional partnerships, localization, advanced features

**Key Features:**
- [ ] Institutional verification program
  - Partner with NUC/NBTE
  - Direct data feeds from institutions
  - Verified badge for partners
- [ ] Localization:
  - Yoruba translation
  - Hausa translation
  - Igbo translation
  - Currency and date localization
- [ ] Advanced features:
  - Forum/community (students helping students)
  - Video content (virtual tours, webinars)
  - Counselor marketplace
  - Scholarship matching engine
- [ ] B2B offerings:
  - School counselor licenses
  - White-label for states
- [ ] Scaling infrastructure:
  - Database sharding
  - CDN optimization
  - Regional deployments

**Success Criteria (Phase 4):**
- ✅ 50+ institutional partners
- ✅ 50,000+ active users
- ✅ 1,500+ premium subscribers
- ✅ ₦2.25M MRR
- ✅ Profitability achieved
- ✅ 3 languages supported

---

## Success Metrics

### North Star Metric
**Number of students who successfully gain admission to a suitable program** (measured via surveys and user testimonials)

### Product Metrics (OKRs)

**Q1 (MVP Launch):**
- Users: 1,000 total, 100 DAU
- Engagement: 40%+ search-to-view conversion
- Quality: 70%+ data freshness
- Performance: <2s page load, 99% uptime

**Q2 (Scale):**
- Users: 10,000 total, 1,000 DAU
- Engagement: 50%+ search-to-view conversion, 30%+ retention
- Quality: 85%+ data freshness, 200+ institutions
- Alerts: 1,000+ active alerts

**Q3 (Premium):**
- Users: 25,000 total, 2,500 DAU
- Premium: 500 subscribers (5% conversion)
- Revenue: ₦750k MRR
- AI: 5,000+ AI conversations, 80%+ satisfaction

**Q4 (Growth):**
- Users: 50,000 total, 5,000 DAU
- Premium: 1,500 subscribers (3% conversion)
- Revenue: ₦2.25M MRR
- Partnerships: 50+ verified institutions

### Technical Metrics

**Performance:**
- Page load time: <2s (p95)
- API response time: <200ms (p95)
- Search latency: <50ms (p95)
- Time to Interactive (TTI): <3s

**Reliability:**
- Uptime: 99.9% (43 minutes downtime/month)
- Error rate: <0.1%
- Scraper success rate: >95%

**Data Quality:**
- Freshness: >85% within SLA
- Completeness: >90% required fields
- Accuracy: <5% discrepancy rate

**Security:**
- 0 critical vulnerabilities
- 100% HTTPS coverage
- RLS policies on all tables
- NDPR compliance score: 100%

### Business Metrics

**Revenue:**
- MRR (Monthly Recurring Revenue)
- ARR (Annual Recurring Revenue)
- ARPU (Average Revenue Per User): Target ₦50/user/month
- CAC (Customer Acquisition Cost): Target <₦500/user
- LTV (Lifetime Value): Target ₦5,000/user (Premium)
- LTV:CAC Ratio: Target 10:1

**Growth:**
- User growth rate: 30%+ MoM
- Premium conversion rate: 3-5%
- Churn rate: <10%/month
- Referral rate: 20%+ (viral coefficient)

**Engagement:**
- DAU/MAU ratio: >0.3 (sticky product)
- Sessions per user per week: >3
- Pages per session: >5
- Bounce rate: <40%

**Satisfaction:**
- NPS (Net Promoter Score): >50
- Customer Satisfaction (CSAT): >4/5
- Feature adoption rate (new features): >30%

---

## Risk Mitigation

### Technical Risks

**Risk 1: Frequent Website Changes Break Scrapers**
- **Impact:** Data becomes stale, user trust eroded
- **Likelihood:** High (institutions update websites irregularly)
- **Mitigation:**
  - Modular scraper design (easy to update selectors)
  - Automated layout change detection (email alerts)
  - HTML snapshot storage for debugging
  - Fallback to manual data entry
  - Institutional partnerships for direct data feeds
  - 48-hour SLA for scraper fixes

**Risk 2: Data Accuracy Disputes**
- **Impact:** Legal liability, user mistrust
- **Likelihood:** Medium (discrepancies inevitable)
- **Mitigation:**
  - Clear disclaimers: "Verify with institutions"
  - Source citations on every data point
  - "Last updated" timestamps
  - User-reported error button
  - Manual verification for critical data (fees, deadlines)
  - Institutional verification program (verified badges)
  - Insurance policy for legal protection

**Risk 3: Scalability Bottlenecks**
- **Impact:** Slow performance, user churn
- **Likelihood:** Medium (if growth exceeds projections)
- **Mitigation:**
  - Horizontal scaling (Render auto-scaling)
  - Database read replicas
  - Aggressive caching strategy
  - CDN for static assets
  - Load testing before peak seasons (JAMB registration)
  - Database query optimization
  - Monitoring and alerting (Sentry, Render)

**Risk 4: AI Costs Exceed Budget**
- **Impact:** Negative margins, feature degradation
- **Likelihood:** Medium (usage hard to predict)
- **Mitigation:**
  - Token limits per user per day
  - Prompt caching (Redis)
  - Fallback to cheaper models
  - Rate limiting for free users
  - Monitor costs daily
  - Increase premium pricing if necessary
  - Template responses for common queries

### Business Risks

**Risk 5: Low User Adoption**
- **Impact:** Missed revenue targets, funding issues
- **Likelihood:** Medium (competitive market)
- **Mitigation:**
  - Beta testing with 100 students before launch
  - School partnerships (counselors as champions)
  - Social proof (testimonials, success stories)
  - Content marketing (SEO, blog, social media)
  - Referral program (incentivize sharing)
  - Targeted ads during JAMB registration period
  - Free tier to drive adoption

**Risk 6: Premium Conversion Too Low**
- **Impact:** Revenue targets missed
- **Likelihood:** Medium (freemium model risk)
- **Mitigation:**
  - Clear value proposition for premium
  - Free trial (7-day or 14-day)
  - Comparison table showing premium benefits
  - Email nurture campaigns
  - Exit-intent popups with discounts
  - A/B testing pricing and features
  - Student testimonials showcasing premium value

**Risk 7: Institutional Pushback on Scraping**
- **Impact:** Legal threats, forced removal of data
- **Likelihood:** Low (data is public)
- **Mitigation:**
  - Respect robots.txt
  - Scrape only public pages
  - Link back to source pages
  - Offer partnership program (direct data feeds)
  - Legal review of scraping practices
  - Takedown request process
  - Fair use legal argument prepared

**Risk 8: Competition from Incumbents**
- **Impact:** Market share erosion
- **Likelihood:** Medium (JAMB could build similar product)
- **Mitigation:**
  - First-mover advantage (speed to market)
  - Superior UX (mobile-first, fast)
  - AI differentiation (incumbents lack AI)
  - Network effects (more users = better data)
  - Institutional partnerships (exclusive data)
  - Continuous innovation (features, quality)

### Operational Risks

**Risk 9: Founder Burnout**
- **Impact:** Product stagnation, quality decline
- **Likelihood:** Medium (solo founder, high workload)
- **Mitigation:**
  - Sustainable work schedule (avoid burnout)
  - Outsource non-core tasks (design, content)
  - Hire contractors for scraping (as needed)
  - Automate repetitive tasks
  - Community support (forums, volunteer moderators)
  - Focus on Phase 1 MVP first (avoid scope creep)

**Risk 10: Data Breach or Security Incident**
- **Impact:** User data compromised, legal penalties, brand damage
- **Likelihood:** Low (strong security measures)
- **Mitigation:**
  - Security best practices (OWASP Top 10)
  - Regular security audits
  - Encryption at rest and in transit
  - RLS policies on all tables
  - Secrets in environment variables (never in code)
  - Incident response plan documented
  - Cyber insurance policy

---

## Compliance & Legal

### NDPR (Nigeria Data Protection Regulation) Compliance

**Data Subject Rights:**
- **Right to access:** Users can download their data (JSON export)
- **Right to rectification:** Users can edit their profile
- **Right to erasure:** Account deletion within 30 days
- **Right to data portability:** Export in machine-readable format
- **Right to object:** Opt-out of marketing emails, push notifications

**Consent Management:**
- Clear consent checkboxes on signup
- Granular consent for different data uses (marketing, analytics, AI)
- Easy opt-out mechanism
- Consent logged in database (audit trail)

**Data Protection Measures:**
- TLS encryption for data in transit
- Encryption at rest (Supabase native)
- RLS policies for access control
- Minimal data collection (only what's needed)
- Anonymization for analytics (no PII)
- Secure password storage (bcrypt)
- Regular security audits

**Data Breach Notification:**
- Incident response plan documented
- 72-hour breach notification to NDPC (if applicable)
- User notification within 72 hours
- Post-mortem and remediation report

**Privacy Policy:**
- Clear, plain-language policy
- Published at /privacy-policy
- Updated with version history
- Covers: data collection, usage, sharing, retention, rights

**Terms of Service:**
- User responsibilities
- Platform usage rules
- Disclaimers about third-party data
- Limitation of liability
- Dispute resolution

**Full Compliance Spec:** See `/specs/security-compliance.md`

### Content & Copyright

**Fair Use Argument:**
- Scraping publicly accessible data for educational purposes
- Transformative use (aggregation, comparison)
- No commercial harm to institutions
- Attribution and links to sources

**Institutional Data:**
- Only scrape public pages (no login bypass)
- Link back to source pages
- Cache only summaries, not full content
- Honor takedown requests within 48 hours

**User-Generated Content:**
- Users retain ownership of their content (reviews, notes)
- Platform has license to display and distribute
- Moderation policy for inappropriate content
- DMCA takedown process (if applicable)

### Disclaimers

**Data Accuracy Disclaimer:**
> "Admitly aggregates information from institutional websites and official sources. While we strive for accuracy, we cannot guarantee that all information is current or correct. Always verify critical information (fees, deadlines, requirements) with the institution directly before making decisions or payments."

**AI Disclaimer:**
> "AI-generated recommendations are provided for informational purposes only and should not be considered professional advice. Recommendations are based on platform data and may not account for all factors. Consult with qualified educational counselors for personalized guidance."

**No Liability Disclaimer:**
> "Admitly is not responsible for admission outcomes, application errors, or financial losses resulting from use of the platform. Users are solely responsible for verifying information and making informed decisions."

---

## Appendix

### Glossary

- **JAMB:** Joint Admissions and Matriculation Board (national exam body)
- **UTME:** Unified Tertiary Matriculation Examination (university entrance exam)
- **SSCE:** Senior Secondary Certificate Examination (O'Level)
- **NECO:** National Examinations Council (O'Level exam body)
- **NUC:** National Universities Commission (accreditation body)
- **NBTE:** National Board for Technical Education (polytechnic accreditation)
- **JUPEB:** Joint Universities Preliminary Examinations Board (pre-degree program)
- **ND:** National Diploma (2-year polytechnic program)
- **HND:** Higher National Diploma (2-year advanced polytechnic program)
- **BSc/BA/BEng:** Bachelor's degree qualifications
- **RLS:** Row Level Security (database access control)
- **PWA:** Progressive Web App
- **MRR:** Monthly Recurring Revenue
- **ARR:** Annual Recurring Revenue
- **CAC:** Customer Acquisition Cost
- **LTV:** Lifetime Value
- **NPS:** Net Promoter Score

### References

1. JAMB Statistics: https://www.jamb.gov.ng
2. NUC List of Accredited Universities: https://www.nuc.edu.ng
3. NBTE Polytechnics List: https://www.nbte.gov.ng
4. NDPR Guidelines: https://ndpr.nitda.gov.ng
5. Supabase Documentation: https://supabase.com/docs
6. FastAPI Documentation: https://fastapi.tiangolo.com
7. React Documentation: https://react.dev
8. Meilisearch Documentation: https://www.meilisearch.com/docs
9. Paystack API Documentation: https://paystack.com/docs/api

### Document History

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | 2025-01-05 | Initial PRD with high-level requirements | User |
| 2.0 | 2025-01-11 | Complete rewrite with finalized specs, tech stack, timelines, and implementation details | Claude Code |

---

**For detailed technical specifications, see:**
- `/specs/tech-stack-decisions.md` - Technology choices and rationale
- `/specs/database-schema.md` - Complete database schema with RLS
- `/specs/system-architecture.md` - Architecture diagrams and data flows
- `/specs/api-specification.md` - REST API documentation (70+ endpoints)
- `/specs/data-pipeline.md` - Scraping and data management
- `/specs/frontend-specification.md` - UI/UX and component architecture
- `/specs/security-compliance.md` - Security best practices and NDPR compliance
- `/specs/payment-integration.md` - Paystack payment implementation

---

**Status:** ✅ Ready for Implementation
**Next Step:** Phase 1 - Week 1-2 Infrastructure Setup
**Owner:** Internal Development Team
**Review Date:** After Phase 1 completion (Week 14)
