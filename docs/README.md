# Admitly Platform Documentation

This directory contains comprehensive technical documentation for the Admitly Platform backend APIs and system architecture.

---

## User Features API Documentation

### 1. [User Features API Design](./user-features-api-design.md) (59 KB)
**Comprehensive specification document covering:**
- Complete API endpoint specifications with request/response examples
- Pydantic schema definitions
- Service layer implementation patterns
- Database schema requirements
- Authentication & authorization details
- Error handling strategies
- Testing strategy
- Implementation roadmap with phases

**When to use:** This is your primary reference when implementing any user feature. Read this document thoroughly before starting development.

---

### 2. [User Features API Summary](./user-features-api-summary.md) (9.2 KB)
**Quick reference guide containing:**
- Endpoint summary table
- Database schema overview
- Implementation checklist
- Common API call examples
- File structure guide
- Quick troubleshooting tips

**When to use:** Use this as a quick reference during development when you need to recall endpoint paths, parameters, or response formats without diving into the full specification.

---

### 3. [User Features Architecture](./user-features-architecture.md) (35 KB)
**Visual architecture documentation featuring:**
- System architecture diagrams
- Request flow examples
- Data model relationships (ER diagrams)
- Security architecture layers
- Error flow scenarios
- Performance optimization strategies
- Monitoring & observability setup
- Deployment architecture

**When to use:** Reference this document when you need to understand the system's overall structure, data flow, security layers, or deployment architecture.

---

## API Endpoints Overview

### Bookmarks API
**Base Path:** `/api/v1/users/me/bookmarks`

Allows users to bookmark programs and institutions for later reference.

**Key Endpoints:**
- `GET /` - List bookmarks
- `POST /` - Create bookmark
- `PATCH /{id}` - Update bookmark
- `DELETE /{id}` - Delete bookmark
- `DELETE /bulk` - Bulk delete
- `GET /check` - Check bookmark status

---

### Saved Searches API
**Base Path:** `/api/v1/users/me/saved-searches`

Enables users to save search queries with filters for quick access.

**Key Endpoints:**
- `GET /` - List saved searches
- `POST /` - Create saved search
- `GET /{id}` - Get saved search
- `PATCH /{id}` - Update saved search
- `DELETE /{id}` - Delete saved search
- `POST /{id}/execute` - Execute saved search

---

### User Profile Management API
**Base Path:** `/api/v1/users/me`

Manages user profile information and preferences.

**Key Endpoints:**
- `GET /` - Get profile
- `PATCH /` - Update profile
- `PATCH /preferences` - Update preferences
- `DELETE /` - Delete account (soft)

---

### Search History API
**Base Path:** `/api/v1/users/me/search-history`

Tracks and displays user's search history.

**Key Endpoints:**
- `GET /` - List search history
- `DELETE /` - Clear history
- `GET /analytics` - Search analytics (optional)

---

## Database Tables

### New Table Required
- **`user_saved_searches`** - Needs to be created via migration

### Existing Tables Used
- **`user_bookmarks`** ✅
- **`user_search_history`** ✅
- **`user_profiles`** ✅
- **`institutions`** ✅ (referenced)
- **`programs`** ✅ (referenced)

---

## Implementation Phases

### Phase 1: Database Setup (Week 1)
Create `user_saved_searches` table, apply RLS policies, create indexes.

### Phase 2: Bookmarks API (Week 1-2)
Schemas → Service → Router → Tests

### Phase 3: Saved Searches API (Week 2)
Schemas → Service → Router → Tests → Integration

### Phase 4: User Profile API (Week 2-3)
Schemas → Service → Router → Tests → Soft delete

### Phase 5: Search History API (Week 3)
Schemas → Service → Router → Tests → Auto-recording

### Phase 6: Integration & Testing (Week 3-4)
E2E tests, performance testing, security audit

### Phase 7: Deployment (Week 4)
Staging → QA → Production → Monitoring

---

## Technology Stack

### Backend Framework
- **FastAPI** - Async Python web framework
- **Pydantic v2** - Data validation and serialization
- **Supabase Python Client** - Database interaction
- **PostgreSQL** - Primary database (via Supabase)

### Authentication
- **Supabase Auth** - JWT-based authentication
- **Row Level Security (RLS)** - Database-level authorization

### Caching (Optional)
- **Redis** - Session cache, rate limiting

---

## Security Features

### Authentication
- JWT Bearer token required for all endpoints
- Token validated via Supabase Auth
- User ID extracted from token payload

