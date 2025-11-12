# System Architecture Specification

## Overview
This document defines the comprehensive system architecture for the Nigeria Student Data Services Platform, detailing all components, their interactions, data flows, and deployment strategy.

---

## High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  React Web App  │  React Native Mobile  │  Admin Portal (React) │
│  (Render CDN)   │     (PWA + Native)    │      (Render CDN)     │
└────────┬────────┴────────────┬──────────┴───────────┬───────────┘
         │                     │                      │
         └─────────────────────┼──────────────────────┘
                               │
                    ┌──────────▼──────────┐
                    │    Render CDN       │
                    │  (Static Sites)     │
                    └──────────┬──────────┘
                               │
         ┌─────────────────────┼─────────────────────┐
         │                     │                     │
┌────────▼────────┐   ┌────────▼────────┐   ┌──────▼──────┐
│   Supabase      │   │  FastAPI on     │   │ Meilisearch │
│   (Database +   │◄──┤  Render         │◄──┤ on Render   │
│   Auth + RLS)   │   │  (API Server)   │   │ (Search)    │
└────────┬────────┘   └────────┬────────┘   └─────────────┘
         │                     │
         │            ┌────────▼────────┐
         │            │  Render Workers │
         │            │  (Scrapers +    │
         │            │   Data Pipeline)│
         │            └────────┬────────┘
         │                     │
         └─────────────────────┼─────────────────────┐
                               │                     │
                      ┌────────▼────────┐   ┌────────▼────────┐
                      │  Supabase       │   │  External APIs  │
                      │  Storage        │   │  - Gemini AI    │
                      │  (Files/Docs)   │   │  - Claude AI    │
                      └─────────────────┘   │  - Paystack     │
                                            └─────────────────┘
```

---

## Component Architecture

### 1. Frontend Layer

#### 1.1 React Web Application
**Deployment:** Render (Static Site + CDN)
**Tech Stack:**
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS + shadcn/ui
- Zustand (state management)
- React Query (server state)
- React Router (routing)

**Key Features:**
- Server-side rendering (SSR) for SEO
- Code splitting by route
- Progressive enhancement
- Offline support via Service Worker
- Lazy loading for images and components

**Pages:**
- Home (search + featured institutions)
- Search Results (with filters)
- Institution Profile
- Program Profile
- Compare Tool (up to 3 items)
- Deadlines Calendar
- Career Insights
- User Dashboard
- Premium AI Chat
- Auth (login/register)

#### 1.2 React Native Mobile App
**Deployment:** Expo (with EAS Build)
**Tech Stack:**
- React Native + Expo
- Expo Router (file-based routing)
- NativeWind (Tailwind for RN)
- Zustand + React Query
- Expo notifications

**Platform Support:**
- iOS (App Store)
- Android (Play Store)
- PWA (web fallback)

**Native Features:**
- Push notifications (deadline alerts)
- Offline caching (AsyncStorage)
- Deep linking
- Share functionality
- Biometric auth (premium users)

#### 1.3 Admin Portal
**Deployment:** Render (Static Site)
**Tech Stack:**
- React 18 + TypeScript
- React Admin or custom dashboard
- TanStack Table (data grids)
- Recharts (analytics)

**Features:**
- Data review queue
- Scraper monitoring dashboard
- User management
- Analytics dashboard
- Content moderation
- Change log viewer
- Manual data entry forms

---

### 2. Backend Layer

#### 2.1 FastAPI Application
**Deployment:** Render Web Service
**Tech Stack:**
- FastAPI 0.104+
- Python 3.11+
- Pydantic v2 (data validation)
- SQLAlchemy (ORM)
- Asyncpg (async Postgres driver)
- Redis (caching + rate limiting)

**Structure:**
```
/api
  /routers
    - institutions.py
    - programs.py
    - admissions.py
    - search.py
    - compare.py
    - deadlines.py
    - insights.py
    - auth.py
    - admin.py
    - ai.py
    - payments.py
  /models          (SQLAlchemy models)
  /schemas         (Pydantic schemas)
  /services        (business logic)
  /core
    - config.py
    - security.py
    - database.py
    - cache.py
  /utils
  main.py          (FastAPI app)
