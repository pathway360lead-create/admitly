# Admitly Technical Specifications

## Overview
This directory contains all technical specifications for the Nigeria Student Data Services Platform (Admitly). These documents provide comprehensive implementation guidance for the development team.

---

## Document Index

### 1. [Technical Stack Decisions](./tech-stack-decisions.md)
**Purpose:** Finalized technology choices with rationale
**Key Contents:**
- Complete tech stack (FastAPI, React, Supabase, Render)
- Database and infrastructure decisions
- Search engine selection (Meilisearch)
- AI service strategy (Gemini, Claude)
- Cost estimates (~₦132,800-187,200/month)
- Top 50 institutions priority list for MVP

### 2. [System Architecture](./system-architecture.md)
**Purpose:** High-level system design and component interactions
**Key Contents:**
- Architecture diagrams
- Component responsibilities (Frontend, Backend, Data Pipeline, AI, Admin)
- Supabase configuration (Auth, Storage, RLS, Edge Functions)
- Render deployment strategy
- Meilisearch integration
- Caching layers (CDN, Redis, Browser)
- Data flow diagrams
- Scalability considerations

### 3. [Database Schema](./database-schema.md)
**Purpose:** Complete PostgreSQL schema with Supabase RLS policies
**Key Contents:**
- 12 main table schemas (Institutions, Programs, Admissions, Costs, etc.)
- Row Level Security (RLS) policies for all user roles
- Indexes and performance optimization
- Materialized views for analytics
- Triggers and functions
- Staging tables for data approval workflow
- Migration strategy

### 4. [API Specification](./api-specification.md)
**Purpose:** Complete REST API documentation
**Key Contents:**
- 70+ API endpoints across 10 categories
- Request/response formats (JSON)
- Authentication (JWT Bearer tokens)
- Rate limiting by role
- Pagination standards
- Error handling
- WebSocket API for real-time updates
- Webhook specifications (Paystack)
- OpenAPI/Swagger documentation

### 5. [Data Pipeline](./data-pipeline.md)
**Purpose:** Scraping, normalization, and data management workflows
**Key Contents:**
- Scrapy spider architecture
- Institution-specific scraping strategies (50 institutions)
- Scheduling system (APScheduler + Redis Queue)
- Data normalization (dates, currency, text)
- Validation rules
- Staging & approval workflow
- Conflict detection
- Meilisearch sync strategy
- Monitoring and alerting

### 6. [Frontend Specification](./frontend-specification.md)
**Purpose:** React web and React Native mobile implementation guide
**Key Contents:**
- Component architecture (Atomic Design)
- Page specifications (10 pages)
- State management (Zustand + React Query)
- Routing structure
- PWA implementation
- Performance optimization
- Responsive design (mobile-first)
- Accessibility (WCAG 2.1 AA)
- Tailwind configuration and theming

### 7. [Security & Compliance](./security-compliance.md)
**Purpose:** Security best practices and NDPR compliance
**Key Contents:**
- Authentication & authorization (Supabase Auth, JWT)
- Row Level Security (RLS) policies
- API security (rate limiting, CORS, input validation)
- Data protection (TLS, encryption, PII handling)
- Payment security (Paystack webhook verification)
- NDPR compliance (consent, data access, deletion, breach notification)
- Scraping ethics and legal considerations
- Secrets management
- Incident response plan
- Penetration testing checklist

### 8. [Payment Integration](./payment-integration.md)
**Purpose:** Paystack integration for subscription billing
**Key Contents:**
- Subscription tiers (Free, Monthly ₦1,500, Yearly ₦15,000)
- Payment flow diagrams
- Implementation (initialize, verify, callback)
- Webhook handling
- Subscription management
- Transaction history
- Email notifications
- Refund policy
- Testing with Paystack test cards

---

## Quick Start Guide

### For Backend Developers
1. Read: [Tech Stack Decisions](./tech-stack-decisions.md)
2. Study: [Database Schema](./database-schema.md)
3. Implement: [API Specification](./api-specification.md)
4. Review: [Security & Compliance](./security-compliance.md)

### For Frontend Developers
1. Read: [Tech Stack Decisions](./tech-stack-decisions.md)
2. Study: [Frontend Specification](./frontend-specification.md)
3. Integrate: [API Specification](./api-specification.md)
4. Implement: [Payment Integration](./payment-integration.md)

### For Data Engineers
1. Read: [Tech Stack Decisions](./tech-stack-decisions.md)
2. Study: [Data Pipeline](./data-pipeline.md)
3. Review: [Database Schema](./database-schema.md)
4. Follow: [Security & Compliance](./security-compliance.md) (scraping ethics)

