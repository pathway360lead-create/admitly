# Technical Stack Decisions

## Overview
This document outlines the finalized technical stack for the Nigeria Student Data Services Platform based on project requirements, budget constraints, and scalability needs.

---

## Core Technology Stack

### Backend
- **Framework:** FastAPI (Python 3.11+)
- **Rationale:**
  - Shares codebase with scraping workers (Python)
  - Excellent async/await support for high concurrency
  - Built-in data validation with Pydantic
  - Auto-generated OpenAPI documentation
  - Superior performance for AI/ML integration
  - Type hints improve code maintainability

### Database
- **Primary:** Supabase (Managed PostgreSQL 15+)
- **Features Used:**
  - Row Level Security (RLS) for multi-tenant access control
  - PostgREST API for direct database access
  - Supabase Auth for authentication
  - Supabase Storage for documents/attachments
  - Real-time subscriptions for admin dashboard
  - Edge Functions for serverless compute

### Frontend
- **Web:** React 18+ with TypeScript
- **Mobile:** React Native with Expo
- **PWA:** Progressive Web App capabilities for all platforms
- **UI Framework:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand + React Query
- **Rationale:**
  - Maximum code reuse between web and mobile
  - Largest ecosystem and community support
  - Excellent PWA support
  - Best-in-class developer experience

### Search
- **Engine:** Meilisearch (self-hosted on Render)
- **Rationale:**
  - Typo-tolerant out of the box
  - Sub-50ms search response times
  - No per-search pricing (budget-friendly)
  - Easy to deploy and maintain
  - Better synonym/filtering support than Postgres FTS
  - Scales horizontally

### Deployment & Infrastructure
- **API & Workers:** Render
  - Web service for FastAPI backend
  - Background workers for scrapers
  - Cron jobs for scheduled tasks
  - Static sites for React frontend
- **Database & Auth:** Supabase
- **CDN:** Render CDN for static assets
- **Search:** Meilisearch on Render

### AI Services
- **Primary:** Google Gemini (cost-effective for high volume)
- **Secondary:** Anthropic Claude (for complex reasoning)
- **Fallback:** Open-source models (Llama 3.1 via Ollama)
- **Budget:** ₦5,000/month (~$6 USD)
- **Strategy:**
  - Gemini Flash for quick recommendations
  - Claude for detailed career guidance
  - Cache prompts to reduce costs
  - Rate limit premium features

### Payment Gateway
- **Provider:** Paystack
- **Features:**
  - Nigerian bank support
  - Mobile money integration
  - Subscription billing
  - Webhook support
- **Currency:** Nigerian Naira (₦)

### Scraping Infrastructure
- **Framework:** Scrapy (structured) + BeautifulSoup (simple pages)
- **Browser Automation:** Playwright (lighter than Selenium)
- **Scheduler:** APScheduler + Redis Queue
- **Storage:** Supabase Storage for HTML snapshots
- **Deployment:** Render background workers

### Monitoring & Observability
- **Logging:** Sentry (error tracking)
- **Metrics:** Render native metrics + Supabase dashboard
- **Uptime:** Better Uptime or UptimeRobot
- **Analytics:** PostHog (open-source, self-hosted option)

---

## Data Architecture

### Storage Strategy
1. **PostgreSQL (Supabase):** Structured data, user accounts, transactions
2. **Meilisearch:** Full-text search index (synced from Postgres)
3. **Supabase Storage:** Documents, attachments, HTML snapshots
4. **Redis (via Render):** Job queues, caching, rate limiting

### Caching Layers
1. **CDN:** Render CDN for static assets
2. **API Cache:** Redis with 5-15 minute TTLs
3. **Browser Cache:** Service Worker for PWA
4. **Database:** Materialized views for expensive queries

---

## Development Tools

### Code Quality
- **Linting:** ESLint (JS/TS), Ruff (Python)
- **Formatting:** Prettier (JS/TS), Black (Python)
- **Type Checking:** TypeScript, Mypy (Python)
- **Testing:**
  - Vitest (frontend unit tests)
  - Playwright (E2E tests)
  - Pytest (backend tests)

### CI/CD
- **Platform:** GitHub Actions
- **Workflow:**
  - Lint & type check on PR
  - Run tests on PR
  - Deploy preview on PR (Render preview for frontend + backend)
  - Deploy to production on merge to main

### Version Control
- **Repository:** GitHub (monorepo with pnpm workspaces)
- **Structure:**
  ```
  /apps
    /web          (React web app)
    /mobile       (React Native)
    /admin        (React admin portal)
  /packages
    /ui           (Shared UI components)
    /types        (Shared TypeScript types)
    /api-client   (Generated API client)
  /services
    /api          (FastAPI backend)
    /scrapers     (Python scrapers)
    /ai           (AI service)
  /database
    /migrations   (Supabase migrations)
    /seed         (Seed data)
  /docs
    /specs        (Technical specifications)
  ```

---

## Security Stack

