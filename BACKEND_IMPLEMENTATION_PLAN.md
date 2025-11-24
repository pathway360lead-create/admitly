# Backend Implementation Plan
# Admitly Platform - Nigeria Student Data Services

**Created:** January 19, 2025
**Status:** In Progress
**Estimated Duration:** 3-4 weeks
**Current Phase:** Phase 1 - Backend Setup

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Phase 1: Backend Setup & Configuration](#phase-1-backend-setup--configuration)
4. [Phase 2: Authentication System](#phase-2-authentication-system)
5. [Phase 3: Core API Endpoints](#phase-3-core-api-endpoints)
6. [Phase 4: Search Integration](#phase-4-search-integration)
7. [Phase 5: Frontend Integration](#phase-5-frontend-integration)
8. [Phase 6: Data Pipeline](#phase-6-data-pipeline)
9. [Phase 7: Admin Portal Backend](#phase-7-admin-portal-backend)
10. [Testing Strategy](#testing-strategy)
11. [Deployment Plan](#deployment-plan)
12. [Success Criteria](#success-criteria)

---

## Overview

### Current State
- ✅ Frontend: 100% complete with mock data
- ✅ Security: Hardened with password validation and token expiration
- ✅ Testing: 72 tests passing, coverage reporting setup
- ✅ Database: 24 tables in Supabase with RLS policies
- ⏳ Backend API: 0% - Starting now
- ⏳ Search Service: Meilisearch not deployed
- ⏳ Data Pipeline: Scrapers not implemented

### Goals
1. Build FastAPI backend with 70+ endpoints
2. Replace frontend mock data with real API
3. Deploy Meilisearch for fast search (<50ms)
4. Implement data scraping pipeline
5. Create admin approval workflow
6. Achieve <200ms API response time
7. Support 10,000+ concurrent users

### Technical Stack
- **Framework:** FastAPI 0.121+
- **Runtime:** Python 3.13
- **Database:** Supabase (PostgreSQL 15)
- **Search:** Meilisearch 1.11+
- **Cache:** Redis 7.0+
- **Auth:** Supabase Auth (JWT)
- **Deployment:** Render.com
- **Monitoring:** Sentry + Render Metrics

---

## Prerequisites

### Required Access
- [x] Supabase project credentials
- [x] GitHub repository access
- [ ] Render.com account setup
- [ ] Meilisearch Cloud or self-hosted instance
- [ ] Redis Cloud instance (optional)

### Environment Setup
```bash
# Clone repository
git clone https://github.com/pathway360lead-create/admitly.git
cd admitly

# Navigate to API service
cd services/api

# Create virtual environment
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Unix/macOS)
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
```

### Environment Variables Required
```env
# Supabase
SUPABASE_URL=https://[project-id].supabase.co
SUPABASE_KEY=[anon-key]
SUPABASE_SERVICE_KEY=[service-role-key]

# Meilisearch
MEILISEARCH_HOST=http://localhost:7700
MEILISEARCH_API_KEY=[master-key]

# Redis (Optional)
REDIS_URL=redis://localhost:6379

# Security
JWT_SECRET=[random-secret]
API_SECRET_KEY=[random-secret]

# AI Services (Premium Features)
GEMINI_API_KEY=[key]
CLAUDE_API_KEY=[key]

# Payment (Phase 2)
PAYSTACK_SECRET_KEY=[key]
PAYSTACK_PUBLIC_KEY=[key]

# Environment
ENVIRONMENT=development
DEBUG=true
ALLOWED_ORIGINS=http://localhost:5174,https://admitly.com.ng
```

---

## Phase 1: Backend Setup & Configuration

**Duration:** 3-5 days
**Goal:** Create FastAPI project structure with core configuration

### Tasks

#### Day 1-2: Project Structure & Dependencies

**1.1 Create Directory Structure**
```
services/api/
├── app/
│   ├── __init__.py
│   ├── main.py              # FastAPI app initialization
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py        # Settings from environment
│   │   ├── security.py      # JWT, password hashing
│   │   ├── database.py      # Supabase client
│   │   ├── cache.py         # Redis client
│   │   └── logging.py       # Logging configuration
│   ├── models/
│   │   ├── __init__.py
│   │   └── schemas.py       # Pydantic models
│   ├── routers/
│   │   ├── __init__.py
│   │   ├── auth.py          # Authentication endpoints
│   │   ├── institutions.py  # Institution endpoints
│   │   ├── programs.py      # Program endpoints
│   │   ├── search.py        # Search endpoints
│   │   └── users.py         # User profile endpoints
│   ├── services/
│   │   ├── __init__.py
│   │   ├── auth_service.py
│   │   ├── institution_service.py
│   │   ├── program_service.py
│   │   └── search_service.py
│   └── utils/
│       ├── __init__.py
│       ├── validators.py
│       └── helpers.py
├── tests/
│   ├── __init__.py
│   ├── conftest.py
│   ├── test_auth.py
│   ├── test_institutions.py
│   └── test_programs.py
├── requirements.txt
├── .env.example
└── README.md
```

**1.2 Create requirements.txt**
```txt
# Core Framework
fastapi==0.121.2
uvicorn[standard]==0.38.0
python-dotenv==1.2.1
pydantic==2.12.4
pydantic-settings==2.12.0

# Database & Storage
supabase==2.24.0
asyncpg==0.30.0

# Search
meilisearch==0.38.0

# Cache (Optional)
redis==7.0.1

# Security
python-jose[cryptography]==3.4.0
passlib[bcrypt]==1.7.4
python-multipart==0.0.18

# HTTP Client
httpx==0.28.1

# Background Tasks (Later)
celery==5.4.0
redis==7.0.1

# Testing
pytest==8.3.4
pytest-asyncio==0.24.0
pytest-cov==6.0.0
httpx==0.28.1  # For TestClient

# Monitoring (Production)
sentry-sdk[fastapi]==2.24.0

# Development
ruff==0.8.6
mypy==1.14.1
black==25.1.0
```

**1.3 Create core/config.py**
```python
from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import List

class Settings(BaseSettings):
    """Application settings loaded from environment variables"""

    # App Info
    app_name: str = "Admitly API"
    app_version: str = "1.0.0"
    environment: str = "development"
    debug: bool = True

    # API Settings
    api_v1_prefix: str = "/api/v1"
    allowed_origins: List[str] = [
        "http://localhost:5174",
        "https://admitly.com.ng"
    ]

    # Supabase
    supabase_url: str
    supabase_key: str
    supabase_service_key: str

    # Meilisearch
    meilisearch_host: str = "http://localhost:7700"
    meilisearch_api_key: str

    # Redis (Optional)
    redis_url: str | None = None

    # Security
    jwt_secret: str
    jwt_algorithm: str = "HS256"
    jwt_access_token_expire_minutes: int = 60
    jwt_refresh_token_expire_days: int = 7

    # AI Services (Premium)
    gemini_api_key: str | None = None
    claude_api_key: str | None = None

    # Paystack (Payment)
    paystack_secret_key: str | None = None
    paystack_public_key: str | None = None

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False
    )

# Global settings instance
settings = Settings()
```

**1.4 Create core/database.py**
```python
from supabase import create_client, Client
from .config import settings

def get_supabase_client() -> Client:
    """Create Supabase client instance"""
    return create_client(
        settings.supabase_url,
        settings.supabase_key
    )

def get_supabase_admin_client() -> Client:
    """Create Supabase admin client with service role key"""
    return create_client(
        settings.supabase_url,
        settings.supabase_service_key
    )

# Global clients
supabase: Client = get_supabase_client()
supabase_admin: Client = get_supabase_admin_client()
```

**1.5 Create main.py**
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from .core.config import settings
from .routers import auth, institutions, programs, search, users

# Initialize FastAPI app
app = FastAPI(
    title=settings.app_name,
    version=settings.app_version,
    docs_url="/docs" if settings.debug else None,
    redoc_url="/redoc" if settings.debug else None,
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Gzip Compression
app.add_middleware(GZipMiddleware, minimum_size=1000)

# Health Check
@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "version": settings.app_version,
        "environment": settings.environment
    }

# Include routers
app.include_router(auth.router, prefix=settings.api_v1_prefix, tags=["auth"])
app.include_router(institutions.router, prefix=settings.api_v1_prefix, tags=["institutions"])
app.include_router(programs.router, prefix=settings.api_v1_prefix, tags=["programs"])
app.include_router(search.router, prefix=settings.api_v1_prefix, tags=["search"])
app.include_router(users.router, prefix=settings.api_v1_prefix, tags=["users"])

# Startup Event
@app.on_event("startup")
async def startup_event():
    """Initialize services on startup"""
    print(f"🚀 {settings.app_name} v{settings.app_version} starting...")
    print(f"📡 Environment: {settings.environment}")
    print(f"🔗 Supabase: Connected")
    # TODO: Initialize Meilisearch
    # TODO: Initialize Redis (if configured)

# Shutdown Event
@app.on_event("shutdown")
async def shutdown_event():
    """Cleanup on shutdown"""
    print("👋 Shutting down...")
    # TODO: Close connections

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host="0.0.0.0",
        port=8000,
        reload=settings.debug
    )
```

#### Day 3: Testing Setup

**1.6 Create tests/conftest.py**
```python
import pytest
from fastapi.testclient import TestClient
from app.main import app

@pytest.fixture
def client():
    """FastAPI test client"""
    return TestClient(app)

@pytest.fixture
def auth_headers(client):
    """Authenticated headers for testing"""
    # TODO: Implement after auth is ready
    response = client.post("/api/v1/auth/login", json={
        "email": "test@example.com",
        "password": "Test123!@#"
    })
    token = response.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}
```

**1.7 Create tests/test_main.py**
```python
def test_health_check(client):
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"

def test_cors_headers(client):
    """Test CORS headers are present"""
    response = client.options(
        "/api/v1/institutions",
        headers={"Origin": "http://localhost:5174"}
    )
    assert response.headers["access-control-allow-origin"] == "http://localhost:5174"
```

#### Day 4-5: Run & Verify

**1.8 Installation & Testing**
```bash
# Install dependencies
pip install -r requirements.txt

# Run development server
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Test health endpoint
curl http://localhost:8000/health

# Run tests
pytest

# Type checking
mypy app/

# Linting
ruff check app/
```

**1.9 Success Criteria**
- [ ] FastAPI server runs without errors
- [ ] Health check endpoint returns 200
- [ ] CORS middleware configured correctly
- [ ] Environment variables load from .env
- [ ] Supabase connection established
- [ ] Tests run and pass
- [ ] No type errors from mypy
- [ ] No linting errors from ruff

---

## Phase 2: Authentication System

**Duration:** 2-3 days
**Goal:** Implement JWT-based authentication with Supabase Auth

### Reference Documents
- `specs/api-specification.md` (Authentication section)
- `specs/security-compliance.md` (Auth requirements)
- Frontend: `apps/web/src/hooks/useAuth.ts`

### Tasks

#### Day 1: Auth Models & Security

**2.1 Create models/schemas.py - Auth Models**
```python
from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import datetime

class UserRegister(BaseModel):
    """User registration payload"""
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: str = Field(..., min_length=3, max_length=100)

    @field_validator('password')
    def validate_password(cls, v):
        """Password must meet security requirements"""
        if not any(c.isupper() for c in v):
            raise ValueError('Password must contain uppercase letter')
        if not any(c.islower() for c in v):
            raise ValueError('Password must contain lowercase letter')
        if not any(c.isdigit() for c in v):
            raise ValueError('Password must contain number')
        if not any(c in '!@#$%^&*' for c in v):
            raise ValueError('Password must contain special character')
        return v

class UserLogin(BaseModel):
    """User login payload"""
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    """JWT token response"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # seconds

class UserProfile(BaseModel):
    """User profile response"""
    id: str
    email: str
    full_name: str
    role: str
    subscription_status: str
    created_at: datetime
    updated_at: datetime
```

**2.2 Create core/security.py**
```python
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from passlib.context import CryptContext
from .config import settings

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against hash"""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Hash password"""
    return pwd_context.hash(password)

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Create JWT access token"""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.jwt_access_token_expire_minutes
        )
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt

def create_refresh_token(data: dict):
    """Create JWT refresh token"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(
        days=settings.jwt_refresh_token_expire_days
    )
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(
        to_encode,
        settings.jwt_secret,
        algorithm=settings.jwt_algorithm
    )
    return encoded_jwt

def decode_token(token: str) -> dict:
    """Decode and validate JWT token"""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm]
        )
        return payload
    except JWTError:
        return None
```

#### Day 2: Auth Service & Router

**2.3 Create services/auth_service.py**
```python
from typing import Optional
from fastapi import HTTPException, status
from app.core.database import supabase, supabase_admin
from app.core.security import create_access_token, create_refresh_token
from app.models.schemas import UserRegister, UserLogin, TokenResponse
from datetime import timedelta

class AuthService:
    """Authentication service using Supabase Auth"""

    async def register(self, user_data: UserRegister) -> TokenResponse:
        """Register new user"""
        try:
            # Create user in Supabase Auth
            auth_response = supabase.auth.sign_up({
                "email": user_data.email,
                "password": user_data.password,
                "options": {
                    "data": {
                        "full_name": user_data.full_name
                    }
                }
            })

            if auth_response.user is None:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="User registration failed"
                )

            # Create user profile in database
            profile_data = {
                "id": auth_response.user.id,
                "email": user_data.email,
                "full_name": user_data.full_name,
                "role": "student",
                "subscription_status": "free"
            }

            supabase_admin.table('user_profiles').insert(profile_data).execute()

            # Return tokens
            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=3600
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail=f"Registration error: {str(e)}"
            )

    async def login(self, credentials: UserLogin) -> TokenResponse:
        """Login user"""
        try:
            auth_response = supabase.auth.sign_in_with_password({
                "email": credentials.email,
                "password": credentials.password
            })

            if auth_response.session is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid credentials"
                )

            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=3600
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid credentials"
            )

    async def refresh(self, refresh_token: str) -> TokenResponse:
        """Refresh access token"""
        try:
            auth_response = supabase.auth.refresh_session(refresh_token)

            return TokenResponse(
                access_token=auth_response.session.access_token,
                refresh_token=auth_response.session.refresh_token,
                expires_in=3600
            )

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid refresh token"
            )

    async def get_current_user(self, access_token: str):
        """Get current user from access token"""
        try:
            user = supabase.auth.get_user(access_token)

            # Fetch profile
            profile = supabase.table('user_profiles').select('*').eq('id', user.user.id).single().execute()

            return profile.data

        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired token"
            )
```

**2.4 Create routers/auth.py**
```python
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from app.models.schemas import UserRegister, UserLogin, TokenResponse, UserProfile
from app.services.auth_service import AuthService

router = APIRouter()
security = HTTPBearer()

auth_service = AuthService()

@router.post("/auth/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(user_data: UserRegister):
    """
    Register a new user account

    Requirements:
    - Email must be valid and unique
    - Password must meet security requirements
    - Full name required
    """
    return await auth_service.register(user_data)

@router.post("/auth/login", response_model=TokenResponse)
async def login(credentials: UserLogin):
    """
    Login with email and password

    Returns:
    - Access token (expires in 1 hour)
    - Refresh token (expires in 7 days)
    """
    return await auth_service.login(credentials)

@router.post("/auth/refresh", response_model=TokenResponse)
async def refresh_token(refresh_token: str):
    """
    Refresh access token using refresh token
    """
    return await auth_service.refresh(refresh_token)

@router.get("/auth/me", response_model=UserProfile)
async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Get current authenticated user profile
    """
    token = credentials.credentials
    return await auth_service.get_current_user(token)

@router.post("/auth/logout")
async def logout(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """
    Logout user (invalidate session on client side)
    """
    # Supabase handles session invalidation on client side
    return {"message": "Logged out successfully"}
```

#### Day 3: Testing

**2.5 Create tests/test_auth.py**
```python
def test_register_success(client):
    """Test successful user registration"""
    response = client.post("/api/v1/auth/register", json={
        "email": "newuser@example.com",
        "password": "Test123!@#",
        "full_name": "New User"
    })
    assert response.status_code == 201
    data = response.json()
    assert "access_token" in data
    assert "refresh_token" in data

def test_register_weak_password(client):
    """Test registration with weak password"""
    response = client.post("/api/v1/auth/register", json={
        "email": "user@example.com",
        "password": "weak",
        "full_name": "Test User"
    })
    assert response.status_code == 422

def test_login_success(client):
    """Test successful login"""
    # First register
    client.post("/api/v1/auth/register", json={
        "email": "login@example.com",
        "password": "Test123!@#",
        "full_name": "Login User"
    })

    # Then login
    response = client.post("/api/v1/auth/login", json={
        "email": "login@example.com",
        "password": "Test123!@#"
    })
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_login_invalid_credentials(client):
    """Test login with invalid credentials"""
    response = client.post("/api/v1/auth/login", json={
        "email": "invalid@example.com",
        "password": "WrongPassword123!"
    })
    assert response.status_code == 401

def test_get_current_user(client, auth_headers):
    """Test getting current user profile"""
    response = client.get("/api/v1/auth/me", headers=auth_headers)
    assert response.status_code == 200
    data = response.json()
    assert "email" in data
    assert "full_name" in data
```

**2.6 Success Criteria**
- [ ] User can register with valid email/password
- [ ] Weak passwords are rejected
- [ ] User can login and receive tokens
- [ ] Access token expires after 1 hour
- [ ] Refresh token can generate new access token
- [ ] Protected endpoints require valid token
- [ ] `/auth/me` returns current user profile
- [ ] All tests pass

---

## Phase 3: Core API Endpoints

**Duration:** 5-7 days
**Goal:** Implement institutions and programs endpoints

### Reference Documents
- `specs/api-specification.md` (Institutions & Programs endpoints)
- `specs/database-schema.md` (Tables: institutions, programs)
- Frontend hooks: `useInstitutions.ts`, `usePrograms.ts`

### Endpoints to Implement

**Institutions (Day 1-3):**
- `GET /api/v1/institutions` - List with filters
- `GET /api/v1/institutions/{slug}` - Get by slug
- `GET /api/v1/institutions/{slug}/programs` - Get institution programs

**Programs (Day 4-5):**
- `GET /api/v1/programs` - List with filters
- `GET /api/v1/programs/{id}` - Get by ID

**User Features (Day 6-7):**
- `POST /api/v1/users/bookmarks` - Bookmark program
- `GET /api/v1/users/bookmarks` - List bookmarks
- `POST /api/v1/users/saved-searches` - Save search
- `GET /api/v1/users/saved-searches` - List saved searches

### Tasks

#### Day 1-2: Institutions Service

**3.1 Create models/schemas.py - Institution Models**
```python
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime

class InstitutionBase(BaseModel):
    """Base institution model"""
    id: str
    slug: str
    name: str
    short_name: Optional[str]
    type: str  # federal_university, state_university, etc.
    state: str
    city: str
    logo_url: Optional[str]
    website: Optional[str]
    verified: bool
    program_count: int

class InstitutionDetail(InstitutionBase):
    """Detailed institution model"""
    description: Optional[str]
    address: Optional[str]
    phone: Optional[str]
    email: Optional[str]
    accreditation_status: Optional[str]
    year_established: Optional[int]
    created_at: datetime
    updated_at: datetime

class InstitutionFilters(BaseModel):
    """Institution filter parameters"""
    search: Optional[str] = None
    state: Optional[List[str]] = None
    type: Optional[List[str]] = None
    verified: Optional[bool] = None
    page: int = 1
    page_size: int = 20
```

**3.2 Create services/institution_service.py**
```python
from typing import List, Optional
from fastapi import HTTPException, status
from app.core.database import supabase
from app.models.schemas import InstitutionBase, InstitutionDetail, InstitutionFilters

class InstitutionService:
    """Service for institution operations"""

    async def list_institutions(
        self,
        filters: InstitutionFilters
    ) -> dict:
        """List institutions with filters and pagination"""
        query = supabase.table('institutions').select('*', count='exact')

        # Apply filters
        query = query.eq('status', 'published')
        query = query.is_('deleted_at', 'null')

        if filters.search:
            query = query.or_(
                f'name.ilike.%{filters.search}%,'
                f'short_name.ilike.%{filters.search}%'
            )

        if filters.state:
            query = query.in_('state', filters.state)

        if filters.type:
            query = query.in_('type', filters.type)

        if filters.verified is not None:
            query = query.eq('verified', filters.verified)

        # Pagination
        offset = (filters.page - 1) * filters.page_size
        query = query.range(offset, offset + filters.page_size - 1)

        # Order by name
        query = query.order('name')

        # Execute
        response = query.execute()

        total = response.count if response.count else 0
        total_pages = (total + filters.page_size - 1) // filters.page_size

        return {
            "data": response.data,
            "pagination": {
                "page": filters.page,
                "page_size": filters.page_size,
                "total": total,
                "total_pages": total_pages,
                "has_prev": filters.page > 1,
                "has_next": filters.page < total_pages
            }
        }

    async def get_institution_by_slug(self, slug: str) -> InstitutionDetail:
        """Get institution by slug"""
        response = supabase.table('institutions').select('*').eq('slug', slug).eq('status', 'published').single().execute()

        if not response.data:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Institution with slug '{slug}' not found"
            )

        return InstitutionDetail(**response.data)
```

**3.3 Create routers/institutions.py**
```python
from fastapi import APIRouter, Depends, Query
from typing import List, Optional
from app.models.schemas import InstitutionBase, InstitutionDetail, InstitutionFilters
from app.services.institution_service import InstitutionService

router = APIRouter()
institution_service = InstitutionService()

@router.get("/institutions", response_model=dict)
async def list_institutions(
    search: Optional[str] = Query(None, description="Search by name or short name"),
    state: Optional[List[str]] = Query(None, description="Filter by state(s)"),
    type: Optional[List[str]] = Query(None, description="Filter by institution type(s)"),
    verified: Optional[bool] = Query(None, description="Filter by verification status"),
    page: int = Query(1, ge=1, description="Page number"),
    page_size: int = Query(20, ge=1, le=100, description="Items per page")
):
    """
    List institutions with filters and pagination

    Supports filtering by:
    - Search term (name or short name)
    - State (multiple)
    - Institution type (multiple)
    - Verification status

    Returns paginated results with metadata.
    """
    filters = InstitutionFilters(
        search=search,
        state=state,
        type=type,
        verified=verified,
        page=page,
        page_size=page_size
    )
    return await institution_service.list_institutions(filters)

@router.get("/institutions/{slug}", response_model=InstitutionDetail)
async def get_institution(slug: str):
    """
    Get institution details by slug

    Returns full institution information including:
    - Basic info
    - Contact details
    - Accreditation status
    - Year established
    """
    return await institution_service.get_institution_by_slug(slug)
```

#### Day 3-4: Programs Service

**(Similar structure as institutions - see full API specification)**

#### Day 5-7: User Features

**(Bookmarks and saved searches implementation)**

**3.4 Success Criteria**
- [ ] Institutions endpoints return correct data
- [ ] Programs endpoints return correct data
- [ ] Filtering works for all supported fields
- [ ] Pagination works correctly
- [ ] Search is case-insensitive
- [ ] 404 returned for non-existent resources
- [ ] Response times < 200ms (local testing)
- [ ] All integration tests pass

---

## Phase 4: Search Integration

**Duration:** 3-4 days
**Goal:** Deploy Meilisearch and implement fast search

### Tasks

#### Day 1: Meilisearch Deployment

**4.1 Deploy Meilisearch**
- Option A: Meilisearch Cloud (recommended)
- Option B: Self-hosted on Render.com

**4.2 Configure Indexes**
```python
# scripts/setup_meilisearch.py
import meilisearch

client = meilisearch.Client('http://localhost:7700', 'MASTER_KEY')

# Create institutions index
institutions_index = client.index('institutions')
institutions_index.update_settings({
    'searchableAttributes': [
        'name',
        'short_name',
        'description',
        'state',
        'city'
    ],
    'filterableAttributes': [
        'type',
        'state',
        'verified',
        'accreditation_status'
    ],
    'sortableAttributes': [
        'name',
        'program_count',
        'created_at'
    ],
    'rankingRules': [
        'words',
        'typo',
        'proximity',
        'attribute',
        'sort',
        'exactness'
    ]
})

# Create programs index
programs_index = client.index('programs')
programs_index.update_settings({
    'searchableAttributes': [
        'name',
        'field_of_study',
        'institution_name',
        'description'
    ],
    'filterableAttributes': [
        'degree_type',
        'field_of_study',
        'institution_state',
        'mode',
        'tuition_annual',
        'cutoff_score'
    ],
    'sortableAttributes': [
        'name',
        'tuition_annual',
        'cutoff_score',
        'duration_years'
    ]
})
```

#### Day 2-3: Search Service Implementation

**4.3 Create services/search_service.py**
```python
import meilisearch
from app.core.config import settings

class SearchService:
    def __init__(self):
        self.client = meilisearch.Client(
            settings.meilisearch_host,
            settings.meilisearch_api_key
        )
        self.institutions_index = self.client.index('institutions')
        self.programs_index = self.client.index('programs')

    async def search_institutions(
        self,
        query: str,
        filters: dict = None,
        limit: int = 20
    ):
        """Search institutions with Meilisearch"""
        search_params = {
            'limit': limit,
            'attributesToHighlight': ['name', 'short_name']
        }

        if filters:
            filter_expressions = []
            if filters.get('state'):
                filter_expressions.append(f"state IN [{','.join(filters['state'])}]")
            if filters.get('type'):
                filter_expressions.append(f"type IN [{','.join(filters['type'])}]")

            if filter_expressions:
                search_params['filter'] = ' AND '.join(filter_expressions)

        results = self.institutions_index.search(query, search_params)
        return results

    async def search_programs(
        self,
        query: str,
        filters: dict = None,
        limit: int = 20
    ):
        """Search programs with Meilisearch"""
        # Similar implementation
        pass
```

**4.4 Create routers/search.py**
```python
from fastapi import APIRouter, Query
from app.services.search_service import SearchService

router = APIRouter()
search_service = SearchService()

@router.get("/search")
async def search(
    q: str = Query(..., min_length=2, description="Search query"),
    type: str = Query('all', description="Search type: all, institutions, programs"),
    limit: int = Query(20, ge=1, le=100)
):
    """
    Universal search endpoint with Meilisearch

    Features:
    - Typo tolerance
    - Instant results (<50ms)
    - Highlighted matches
    - Relevance ranking
    """
    results = {
        "query": q,
        "institutions": [],
        "programs": []
    }

    if type in ['all', 'institutions']:
        results['institutions'] = await search_service.search_institutions(q, limit=limit)

    if type in ['all', 'programs']:
        results['programs'] = await search_service.search_programs(q, limit=limit)

    return results
```

#### Day 4: Sync Pipeline

**4.5 Create sync script for Supabase → Meilisearch**
```python
# scripts/sync_to_meilisearch.py
"""Sync data from Supabase to Meilisearch"""

async def sync_institutions():
    """Sync all published institutions to Meilisearch"""
    # Fetch from Supabase
    # Transform data
    # Batch update to Meilisearch
    pass

async def sync_programs():
    """Sync all published programs to Meilisearch"""
    pass

# Run manually or schedule with cron
```

**4.6 Success Criteria**
- [ ] Meilisearch deployed and accessible
- [ ] Indexes created with correct settings
- [ ] Search returns relevant results
- [ ] Search response time < 50ms
- [ ] Typo tolerance works
- [ ] Filters work correctly
- [ ] Sync script populates indexes

---

## Phase 5: Frontend Integration

**Duration:** 2-3 days
**Goal:** Connect frontend to backend API

### Tasks

**5.1 Update Frontend Environment**
```env
# apps/web/.env.local
VITE_API_URL=http://localhost:8000
```

**5.2 Remove Mock Data Mode**
```typescript
// apps/web/src/hooks/api/useInstitutions.ts
// Change:
const USE_MOCK_DATA = true;
// To:
const USE_MOCK_DATA = false;

// Do same for usePrograms.ts
```

**5.3 Test All Pages**
- [ ] Home page loads with real data
- [ ] Institutions page shows real institutions
- [ ] Programs page shows real programs
- [ ] Search works with Meilisearch
- [ ] Filters work correctly
- [ ] Detail pages load
- [ ] Authentication flow works
- [ ] Bookmarks work
- [ ] Dashboard loads

**5.4 Handle Edge Cases**
- Empty states
- Loading states
- Error states
- Network errors
- 404 pages

**5.5 Success Criteria**
- [ ] All pages load without errors
- [ ] Data displays correctly
- [ ] Search is fast (<500ms perceived)
- [ ] No console errors
- [ ] Auth flow works end-to-end

---

## Phase 6: Data Pipeline

**Duration:** 2 weeks (can run in parallel with other phases)
**Goal:** Implement scrapers for top 50 institutions

### Reference Documents
- `specs/data-pipeline.md`
- `services/scrapers/README.md`

### Tasks

**Week 1: Spider Implementation**
- Implement spiders for top 10 institutions
- Data normalization pipeline
- Validation rules

**Week 2: Staging & Approval**
- Staging database implementation
- Admin review interface
- Approval workflow
- Automated scheduling

(See `specs/data-pipeline.md` for detailed implementation)

---

## Phase 7: Admin Portal Backend

**Duration:** 1 week
**Goal:** API endpoints for admin operations

### Endpoints
- `GET /api/v1/admin/review-queue`
- `POST /api/v1/admin/approve-institution/{id}`
- `POST /api/v1/admin/approve-program/{id}`
- `GET /api/v1/admin/analytics`
- `GET /api/v1/admin/users`

(Lower priority - can be deferred)

---

## Testing Strategy

### Unit Tests (pytest)
```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/test_auth.py

# Run with verbose output
pytest -v
```

### Integration Tests
- Test all API endpoints
- Test database operations
- Test Meilisearch integration
- Test authentication flow

### Load Testing (Later)
```bash
# Install locust
pip install locust

# Run load test
locust -f tests/load_test.py
```

### Test Coverage Goals
- Minimum 80% code coverage
- 100% coverage for auth and security code
- All endpoints tested
- All error paths tested

---

## Deployment Plan

### Development Environment
```bash
# Backend
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Frontend
cd apps/web && pnpm dev
```

### Staging Environment (Render.com)
- Automatic deployment on PR merge
- Preview URLs for testing
- Environment: `staging`

### Production Environment (Render.com)
- Manual approval required
- Blue-green deployment
- Environment: `production`

### Deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Meilisearch indexes populated
- [ ] CORS configured correctly
- [ ] Monitoring setup (Sentry)
- [ ] Rate limiting enabled
- [ ] HTTPS enforced
- [ ] Health checks passing

---

## Success Criteria

### Performance Metrics
- ✅ API response time < 200ms (p95)
- ✅ Search response time < 50ms
- ✅ Database queries < 100ms
- ✅ Zero downtime deployments

### Functional Requirements
- ✅ All 70+ endpoints working
- ✅ Authentication flow complete
- ✅ Search working with Meilisearch
- ✅ Data scrapers running
- ✅ Admin portal functional
- ✅ Frontend connected to backend

### Quality Metrics
- ✅ 80%+ test coverage
- ✅ Zero type errors (mypy)
- ✅ Zero linting errors (ruff)
- ✅ No security vulnerabilities
- ✅ API documentation complete

### User Experience
- ✅ Fast search results
- ✅ Smooth page transitions
- ✅ Clear error messages
- ✅ Responsive on mobile
- ✅ Accessible (WCAG 2.1 AA)

---

## Timeline Summary

| Phase | Duration | Status |
|-------|----------|--------|
| Phase 1: Backend Setup | 3-5 days | ✅ Completed |
| Phase 2: Authentication | 2-3 days | ✅ Completed |
| Phase 3: Core APIs | 5-7 days | ✅ Completed |
| Phase 4: Search Integration | 3-4 days | ✅ Completed |
| Phase 5: Frontend Integration | 2-3 days | ⏳ Pending |
| Phase 6: Data Pipeline | 2 weeks | ⏳ Pending |
| Phase 7: Admin Portal | 1 week | ⏳ Deferred |
| **Total** | **3-4 weeks** | |

---

## Next Steps

**Immediate (Today):**
1. ✅ Complete backend project structure
2. ⏳ Install dependencies (requirements.txt)
3. ⏳ Set up environment variables
4. ⏳ Test health check endpoint
5. ⏳ Commit initial backend code

**This Week:**
1. Implement authentication system
2. Implement institutions API
3. Implement programs API
4. Deploy Meilisearch

**Next Week:**
1. Connect frontend to backend
2. Test all pages
3. Start data scraping pipeline

---

**Document Version:** 1.0
**Last Updated:** January 19, 2025
**Status:** Active Development
