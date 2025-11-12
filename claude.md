# Claude Code Development Guide
# Admitly Platform - Nigeria Student Data Services

**Version:** 1.0
**Last Updated:** January 11, 2025
**Project:** Admitly Platform
**Tech Stack:** FastAPI, React, Supabase, Meilisearch, Paystack, Gemini/Claude AI

---

## Table of Contents

1. [Project Overview](#project-overview)
2. [Development Principles](#development-principles)
3. [Project Structure](#project-structure)
4. [Development Workflow](#development-workflow)
5. [Technology-Specific Guidelines](#technology-specific-guidelines)
6. [Common Patterns & Best Practices](#common-patterns--best-practices)
7. [Testing Strategy](#testing-strategy)
8. [Deployment Process](#deployment-process)
9. [Troubleshooting](#troubleshooting)
10. [Quick Reference](#quick-reference)

---

## Project Overview

### What is Admitly?
A comprehensive platform that centralizes verified educational data for Nigerian students, helping them discover, compare, and plan their educational journey across universities, polytechnics, colleges, and pre-degree programs.

### Core Features
- **Search & Discovery**: Typo-tolerant search across 200+ institutions
- **Comparison Tool**: Side-by-side comparison of programs/institutions
- **Deadline Tracking**: Real-time alerts for application deadlines
- **AI Guidance**: Personalized recommendations (Premium feature)
- **Cost Calculator**: Budget planning tools
- **Career Insights**: Job prospects and salary data

### Key Metrics
- Target: 50,000 users by Year 1
- Performance: <200ms API response, <50ms search latency
- Uptime: 99.9%
- Data Freshness: >85% within SLA

---

## Development Principles

### Core Rules (from genrules.md)

#### 1. **ALWAYS Check Existing Code First** 🔍
**Before creating ANY new component, function, or file:**

```bash
# Search for existing implementations
grep -r "ComponentName" .
grep -r "function_name" .

# Check for similar patterns
find . -name "*similar*"

# Use IDE search (Ctrl+Shift+F or Cmd+Shift+F)
```

**Example Questions to Ask:**
- Does a similar component already exist?
- Is there a utility function that does this?
- What patterns are used elsewhere in the codebase?
- Are there existing TypeScript types/interfaces I can reuse?

#### 2. **Never Assume - Verify with 99% Certainty** ✅
**Before implementing:**
- Read the specification documents in `/specs/`
- Check the database schema in `/specs/database-schema.md`
- Verify API contracts in `/specs/api-specification.md`
- Review the PRD in `/prd.md` for requirements

**If uncertain, ASK:**
- "Should this component handle authentication?"
- "What format should this date be in (ISO 8601)?"
- "Is this field required or optional in the database?"
- "What should happen if the API call fails?"

#### 3. **Maintain Synchronization** 🔄
**Schema → Backend → Frontend → Tests**

**Always ensure:**
- Database schema matches Pydantic models (backend)
- API responses match TypeScript types (frontend)
- UI components match API data structure
- Tests cover all integration points

**Verification Checklist:**
```bash
# 1. Check database schema
cat specs/database-schema.md | grep "table_name"

# 2. Check backend models
grep -r "class TableName" services/api/

# 3. Check TypeScript types
grep -r "interface TableName" apps/web/src/types/

# 4. Verify API endpoint exists
grep -r "@app.get.*table_name" services/api/
```

#### 4. **SOLID Principles Application**

**Single Responsibility:**
```typescript
// ❌ BAD: Component does too much
const ProgramCard = () => {
  // Fetches data, handles auth, renders UI, manages state
}

// ✅ GOOD: Single responsibility
const ProgramCard = ({ program, onCompare, onBookmark }) => {
  // Only renders UI based on props
}
```

**Open/Closed:**
```typescript
// ✅ GOOD: Extendable without modification
interface SearchFilter {
  apply(items: any[]): any[];
}

class StateFilter implements SearchFilter {
  apply(items) { /* filter by state */ }
}

class TuitionFilter implements SearchFilter {
  apply(items) { /* filter by tuition */ }
}
```

**Dependency Inversion:**
```python
# ✅ GOOD: Depend on abstraction
from abc import ABC, abstractmethod

class DataSource(ABC):
    @abstractmethod
    async def fetch_institutions(self): pass

class DatabaseSource(DataSource):
    async def fetch_institutions(self):
        # Implementation

class APISource(DataSource):
    async def fetch_institutions(self):
        # Implementation
```

---

## Project Structure

### Monorepo Layout
```
admitly/
├── apps/
│   ├── web/                    # React web app (Vite + TypeScript)
│   ├── mobile/                 # React Native app (Expo)
│   └── admin/                  # Admin portal (React)
├── packages/
│   ├── ui/                     # Shared UI components (shadcn/ui)
│   ├── types/                  # Shared TypeScript types
│   └── api-client/             # Generated API client
├── services/
│   ├── api/                    # FastAPI backend
│   │   ├── routers/            # API endpoints
│   │   ├── models/             # SQLAlchemy models
│   │   ├── schemas/            # Pydantic schemas
│   │   ├── services/           # Business logic
│   │   └── core/               # Config, security, database
│   ├── scrapers/               # Scrapy spiders
│   │   ├── spiders/            # Spider implementations
│   │   ├── pipelines/          # Data processing
│   │   └── config/             # Source configurations
│   └── ai/                     # AI service (Gemini/Claude)
├── database/
│   ├── migrations/             # Supabase migrations
│   └── seed/                   # Seed data
├── specs/                      # Technical specifications (8 docs)
├── prd.md                      # Product Requirements Document
├── genrules.md                 # Development rules
└── claude.md                   # This file
```

### Naming Conventions

**Backend (Python):**
```python
# Files: snake_case
institution_router.py
user_service.py

# Classes: PascalCase
class InstitutionService:
    pass

# Functions/variables: snake_case
def get_institutions_by_state(state: str):
    pass

# Constants: UPPER_SNAKE_CASE
MAX_RESULTS_PER_PAGE = 100
```

**Frontend (TypeScript/JavaScript):**
```typescript
// Files: PascalCase for components, camelCase for utils
ProgramCard.tsx
usePrograms.ts
formatCurrency.ts

// Components: PascalCase
const ProgramCard = () => {}

// Functions/variables: camelCase
const fetchPrograms = async () => {}

// Constants: UPPER_SNAKE_CASE
const API_BASE_URL = "https://api.admitly.com.ng"

// Types/Interfaces: PascalCase with I prefix (optional)
interface Program {
  id: string;
  name: string;
}
```

**Database:**
```sql
-- Tables: snake_case, plural
institutions
user_profiles
application_windows

-- Columns: snake_case
created_at
institution_id
subscription_status
```

---

## Development Workflow

### Step-by-Step Development Process

#### Phase 1: Planning & Research (CRITICAL ⚠️)

**1. Read Specifications (MANDATORY)**
```bash
# Always read relevant specs before coding
cat specs/api-specification.md       # For API development
cat specs/database-schema.md         # For database work
cat specs/frontend-specification.md  # For UI development
cat specs/system-architecture.md     # For architecture decisions
```

**2. Search Existing Code (MANDATORY)**
```bash
# Backend: Search for similar endpoints
grep -r "institutions" services/api/routers/

# Frontend: Search for similar components
grep -r "ProgramCard" apps/web/src/

# Database: Check existing tables
psql -U postgres -d admitly -c "\dt"
# or check specs/database-schema.md
```

**3. Verify Requirements**
- [ ] Is this feature in the PRD?
- [ ] Is the API endpoint defined in specs/api-specification.md?
- [ ] Is the database table in specs/database-schema.md?
- [ ] Are there existing patterns to follow?
- [ ] What are the acceptance criteria?

#### Phase 2: Implementation

**Backend Development (FastAPI):**

1. **Check Database Schema First**
```bash
# Read the schema
cat specs/database-schema.md | grep "institutions"

# Verify table exists in Supabase
# OR check migration files
ls database/migrations/
```

2. **Create Pydantic Schema**
```python
# services/api/schemas/institution.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class InstitutionBase(BaseModel):
    name: str = Field(..., min_length=3, max_length=200)
    state: str
    type: str
    # ... match database schema EXACTLY

class InstitutionCreate(InstitutionBase):
    pass

class InstitutionResponse(InstitutionBase):
    id: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Pydantic v2
```

3. **Create Service Layer**
```python
# services/api/services/institution_service.py
from supabase import Client
from ..schemas.institution import InstitutionResponse

class InstitutionService:
    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def get_institutions(
        self,
        state: Optional[str] = None,
        page: int = 1,
        page_size: int = 20
    ) -> list[InstitutionResponse]:
        """Get institutions with filtering"""
        query = self.supabase.table('institutions').select('*')

        if state:
            query = query.eq('state', state)

        query = query.eq('status', 'published')
        query = query.is_('deleted_at', 'null')

        # Pagination
        offset = (page - 1) * page_size
        query = query.range(offset, offset + page_size - 1)

        response = query.execute()

        return [InstitutionResponse(**item) for item in response.data]
```

4. **Create Router**
```python
# services/api/routers/institutions.py
from fastapi import APIRouter, Depends, Query
from ..schemas.institution import InstitutionResponse
from ..services.institution_service import InstitutionService
from ..core.dependencies import get_institution_service

router = APIRouter(prefix="/api/v1/institutions", tags=["institutions"])

@router.get("/", response_model=list[InstitutionResponse])
async def list_institutions(
    state: Optional[str] = Query(None, description="Filter by Nigerian state"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page"),
    service: InstitutionService = Depends(get_institution_service)
):
    """List institutions with filtering and pagination"""
    return await service.get_institutions(state, page, page_size)
```

5. **Add Tests**
```python
# services/api/tests/test_institutions.py
import pytest
from fastapi.testclient import TestClient

def test_list_institutions(client: TestClient):
    response = client.get("/api/v1/institutions")
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_filter_by_state(client: TestClient):
    response = client.get("/api/v1/institutions?state=Lagos")
    assert response.status_code == 200
    # All results should be from Lagos
    for item in response.json():
        assert item["state"] == "Lagos"
```

**Frontend Development (React + TypeScript):**

1. **Define TypeScript Types (match backend schema)**
```typescript
// apps/web/src/types/models.ts
export interface Institution {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  type: InstitutionType;
  state: string;
  city: string;
  logo_url?: string;
  website?: string;
  verified: boolean;
  program_count: number;
  created_at: string;
  updated_at: string;
}

export type InstitutionType =
  | 'federal_university'
  | 'state_university'
  | 'private_university'
  | 'polytechnic'
  | 'college_of_education'
  | 'specialized'
  | 'jupeb_center';
```

2. **Create API Client Hook**
```typescript
// apps/web/src/hooks/useInstitutions.ts
import { useQuery } from '@tanstack/react-query';
import { Institution } from '@/types/models';
import { api } from '@/lib/api';

interface UseInstitutionsParams {
  state?: string;
  page?: number;
  pageSize?: number;
}

export function useInstitutions(params: UseInstitutionsParams = {}) {
  return useQuery({
    queryKey: ['institutions', params],
    queryFn: async () => {
      const { data } = await api.get<Institution[]>('/api/v1/institutions', {
        params
      });
      return data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
```

3. **Create Component (check for existing components first!)**
```typescript
// apps/web/src/components/molecules/InstitutionCard/InstitutionCard.tsx
import { FC } from 'react';
import { Institution } from '@/types/models';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface InstitutionCardProps {
  institution: Institution;
  onCompare?: (id: string) => void;
  onBookmark?: (id: string) => void;
  className?: string;
}

export const InstitutionCard: FC<InstitutionCardProps> = ({
  institution,
  onCompare,
  onBookmark,
  className
}) => {
  return (
    <Card className={className}>
      {/* Render institution details */}
      <h3>{institution.name}</h3>
      <Badge>{institution.type}</Badge>
      {institution.verified && <Badge variant="success">Verified</Badge>}
      {/* Actions */}
      {onCompare && (
        <button onClick={() => onCompare(institution.id)}>Compare</button>
      )}
      {onBookmark && (
        <button onClick={() => onBookmark(institution.id)}>Bookmark</button>
      )}
    </Card>
  );
};

InstitutionCard.displayName = 'InstitutionCard';
```

4. **Use in Page**
```typescript
// apps/web/src/pages/InstitutionsPage.tsx
import { useInstitutions } from '@/hooks/useInstitutions';
import { InstitutionCard } from '@/components/molecules/InstitutionCard';

export default function InstitutionsPage() {
  const { data: institutions, isLoading, error } = useInstitutions({
    state: 'Lagos',
    page: 1,
    pageSize: 20
  });

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {institutions?.map(institution => (
        <InstitutionCard
          key={institution.id}
          institution={institution}
          onCompare={handleCompare}
          onBookmark={handleBookmark}
        />
      ))}
    </div>
  );
}
```

5. **Add Tests**
```typescript
// apps/web/src/components/molecules/InstitutionCard/InstitutionCard.test.tsx
import { render, screen } from '@testing-library/react';
import { InstitutionCard } from './InstitutionCard';

const mockInstitution = {
  id: '1',
  name: 'University of Lagos',
  type: 'federal_university' as const,
  state: 'Lagos',
  verified: true,
  // ... other required fields
};

describe('InstitutionCard', () => {
  it('renders institution name', () => {
    render(<InstitutionCard institution={mockInstitution} />);
    expect(screen.getByText('University of Lagos')).toBeInTheDocument();
  });

  it('shows verified badge when verified', () => {
    render(<InstitutionCard institution={mockInstitution} />);
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });
});
```

#### Phase 3: Integration & Testing

**Integration Checklist:**
- [ ] Backend endpoint returns correct data structure
- [ ] Frontend TypeScript types match backend schema
- [ ] API client correctly handles errors
- [ ] Loading states are handled
- [ ] Error states are handled
- [ ] Empty states are handled
- [ ] Pagination works correctly
- [ ] Filters work correctly

**Testing Checklist:**
- [ ] Unit tests for business logic
- [ ] Integration tests for API endpoints
- [ ] Component tests for UI
- [ ] E2E tests for critical flows
- [ ] Performance tests (if needed)

---

## Technology-Specific Guidelines

### FastAPI (Backend)

**Project Commands:**
```bash
# Development
cd services/api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run tests
pytest

# Type checking
mypy .

# Linting
ruff check .

# Formatting
black .
```

**Common Patterns:**

**1. Dependency Injection:**
```python
# core/dependencies.py
from supabase import create_client, Client
from fastapi import Depends

def get_supabase() -> Client:
    return create_client(SUPABASE_URL, SUPABASE_KEY)

def get_institution_service(
    supabase: Client = Depends(get_supabase)
) -> InstitutionService:
    return InstitutionService(supabase)
```

**2. Error Handling:**
```python
from fastapi import HTTPException, status

@router.get("/{institution_id}")
async def get_institution(
    institution_id: str,
    service: InstitutionService = Depends(get_institution_service)
):
    institution = await service.get_by_id(institution_id)

    if not institution:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Institution with id {institution_id} not found"
        )

    return institution
```

**3. Authentication:**
```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

security = HTTPBearer()

async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> dict:
    """Verify JWT token from Supabase Auth"""
    token = credentials.credentials

    try:
        # Verify with Supabase
        user = supabase.auth.get_user(token)
        return user
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authentication credentials"
        )
```

### React + TypeScript (Frontend)

**Project Commands:**
```bash
# Development
cd apps/web
pnpm install

# Run development server
pnpm dev

# Build
pnpm build

# Preview production build
pnpm preview

# Type checking
pnpm typecheck

# Linting
pnpm lint

# Testing
pnpm test

# E2E tests
pnpm test:e2e
```

**Common Patterns:**

**1. Component Structure:**
```typescript
// Component file structure
ComponentName/
├── ComponentName.tsx         # Main component
├── ComponentName.test.tsx    # Tests
├── ComponentName.stories.tsx # Storybook (optional)
├── index.ts                  # Export
└── types.ts                  # Component-specific types (optional)
```

**2. State Management (Zustand):**
```typescript
// stores/comparisonStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ComparisonStore {
  items: string[];
  addItem: (id: string) => void;
  removeItem: (id: string) => void;
  clear: () => void;
}

export const useComparisonStore = create<ComparisonStore>()(
  persist(
    (set) => ({
      items: [],
      addItem: (id) =>
        set((state) => ({
          items: [...state.items, id].slice(0, 3) // Max 3 items
        })),
      removeItem: (id) =>
        set((state) => ({
          items: state.items.filter(item => item !== id)
        })),
      clear: () => set({ items: [] })
    }),
    {
      name: 'comparison-storage',
    }
  )
);
```

**3. Server State (React Query):**
```typescript
// hooks/usePrograms.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export function usePrograms(filters: ProgramFilters) {
  return useQuery({
    queryKey: ['programs', filters],
    queryFn: () => api.getPrograms(filters),
    staleTime: 5 * 60 * 1000,
  });
}

export function useBookmarkProgram() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (programId: string) => api.bookmarkProgram(programId),
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
}
```

**4. Error Boundaries:**
```typescript
// components/ErrorBoundary.tsx
import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || <div>Something went wrong</div>;
    }

    return this.props.children;
  }
}
```

### Supabase (Database)

**Common Operations:**

**1. Query with RLS:**
```typescript
// Supabase automatically applies RLS policies
const { data, error } = await supabase
  .from('institutions')
  .select('*')
  .eq('status', 'published')
  .is('deleted_at', null);
```

**2. Insert Data:**
```typescript
const { data, error } = await supabase
  .from('user_profiles')
  .insert({
    id: userId,
    full_name: 'John Doe',
    role: 'student'
  })
  .select()
  .single();
```

**3. Real-time Subscriptions:**
```typescript
// Subscribe to changes
const subscription = supabase
  .channel('institutions')
  .on('postgres_changes',
    {
      event: '*',
      schema: 'public',
      table: 'institutions'
    },
    (payload) => {
      console.log('Change received!', payload);
    }
  )
  .subscribe();

// Clean up
subscription.unsubscribe();
```

**4. Storage:**
```typescript
// Upload file
const { data, error } = await supabase.storage
  .from('institution-logos')
  .upload(`${institutionId}/logo.png`, file);

// Get public URL
const { data: { publicUrl } } = supabase.storage
  .from('institution-logos')
  .getPublicUrl(`${institutionId}/logo.png`);
```

### Scrapy (Data Pipeline)

**Project Commands:**
```bash
cd services/scrapers

# Run a spider
scrapy crawl institution_spider

# Run with settings
scrapy crawl institution_spider -s LOG_LEVEL=DEBUG

# List all spiders
scrapy list

# Check spider code
scrapy check institution_spider
```

**Spider Template:**
```python
# spiders/institution_spider.py
import scrapy
from ..items.models import InstitutionItem

class InstitutionSpider(scrapy.Spider):
    name = "institution_spider"

    # Load from config
    start_urls = ['https://unilag.edu.ng/about']

    custom_settings = {
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
    }

    def parse(self, response):
        """Parse institution page"""
        item = InstitutionItem(
            name=response.css('h1::text').get(),
            description=response.css('.about p::text').get(),
            # ... extract data
            source_url=response.url,
            scrape_timestamp=datetime.now()
        )

        yield item
```

---

## Common Patterns & Best Practices

### 1. Error Handling

**Backend:**
```python
# Use custom exceptions
class InstitutionNotFoundError(Exception):
    pass

# Handle in router
try:
    institution = await service.get_institution(id)
except InstitutionNotFoundError:
    raise HTTPException(status_code=404, detail="Institution not found")
except Exception as e:
    logger.error(f"Unexpected error: {e}")
    raise HTTPException(status_code=500, detail="Internal server error")
```

**Frontend:**
```typescript
// Use error boundaries for component errors
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// Handle API errors with React Query
const { data, error, isError } = useInstitutions();

if (isError) {
  return <ErrorMessage error={error} />;
}
```

### 2. Loading States

**Frontend:**
```typescript
const { data, isLoading, isFetching } = useInstitutions();

if (isLoading) {
  return <Skeleton />; // Initial load
}

return (
  <>
    {isFetching && <LoadingSpinner />} {/* Background refetch */}
    <InstitutionList data={data} />
  </>
);
```

### 3. Pagination

**Backend:**
```python
@router.get("/")
async def list_items(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100)
):
    offset = (page - 1) * page_size

    items = await service.get_items(offset, page_size)
    total = await service.count_items()

    return {
        "data": items,
        "pagination": {
            "page": page,
            "page_size": page_size,
            "total": total,
            "total_pages": (total + page_size - 1) // page_size
        }
    }
```

**Frontend:**
```typescript
function InstitutionList() {
  const [page, setPage] = useState(1);
  const { data } = useInstitutions({ page });

  return (
    <>
      <ItemsList items={data?.data} />
      <Pagination
        currentPage={page}
        totalPages={data?.pagination.total_pages}
        onPageChange={setPage}
      />
    </>
  );
}
```

### 4. Authentication Flow

**Backend:**
```python
# Protect routes
@router.get("/me")
async def get_profile(
    current_user: dict = Depends(get_current_user)
):
    return current_user
```

**Frontend:**
```typescript
// Auth context
const { user, loading } = useAuth();

if (loading) return <LoadingSpinner />;
if (!user) return <Navigate to="/login" />;

return <ProtectedContent />;
```

### 5. Form Handling

**Frontend with React Hook Form:**
```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const schema = z.object({
  name: z.string().min(3).max(200),
  state: z.string(),
  type: z.enum(['federal_university', 'state_university', ...])
});

function InstitutionForm() {
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      state: '',
      type: 'federal_university'
    }
  });

  const onSubmit = async (data) => {
    try {
      await api.createInstitution(data);
      toast.success('Institution created');
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

---

## Testing Strategy

### Backend Tests (Pytest)

**Structure:**
```
services/api/tests/
├── conftest.py           # Fixtures
├── test_institutions.py  # Institution tests
├── test_programs.py      # Program tests
└── test_auth.py          # Auth tests
```

**Example Tests:**
```python
# conftest.py
import pytest
from fastapi.testclient import TestClient
from main import app

@pytest.fixture
def client():
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    # Get auth token
    response = client.post("/auth/login", json={
        "email": "test@example.com",
        "password": "password"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

# test_institutions.py
def test_list_institutions(client):
    response = client.get("/api/v1/institutions")
    assert response.status_code == 200
    assert isinstance(response.json()["data"], list)

def test_get_institution_not_found(client):
    response = client.get("/api/v1/institutions/invalid-id")
    assert response.status_code == 404

def test_create_institution_unauthorized(client):
    response = client.post("/api/v1/institutions", json={
        "name": "Test University"
    })
    assert response.status_code == 401

def test_create_institution(client, auth_headers):
    response = client.post(
        "/api/v1/institutions",
        json={"name": "Test University", "state": "Lagos"},
        headers=auth_headers
    )
    assert response.status_code == 201
```

### Frontend Tests (Vitest + React Testing Library)

**Structure:**
```
apps/web/src/
├── components/
│   └── InstitutionCard/
│       ├── InstitutionCard.tsx
│       └── InstitutionCard.test.tsx
├── hooks/
│   └── useInstitutions.test.ts
└── pages/
    └── InstitutionsPage.test.tsx
```

**Example Tests:**
```typescript
// InstitutionCard.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { InstitutionCard } from './InstitutionCard';

describe('InstitutionCard', () => {
  const mockInstitution = {
    id: '1',
    name: 'University of Lagos',
    type: 'federal_university',
    state: 'Lagos',
    verified: true
  };

  it('renders institution details', () => {
    render(<InstitutionCard institution={mockInstitution} />);

    expect(screen.getByText('University of Lagos')).toBeInTheDocument();
    expect(screen.getByText('Lagos')).toBeInTheDocument();
    expect(screen.getByText('Verified')).toBeInTheDocument();
  });

  it('calls onCompare when compare button clicked', () => {
    const onCompare = vi.fn();
    render(
      <InstitutionCard
        institution={mockInstitution}
        onCompare={onCompare}
      />
    );

    fireEvent.click(screen.getByText('Compare'));
    expect(onCompare).toHaveBeenCalledWith('1');
  });
});
```

### E2E Tests (Playwright)

**Example Test:**
```typescript
// tests/e2e/search.spec.ts
import { test, expect } from '@playwright/test';

test('user can search for institutions', async ({ page }) => {
  // Navigate to home
  await page.goto('/');

  // Enter search query
  await page.fill('[data-testid="search-input"]', 'computer science');
  await page.click('[data-testid="search-button"]');

  // Wait for results
  await page.waitForSelector('[data-testid="search-results"]');

  // Verify results
  const results = page.locator('[data-testid="program-card"]');
  await expect(results).toHaveCount.greaterThan(0);

  // Check first result contains search term
  const firstResult = results.first();
  await expect(firstResult).toContainText('Computer Science');
});

test('user can compare programs', async ({ page }) => {
  await page.goto('/programs');

  // Add 3 programs to comparison
  const compareButtons = page.locator('[data-testid="compare-button"]');
  await compareButtons.nth(0).click();
  await compareButtons.nth(1).click();
  await compareButtons.nth(2).click();

  // Check comparison tray
  const tray = page.locator('[data-testid="comparison-tray"]');
  await expect(tray).toContainText('3 items');

  // Navigate to comparison page
  await tray.locator('button:has-text("Compare")').click();
  await expect(page).toHaveURL('/compare');

  // Verify comparison table
  const table = page.locator('[data-testid="comparison-table"]');
  await expect(table).toBeVisible();
});
```

---

## Deployment Process

### Environment Setup

**Development:**
```bash
# Backend
cp .env.example .env.development
# Edit .env.development with dev credentials

# Frontend
cp .env.example .env.local
# Edit .env.local
```

**Staging:**
- Automatic deployment on PR to main
- Render preview for frontend
- Render preview for backend

**Production:**
- Automatic deployment on merge to main
- Manual approval required

### Deployment Checklist

**Pre-deployment:**
- [ ] All tests passing
- [ ] Type checking passes
- [ ] Linting passes
- [ ] No console.log statements
- [ ] Environment variables configured
- [ ] Database migrations ready
- [ ] API documentation updated

**Backend Deployment (Render):**
```bash
# 1. Push to main branch
git push origin main

# 2. Render auto-deploys
# Monitor at: https://dashboard.render.com

# 3. Run migrations (if needed)
# Via Render shell or manually

# 4. Verify deployment
curl https://api.admitly.com.ng/health
```

**Frontend Deployment (Render):**
```bash
# 1. Push to main branch
git push origin main

# 2. Render auto-deploys static site
# Monitor at: https://dashboard.render.com

# 3. Verify deployment
curl https://admitly.com.ng
```

**Database Migrations (Supabase):**
```bash
# 1. Create migration
supabase migration new migration_name

# 2. Write migration SQL
# Edit database/migrations/TIMESTAMP_migration_name.sql

# 3. Apply to local
supabase db reset

# 4. Test locally
# Run tests

# 5. Apply to production
supabase db push
```

---

## Troubleshooting

### Common Issues & Solutions

#### 1. Database Connection Issues

**Problem:** `Connection to Supabase failed`

**Solution:**
```bash
# Check environment variables
echo $SUPABASE_URL
echo $SUPABASE_KEY

# Verify network connection
curl $SUPABASE_URL

# Check RLS policies (might be blocking access)
# Review database/schema.sql for RLS policies
```

#### 2. TypeScript Type Errors

**Problem:** `Type 'X' is not assignable to type 'Y'`

**Solution:**
```typescript
// 1. Check if types are in sync with backend
// Compare: apps/web/src/types/models.ts with services/api/schemas/

// 2. Regenerate types from OpenAPI
pnpm generate:types

// 3. Add type assertion if necessary
const data = response.data as ExpectedType;
```

#### 3. API 404 Errors

**Problem:** `404 Not Found` for API endpoint

**Solution:**
```bash
# 1. Verify endpoint exists in specs/api-specification.md
grep "GET /api/v1/institutions" specs/api-specification.md

# 2. Check router is registered
# In services/api/main.py
app.include_router(institutions_router)

# 3. Check route parameters
# /api/v1/institutions/{id} vs /api/v1/institutions?id=123
```

#### 4. Authentication Errors

**Problem:** `401 Unauthorized`

**Solution:**
```typescript
// 1. Check token is being sent
console.log('Token:', localStorage.getItem('supabase.auth.token'));

// 2. Verify token format
// Should be: Bearer <jwt-token>

// 3. Check token expiry
// Tokens expire after 1 hour

// 4. Refresh token
const { data, error } = await supabase.auth.refreshSession();
```

#### 5. Scraper Failures

**Problem:** Scraper not extracting data

**Solution:**
```bash
# 1. Check if website changed
# Visit source URL in browser

# 2. Test selectors in browser console
document.querySelector('h1.institution-name')

# 3. Check robots.txt
curl https://unilag.edu.ng/robots.txt

# 4. Run with debug logging
scrapy crawl institution_spider -s LOG_LEVEL=DEBUG

# 5. Check HTML snapshot
# View stored snapshot in Supabase Storage
```

#### 6. Performance Issues

**Problem:** Slow page load times

**Solution:**
```bash
# 1. Run Lighthouse audit
pnpm lighthouse

# 2. Check bundle size
pnpm analyze

# 3. Profile API calls
# Use browser DevTools Network tab

# 4. Check database queries
# Use Supabase dashboard query performance

# 5. Verify caching is working
# Check Redis/CDN hit rates
```

---

## Quick Reference

### Project Commands Cheat Sheet

**Backend:**
```bash
cd services/api
uvicorn main:app --reload        # Dev server
pytest                           # Run tests
pytest -v -s                     # Verbose tests
mypy .                          # Type checking
ruff check .                    # Linting
black .                         # Formatting
```

**Frontend:**
```bash
cd apps/web
pnpm dev                        # Dev server
pnpm build                      # Production build
pnpm preview                    # Preview build
pnpm test                       # Unit tests
pnpm test:e2e                   # E2E tests
pnpm typecheck                  # Type checking
pnpm lint                       # Linting
```

**Database:**
```bash
# Supabase CLI
supabase start                  # Start local Supabase
supabase db reset               # Reset database
supabase db push                # Push migrations
supabase db pull                # Pull schema
supabase migration new <name>   # Create migration
```

**Scrapers:**
```bash
cd services/scrapers
scrapy crawl <spider_name>      # Run spider
scrapy list                     # List spiders
scrapy check                    # Check spiders
```

### Important File Locations

**Specifications:**
- PRD: `/prd.md`
- Tech Stack: `/specs/tech-stack-decisions.md`
- Database Schema: `/specs/database-schema.md`
- API Spec: `/specs/api-specification.md`
- Frontend Spec: `/specs/frontend-specification.md`
- Data Pipeline: `/specs/data-pipeline.md`
- Security: `/specs/security-compliance.md`
- Payment: `/specs/payment-integration.md`

**Configuration:**
- Backend Config: `services/api/core/config.py`
- Frontend Config: `apps/web/vite.config.ts`
- Database Migrations: `database/migrations/`
- Scraper Config: `services/scrapers/config/sources.yaml`

**Key Files:**
- Backend Entry: `services/api/main.py`
- Frontend Entry: `apps/web/src/main.tsx`
- Database Schema: `database/schema.sql`

### Environment Variables

**Backend (.env):**
```bash
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_KEY=xxx
SUPABASE_SERVICE_KEY=xxx
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=xxx
REDIS_URL=redis://localhost:6379
GEMINI_API_KEY=xxx
CLAUDE_API_KEY=xxx
PAYSTACK_SECRET_KEY=xxx
```

**Frontend (.env.local):**
```bash
VITE_SUPABASE_URL=https://xxx.supabase.co
VITE_SUPABASE_ANON_KEY=xxx
VITE_API_URL=http://localhost:8000
VITE_MEILISEARCH_HOST=http://localhost:7700
```

### Quick Decision Tree

**When creating a new feature:**
```
1. Is it in the PRD? → Read specs/
2. Does similar code exist? → grep/find
3. What's the data structure? → Check database-schema.md
4. What's the API contract? → Check api-specification.md
5. Are there existing patterns? → Search codebase
6. Do I need new types? → Add to types/models.ts
7. Do I need tests? → YES, always
8. Do I need documentation? → If complex, YES
```

**When debugging:**
```
1. Check logs → Console/terminal
2. Check network → Browser DevTools
3. Check database → Supabase dashboard
4. Check types → TypeScript errors
5. Check tests → Run relevant tests
6. Check specs → Verify requirements
7. Ask for help → If stuck >30 min
```

---

## Final Reminders

### Development Best Practices

1. **ALWAYS read specifications first** - Don't guess requirements
2. **ALWAYS search for existing code** - Don't duplicate functionality
3. **ALWAYS verify with 99% certainty** - Don't assume anything
4. **ALWAYS maintain synchronization** - Schema → Backend → Frontend → Tests
5. **ALWAYS write tests** - No exceptions
6. **ALWAYS handle errors** - Loading, error, and empty states
7. **ALWAYS follow naming conventions** - Consistency is key
8. **ALWAYS document complex logic** - Your future self will thank you
9. **ALWAYS commit with meaningful messages** - Explain the "why"
10. **ALWAYS ask when uncertain** - It's better than guessing wrong

### Code Review Checklist

Before submitting a PR:
- [ ] Tests written and passing
- [ ] Types are correct
- [ ] Error handling implemented
- [ ] Loading states handled
- [ ] Empty states handled
- [ ] Accessibility considered
- [ ] Performance optimized
- [ ] Security reviewed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] No commented-out code
- [ ] Follows project conventions

### Resources

**Documentation:**
- FastAPI: https://fastapi.tiangolo.com
- React: https://react.dev
- Supabase: https://supabase.com/docs
- Meilisearch: https://www.meilisearch.com/docs
- Scrapy: https://docs.scrapy.org

**Tools:**
- GitHub: https://github.com/admitly/admitly
- Render: https://dashboard.render.com
- Supabase Dashboard: https://supabase.com/dashboard

---

**Remember:** This is a living document. Update it as patterns emerge and the project evolves.

**Last Updated:** January 11, 2025
**Status:** Active
**Next Review:** After Phase 1 completion