### Authentication
- **Provider:** Supabase Auth
- **Methods:**
  - Email/Password
  - OAuth (Google)
  - Magic Link (passwordless)
  - OTP for sensitive actions
- **Session:** JWT with refresh tokens

### Authorization
- **Method:** Row Level Security (RLS) in Supabase
- **Roles:**
  - `anonymous` (public read-only)
  - `student` (free tier)
  - `premium` (paid tier)
  - `counselor` (verified counselors)
  - `institution_admin` (institution reps)
  - `internal_admin` (platform admins)

### Data Protection
- **TLS:** Enforced on all connections
- **Encryption at Rest:** Supabase native
- **PII Hashing:** bcrypt for sensitive fields
- **Rate Limiting:** Redis-backed, per-user and per-IP

### Compliance
- **NDPR (Nigeria Data Protection Regulation):**
  - User consent for data collection
  - Right to access personal data
  - Right to deletion
  - Data breach notification
  - Privacy policy and terms of service

---

## Cost Estimates (Monthly)

### Infrastructure
- **Supabase:** $25 (Pro plan) - includes DB, Auth, Storage
- **Render:** $21 (API) + $21 (workers) + $7 (frontend static site)
- **Meilisearch:** $15 (Render deployment)
- **Total Infrastructure:** ~$89/month

### Services
- **AI (Gemini/Claude):** ₦5,000 (~$6)
- **Paystack:** 1.5% per transaction
- **Sentry:** Free tier (up to 5k events/month)
- **Total Services:** ~$6/month + transaction fees

### Grand Total: ~$83-117/month (~₦132,800-187,200)

---

## Phase 1 MVP Institution Priority List

### Federal Universities (10)
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

### State Universities (5)
11. Lagos State University (LASU)
12. Rivers State University (RSU)
13. Ekiti State University (EKSU)
14. Osun State University (UNIOSUN)
15. Ambrose Alli University (AAU)

### Private Universities (5)
16. Covenant University
17. Babcock University
18. American University of Nigeria (AUN)
19. Afe Babalola University (ABUAD)
20. Bowen University

### Polytechnics (15)
21. Yaba College of Technology (YABATECH)
22. Federal Polytechnic, Nekede
23. Kaduna Polytechnic
24. Federal Polytechnic, Ilaro
25. The Polytechnic, Ibadan
26. Federal Polytechnic, Ado-Ekiti
27. Auchi Polytechnic
28. Federal Polytechnic, Offa
29. Federal Polytechnic, Bida
30. Lagos State Polytechnic (LASPOTECH)
31. Institute of Management and Technology (IMT) Enugu
32. Federal Polytechnic, Bauchi
33. Rufus Giwa Polytechnic, Owo
34. Federal Polytechnic, Oko
35. Delta State Polytechnic, Ozoro

### Colleges of Education (5)
36. Federal College of Education, Zaria
37. Adeniran Ogunsanya College of Education
38. Federal College of Education (Technical), Akoka
39. Alvan Ikoku Federal College of Education
40. Federal College of Education, Abeokuta

### Specialized Institutions (5)
41. Nigerian Defence Academy (NDA)
42. Nigerian Maritime University, Okerenkoko
43. Nigerian Aviation College, Zaria
44. Nigerian Police Academy
45. Federal College of Dental Technology and Therapy

### JUPEB/Pre-degree Centers (5)
46. University of Lagos JUPEB
47. University of Ibadan Pre-degree
48. OAU Foundation Program
49. LASU Pre-degree
50. Covenant University Foundation

---

## Migration Strategy

### From Development to MVP
1. **Week 1-2:** Infrastructure setup (Supabase, Render, domains)
2. **Week 3-4:** Core API development (FastAPI + Supabase)
3. **Week 5-6:** Scraper development (top 10 institutions)
4. **Week 7-8:** Frontend MVP (React web app)
5. **Week 9-10:** Mobile PWA (React Native)
6. **Week 11-12:** Admin portal + testing
7. **Week 13-14:** Beta launch with 50 institutions

### Future Scaling
- Add more institutions (200+ by Phase 2)
- Introduce AI features (Phase 3)
- Add payment and premium tier (Phase 3)
- Mobile app store deployment (Phase 3)
- Localization (Phase 4)

---

## Risk Mitigation

### Technical Risks
1. **Scraper breakage:** Modular design, automated monitoring, quick patches
2. **Search performance:** Meilisearch indexing strategy, pagination
3. **Database scalability:** Read replicas, connection pooling, caching
4. **AI costs:** Token limits, caching, fallback to cheaper models

### Business Risks
1. **Low adoption:** Beta testing, partnerships with schools
2. **Data accuracy:** Manual verification, institution partnerships
3. **Legal issues:** Respect robots.txt, public data only, terms of service

---

## Next Steps
1. Create detailed architecture diagrams
2. Define database schema with RLS policies
3. Design API specification
4. Create frontend component library
5. Set up development environment