```

**API Endpoints:** See `api-specification.md`

**Features:**
- JWT authentication (via Supabase)
- Rate limiting (per-user, per-IP)
- Request validation
- Response caching
- Error handling
- CORS configuration
- OpenAPI documentation
- Health check endpoint

#### 2.2 Supabase Backend
**Services Used:**

1. **PostgreSQL Database**
   - Primary data store
   - Row Level Security (RLS)
   - Triggers for audit logs
   - Materialized views for analytics
   - Full-text search (tsvector)

2. **Supabase Auth**
   - JWT-based authentication
   - Email/password + OAuth
   - Magic links
   - Session management
   - User metadata

3. **PostgREST API**
   - Auto-generated REST API
   - Used for simple CRUD operations
   - Filtered by RLS policies
   - Reduces custom API code

4. **Supabase Storage**
   - Institution logos
   - Program brochures
   - HTML snapshots (for scrapers)
   - User uploads (premium)

5. **Real-time Subscriptions**
   - Admin dashboard updates
   - Live scraper status
   - User notifications

6. **Edge Functions**
   - Webhook handlers (Paystack)
   - Scheduled data sync
   - Complex queries
   - Email notifications

---

### 3. Search Layer

#### 3.1 Meilisearch Server
**Deployment:** Render Web Service (Docker)
**Configuration:**
- Index: `institutions`, `programs`
- Ranking rules: typo, words, proximity, attribute, sort, exactness
- Searchable attributes: name, description, location, keywords
- Filterable attributes: state, type, accreditation, tuition_range
- Sortable attributes: name, tuition, rating
- Synonyms: university→uni, polytechnic→poly, etc.

**Indexing Strategy:**
- Sync from Postgres on data changes (via trigger)
- Full reindex nightly
- Incremental updates real-time
- 5-second index update latency

**Search Features:**
- Typo tolerance (1-2 chars)
- Synonym support
- Faceted search
- Geo-search (by state/region)
- Pagination
- Highlighting

---

### 4. Data Pipeline Layer

#### 4.1 Scraping Workers
**Deployment:** Render Background Workers
**Tech Stack:**
- Scrapy (framework)
- Playwright (browser automation)
- BeautifulSoup4 (parsing)
- APScheduler (scheduling)
- Redis Queue (job queue)

**Worker Types:**
1. **Institution Scraper**
   - Scrapes institution profiles
   - Frequency: Quarterly
   - Sources: 50 institutions

2. **Program Scraper**
   - Scrapes program listings
   - Frequency: Monthly
   - Sources: Institution websites

3. **Admission Scraper**
   - Scrapes cut-off scores, requirements
   - Frequency: Weekly (during admission season)
   - Sources: Official portals

4. **Deadline Scraper**
   - Scrapes application deadlines
   - Frequency: Daily (during admission season)
   - Priority: High

5. **Fees Scraper**
   - Scrapes tuition and fees
   - Frequency: Biweekly
   - Sources: Institution websites

**Architecture:**
```python
# Scraper Service
class InstitutionScraper:
    def scrape(self, url: str) -> dict:
        # 1. Fetch HTML
        # 2. Parse with Scrapy/BeautifulSoup
        # 3. Extract data
        # 4. Validate schema
        # 5. Save to staging table
        # 6. Flag for review
```

**Error Handling:**
- Retry with exponential backoff
- Dead-letter queue for failed jobs
- Alert on repeated failures
- Store HTML snapshots for debugging

#### 4.2 Data Normalization Service
**Deployment:** Render Background Worker
**Responsibilities:**
- Standardize dates (ISO 8601)
- Normalize currency (₦)
- Deduplicate institutions/programs
- Validate data integrity
- Flag conflicts

**Rules:**
```python
# Example normalization rules
def normalize_date(raw_date: str) -> datetime:
    # Parse various formats: "15th Jan 2025", "15/01/2025", etc.
    # Return ISO format

def normalize_fees(raw_fee: str) -> int:
    # Parse "N50,000.00", "50000", "Fifty thousand"
    # Return integer amount in kobo
