# Admitly Platform

Nigeria Student Data Services Platform - Centralizing verified educational data for Nigerian students.

## Overview

Admitly is a comprehensive platform that helps Nigerian students discover, compare, and plan their educational journey across universities, polytechnics, colleges, and pre-degree programs.

## Tech Stack

- **Frontend:** React 18 + TypeScript + Vite
- **Mobile:** React Native + Expo
- **Backend:** FastAPI (Python 3.11+)
- **Database:** Supabase (PostgreSQL)
- **Search:** Meilisearch
- **Deployment:** Render
- **Payment:** Paystack

## Project Structure

```
admitly/
├── apps/
│   ├── web/           # React web app (Vite + TypeScript)
│   ├── mobile/        # React Native app (Expo)
│   └── admin/         # Admin portal (React)
├── packages/
│   ├── ui/            # Shared UI components (shadcn/ui)
│   ├── types/         # Shared TypeScript types
│   └── api-client/    # Generated API client
├── services/
│   ├── api/           # FastAPI backend
│   ├── scrapers/      # Scrapy spiders
│   └── ai/            # AI service (Gemini/Claude)
├── database/
│   ├── migrations/    # Supabase migrations
│   └── seed/          # Seed data
└── specs/             # Technical specifications
```

## Prerequisites

- **Node.js:** >= 18.0.0
- **pnpm:** >= 8.0.0
- **Python:** >= 3.11
- **PostgreSQL:** >= 15 (via Supabase)
- **Redis:** >= 7.0

## Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/admitly/admitly.git
cd admitly
```

### 2. Install Dependencies

#### Frontend (pnpm workspaces)

```bash
pnpm install
```

#### Backend (Python)

```bash
cd services/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Scrapers (Python)

```bash
cd services/scrapers
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 3. Environment Setup

Copy the example environment file and fill in your credentials:

```bash
cp .env.example .env
```

Edit `.env` with your actual configuration values.

### 4. Database Setup (Supabase)

1. Create a Supabase project at https://supabase.com
2. Copy your project URL and keys to `.env`
3. Run migrations:

```bash
cd database/migrations
# Follow Supabase CLI instructions
```

### 5. Start Development Servers

#### Frontend (Web App)

```bash
pnpm dev:web
# Access at http://localhost:5173
```

#### Backend (API)

```bash
cd services/api
uvicorn main:app --reload --host 0.0.0.0 --port 8000
# Access at http://localhost:8000
# API docs at http://localhost:8000/docs
```

#### Mobile (Expo)

```bash
pnpm dev:mobile
# Follow Expo CLI instructions
```

## Available Scripts

### Root Level

- `pnpm dev` - Start all development servers
- `pnpm build` - Build all apps for production
- `pnpm test` - Run all tests
- `pnpm lint` - Lint all code
- `pnpm typecheck` - Type check all TypeScript
- `pnpm format` - Format all code with Prettier

### Web App

- `pnpm dev:web` - Start web dev server
- `pnpm build:web` - Build for production
- `pnpm test:e2e` - Run E2E tests

### Backend

- `uvicorn main:app --reload` - Start dev server
- `pytest` - Run tests
- `black .` - Format code
- `ruff check .` - Lint code

## Documentation

- **PRD:** [prd.md](./prd.md)
- **Development Guide:** [CLAUDE.md](./CLAUDE.md)
- **Technical Specifications:** [specs/](./specs/)
- **API Documentation:** http://localhost:8000/docs (when running)

## Deployment

### Render Configuration

See `render.yaml` for deployment configuration.

### Production Checklist

- [ ] Environment variables configured
- [ ] Database migrations applied
- [ ] All tests passing
- [ ] Security audit completed
- [ ] Performance optimization done
- [ ] Monitoring configured (Sentry)

## Contributing

1. Read the [development guide](./CLAUDE.md)
2. Follow the coding standards
3. Write tests for new features
4. Submit a pull request

## License

UNLICENSED - Internal Project

## Support

For questions or issues, contact the development team.

## Version

**Version:** 1.0.0
**Status:** In Development
**Target Launch:** November 30, 2025