### For DevOps/Infrastructure
1. Read: [Tech Stack Decisions](./tech-stack-decisions.md)
2. Study: [System Architecture](./system-architecture.md)
3. Configure: Supabase + Render (see architecture doc)
4. Implement: [Security & Compliance](./security-compliance.md)

---

## Implementation Phases

### Phase 0: Discovery (2-3 weeks) ✅ COMPLETE
- ✅ PRD finalized
- ✅ Technical specifications complete
- ✅ Tech stack decisions made
- ✅ Institution priority list created
- ⏳ Legal review (NDPR compliance)
- ⏳ Institution outreach

### Phase 1: MVP (6-8 weeks) - NEXT
**Goal:** Launch with 50 institutions, web app, basic features

**Week 1-2: Infrastructure Setup**
- [ ] Create Supabase project
- [ ] Set up Render account
- [ ] Configure domain and SSL
- [ ] Set up GitHub repository (monorepo)
- [ ] Configure CI/CD pipeline
- [ ] Deploy Meilisearch

**Week 3-4: Backend Development**
- [ ] Implement database schema with RLS policies
- [ ] Set up FastAPI project structure
- [ ] Implement authentication (Supabase Auth)
- [ ] Implement core API endpoints (institutions, programs)
- [ ] Set up rate limiting (Redis)
- [ ] Deploy to Render

**Week 5-6: Data Pipeline**
- [ ] Set up Scrapy project
- [ ] Implement scrapers for top 10 institutions
- [ ] Implement normalization pipeline
- [ ] Set up staging database and approval workflow
- [ ] Configure scheduler (APScheduler)
- [ ] Deploy scrapers to Render workers

**Week 7-8: Frontend Development**
- [ ] Set up React project (Vite)
- [ ] Implement design system (Tailwind + shadcn/ui)
- [ ] Build core pages (Home, Search, Institution, Program)
- [ ] Implement search with filters
- [ ] Implement compare tool
- [ ] Deploy to Render

**Week 9-10: Mobile & PWA**
- [ ] Set up React Native (Expo) project
- [ ] Share components with web
- [ ] Implement PWA features (offline, install)
- [ ] Test on iOS and Android
- [ ] Deploy to Expo

**Week 11-12: Admin Portal & Testing**
- [ ] Build admin dashboard
- [ ] Implement review queue
- [ ] End-to-end testing (Playwright)
- [ ] Performance testing
- [ ] Security audit
- [ ] Beta launch with 50 institutions

### Phase 2: Scale (6-8 weeks)
- Expand to 200+ institutions
- Performance optimization and caching
- Admin portal enhancements
- Mobile app store deployment
- Alert notifications

### Phase 3: AI Premium (4-6 weeks)
- AI recommendation engine (Gemini + Claude)
- Premium subscription (Paystack)
- Payment integration
- AI chat interface
- Analytics dashboard

### Phase 4: Hardening (Ongoing)
- Accessibility improvements
- Localization (Yoruba, Hausa, Igbo)
- Security audits
- Institutional partnerships
- Customer support setup

---

## Tech Stack Summary

### Frontend
- **Web:** React 18 + TypeScript + Vite
- **Mobile:** React Native + Expo
- **UI:** Tailwind CSS + shadcn/ui
- **State:** Zustand + React Query
- **Deployment:** Render (Static Site)

### Backend
- **API:** FastAPI (Python 3.11+)
- **Database:** Supabase (PostgreSQL 15+)
- **Auth:** Supabase Auth (JWT)
- **Storage:** Supabase Storage
- **Search:** Meilisearch (self-hosted on Render)
- **Cache:** Redis
- **Deployment:** Render

### Data Pipeline
- **Scraping:** Scrapy + Playwright
- **Scheduling:** APScheduler
- **Queue:** Redis Queue
- **Deployment:** Render Workers

### Infrastructure
- **Hosting:** Render (API + Workers + Frontend)
- **Database:** Supabase (managed Postgres)
- **CDN:** Render CDN
- **Monitoring:** Sentry
- **Analytics:** PostHog

### Third-Party Services
- **Payment:** Paystack
- **AI:** Google Gemini + Anthropic Claude
- **Email:** Supabase (SMTP) or SendGrid

---

## Estimated Costs

### Monthly Infrastructure Costs
| Service | Plan | Cost |
|---------|------|------|
| Supabase | Pro | $25 |
| Render (API) | Standard | $21 |
| Render (Workers) | Standard | $21 |
| Render (Frontend) | Static Site | $7 |
| Meilisearch | Render deployment | $15 |
| **Total Infrastructure** | | **$89/month** |