```

#### 4.3 Data Staging & Approval
**Deployment:** FastAPI + Supabase
**Workflow:**
1. Scraped data lands in `staging_*` tables
2. Automated validation checks run
3. Conflicts flagged (e.g., fee change >20%)
4. Admin reviews in approval queue
5. Approved data promoted to production tables
6. Change logged in `audit_log` table
7. Search index updated
8. Subscribers notified (if relevant)

**Staging Tables:**
- `staging_institutions`
- `staging_programs`
- `staging_admissions`
- `staging_costs`
- `staging_deadlines`

---

### 5. AI Service Layer

#### 5.1 AI Recommendation Engine
**Deployment:** FastAPI (integrated service)
**Tech Stack:**
- Google Gemini API (primary)
- Anthropic Claude API (secondary)
- LangChain (orchestration)
- Redis (caching)

**Features:**
1. **Personalized Recommendations**
   - Input: User profile (budget, location, interests)
   - Output: Ranked list of programs with explanations

2. **Application Planning**
   - Input: Selected programs
   - Output: Step-by-step checklist with deadlines

3. **Career Guidance**
   - Input: Program/field of study
   - Output: Career paths, salary ranges, skills

4. **What-if Analysis**
   - Input: Constraints (budget, location)
   - Output: Alternative scenarios

**Prompt Strategy:**
```python
# Example prompt template
SYSTEM_PROMPT = """
You are an educational advisor for Nigerian students.
Use the following data to provide recommendations:

Institutions: {institutions_json}
Programs: {programs_json}
User Profile: {user_profile}

Provide specific, data-driven recommendations.
Cite sources for each claim.
"""
```

**Cost Optimization:**
- Cache responses (user profile hash)
- Use Gemini Flash for quick queries
- Use Claude for complex reasoning
- Token limits per user per day
- Fallback to templates if budget exhausted

---

### 6. Payment Service Layer

#### 6.1 Paystack Integration
**Deployment:** FastAPI + Supabase Edge Functions
**Features:**
- One-time payments (premium unlock)
- Recurring subscriptions (monthly/yearly)
- Transaction webhooks
- Payment verification
- Refund handling

**Flow:**
1. User initiates payment (frontend)
2. Backend creates Paystack transaction
3. User redirects to Paystack checkout
4. User completes payment
5. Paystack webhook → Edge Function
6. Verify payment signature
7. Update user subscription in Supabase
8. Send confirmation email
9. Grant premium access

**Subscription Tiers:**
- **Free:** Search, browse, compare
- **Premium Monthly (₦1,500/month):** AI chat, alerts, exports
- **Premium Yearly (₦15,000/year):** Save ₦3,000

---

## Data Flow Diagrams

### 7.1 User Search Flow
```
User Input (React)
    ↓
Search API (FastAPI)
    ↓
Meilisearch Query
    ↓
Results + Filters
    ↓
Cache (Redis 5min)
    ↓
Return JSON
    ↓
Render Results (React)
```

### 7.2 Data Scraping Flow
```
Cron Job (APScheduler)
    ↓
Scraper Worker (Render)
    ↓
Fetch HTML (Playwright)
    ↓
Parse Data (Scrapy)
    ↓
Validate Schema (Pydantic)
    ↓
Save to Staging (Supabase)
    ↓
Flag for Review (if conflicts)
    ↓
Admin Approval (Portal)
    ↓
Promote to Production
    ↓
Update Search Index (Meilisearch)
    ↓
Notify Subscribers (Email/Push)
```

### 7.3 AI Recommendation Flow
```
User Request (React)
    ↓
Auth Check (JWT)
    ↓
Premium Check (Supabase)
    ↓
Load User Profile
    ↓
Query Relevant Data (Postgres)
    ↓
Check Cache (Redis)
    ↓ (miss)
Generate Prompt
    ↓
Call Gemini API
    ↓
Parse Response
    ↓
Cache Result (Redis 1hr)
    ↓
Return JSON
    ↓
Render Chat (React)
```

---

## Security Architecture

### 8.1 Authentication Flow
```
User Login (React)
    ↓
Supabase Auth.signIn()
    ↓
Supabase Auth (JWT)
    ↓
Return Access Token + Refresh Token
    ↓
Store in HttpOnly Cookie (Web)
    ↓
Store in Secure Storage (Mobile)
    ↓
Include in API Requests (Authorization header)
    ↓
FastAPI Verify JWT (Supabase public key)
    ↓
Extract User ID + Role
    ↓