### Authorization
- Row Level Security (RLS) policies enforce access control
- Users can only access their own data
- No cross-user data leakage possible

### Input Validation
- All inputs validated by Pydantic schemas
- SQL injection prevented by parameterized queries
- Max length constraints on all text fields

### Rate Limiting (Recommended)
- 100 requests/minute per user
- 1000 requests/hour per user

---

## Performance Optimization

### Database
- **Indexes** on all foreign keys and filtered columns
- **Pagination** for all list endpoints (max 100 items)
- **Query optimization** using Supabase joins

### Caching
- User profiles: 5 minutes
- Bookmark counts: 1 minute
- Search results: 30 seconds

### Connection Pooling
- Supabase client maintains connection pool
- Min: 10, Max: 100 connections

---

## Testing Strategy

### Unit Tests
Test individual services in isolation with mocked dependencies.

### Integration Tests
Test API endpoints with real database (test database).

### End-to-End Tests
Test complete user flows across multiple endpoints.

### Security Tests
Verify RLS policies prevent unauthorized access.

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

## Example API Calls

### Create Bookmark
```bash
curl -X POST "http://localhost:8000/api/v1/users/me/bookmarks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "entity_type": "program",
    "entity_id": "650e8400-e29b-41d4-a716-446655440002",
    "notes": "Interested in this program"
  }'
```

### Save Search
```bash
curl -X POST "http://localhost:8000/api/v1/users/me/saved-searches" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Computer Science in Lagos",
    "query": "computer science",
    "filters": {
      "state": ["Lagos"],
      "degree_type": ["undergraduate"]
    },
    "notify_on_new_results": true
  }'
```

### Update Profile
```bash
curl -X PATCH "http://localhost:8000/api/v1/users/me" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "John Doe",
    "phone_number": "+2348012345678",
    "state": "Lagos"
  }'
```

---

## Related Documentation

### Project Root
- **[CLAUDE.md](../CLAUDE.md)** - Development guide and coding standards
- **[prd.md](../prd.md)** - Product Requirements Document

### Specifications
- **[specs/api-specification.md](../specs/api-specification.md)** - Overall API specification
- **[specs/database-schema.md](../specs/database-schema.md)** - Database schema
- **[specs/security-compliance.md](../specs/security-compliance.md)** - Security standards

---

## Getting Started

### For Developers

1. **Read the comprehensive design document first:**
   ```bash
   # Read the full API design
   less docs/user-features-api-design.md
   ```

2. **Understand the architecture:**
   ```bash
   # Review architecture diagrams
   less docs/user-features-architecture.md
   ```

3. **Keep the summary handy:**
   ```bash
   # Quick reference during development
   less docs/user-features-api-summary.md
   ```

4. **Set up your development environment:**
   ```bash
   cd services/api
   python -m venv venv
   source venv/bin/activate  # Windows: venv\Scripts\activate
   pip install -r requirements.txt
   ```

5. **Create database migration:**
   ```bash
   # Create migration for user_saved_searches table
   supabase migration new create_user_saved_searches
   ```

6. **Start implementing in order:**
   - Phase 1: Database setup
   - Phase 2: Bookmarks API
   - Phase 3: Saved Searches API
   - Phase 4: User Profile API
   - Phase 5: Search History API

---

## Support

### Questions or Issues?

1. **Check the documentation:**
   - Start with the summary for quick answers
   - Refer to the full design for detailed specifications
   - Review architecture diagrams for system understanding

2. **Review existing code:**
   - `services/api/routers/institutions.py` - Example router
   - `services/api/services/institution_service.py` - Example service
   - `services/api/schemas/institutions.py` - Example schemas

3. **Follow the patterns:**
   - All user features follow the same architectural pattern
   - Copy existing patterns and adapt for new features

---

## Contributing

When implementing features:

1. **Follow the design document** exactly as specified
2. **Write tests** for all new code (unit + integration)
3. **Update documentation** if you make changes
4. **Follow naming conventions** in CLAUDE.md
5. **Use type hints** and Pydantic schemas
6. **Handle errors** consistently
7. **Log appropriately** (info, error, debug)

---

## Document Maintenance

### Review Cycle
- **Quarterly** or when major features are added
- Update version numbers and "Last Updated" dates
- Keep API examples current with actual implementation

### Change Log
- **v1.0 (January 2025)** - Initial comprehensive user features API design

---

**Last Updated:** January 2025
**Status:** Active Documentation
**Maintainer:** Backend Team
