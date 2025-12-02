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