Apply RLS Policies (Supabase)
```

### 8.2 Row Level Security (RLS)
**Policies:**

1. **Public Read (anonymous):**
   - Institutions, Programs, Admissions, Costs (published only)

2. **Student Read:**
   - Own profile, bookmarks, search history

3. **Premium Read:**
   - AI chat history, application plans, alerts

4. **Institution Admin:**
   - Own institution data (read/write)
   - Submit updates (staging tables)

5. **Internal Admin:**
   - All tables (read/write)
   - Approval queue (write)
   - Analytics (read)

**Example Policy:**
```sql
-- Students can only read their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Everyone can read published institutions
CREATE POLICY "Public read published institutions"
ON public.institutions
FOR SELECT
USING (status = 'published');
```

---

## Caching Strategy

### 9.1 Cache Layers

1. **CDN Cache (Render):**
   - Static assets (images, CSS, JS)
   - TTL: 1 year (with versioning)

2. **API Cache (Redis):**
   - Search results (5 minutes)
   - Institution profiles (15 minutes)
   - Program lists (15 minutes)
   - Analytics (1 hour)
   - AI responses (1 hour, user-specific)

3. **Browser Cache (Service Worker):**
   - App shell
   - Offline fallback pages
   - User bookmarks

4. **Database Cache (Postgres):**
   - Materialized views (refreshed nightly)
   - Query result cache (pg_prewarm)

### 9.2 Cache Invalidation
- On data update: Invalidate related Redis keys
- On scraper run: Invalidate institution/program cache
- On admin approval: Invalidate search index + API cache
- Manual purge: Admin dashboard button

---

## Scalability Considerations

### 10.1 Database Scaling
- **Supabase Pro:** 8GB RAM, 4 CPU, 100GB storage
- **Read Replicas:** Add for read-heavy queries
- **Connection Pooling:** PgBouncer (built-in)
- **Partitioning:** By institution_id (future)

### 10.2 API Scaling
- **Render:** Auto-scaling (1-10 instances)
- **Load Balancer:** Render built-in
- **Horizontal Scaling:** Stateless API

### 10.3 Worker Scaling
- **Queue:** Redis Queue (RQ)
- **Workers:** Scale by job volume
- **Priority Queue:** High (deadlines), Medium (fees), Low (profiles)

---

## Monitoring & Observability

### 11.1 Metrics
- **API:** Request rate, latency, error rate (Sentry)
- **Database:** Query time, connection pool usage (Supabase)
- **Scrapers:** Success rate, data freshness (custom)
- **Search:** Query latency, index size (Meilisearch)
- **AI:** Token usage, cost, response time (custom)

### 11.2 Alerts
- API error rate >5% (5 minutes)
- Database CPU >80% (5 minutes)
- Scraper failure 3x in a row
- Payment webhook failure
- Disk space <10% (Render)

### 11.3 Logging
- **Structured Logs:** JSON format
- **Correlation IDs:** Trace requests across services
- **Log Levels:** DEBUG, INFO, WARNING, ERROR, CRITICAL
- **Storage:** Sentry (errors), Render logs (info)

---

## Disaster Recovery

### 12.1 Backup Strategy
- **Database:** Daily snapshots (Supabase)
- **Files:** Replicated (Supabase Storage)
- **Code:** Git (GitHub)
- **Config:** Environment variables (Render secrets)

### 12.2 Recovery Plan
- **RTO (Recovery Time Objective):** 4 hours
- **RPO (Recovery Point Objective):** 24 hours
- **Runbook:** Documented in `/docs/runbooks/`

---

## API Gateway & Rate Limiting

### 13.1 Rate Limits
- **Anonymous:** 100 req/hour
- **Student:** 1,000 req/hour
- **Premium:** 5,000 req/hour
- **Admin:** Unlimited

### 13.2 Implementation
```python
# Redis-based rate limiting
from fastapi_limiter import FastAPILimiter
from fastapi_limiter.depends import RateLimiter

@app.get("/api/institutions", dependencies=[Depends(RateLimiter(times=100, hours=1))])
async def list_institutions():
    ...
```

---

## Deployment Pipeline

### 14.1 Environments
- **Development:** Local (Docker Compose)
- **Staging:** Render preview + Supabase staging project
- **Production:** Render + Supabase production

### 14.2 CI/CD Workflow
```yaml
# .github/workflows/deploy.yml
on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    - Lint (ESLint, Ruff)
    - Type check (TypeScript, Mypy)
    - Unit tests (Vitest, Pytest)
    - Integration tests

  deploy-staging:
    - Deploy to Render preview (backend + frontend)
    - Run E2E tests (Playwright)

  deploy-production:
    - Deploy to Render (on merge to main - all services)
    - Run smoke tests
    - Monitor error rate
```

---

## Technology Decisions Summary

| Component | Technology | Rationale |
|-----------|-----------|-----------|
| Database | Supabase (Postgres) | Managed, RLS, real-time, auth |
| Backend | FastAPI (Python) | Async, type-safe, shares code with scrapers |
| Frontend | React + TypeScript | Largest ecosystem, PWA support |
| Mobile | React Native (Expo) | Code reuse with web |
| Search | Meilisearch | Typo-tolerant, fast, self-hosted |
| Deployment | Render (All-in-One) | Simplified, cost-effective, auto-scaling |
| Auth | Supabase Auth | Integrated with database |
| Payments | Paystack | Nigerian market leader |
| AI | Gemini + Claude | Cost-effective + high quality |
| Cache | Redis | Fast, persistent |
| Monitoring | Sentry | Error tracking |

---

## Next Steps
1. Set up infrastructure (Supabase, Render accounts)
2. Define database schema (see `database-schema.md`)
3. Implement API endpoints (see `api-specification.md`)
4. Build scraper prototypes (see `data-pipeline.md`)
5. Design UI/UX (see `frontend-specification.md`)
