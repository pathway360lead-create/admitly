# User Features API Design
**Version:** 1.0
**Last Updated:** January 2025
**Project:** Admitly Platform
**Author:** Backend Systems Architect

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture Principles](#architecture-principles)
3. [Database Schema Requirements](#database-schema-requirements)
4. [API Endpoints Specification](#api-endpoints-specification)
   - [Bookmarks API](#1-bookmarks-api)
   - [Saved Searches API](#2-saved-searches-api)
   - [User Profile Management API](#3-user-profile-management-api)
   - [Search History API](#4-search-history-api)
5. [Pydantic Schemas](#pydantic-schemas)
6. [Service Layer Implementation](#service-layer-implementation)
7. [Authentication & Authorization](#authentication--authorization)
8. [Error Handling](#error-handling)
9. [Testing Strategy](#testing-strategy)
10. [Implementation Roadmap](#implementation-roadmap)

---

## Overview

This document provides comprehensive specifications for implementing user-centric features in the Admitly platform. These features enable users to:

- **Bookmark** programs and institutions for later reference
- **Save search queries** with filters for quick access
- **Manage their profile** and preferences
- **Track search history** for analytics and convenience

### Key Requirements
- **Authentication Required:** All endpoints require valid JWT token (Supabase Auth)
- **RLS Enforcement:** Row Level Security ensures users only access their own data
- **Performance:** Paginated responses, indexed database queries
- **Data Integrity:** Proper validation, unique constraints, cascading deletes
- **Audit Trail:** Track creation/update timestamps for all user data

---

## Architecture Principles

### 1. Layered Architecture
```
Router Layer (FastAPI endpoints)
    ↓
Service Layer (Business logic)
    ↓
Database Layer (Supabase with RLS)
```

### 2. Dependency Injection
- Use FastAPI's `Depends()` for service injection
- Separate concerns: authentication, authorization, business logic

### 3. Data Validation
- **Input:** Pydantic schemas validate all request data
- **Output:** Response models ensure consistent API contracts
- **Database:** RLS policies enforce access control

### 4. Error Handling
- Consistent error response format
- Appropriate HTTP status codes
- User-friendly error messages
- Logging for debugging

---

## Database Schema Requirements

### Schema Analysis
Based on `specs/database-schema.md`, the following tables already exist:

#### 1. `public.user_profiles` (Lines 28-50)
```sql
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    phone_number TEXT,
    state TEXT,
    lga TEXT,
    role TEXT NOT NULL CHECK (role IN ('student', 'premium', 'counselor', 'institution_admin', 'internal_admin')),
    subscription_status TEXT CHECK (subscription_status IN ('free', 'active', 'expired', 'cancelled')),
    subscription_tier TEXT CHECK (subscription_tier IN ('free', 'monthly', 'yearly')),
    subscription_start_date TIMESTAMPTZ,
    subscription_end_date TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

#### 2. `public.user_bookmarks` (Lines 52-66)
```sql
CREATE TABLE public.user_bookmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    entity_type TEXT NOT NULL CHECK (entity_type IN ('institution', 'program')),
    entity_id UUID NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_bookmarks_user ON public.user_bookmarks(user_id);
CREATE INDEX idx_bookmarks_entity ON public.user_bookmarks(entity_type, entity_id);
CREATE UNIQUE INDEX idx_bookmarks_unique ON public.user_bookmarks(user_id, entity_type, entity_id);
```

#### 3. `public.user_search_history` (Lines 68-81)
```sql
CREATE TABLE public.user_search_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    results_count INTEGER,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_search_history_user ON public.user_search_history(user_id);
CREATE INDEX idx_search_history_date ON public.user_search_history(created_at DESC);
```

### New Table Required: `public.user_saved_searches`

**Note:** The `user_search_history` table only tracks searches automatically. We need a separate table for **intentionally saved searches** with custom names and notification preferences.

```sql
CREATE TABLE public.user_saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- User-defined name for the saved search
    query TEXT NOT NULL, -- Search query string
    filters JSONB DEFAULT '{}', -- Search filters (state, type, degree_type, etc.)

    -- Notification preferences
    notify_on_new_results BOOLEAN DEFAULT FALSE,
    last_notified_at TIMESTAMPTZ,

    -- Metadata
    execution_count INTEGER DEFAULT 0, -- How many times user ran this search
    last_executed_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);

-- Indexes
CREATE INDEX idx_saved_searches_user ON public.user_saved_searches(user_id) WHERE deleted_at IS NULL;
CREATE INDEX idx_saved_searches_notify ON public.user_saved_searches(notify_on_new_results)
    WHERE notify_on_new_results = TRUE AND deleted_at IS NULL;

-- Trigger for updated_at
CREATE TRIGGER update_saved_searches_updated_at
BEFORE UPDATE ON public.user_saved_searches
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### RLS Policies Required

```sql
-- Enable RLS
ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_search_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_saved_searches ENABLE ROW LEVEL SECURITY;

-- Users can only access their own bookmarks
CREATE POLICY "Users can manage own bookmarks"
ON public.user_bookmarks
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only access their own search history
CREATE POLICY "Users can manage own search history"
ON public.user_search_history
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can only access their own saved searches
CREATE POLICY "Users can manage own saved searches"
ON public.user_saved_searches
FOR ALL
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Users can read and update their own profile
CREATE POLICY "Users can read own profile"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON public.user_profiles
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
```

---

## API Endpoints Specification

### Base URL
- **Development:** `http://localhost:8000/api/v1`
- **Production:** `https://api.admitly.com.ng/api/v1`

### Authentication Header (Required for all endpoints)
```http
Authorization: Bearer <jwt_token>
```

---

## 1. Bookmarks API

### 1.1 List User Bookmarks
**Endpoint:** `GET /api/v1/users/me/bookmarks`

**Description:** Get all bookmarks for the authenticated user with pagination and filtering.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `entity_type` | string | No | all | Filter by type: `institution`, `program`, `all` |
| `page` | integer | No | 1 | Page number (min: 1) |
| `page_size` | integer | No | 20 | Items per page (min: 1, max: 100) |
| `sort` | string | No | created_at | Sort field: `created_at`, `name` |
| `order` | string | No | desc | Sort order: `asc`, `desc` |

**Request Example:**
```bash
GET /api/v1/users/me/bookmarks?entity_type=program&page=1&page_size=20&order=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "entity_type": "program",
      "entity_id": "650e8400-e29b-41d4-a716-446655440002",
      "notes": "Interested - need to check cutoff scores",
      "created_at": "2025-01-10T14:30:00Z",
      "entity": {
        "id": "650e8400-e29b-41d4-a716-446655440002",
        "name": "Computer Engineering",
        "slug": "computer-engineering",
        "institution": {
          "id": "750e8400-e29b-41d4-a716-446655440003",
          "name": "University of Lagos",
          "slug": "university-of-lagos",
          "state": "Lagos"
        },
        "degree_type": "undergraduate",
        "duration_years": 5.0,
        "tuition_range": {
          "min": 50000000,
          "max": 60000000
        }
      }
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440004",
      "entity_type": "institution",
      "entity_id": "750e8400-e29b-41d4-a716-446655440003",
      "notes": "My top choice university",
      "created_at": "2025-01-09T10:15:00Z",
      "entity": {
        "id": "750e8400-e29b-41d4-a716-446655440003",
        "name": "University of Lagos",
        "slug": "university-of-lagos",
        "short_name": "UNILAG",
        "type": "federal_university",
        "state": "Lagos",
        "logo_url": "https://storage.supabase.co/logos/unilag.png",
        "program_count": 120
      }
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 12,
    "total_pages": 1,
    "has_prev": false,
    "has_next": false
  }
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `500 Internal Server Error`: Database error

---

### 1.2 Create Bookmark
**Endpoint:** `POST /api/v1/users/me/bookmarks`

**Description:** Add a program or institution to user's bookmarks.

**Request Body:**
```json
{
  "entity_type": "program",
  "entity_id": "650e8400-e29b-41d4-a716-446655440002",
  "notes": "Interested - need to check cutoff scores"
}
```

**Request Schema:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `entity_type` | string | Yes | `institution` or `program` | Type of entity to bookmark |
| `entity_id` | UUID | Yes | Valid UUID, entity must exist | ID of the entity |
| `notes` | string | No | Max 500 chars | Optional notes about the bookmark |

**Response Example (201 Created):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "entity_type": "program",
  "entity_id": "650e8400-e29b-41d4-a716-446655440002",
  "notes": "Interested - need to check cutoff scores",
  "created_at": "2025-01-10T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid entity_type or entity_id
- `404 Not Found`: Entity (program/institution) does not exist
- `409 Conflict`: Bookmark already exists (duplicate)
- `401 Unauthorized`: Invalid or missing JWT token

---

### 1.3 Update Bookmark
**Endpoint:** `PATCH /api/v1/users/me/bookmarks/{bookmark_id}`

**Description:** Update notes for an existing bookmark.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookmark_id` | UUID | Yes | ID of the bookmark to update |

**Request Body:**
```json
{
  "notes": "Updated notes - talked to current students, sounds great!"
}
```

**Response Example (200 OK):**
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440001",
  "entity_type": "program",
  "entity_id": "650e8400-e29b-41d4-a716-446655440002",
  "notes": "Updated notes - talked to current students, sounds great!",
  "created_at": "2025-01-10T14:30:00Z"
}
```

**Error Responses:**
- `404 Not Found`: Bookmark not found
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: Bookmark belongs to another user

---

### 1.4 Delete Bookmark
**Endpoint:** `DELETE /api/v1/users/me/bookmarks/{bookmark_id}`

**Description:** Remove a bookmark from user's collection.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `bookmark_id` | UUID | Yes | ID of the bookmark to delete |

**Response Example (200 OK):**
```json
{
  "message": "Bookmark deleted successfully",
  "deleted_id": "550e8400-e29b-41d4-a716-446655440001"
}
```

**Error Responses:**
- `404 Not Found`: Bookmark not found
- `401 Unauthorized`: Invalid or missing JWT token
- `403 Forbidden`: Bookmark belongs to another user

---

### 1.5 Delete Multiple Bookmarks (Bulk Delete)
**Endpoint:** `DELETE /api/v1/users/me/bookmarks/bulk`

**Description:** Delete multiple bookmarks at once.

**Request Body:**
```json
{
  "bookmark_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**Request Schema:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `bookmark_ids` | array[UUID] | Yes | Min 1, Max 50 items | List of bookmark IDs to delete |

**Response Example (200 OK):**
```json
{
  "message": "Bookmarks deleted successfully",
  "deleted_count": 2,
  "deleted_ids": [
    "550e8400-e29b-41d4-a716-446655440001",
    "550e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**Error Responses:**
- `400 Bad Request`: Invalid request (empty array, too many items)
- `401 Unauthorized`: Invalid or missing JWT token
- `207 Multi-Status`: Partial success (some bookmarks not found/forbidden)

---

### 1.6 Check if Entity is Bookmarked
**Endpoint:** `GET /api/v1/users/me/bookmarks/check`

**Description:** Check if specific entities are bookmarked by the user.

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | string | Yes | `institution` or `program` |
| `entity_ids` | array[UUID] | Yes | Comma-separated list of entity IDs (max 100) |

**Request Example:**
```bash
GET /api/v1/users/me/bookmarks/check?entity_type=program&entity_ids=650e8400-e29b-41d4-a716-446655440002,750e8400-e29b-41d4-a716-446655440003
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (200 OK):**
```json
{
  "bookmarks": {
    "650e8400-e29b-41d4-a716-446655440002": {
      "is_bookmarked": true,
      "bookmark_id": "550e8400-e29b-41d4-a716-446655440001"
    },
    "750e8400-e29b-41d4-a716-446655440003": {
      "is_bookmarked": false,
      "bookmark_id": null
    }
  }
}
```

---

## 2. Saved Searches API

### 2.1 List Saved Searches
**Endpoint:** `GET /api/v1/users/me/saved-searches`

**Description:** Get all saved searches for the authenticated user.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number (min: 1) |
| `page_size` | integer | No | 20 | Items per page (min: 1, max: 100) |
| `sort` | string | No | updated_at | Sort field: `name`, `created_at`, `updated_at`, `execution_count` |
| `order` | string | No | desc | Sort order: `asc`, `desc` |

**Request Example:**
```bash
GET /api/v1/users/me/saved-searches?page=1&page_size=20&sort=execution_count&order=desc
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "450e8400-e29b-41d4-a716-446655440010",
      "name": "Computer Science in Lagos",
      "query": "computer science",
      "filters": {
        "state": ["Lagos"],
        "degree_type": ["undergraduate"],
        "field_of_study": ["Computer Science"]
      },
      "notify_on_new_results": true,
      "last_notified_at": "2025-01-09T08:00:00Z",
      "execution_count": 15,
      "last_executed_at": "2025-01-10T14:30:00Z",
      "created_at": "2025-01-05T10:00:00Z",
      "updated_at": "2025-01-10T14:30:00Z"
    },
    {
      "id": "450e8400-e29b-41d4-a716-446655440011",
      "name": "Engineering programs under 100k",
      "query": "engineering",
      "filters": {
        "field_of_study": ["Engineering"],
        "max_tuition": 10000000
      },
      "notify_on_new_results": false,
      "last_notified_at": null,
      "execution_count": 3,
      "last_executed_at": "2025-01-08T12:00:00Z",
      "created_at": "2025-01-07T15:30:00Z",
      "updated_at": "2025-01-08T12:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 5,
    "total_pages": 1,
    "has_prev": false,
    "has_next": false
  }
}
```

---

### 2.2 Create Saved Search
**Endpoint:** `POST /api/v1/users/me/saved-searches`

**Description:** Save a search query with filters for later use.

**Request Body:**
```json
{
  "name": "Computer Science in Lagos",
  "query": "computer science",
  "filters": {
    "state": ["Lagos"],
    "degree_type": ["undergraduate"],
    "field_of_study": ["Computer Science"]
  },
  "notify_on_new_results": true
}
```

**Request Schema:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `name` | string | Yes | Min 3, Max 100 chars | User-defined name for the search |
| `query` | string | Yes | Min 1, Max 200 chars | Search query string |
| `filters` | object | No | Valid filter keys | Search filters (state, type, etc.) |
| `notify_on_new_results` | boolean | No | Default: false | Enable notifications for new results |

**Valid Filter Keys:**
- `state`: array of strings
- `type`: array of strings (institution types)
- `degree_type`: array of strings
- `field_of_study`: array of strings
- `mode`: array of strings (full_time, part_time, etc.)
- `min_tuition`: integer (kobo)
- `max_tuition`: integer (kobo)
- `min_cutoff`: number
- `max_cutoff`: number

**Response Example (201 Created):**
```json
{
  "id": "450e8400-e29b-41d4-a716-446655440010",
  "name": "Computer Science in Lagos",
  "query": "computer science",
  "filters": {
    "state": ["Lagos"],
    "degree_type": ["undergraduate"],
    "field_of_study": ["Computer Science"]
  },
  "notify_on_new_results": true,
  "last_notified_at": null,
  "execution_count": 0,
  "last_executed_at": null,
  "created_at": "2025-01-10T14:30:00Z",
  "updated_at": "2025-01-10T14:30:00Z"
}
```

**Error Responses:**
- `400 Bad Request`: Invalid filters or validation error
- `401 Unauthorized`: Invalid or missing JWT token

---

### 2.3 Get Saved Search Details
**Endpoint:** `GET /api/v1/users/me/saved-searches/{saved_search_id}`

**Description:** Get details of a specific saved search.

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `saved_search_id` | UUID | Yes | ID of the saved search |

**Response Example (200 OK):**
```json
{
  "id": "450e8400-e29b-41d4-a716-446655440010",
  "name": "Computer Science in Lagos",
  "query": "computer science",
  "filters": {
    "state": ["Lagos"],
    "degree_type": ["undergraduate"],
    "field_of_study": ["Computer Science"]
  },
  "notify_on_new_results": true,
  "last_notified_at": "2025-01-09T08:00:00Z",
  "execution_count": 15,
  "last_executed_at": "2025-01-10T14:30:00Z",
  "created_at": "2025-01-05T10:00:00Z",
  "updated_at": "2025-01-10T14:30:00Z"
}
```

---

### 2.4 Update Saved Search
**Endpoint:** `PATCH /api/v1/users/me/saved-searches/{saved_search_id}`

**Description:** Update a saved search (name, filters, or notification settings).

**Request Body:**
```json
{
  "name": "Computer Science Programs in Lagos (Updated)",
  "filters": {
    "state": ["Lagos", "Ogun"],
    "degree_type": ["undergraduate"],
    "field_of_study": ["Computer Science"]
  },
  "notify_on_new_results": false
}
```

**Response Example (200 OK):**
```json
{
  "id": "450e8400-e29b-41d4-a716-446655440010",
  "name": "Computer Science Programs in Lagos (Updated)",
  "query": "computer science",
  "filters": {
    "state": ["Lagos", "Ogun"],
    "degree_type": ["undergraduate"],
    "field_of_study": ["Computer Science"]
  },
  "notify_on_new_results": false,
  "last_notified_at": "2025-01-09T08:00:00Z",
  "execution_count": 15,
  "last_executed_at": "2025-01-10T14:30:00Z",
  "created_at": "2025-01-05T10:00:00Z",
  "updated_at": "2025-01-10T15:00:00Z"
}
```

---

### 2.5 Delete Saved Search
**Endpoint:** `DELETE /api/v1/users/me/saved-searches/{saved_search_id}`

**Description:** Delete a saved search (soft delete).

**Response Example (200 OK):**
```json
{
  "message": "Saved search deleted successfully",
  "deleted_id": "450e8400-e29b-41d4-a716-446655440010"
}
```

---

### 2.6 Execute Saved Search
**Endpoint:** `POST /api/v1/users/me/saved-searches/{saved_search_id}/execute`

**Description:** Run a saved search and get current results.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | Page number |
| `page_size` | integer | No | 20 | Items per page (max: 100) |

**Response Example (200 OK):**
```json
{
  "saved_search": {
    "id": "450e8400-e29b-41d4-a716-446655440010",
    "name": "Computer Science in Lagos",
    "query": "computer science",
    "filters": {
      "state": ["Lagos"],
      "degree_type": ["undergraduate"]
    }
  },
  "results": {
    "data": [
      {
        "id": "650e8400-e29b-41d4-a716-446655440002",
        "name": "Computer Science",
        "institution": {
          "name": "University of Lagos",
          "state": "Lagos"
        },
        "degree_type": "undergraduate"
      }
    ],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 15,
      "total_pages": 1,
      "has_prev": false,
      "has_next": false
    }
  },
  "execution_metadata": {
    "executed_at": "2025-01-10T15:30:00Z",
    "execution_count": 16
  }
}
```

**Business Logic:**
- Increments `execution_count` by 1
- Updates `last_executed_at` timestamp
- Returns results matching the saved query and filters

---

## 3. User Profile Management API

### 3.1 Get User Profile
**Endpoint:** `GET /api/v1/users/me`

**Description:** Get the authenticated user's profile information.

**Request Example:**
```bash
GET /api/v1/users/me
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (200 OK):**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440020",
  "email": "student@example.com",
  "full_name": "John Doe",
  "phone_number": "+2348012345678",
  "state": "Lagos",
  "lga": "Ikeja",
  "role": "premium",
  "subscription_status": "active",
  "subscription_tier": "monthly",
  "subscription_start_date": "2025-01-01T00:00:00Z",
  "subscription_end_date": "2025-02-01T00:00:00Z",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": true,
      "push": true,
      "deadline_alerts": true,
      "new_programs": false
    },
    "search_defaults": {
      "state": "Lagos",
      "degree_type": "undergraduate"
    }
  },
  "metadata": {
    "onboarding_completed": true,
    "last_login": "2025-01-10T14:00:00Z"
  },
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2025-01-10T14:00:00Z"
}
```

**Error Responses:**
- `401 Unauthorized`: Invalid or missing JWT token
- `404 Not Found`: User profile not found (shouldn't happen if authenticated)

---

### 3.2 Update User Profile
**Endpoint:** `PATCH /api/v1/users/me`

**Description:** Update user profile information.

**Request Body:**
```json
{
  "full_name": "John Doe Updated",
  "phone_number": "+2348098765432",
  "state": "Ogun",
  "lga": "Ijebu Ode"
}
```

**Request Schema:**
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| `full_name` | string | No | Min 2, Max 100 chars | User's full name |
| `phone_number` | string | No | Valid Nigerian phone format | Phone number |
| `state` | string | No | Valid Nigerian state | State of residence |
| `lga` | string | No | Max 100 chars | Local Government Area |

**Business Rules:**
- Users **CANNOT** update: `email`, `role`, `subscription_status`, `subscription_tier`, subscription dates
- These fields are managed by authentication system or payment flow
- Attempting to update these fields should be silently ignored (not error)

**Response Example (200 OK):**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440020",
  "email": "student@example.com",
  "full_name": "John Doe Updated",
  "phone_number": "+2348098765432",
  "state": "Ogun",
  "lga": "Ijebu Ode",
  "role": "premium",
  "subscription_status": "active",
  "subscription_tier": "monthly",
  "subscription_start_date": "2025-01-01T00:00:00Z",
  "subscription_end_date": "2025-02-01T00:00:00Z",
  "preferences": {
    "theme": "light",
    "notifications": {
      "email": true,
      "push": true
    }
  },
  "metadata": {},
  "created_at": "2024-12-15T10:00:00Z",
  "updated_at": "2025-01-10T15:30:00Z"
}
```

---

### 3.3 Update User Preferences
**Endpoint:** `PATCH /api/v1/users/me/preferences`

**Description:** Update user preferences (notifications, theme, search defaults).

**Request Body:**
```json
{
  "theme": "dark",
  "notifications": {
    "email": true,
    "push": false,
    "deadline_alerts": true,
    "new_programs": true,
    "cost_changes": false
  },
  "search_defaults": {
    "state": "Lagos",
    "degree_type": "undergraduate",
    "sort_by": "relevance"
  }
}
```

**Valid Preference Keys:**
- `theme`: string (`light`, `dark`, `system`)
- `notifications`: object
  - `email`: boolean
  - `push`: boolean
  - `deadline_alerts`: boolean
  - `new_programs`: boolean
  - `cost_changes`: boolean
- `search_defaults`: object (any valid search filters)

**Response Example (200 OK):**
```json
{
  "id": "850e8400-e29b-41d4-a716-446655440020",
  "preferences": {
    "theme": "dark",
    "notifications": {
      "email": true,
      "push": false,
      "deadline_alerts": true,
      "new_programs": true,
      "cost_changes": false
    },
    "search_defaults": {
      "state": "Lagos",
      "degree_type": "undergraduate",
      "sort_by": "relevance"
    }
  },
  "updated_at": "2025-01-10T15:45:00Z"
}
```

---

### 3.4 Delete Account (Soft Delete)
**Endpoint:** `DELETE /api/v1/users/me`

**Description:** Soft delete user account and all associated data.

**Request Body (Optional Confirmation):**
```json
{
  "confirmation": "DELETE",
  "reason": "No longer needed"
}
```

**Response Example (200 OK):**
```json
{
  "message": "Account deleted successfully",
  "deleted_at": "2025-01-10T16:00:00Z"
}
```

**Business Logic:**
- Soft delete user profile (set `deleted_at`)
- Do **NOT** delete from Supabase Auth (for potential recovery)
- Cascade soft delete to:
  - All bookmarks
  - All saved searches
  - All search history
  - All notifications
  - All AI conversations
- Keep transactions for audit/legal compliance

**Error Responses:**
- `400 Bad Request`: Invalid confirmation
- `401 Unauthorized`: Invalid or missing JWT token

---

## 4. Search History API

### 4.1 List Search History
**Endpoint:** `GET /api/v1/users/me/search-history`

**Description:** Get user's recent search queries with pagination.

**Query Parameters:**
| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 50 | Max results to return (min: 1, max: 100) |
| `offset` | integer | No | 0 | Number of items to skip |

**Request Example:**
```bash
GET /api/v1/users/me/search-history?limit=20&offset=0
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Response Example (200 OK):**
```json
{
  "data": [
    {
      "id": "350e8400-e29b-41d4-a716-446655440030",
      "query": "computer science",
      "filters": {
        "state": ["Lagos"],
        "degree_type": ["undergraduate"]
      },
      "results_count": 15,
      "created_at": "2025-01-10T14:30:00Z"
    },
    {
      "id": "350e8400-e29b-41d4-a716-446655440031",
      "query": "engineering programs",
      "filters": {
        "state": ["Lagos", "Ogun"]
      },
      "results_count": 42,
      "created_at": "2025-01-10T13:00:00Z"
    }
  ],
  "total": 127,
  "limit": 20,
  "offset": 0
}
```

---

### 4.2 Clear Search History
**Endpoint:** `DELETE /api/v1/users/me/search-history`

**Description:** Delete all search history for the authenticated user.

**Response Example (200 OK):**
```json
{
  "message": "Search history cleared successfully",
  "deleted_count": 127
}
```

---

### 4.3 Get Search Analytics (Optional - Future Enhancement)
**Endpoint:** `GET /api/v1/users/me/search-history/analytics`

**Description:** Get analytics about user's search behavior.

**Response Example (200 OK):**
```json
{
  "total_searches": 127,
  "unique_queries": 45,
  "top_queries": [
    {
      "query": "computer science",
      "count": 12
    },
    {
      "query": "engineering",
      "count": 8
    }
  ],
  "top_filters": {
    "state": {
      "Lagos": 67,
      "Ogun": 23
    },
    "degree_type": {
      "undergraduate": 98,
      "hnd": 15
    }
  },
  "date_range": {
    "first_search": "2024-12-20T10:00:00Z",
    "last_search": "2025-01-10T14:30:00Z"
  }
}
```

---

## Pydantic Schemas

### File: `services/api/schemas/bookmarks.py`

```python
"""
Bookmark Schemas
Pydantic models for bookmark endpoints
"""
from pydantic import BaseModel, Field, UUID4, validator
from typing import Optional, Literal, Dict, Any
from datetime import datetime
from enum import Enum


class EntityType(str, Enum):
    """Entity type enum"""
    INSTITUTION = "institution"
    PROGRAM = "program"


class BookmarkCreate(BaseModel):
    """Schema for creating a bookmark"""
    entity_type: EntityType = Field(
        ...,
        description="Type of entity to bookmark"
    )
    entity_id: UUID4 = Field(
        ...,
        description="UUID of the entity to bookmark"
    )
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional notes about the bookmark"
    )

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "entity_type": "program",
                "entity_id": "650e8400-e29b-41d4-a716-446655440002",
                "notes": "Interested - need to check cutoff scores"
            }]
        }
    }


class BookmarkUpdate(BaseModel):
    """Schema for updating a bookmark"""
    notes: Optional[str] = Field(
        None,
        max_length=500,
        description="Updated notes"
    )


class BookmarkResponse(BaseModel):
    """Schema for bookmark response"""
    id: UUID4 = Field(..., description="Bookmark UUID")
    entity_type: str = Field(..., description="Entity type")
    entity_id: UUID4 = Field(..., description="Entity UUID")
    notes: Optional[str] = Field(None, description="User notes")
    created_at: datetime = Field(..., description="Creation timestamp")
    entity: Optional[Dict[str, Any]] = Field(
        None,
        description="Populated entity data (program or institution)"
    )

    model_config = {"from_attributes": True}


class BookmarkListResponse(BaseModel):
    """Schema for paginated bookmark list"""
    data: list[BookmarkResponse]
    pagination: Dict[str, Any]


class BookmarkBulkDelete(BaseModel):
    """Schema for bulk delete"""
    bookmark_ids: list[UUID4] = Field(
        ...,
        min_length=1,
        max_length=50,
        description="List of bookmark IDs to delete"
    )


class BookmarkCheckResponse(BaseModel):
    """Schema for bookmark check response"""
    bookmarks: Dict[str, Dict[str, Any]] = Field(
        ...,
        description="Map of entity_id to bookmark status"
    )
```

### File: `services/api/schemas/saved_searches.py`

```python
"""
Saved Search Schemas
Pydantic models for saved search endpoints
"""
from pydantic import BaseModel, Field, UUID4, validator
from typing import Optional, Dict, Any
from datetime import datetime


class SavedSearchCreate(BaseModel):
    """Schema for creating a saved search"""
    name: str = Field(
        ...,
        min_length=3,
        max_length=100,
        description="User-defined name for the search"
    )
    query: str = Field(
        ...,
        min_length=1,
        max_length=200,
        description="Search query string"
    )
    filters: Optional[Dict[str, Any]] = Field(
        default_factory=dict,
        description="Search filters"
    )
    notify_on_new_results: bool = Field(
        default=False,
        description="Enable notifications for new results"
    )

    @validator('filters')
    def validate_filters(cls, v):
        """Validate filter keys"""
        valid_keys = {
            'state', 'type', 'degree_type', 'field_of_study',
            'mode', 'min_tuition', 'max_tuition', 'min_cutoff', 'max_cutoff'
        }
        if v:
            invalid_keys = set(v.keys()) - valid_keys
            if invalid_keys:
                raise ValueError(f"Invalid filter keys: {invalid_keys}")
        return v

    model_config = {
        "json_schema_extra": {
            "examples": [{
                "name": "Computer Science in Lagos",
                "query": "computer science",
                "filters": {
                    "state": ["Lagos"],
                    "degree_type": ["undergraduate"]
                },
                "notify_on_new_results": true
            }]
        }
    }


class SavedSearchUpdate(BaseModel):
    """Schema for updating a saved search"""
    name: Optional[str] = Field(
        None,
        min_length=3,
        max_length=100,
        description="Updated name"
    )
    filters: Optional[Dict[str, Any]] = Field(
        None,
        description="Updated filters"
    )
    notify_on_new_results: Optional[bool] = Field(
        None,
        description="Update notification preference"
    )

    @validator('filters')
    def validate_filters(cls, v):
        """Validate filter keys"""
        if v is not None:
            valid_keys = {
                'state', 'type', 'degree_type', 'field_of_study',
                'mode', 'min_tuition', 'max_tuition', 'min_cutoff', 'max_cutoff'
            }
            invalid_keys = set(v.keys()) - valid_keys
            if invalid_keys:
                raise ValueError(f"Invalid filter keys: {invalid_keys}")
        return v


class SavedSearchResponse(BaseModel):
    """Schema for saved search response"""
    id: UUID4
    name: str
    query: str
    filters: Dict[str, Any]
    notify_on_new_results: bool
    last_notified_at: Optional[datetime]
    execution_count: int
    last_executed_at: Optional[datetime]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class SavedSearchListResponse(BaseModel):
    """Schema for paginated saved search list"""
    data: list[SavedSearchResponse]
    pagination: Dict[str, Any]


class SavedSearchExecuteResponse(BaseModel):
    """Schema for saved search execution response"""
    saved_search: SavedSearchResponse
    results: Dict[str, Any]  # Program list response
    execution_metadata: Dict[str, Any]
```

### File: `services/api/schemas/user_profile.py`

```python
"""
User Profile Schemas
Pydantic models for user profile endpoints
"""
from pydantic import BaseModel, Field, EmailStr, UUID4, validator
from typing import Optional, Dict, Any
from datetime import datetime


class UserProfileResponse(BaseModel):
    """Schema for user profile response"""
    id: UUID4
    email: EmailStr
    full_name: str
    phone_number: Optional[str]
    state: Optional[str]
    lga: Optional[str]
    role: str
    subscription_status: Optional[str]
    subscription_tier: Optional[str]
    subscription_start_date: Optional[datetime]
    subscription_end_date: Optional[datetime]
    preferences: Dict[str, Any]
    metadata: Dict[str, Any]
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile"""
    full_name: Optional[str] = Field(
        None,
        min_length=2,
        max_length=100,
        description="User's full name"
    )
    phone_number: Optional[str] = Field(
        None,
        description="Phone number"
    )
    state: Optional[str] = Field(
        None,
        description="State of residence"
    )
    lga: Optional[str] = Field(
        None,
        max_length=100,
        description="Local Government Area"
    )

    @validator('phone_number')
    def validate_phone(cls, v):
        """Validate Nigerian phone number format"""
        if v is not None:
            # Basic validation - starts with +234 or 0, followed by 10 digits
            import re
            if not re.match(r'^(\+234|0)[789]\d{9}$', v):
                raise ValueError("Invalid Nigerian phone number format")
        return v


class UserPreferencesUpdate(BaseModel):
    """Schema for updating user preferences"""
    theme: Optional[str] = Field(
        None,
        pattern="^(light|dark|system)$",
        description="UI theme preference"
    )
    notifications: Optional[Dict[str, bool]] = Field(
        None,
        description="Notification preferences"
    )
    search_defaults: Optional[Dict[str, Any]] = Field(
        None,
        description="Default search filters"
    )


class UserPreferencesResponse(BaseModel):
    """Schema for user preferences response"""
    id: UUID4
    preferences: Dict[str, Any]
    updated_at: datetime


class AccountDeleteRequest(BaseModel):
    """Schema for account deletion"""
    confirmation: str = Field(
        ...,
        pattern="^DELETE$",
        description="Must be 'DELETE' to confirm"
    )
    reason: Optional[str] = Field(
        None,
        max_length=500,
        description="Optional reason for deletion"
    )


class AccountDeleteResponse(BaseModel):
    """Schema for account deletion response"""
    message: str
    deleted_at: datetime
```

### File: `services/api/schemas/search_history.py`

```python
"""
Search History Schemas
Pydantic models for search history endpoints
"""
from pydantic import BaseModel, Field, UUID4
from typing import Optional, Dict, Any
from datetime import datetime


class SearchHistoryResponse(BaseModel):
    """Schema for search history response"""
    id: UUID4
    query: str
    filters: Dict[str, Any]
    results_count: Optional[int]
    created_at: datetime

    model_config = {"from_attributes": True}


class SearchHistoryListResponse(BaseModel):
    """Schema for search history list"""
    data: list[SearchHistoryResponse]
    total: int
    limit: int
    offset: int


class SearchHistoryClearResponse(BaseModel):
    """Schema for clear history response"""
    message: str
    deleted_count: int


class SearchAnalyticsResponse(BaseModel):
    """Schema for search analytics"""
    total_searches: int
    unique_queries: int
    top_queries: list[Dict[str, Any]]
    top_filters: Dict[str, Dict[str, int]]
    date_range: Dict[str, datetime]
```

---

## Service Layer Implementation

### File: `services/api/services/bookmark_service.py`

```python
"""
Bookmark Service
Business logic for bookmark management
"""
import logging
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID

from supabase import Client
from fastapi import HTTPException, status

from schemas.bookmarks import (
    BookmarkCreate,
    BookmarkUpdate,
    BookmarkResponse,
    BookmarkListResponse
)

logger = logging.getLogger(__name__)


class BookmarkService:
    """Service for managing user bookmarks"""

    def __init__(self, supabase: Client):
        self.supabase = supabase

    async def list_bookmarks(
        self,
        user_id: str,
        entity_type: Optional[str] = None,
        page: int = 1,
        page_size: int = 20,
        sort: str = "created_at",
        order: str = "desc"
    ) -> Dict[str, Any]:
        """
        List user's bookmarks with pagination and filtering

        Args:
            user_id: User UUID
            entity_type: Filter by entity type (institution/program/all)
            page: Page number
            page_size: Items per page
            sort: Sort field
            order: Sort order (asc/desc)

        Returns:
            Paginated bookmark list with populated entity data
        """
        try:
            # Build query
            query = self.supabase.table('user_bookmarks').select(
                '*, entity:entity_id(*)',
                count='exact'
            ).eq('user_id', user_id)

            # Filter by entity type
            if entity_type and entity_type != 'all':
                query = query.eq('entity_type', entity_type)

            # Sorting
            query = query.order(sort, desc=(order == 'desc'))

            # Pagination
            offset = (page - 1) * page_size
            query = query.range(offset, offset + page_size - 1)

            # Execute query
            response = query.execute()

            # Calculate pagination metadata
            total = response.count if response.count else 0
            total_pages = (total + page_size - 1) // page_size

            # Populate entity data
            bookmarks_with_entities = []
            for bookmark in response.data:
                # Fetch full entity data based on type
                entity_data = await self._fetch_entity_data(
                    bookmark['entity_type'],
                    bookmark['entity_id']
                )

                bookmark_dict = {
                    'id': bookmark['id'],
                    'entity_type': bookmark['entity_type'],
                    'entity_id': bookmark['entity_id'],
                    'notes': bookmark.get('notes'),
                    'created_at': bookmark['created_at'],
                    'entity': entity_data
                }
                bookmarks_with_entities.append(bookmark_dict)

            return {
                'data': bookmarks_with_entities,
                'pagination': {
                    'page': page,
                    'page_size': page_size,
                    'total': total,
                    'total_pages': total_pages,
                    'has_prev': page > 1,
                    'has_next': page < total_pages
                }
            }

        except Exception as e:
            logger.error(f"Error listing bookmarks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to retrieve bookmarks"
            )

    async def create_bookmark(
        self,
        user_id: str,
        bookmark_data: BookmarkCreate
    ) -> Dict[str, Any]:
        """
        Create a new bookmark

        Args:
            user_id: User UUID
            bookmark_data: Bookmark creation data

        Returns:
            Created bookmark

        Raises:
            404: Entity not found
            409: Bookmark already exists
        """
        try:
            # Verify entity exists
            entity_exists = await self._verify_entity_exists(
                bookmark_data.entity_type,
                str(bookmark_data.entity_id)
            )
            if not entity_exists:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"{bookmark_data.entity_type.capitalize()} not found"
                )

            # Insert bookmark
            insert_data = {
                'user_id': user_id,
                'entity_type': bookmark_data.entity_type.value,
                'entity_id': str(bookmark_data.entity_id),
                'notes': bookmark_data.notes
            }

            response = self.supabase.table('user_bookmarks').insert(
                insert_data
            ).execute()

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            # Check for unique constraint violation
            if 'duplicate key' in str(e).lower():
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Bookmark already exists"
                )
            logger.error(f"Error creating bookmark: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to create bookmark"
            )

    async def update_bookmark(
        self,
        user_id: str,
        bookmark_id: str,
        update_data: BookmarkUpdate
    ) -> Dict[str, Any]:
        """Update bookmark notes"""
        try:
            # Update bookmark (RLS ensures user owns it)
            response = self.supabase.table('user_bookmarks').update(
                {'notes': update_data.notes}
            ).eq('id', bookmark_id).eq('user_id', user_id).execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Bookmark not found"
                )

            return response.data[0]

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error updating bookmark: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to update bookmark"
            )

    async def delete_bookmark(
        self,
        user_id: str,
        bookmark_id: str
    ) -> Dict[str, Any]:
        """Delete a bookmark"""
        try:
            response = self.supabase.table('user_bookmarks').delete().eq(
                'id', bookmark_id
            ).eq('user_id', user_id).execute()

            if not response.data:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Bookmark not found"
                )

            return {
                'message': 'Bookmark deleted successfully',
                'deleted_id': bookmark_id
            }

        except HTTPException:
            raise
        except Exception as e:
            logger.error(f"Error deleting bookmark: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete bookmark"
            )

    async def delete_bookmarks_bulk(
        self,
        user_id: str,
        bookmark_ids: List[str]
    ) -> Dict[str, Any]:
        """Delete multiple bookmarks"""
        try:
            response = self.supabase.table('user_bookmarks').delete().in_(
                'id', bookmark_ids
            ).eq('user_id', user_id).execute()

            deleted_count = len(response.data) if response.data else 0

            return {
                'message': 'Bookmarks deleted successfully',
                'deleted_count': deleted_count,
                'deleted_ids': [item['id'] for item in response.data]
            }

        except Exception as e:
            logger.error(f"Error bulk deleting bookmarks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete bookmarks"
            )

    async def check_bookmarks(
        self,
        user_id: str,
        entity_type: str,
        entity_ids: List[str]
    ) -> Dict[str, Any]:
        """Check if entities are bookmarked"""
        try:
            response = self.supabase.table('user_bookmarks').select(
                'id, entity_id'
            ).eq('user_id', user_id).eq('entity_type', entity_type).in_(
                'entity_id', entity_ids
            ).execute()

            # Build response map
            bookmarks_map = {}
            bookmarked_entities = {
                item['entity_id']: item['id'] for item in response.data
            }

            for entity_id in entity_ids:
                bookmarks_map[entity_id] = {
                    'is_bookmarked': entity_id in bookmarked_entities,
                    'bookmark_id': bookmarked_entities.get(entity_id)
                }

            return {'bookmarks': bookmarks_map}

        except Exception as e:
            logger.error(f"Error checking bookmarks: {e}")
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to check bookmarks"
            )

    async def _verify_entity_exists(
        self,
        entity_type: str,
        entity_id: str
    ) -> bool:
        """Verify that entity exists and is published"""
        try:
            table_name = 'institutions' if entity_type == 'institution' else 'programs'

            response = self.supabase.table(table_name).select('id').eq(
                'id', entity_id
            ).eq('status', 'published').is_('deleted_at', 'null').execute()

            return len(response.data) > 0

        except Exception as e:
            logger.error(f"Error verifying entity: {e}")
            return False

    async def _fetch_entity_data(
        self,
        entity_type: str,
        entity_id: str
    ) -> Optional[Dict[str, Any]]:
        """Fetch full entity data (program or institution)"""
        try:
            if entity_type == 'institution':
                response = self.supabase.table('institutions').select(
                    'id, name, slug, short_name, type, state, logo_url, program_count'
                ).eq('id', entity_id).single().execute()
            else:  # program
                response = self.supabase.table('programs').select(
                    '''
                    id, name, slug, degree_type, duration_years,
                    institution:institution_id(id, name, slug, state)
                    '''
                ).eq('id', entity_id).single().execute()

            return response.data if response.data else None

        except Exception as e:
            logger.error(f"Error fetching entity data: {e}")
            return None
```

### Additional Service Files

Due to length constraints, I'll provide the structure for remaining services:

#### `services/api/services/saved_search_service.py`
- `list_saved_searches()`: List with pagination
- `create_saved_search()`: Create new saved search
- `get_saved_search()`: Get single saved search
- `update_saved_search()`: Update name/filters/notifications
- `delete_saved_search()`: Soft delete
- `execute_saved_search()`: Run search and increment counter

#### `services/api/services/user_profile_service.py`
- `get_profile()`: Get user profile with email from auth
- `update_profile()`: Update allowed fields only
- `update_preferences()`: Update preferences JSONB
- `delete_account()`: Soft delete with cascade

#### `services/api/services/search_history_service.py`
- `list_history()`: List with limit/offset
- `record_search()`: Auto-record search (called from search service)
- `clear_history()`: Delete all history
- `get_analytics()`: Compute analytics (optional)

---

## Authentication & Authorization

### Authentication Flow

1. **User authenticates** via Supabase Auth (handled by frontend)
2. **Receives JWT token** from Supabase
3. **Includes token** in `Authorization: Bearer <token>` header
4. **Backend verifies** token using `get_current_user` dependency
5. **Extracts user_id** from token payload
6. **RLS policies** automatically filter data by user_id

### Dependency Pattern

```python
# In routers
async def create_bookmark(
    bookmark_data: BookmarkCreate,
    current_user = Depends(get_current_user),
    service: BookmarkService = Depends(get_bookmark_service)
):
    user_id = current_user.user.id
    return await service.create_bookmark(user_id, bookmark_data)
```

### RLS Enforcement

All user tables have RLS enabled with policies that enforce:
```sql
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id)
```

This ensures:
- Users can **only read** their own data
- Users can **only modify** their own data
- No additional authorization checks needed in code

---

## Error Handling

### Standard Error Format

```json
{
  "detail": "Error message",
  "status_code": 400
}
```

### HTTP Status Codes Used

| Code | Usage |
|------|-------|
| `200 OK` | Successful GET, PATCH, DELETE |
| `201 Created` | Successful POST (resource created) |
| `400 Bad Request` | Validation error, invalid input |
| `401 Unauthorized` | Missing/invalid JWT token |
| `403 Forbidden` | User doesn't own resource (rare - RLS handles this) |
| `404 Not Found` | Resource not found |
| `409 Conflict` | Duplicate resource (e.g., bookmark already exists) |
| `500 Internal Server Error` | Database error, unexpected error |

### Error Logging

All services log errors with context:
```python
logger.error(f"Error creating bookmark for user {user_id}: {e}")
```

---

## Testing Strategy

### Unit Tests

**File:** `services/api/tests/test_bookmarks.py`

```python
import pytest
from fastapi.testclient import TestClient

def test_create_bookmark(client: TestClient, auth_headers):
    """Test creating a bookmark"""
    response = client.post(
        "/api/v1/users/me/bookmarks",
        json={
            "entity_type": "program",
            "entity_id": "650e8400-e29b-41d4-a716-446655440002",
            "notes": "Test bookmark"
        },
        headers=auth_headers
    )
    assert response.status_code == 201
    assert response.json()["entity_type"] == "program"

def test_create_duplicate_bookmark(client: TestClient, auth_headers):
    """Test creating duplicate bookmark returns 409"""
    # Create first bookmark
    client.post("/api/v1/users/me/bookmarks", json={...}, headers=auth_headers)

    # Try to create duplicate
    response = client.post("/api/v1/users/me/bookmarks", json={...}, headers=auth_headers)
    assert response.status_code == 409

def test_list_bookmarks_unauthorized(client: TestClient):
    """Test list bookmarks without auth returns 401"""
    response = client.get("/api/v1/users/me/bookmarks")
    assert response.status_code == 401
```

### Integration Tests

Test full flows:
- User creates bookmark → Lists bookmarks → Sees new bookmark
- User saves search → Executes search → Gets results
- User updates profile → Gets profile → Sees updates

### Test Data Fixtures

```python
@pytest.fixture
def test_user(supabase):
    """Create test user"""
    # Create user in Supabase Auth
    # Create profile in user_profiles
    # Return user data

@pytest.fixture
def auth_headers(test_user):
    """Get auth headers for test user"""
    # Get JWT token
    return {"Authorization": f"Bearer {token}"}
```

---

## Implementation Roadmap

### Phase 1: Database Setup (Week 1)
- [ ] Create migration for `user_saved_searches` table
- [ ] Apply RLS policies to all user tables
- [ ] Create indexes
- [ ] Test RLS policies manually

### Phase 2: Bookmarks API (Week 1-2)
- [ ] Create Pydantic schemas (`bookmarks.py`)
- [ ] Implement `BookmarkService`
- [ ] Create router (`bookmarks_router.py`)
- [ ] Write unit tests
- [ ] Integration tests
- [ ] Manual testing with Postman

### Phase 3: Saved Searches API (Week 2)
- [ ] Create Pydantic schemas (`saved_searches.py`)
- [ ] Implement `SavedSearchService`
- [ ] Create router (`saved_searches_router.py`)
- [ ] Integrate with existing search service for execution
- [ ] Write tests

### Phase 4: User Profile API (Week 2-3)
- [ ] Create Pydantic schemas (`user_profile.py`)
- [ ] Implement `UserProfileService`
- [ ] Create router (`user_profile_router.py`)
- [ ] Implement soft delete with cascade
- [ ] Write tests

### Phase 5: Search History API (Week 3)
- [ ] Create Pydantic schemas (`search_history.py`)
- [ ] Implement `SearchHistoryService`
- [ ] Create router (`search_history_router.py`)
- [ ] Integrate auto-recording into search service
- [ ] Write tests

### Phase 6: Integration & Testing (Week 3-4)
- [ ] End-to-end testing
- [ ] Performance testing (load test user endpoints)
- [ ] Update API documentation (Swagger)
- [ ] Create Postman collection
- [ ] Security audit (RLS, input validation)

### Phase 7: Deployment (Week 4)
- [ ] Deploy to staging
- [ ] QA testing
- [ ] Fix bugs
- [ ] Deploy to production
- [ ] Monitor logs and metrics

---

## Performance Considerations

### Database Optimization
- **Indexes:** All foreign keys and frequently filtered columns indexed
- **Pagination:** Always use pagination for list endpoints
- **RLS:** Minimal performance impact, enforced at database level

### Caching Strategy
- **User profiles:** Cache for 5 minutes (Redis)
- **Bookmarks count:** Cache for 1 minute
- **Saved searches:** No cache (real-time updates important)

### Query Optimization
- **Avoid N+1:** Use Supabase joins to fetch related data
- **Select specific columns:** Don't use `SELECT *` unnecessarily
- **Limit joins:** Fetch entity data separately if too complex

---

## Security Considerations

### Input Validation
- All inputs validated by Pydantic schemas
- SQL injection prevented by Supabase client (parameterized queries)
- Max length constraints on text fields

### Access Control
- RLS policies enforce user-level access
- No cross-user data leakage possible
- JWT token validated on every request

### Data Privacy
- Soft deletes preserve audit trail
- User data isolated by RLS
- No sensitive data in logs

### Rate Limiting
- Implement rate limiting per user:
  - 100 requests/minute for authenticated users
  - 1000 requests/hour for authenticated users
- Use Redis for rate limit tracking

---

## Monitoring & Observability

### Logging
- Log all errors with context (user_id, action, error)
- Log slow queries (>1s)
- Log authentication failures

### Metrics to Track
- Bookmark creation rate
- Saved search execution frequency
- Profile update frequency
- API response times
- Error rates by endpoint

### Alerts
- High error rate (>5% of requests)
- Slow API responses (>2s)
- Database connection failures

---

## Appendix: Dependencies

### Add to `requirements.txt`
```
fastapi==0.104.1
pydantic==2.5.0
supabase==2.0.2
python-multipart==0.0.6
```

### Update `core/dependencies.py`
```python
def get_bookmark_service(
    supabase: Client = Depends(get_supabase),
):
    from services.bookmark_service import BookmarkService
    return BookmarkService(supabase)

def get_saved_search_service(
    supabase: Client = Depends(get_supabase),
):
    from services.saved_search_service import SavedSearchService
    return SavedSearchService(supabase)

def get_user_profile_service(
    supabase: Client = Depends(get_supabase),
):
    from services.user_profile_service import UserProfileService
    return UserProfileService(supabase)

def get_search_history_service(
    supabase: Client = Depends(get_supabase),
):
    from services.search_history_service import SearchHistoryService
    return SearchHistoryService(supabase)
```

---

## Conclusion

This comprehensive API design provides production-ready specifications for all user features in the Admitly platform. The design follows FastAPI best practices, leverages Supabase RLS for security, and ensures data integrity through proper validation and error handling.

**Key Strengths:**
- Complete API contracts with request/response examples
- Robust authentication and authorization
- Comprehensive error handling
- Clear separation of concerns (router → service → database)
- Performance optimization through pagination and caching
- Security-first approach with RLS policies

**Next Steps:**
1. Review this document with the team
2. Create database migration for `user_saved_searches`
3. Begin Phase 1 implementation
4. Set up CI/CD pipeline for automated testing

---

**Document Status:** Ready for Implementation
**Last Updated:** January 2025
**Review Cycle:** Quarterly or as needed


---

## API Summary

# User Features API - Quick Reference Summary

**Version:** 1.0
**Full Documentation:** [user-features-api-design.md](./user-features-api-design.md)

---

## Overview

This document provides a quick reference for the user features APIs. For complete specifications, implementation details, and code examples, see the full design document.

---

## API Endpoints Summary

### 1. Bookmarks API (`/api/v1/users/me/bookmarks`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List user's bookmarks | Yes |
| POST | `/` | Create bookmark | Yes |
| PATCH | `/{bookmark_id}` | Update bookmark notes | Yes |
| DELETE | `/{bookmark_id}` | Delete bookmark | Yes |
| DELETE | `/bulk` | Delete multiple bookmarks | Yes |
| GET | `/check` | Check if entities are bookmarked | Yes |

**Key Features:**
- Bookmark programs and institutions
- Add personal notes to bookmarks
- Filter by entity type (program/institution)
- Pagination support
- Bulk operations

---

### 2. Saved Searches API (`/api/v1/users/me/saved-searches`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List saved searches | Yes |
| POST | `/` | Create saved search | Yes |
| GET | `/{id}` | Get saved search details | Yes |
| PATCH | `/{id}` | Update saved search | Yes |
| DELETE | `/{id}` | Delete saved search | Yes |
| POST | `/{id}/execute` | Execute saved search | Yes |

**Key Features:**
- Save search queries with custom names
- Store search filters (state, degree_type, etc.)
- Optional notifications for new results
- Track execution count and last run
- Execute saved search to get current results

---

### 3. User Profile API (`/api/v1/users/me`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | Get user profile | Yes |
| PATCH | `/` | Update profile | Yes |
| PATCH | `/preferences` | Update preferences | Yes |
| DELETE | `/` | Delete account (soft) | Yes |

**Key Features:**
- View full profile (name, phone, state, subscription)
- Update personal information
- Manage preferences (theme, notifications, search defaults)
- Soft delete account with data cascade

---

### 4. Search History API (`/api/v1/users/me/search-history`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/` | List search history | Yes |
| DELETE | `/` | Clear all history | Yes |
| GET | `/analytics` | Get search analytics (optional) | Yes |

**Key Features:**
- Automatic recording of searches
- View recent search queries
- Track search filters and result counts
- Clear history
- Analytics (top queries, top filters)

---

## Database Schema

### New Table Required: `user_saved_searches`

```sql
CREATE TABLE public.user_saved_searches (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    query TEXT NOT NULL,
    filters JSONB DEFAULT '{}',
    notify_on_new_results BOOLEAN DEFAULT FALSE,
    last_notified_at TIMESTAMPTZ,
    execution_count INTEGER DEFAULT 0,
    last_executed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    deleted_at TIMESTAMPTZ
);
```

### Existing Tables Used
- `public.user_bookmarks` ✅ (already exists)
- `public.user_search_history` ✅ (already exists)
- `public.user_profiles` ✅ (already exists)

---

## Implementation Checklist

### Phase 1: Database Setup
- [ ] Create `user_saved_searches` table migration
- [ ] Apply RLS policies to all user tables
- [ ] Create indexes
- [ ] Test RLS policies

### Phase 2: Pydantic Schemas
- [ ] `schemas/bookmarks.py`
- [ ] `schemas/saved_searches.py`
- [ ] `schemas/user_profile.py`
- [ ] `schemas/search_history.py`

### Phase 3: Service Layer
- [ ] `services/bookmark_service.py`
- [ ] `services/saved_search_service.py`
- [ ] `services/user_profile_service.py`
- [ ] `services/search_history_service.py`

### Phase 4: Routers
- [ ] `routers/bookmarks_router.py`
- [ ] `routers/saved_searches_router.py`
- [ ] `routers/user_profile_router.py`
- [ ] `routers/search_history_router.py`

### Phase 5: Dependencies
- [ ] Update `core/dependencies.py` with service factories
- [ ] Register routers in `main.py`

### Phase 6: Testing
- [ ] Unit tests for each service
- [ ] Integration tests for each router
- [ ] End-to-end user flows
- [ ] Security testing (RLS verification)

### Phase 7: Documentation
- [ ] Update Swagger/OpenAPI docs
- [ ] Create Postman collection
- [ ] Update README with new endpoints

---

## Authentication Pattern

All endpoints require JWT Bearer token:

```http
Authorization: Bearer <jwt_token>
```

Example:
```bash
curl -X GET "http://localhost:8000/api/v1/users/me/bookmarks" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

---

## Response Format

### Success Response
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "page_size": 20,
    "total": 50,
    "total_pages": 3,
    "has_prev": false,
    "has_next": true
  }
}
```

### Error Response
```json
{
  "detail": "Error message",
  "status_code": 400
}
```

---

## Common HTTP Status Codes

| Code | Meaning | When Used |
|------|---------|-----------|
| 200 | OK | Successful GET, PATCH, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 404 | Not Found | Resource not found |
| 409 | Conflict | Duplicate resource |
| 500 | Server Error | Database/unexpected error |

---

## Security Features

### Row Level Security (RLS)
All user tables have RLS policies that ensure:
- Users can only access their own data
- No cross-user data leakage
- Automatic enforcement at database level

### Input Validation
- Pydantic schemas validate all inputs
- SQL injection prevented by Supabase client
- Max length constraints on all text fields

### Rate Limiting (Recommended)
- 100 requests/minute per user
- 1000 requests/hour per user
- Implement using Redis

---

## Performance Optimization

### Pagination
Always paginate list endpoints:
- Default: 20 items per page
- Max: 100 items per page

### Indexes
All foreign keys and frequently filtered columns are indexed:
- `user_bookmarks.user_id`
- `user_bookmarks.entity_type, entity_id`
- `user_search_history.user_id, created_at`
- `user_saved_searches.user_id`

### Caching Strategy
- User profiles: 5 minutes (Redis)
- Bookmarks count: 1 minute
- No cache for real-time data

---

## Example API Calls

### 1. Create Bookmark
```bash
POST /api/v1/users/me/bookmarks
Authorization: Bearer <token>
Content-Type: application/json

{
  "entity_type": "program",
  "entity_id": "650e8400-e29b-41d4-a716-446655440002",
  "notes": "Interested in this program"
}
```

### 2. Save Search
```bash
POST /api/v1/users/me/saved-searches
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Computer Science in Lagos",
  "query": "computer science",
  "filters": {
    "state": ["Lagos"],
    "degree_type": ["undergraduate"]
  },
  "notify_on_new_results": true
}
```

### 3. Update Profile
```bash
PATCH /api/v1/users/me
Authorization: Bearer <token>
Content-Type: application/json

{
  "full_name": "John Doe",
  "phone_number": "+2348012345678",
  "state": "Lagos"
}
```

### 4. List Bookmarks
```bash
GET /api/v1/users/me/bookmarks?entity_type=program&page=1&page_size=20
Authorization: Bearer <token>
```

---

## File Structure

```
services/api/
├── routers/
│   ├── bookmarks_router.py         # NEW
│   ├── saved_searches_router.py    # NEW
│   ├── user_profile_router.py      # NEW
│   └── search_history_router.py    # NEW
├── services/
│   ├── bookmark_service.py         # NEW
│   ├── saved_search_service.py     # NEW
│   ├── user_profile_service.py     # NEW
│   └── search_history_service.py   # NEW
├── schemas/
│   ├── bookmarks.py                # NEW
│   ├── saved_searches.py           # NEW
│   ├── user_profile.py             # NEW
│   └── search_history.py           # NEW
├── tests/
│   ├── test_bookmarks.py           # NEW
│   ├── test_saved_searches.py      # NEW
│   ├── test_user_profile.py        # NEW
│   └── test_search_history.py      # NEW
└── core/
    └── dependencies.py              # UPDATE
```

---

## Next Steps

1. **Review** the full design document: [user-features-api-design.md](./user-features-api-design.md)
2. **Create** database migration for `user_saved_searches` table
3. **Implement** Pydantic schemas (Phase 2)
4. **Develop** service layer (Phase 3)
5. **Build** routers (Phase 4)
6. **Test** thoroughly (Phase 6)
7. **Deploy** to staging and production (Phase 7)

---

## Questions or Issues?

Refer to:
- **Full Design Document:** [user-features-api-design.md](./user-features-api-design.md)
- **Database Schema:** [specs/database-schema.md](../specs/database-schema.md)
- **API Specification:** [specs/api-specification.md](../specs/api-specification.md)
- **Development Guide:** [CLAUDE.md](../CLAUDE.md)

---

**Document Status:** Ready for Implementation
**Last Updated:** January 2025