### Monthly Service Costs
| Service | Cost |
|---------|------|
| AI (Gemini/Claude) | ₦5,000 (~$6) |
| Paystack | 1.5% per transaction |
| Sentry | Free (up to 5k events) |
| **Total Services** | **~$6/month** |

### Grand Total: ~$108/month (~₦172,800)

---

## Key Metrics & KPIs

### Technical Metrics
- API response time: <200ms (p95)
- Search latency: <50ms (p95)
- Uptime: 99.9%
- Data freshness: >85%
- Scraper success rate: >95%

### Product Metrics
- DAU/MAU ratio: >0.3
- Search-to-view conversion: >40%
- Premium conversion: >5%
- User retention (30-day): >50%
- NPS: >50

### Business Metrics
- MRR (Monthly Recurring Revenue)
- CAC (Customer Acquisition Cost)
- LTV (Lifetime Value)
- Churn rate: <10%/month

---

## Development Standards

### Code Quality
- **Linting:** ESLint (TypeScript), Ruff (Python)
- **Formatting:** Prettier (TypeScript), Black (Python)
- **Type Checking:** TypeScript strict mode, Mypy (Python)
- **Testing:** Vitest (frontend), Pytest (backend), Playwright (E2E)
- **Coverage:** >80% unit test coverage

### Git Workflow
- **Branching:** feature/*, bugfix/*, hotfix/*
- **Commits:** Conventional Commits (feat:, fix:, docs:, etc.)
- **PRs:** Required reviews, passing CI, no merge conflicts
- **Main Branch:** Protected, deploy on merge

### Documentation
- **API Docs:** Auto-generated (OpenAPI/Swagger)
- **Code Docs:** Inline comments for complex logic
- **Architecture Docs:** This directory
- **Runbooks:** `/docs/runbooks/`

---

## Security Checklist

### Pre-Launch
- [ ] All secrets in environment variables (never in code)
- [ ] TLS enforced on all endpoints
- [ ] RLS policies enabled on all Supabase tables
- [ ] Rate limiting implemented
- [ ] Input validation on all API endpoints
- [ ] CORS properly configured
- [ ] Password policy enforced
- [ ] Payment webhook signature verification
- [ ] NDPR consent flow implemented
- [ ] Security headers configured
- [ ] Dependency vulnerability scan passed
- [ ] Penetration testing completed

### Ongoing
- [ ] Regular dependency updates
- [ ] Quarterly security audits
- [ ] Incident response drills
- [ ] API key rotation
- [ ] Access reviews (who has admin access)

---

## Support & Contact

### Documentation
- **PRD:** `/prd.md`
- **Specs:** `/specs/` (this directory)
- **API Docs:** https://api.admitly.com.ng/docs

### Team Roles
- **Product Lead:** Define features, prioritize roadmap
- **Backend Lead:** API, database, data pipeline
- **Frontend Lead:** Web and mobile apps
- **DevOps Lead:** Infrastructure, deployments, monitoring
- **QA Lead:** Testing, quality assurance

### Communication
- **Project Management:** GitHub Projects
- **Code Reviews:** GitHub Pull Requests
- **Issues:** GitHub Issues
- **Documentation:** GitHub Wiki or Notion

---

## Next Steps

1. **Review all specifications** with the team
2. **Set up development environment** (Supabase, Render, GitHub)
3. **Create project timeline** with milestones
4. **Assign responsibilities** to team members
5. **Begin Phase 1 implementation** (Week 1-2: Infrastructure)

---

## Success Criteria

### MVP Launch (End of Phase 1)
- ✅ 50 institutions with complete data
- ✅ Web app with search, browse, compare
- ✅ Mobile PWA deployed
- ✅ Admin portal functional
- ✅ <2s page load time
- ✅ 100 beta users onboarded
- ✅ Data freshness >70%

### Phase 2 Complete
- ✅ 200+ institutions
- ✅ Alert system functional
- ✅ Mobile apps in App Store / Play Store
- ✅ 1,000+ active users
- ✅ Data freshness >85%

### Phase 3 Complete
- ✅ AI recommendations live
- ✅ Payment integration complete
- ✅ 100+ premium subscribers
- ✅ Positive MRR growth
- ✅ User satisfaction >80%

---

## Change Log

| Date | Version | Changes | Author |
|------|---------|---------|--------|
| 2025-01-10 | 1.0 | Initial specifications created | Claude Code |

---

**Last Updated:** January 10, 2025
**Status:** Ready for Implementation
**Next Review:** Phase 1 completion (Week 12)
