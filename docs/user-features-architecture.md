# User Features API - Architecture Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           CLIENT LAYER                              │
│  (React Web App / React Native Mobile / Admin Portal)              │
└─────────────────────────────────────────────────────────────────────┘
                                  │
                                  │ HTTP/HTTPS
                                  │ Authorization: Bearer <JWT>
                                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                         FASTAPI BACKEND                             │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                    ROUTER LAYER                             │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │  Bookmarks   │  │    Saved     │  │    User      │    │  │
│  │  │   Router     │  │   Searches   │  │   Profile    │    │  │
│  │  │              │  │    Router    │  │    Router    │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │  │
│  │         │                 │                  │             │  │
│  │         │    ┌──────────────┐               │             │  │
│  │         │    │    Search    │               │             │  │
│  │         │    │   History    │               │             │  │
│  │         │    │    Router    │               │             │  │
│  │         │    └──────┬───────┘               │             │  │
│  └─────────┼───────────┼──────────────────────┼─────────────┘  │
│            │           │                      │                 │
│            │           │  Depends(get_current_user)            │
│            │           │  Depends(get_*_service)               │
│            ▼           ▼                      ▼                 │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 MIDDLEWARE LAYER                            │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │     Auth     │  │     Rate     │  │    Error     │    │  │
│  │  │   Verifier   │  │   Limiter    │  │   Handler    │    │  │
│  │  └──────┬───────┘  └──────────────┘  └──────────────┘    │  │
│  │         │                                                  │  │
│  └─────────┼──────────────────────────────────────────────────┘  │
│            │                                                      │
│            ▼                                                      │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                   SERVICE LAYER                             │  │
│  │                  (Business Logic)                           │  │
│  │                                                             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │  │
│  │  │  Bookmark    │  │ SavedSearch  │  │ UserProfile  │    │  │
│  │  │   Service    │  │   Service    │  │   Service    │    │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘    │  │
│  │         │                 │                  │             │  │
│  │         │    ┌──────────────┐               │             │  │
│  │         │    │SearchHistory │               │             │  │
│  │         │    │   Service    │               │             │  │
│  │         │    └──────┬───────┘               │             │  │
│  └─────────┼───────────┼──────────────────────┼─────────────┘  │
│            │           │                      │                 │
└────────────┼───────────┼──────────────────────┼─────────────────┘
             │           │                      │
             ▼           ▼                      ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       SUPABASE (PostgreSQL)                         │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐  │
│  │                 ROW LEVEL SECURITY (RLS)                    │  │
│  │        USING (auth.uid() = user_id)                         │  │
│  └─────────────────────────────────────────────────────────────┘  │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────┐ │
│  │     user     │  │     user     │  │     user     │  │ user │ │
│  │  bookmarks   │  │    saved     │  │   search     │  │profiles│
│  │              │  │   searches   │  │   history    │  │      │ │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────┘ │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐                               │
│  │institutions  │  │   programs   │                               │
│  │              │  │              │                               │
│  └──────────────┘  └──────────────┘                               │
└─────────────────────────────────────────────────────────────────────┘
```

---

## Request Flow Example: Create Bookmark

```
┌──────────┐
│  CLIENT  │
└────┬─────┘
     │
     │ 1. POST /api/v1/users/me/bookmarks
     │    Authorization: Bearer <jwt_token>
     │    Body: { entity_type: "program", entity_id: "xxx" }
     ▼
┌─────────────────────────────────────────┐
│  FASTAPI ROUTER                         │
│  bookmarks_router.create_bookmark()     │
└────┬────────────────────────────────────┘
     │
     │ 2. Depends(get_current_user)
     │    - Verify JWT token
     │    - Extract user_id from token
     ▼
┌─────────────────────────────────────────┐
│  AUTH MIDDLEWARE                        │
│  - Validate token with Supabase Auth   │
│  - Return user object                  │
└────┬────────────────────────────────────┘
     │
     │ 3. user_id = current_user.user.id
     │    Depends(get_bookmark_service)
     ▼
┌─────────────────────────────────────────┐
│  BOOKMARK SERVICE                       │
│  bookmark_service.create_bookmark()     │
│                                         │
│  4. Validate input (Pydantic)          │
│  5. Verify entity exists               │
│  6. Check for duplicates               │
└────┬────────────────────────────────────┘
     │
     │ 7. INSERT INTO user_bookmarks
     │    VALUES (user_id, entity_type, entity_id, notes)
     ▼
┌─────────────────────────────────────────┐
│  SUPABASE DATABASE                      │
│                                         │
│  8. RLS Policy Check:                  │
│     USING (auth.uid() = user_id)       │
│     WITH CHECK (auth.uid() = user_id)  │
│                                         │
│  9. Insert row if checks pass          │
└────┬────────────────────────────────────┘
     │
     │ 10. Return inserted row
     ▼
┌─────────────────────────────────────────┐
│  BOOKMARK SERVICE                       │
│  - Format response                     │
│  - Return BookmarkResponse             │
└────┬────────────────────────────────────┘
     │
     │ 11. Return 201 Created
     ▼
┌──────────┐
│  CLIENT  │
│  Receives│
│  bookmark│
└──────────┘
```

---

## Data Model Relationships

```
┌─────────────────────────────────────────────────────────────┐
│                     auth.users (Supabase Auth)              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  id (UUID - Primary Key)                             │   │
│  │  email                                               │   │
│  │  encrypted_password                                  │   │
│  │  ... (managed by Supabase)                          │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      │ References (ON DELETE CASCADE)
                      ▼
┌─────────────────────────────────────────────────────────────┐
│                    public.user_profiles                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  id (UUID - FK to auth.users.id)                     │   │
│  │  full_name                                           │   │
│  │  phone_number                                        │   │
│  │  state                                               │   │
│  │  role                                                │   │
│  │  subscription_status                                 │   │
│  │  preferences (JSONB)                                 │   │
│  │  created_at, updated_at, deleted_at                  │   │
│  └──────────────────────────────────────────────────────┘   │
└─────┬────────────┬────────────┬────────────┬───────────────┘
      │            │            │            │
      │            │            │            │ References (ON DELETE CASCADE)
      │            │            │            │
      ▼            ▼            ▼            ▼
┌─────────────┐ ┌────────────┐ ┌──────────────┐ ┌─────────────┐
│   user      │ │   user     │ │     user     │ │  user       │
│ bookmarks   │ │   saved    │ │   search     │ │  alerts     │
│             │ │  searches  │ │   history    │ │             │
├─────────────┤ ├────────────┤ ├──────────────┤ ├─────────────┤
│id           │ │id          │ │id            │ │id           │
│user_id (FK) │ │user_id(FK) │ │user_id (FK)  │ │user_id (FK) │
│entity_type  │ │name        │ │query         │ │alert_type   │
│entity_id    │ │query       │ │filters       │ │filters      │
│notes        │ │filters     │ │results_count │ │email_enabled│
│created_at   │ │notify      │ │created_at    │ │push_enabled │
└─────────────┘ │exec_count  │ └──────────────┘ │created_at   │
                │created_at  │                  └─────────────┘
                │updated_at  │
                │deleted_at  │
                └────────────┘

Entity References (NOT FK - for flexibility):
┌─────────────────────┐        ┌─────────────────────┐
│    institutions     │        │      programs       │
├─────────────────────┤        ├─────────────────────┤
│ id (UUID)           │◄───┐   │ id (UUID)           │
│ name                │    │   │ name                │
│ type                │    │   │ institution_id (FK) │
│ state               │    │   │ degree_type         │
│ ...                 │    │   │ ...                 │
└─────────────────────┘    │   └─────────────────────┘
                           │            ▲
                           │            │
                     Referenced by      │
                           │            │
                   ┌───────┴────────────┴────────┐
                   │    user_bookmarks           │
                   │    entity_id (UUID)         │
                   │    entity_type (enum)       │
                   └─────────────────────────────┘
```

---

## Security Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                      SECURITY LAYERS                            │
└─────────────────────────────────────────────────────────────────┘

Layer 1: AUTHENTICATION
┌─────────────────────────────────────────────────────────────────┐
│  JWT Token Verification                                         │
│  - Token signature validated by Supabase Auth                   │
│  - Token expiry checked (1 hour)                                │
│  - User ID extracted from token payload                         │
└─────────────────────────────────────────────────────────────────┘

Layer 2: AUTHORIZATION
┌─────────────────────────────────────────────────────────────────┐
│  Row Level Security (RLS) Policies                              │
│                                                                 │
│  CREATE POLICY "Users can manage own bookmarks"                │
│  ON public.user_bookmarks                                       │
│  FOR ALL                                                        │
│  TO authenticated                                               │
│  USING (auth.uid() = user_id)                                   │
│  WITH CHECK (auth.uid() = user_id)                              │
│                                                                 │
│  Result: Users can ONLY access their own data                  │
└─────────────────────────────────────────────────────────────────┘

Layer 3: INPUT VALIDATION
┌─────────────────────────────────────────────────────────────────┐
│  Pydantic Schemas                                               │
│  - Type validation (UUID, string, int, etc.)                    │
│  - Length constraints (min/max)                                 │
│  - Format validation (email, phone, enum)                       │
│  - Custom validators (filter keys, phone format)                │
└─────────────────────────────────────────────────────────────────┘

Layer 4: SQL INJECTION PROTECTION
┌─────────────────────────────────────────────────────────────────┐
│  Supabase Client (Parameterized Queries)                        │
│  - All queries use prepared statements                          │
│  - User input never directly concatenated to SQL                │
└─────────────────────────────────────────────────────────────────┘

Layer 5: RATE LIMITING (Optional - Redis)
┌─────────────────────────────────────────────────────────────────┐
│  Per-User Rate Limits                                           │
│  - 100 requests/minute                                          │
│  - 1000 requests/hour                                           │
│  - Tracked by user_id in Redis                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Error Flow

```
┌──────────────────────────────────────────────────────────────┐
│                      ERROR SCENARIOS                         │
└──────────────────────────────────────────────────────────────┘

Scenario 1: INVALID JWT TOKEN
┌─────────────┐
│   Client    │ POST /api/v1/users/me/bookmarks
│             │ Authorization: Bearer invalid_token
└──────┬──────┘
       ▼
┌─────────────────────────────┐
│ Auth Middleware             │
│ - Token verification fails  │
│ - Raise HTTPException       │
└──────┬──────────────────────┘
       ▼
┌─────────────────────────────┐
│ Error Handler               │
│ - Catch HTTPException       │
│ - Format error response     │
└──────┬──────────────────────┘
       ▼
┌─────────────┐
│   Client    │ 401 Unauthorized
│             │ { "detail": "Invalid authentication credentials" }
└─────────────┘


Scenario 2: ENTITY NOT FOUND
┌─────────────┐
│   Client    │ POST /api/v1/users/me/bookmarks
│             │ Body: { entity_id: "non-existent-uuid" }
└──────┬──────┘
       ▼
┌─────────────────────────────┐
│ Bookmark Service            │
│ - Verify entity exists      │
│ - Query returns empty       │
│ - Raise HTTPException       │
└──────┬──────────────────────┘
       ▼
┌─────────────┐
│   Client    │ 404 Not Found
│             │ { "detail": "Program not found" }
└─────────────┘


Scenario 3: DUPLICATE BOOKMARK
┌─────────────┐
│   Client    │ POST /api/v1/users/me/bookmarks (2nd time)
│             │ Body: { entity_id: "same-uuid" }
└──────┬──────┘
       ▼
┌─────────────────────────────┐
│ Database                    │
│ - Unique constraint violated│
│ - Raise exception           │
└──────┬──────────────────────┘
       ▼
┌─────────────────────────────┐
│ Bookmark Service            │
│ - Catch exception           │
│ - Check for "duplicate key" │
│ - Raise HTTPException       │
└──────┬──────────────────────┘
       ▼
┌─────────────┐
│   Client    │ 409 Conflict
│             │ { "detail": "Bookmark already exists" }
└─────────────┘


Scenario 4: RLS POLICY VIOLATION (User tries to access another user's data)
┌─────────────┐
│   Client A  │ DELETE /api/v1/users/me/bookmarks/{user_b_bookmark_id}
│             │ Authorization: Bearer user_a_token
└──────┬──────┘
       ▼
┌─────────────────────────────┐
│ Database (RLS)              │
│ - DELETE query executed     │
│ - RLS checks auth.uid()     │
│ - user_a != bookmark.user_id│
│ - Query returns 0 rows      │
└──────┬──────────────────────┘
       ▼
┌─────────────────────────────┐
│ Bookmark Service            │
│ - Check response.data empty │
│ - Raise HTTPException       │
└──────┬──────────────────────┘
       ▼
┌─────────────┐
│   Client A  │ 404 Not Found (NOT 403 - to avoid leaking info)
│             │ { "detail": "Bookmark not found" }
└─────────────┘
```

---

## Performance Optimization

```
┌─────────────────────────────────────────────────────────────────┐
│                    PERFORMANCE STRATEGIES                       │
└─────────────────────────────────────────────────────────────────┘

1. DATABASE INDEXES
┌────────────────────────────────────────┐
│ user_bookmarks                         │
│  - idx_bookmarks_user (user_id)       │
│  - idx_bookmarks_entity (type, id)    │
│  - idx_bookmarks_unique (UNIQUE)      │
└────────────────────────────────────────┘

2. PAGINATION
┌────────────────────────────────────────┐
│ Always limit results:                  │
│  - Default: 20 items per page          │
│  - Max: 100 items per page             │
│  - Use OFFSET/LIMIT efficiently        │
└────────────────────────────────────────┘

3. CACHING (Redis)
┌────────────────────────────────────────┐
│ User Profile: 5 minutes                │
│ Bookmark Count: 1 minute               │
│ Search Results: 30 seconds             │
└────────────────────────────────────────┘

4. DATABASE QUERY OPTIMIZATION
┌────────────────────────────────────────┐
│ - Select specific columns, not *       │
│ - Use Supabase joins for relations     │
│ - Avoid N+1 queries                    │
│ - Index frequently filtered columns    │
└────────────────────────────────────────┘

5. CONNECTION POOLING
┌────────────────────────────────────────┐
│ Supabase client maintains pool:        │
│  - Min connections: 10                 │
│  - Max connections: 100                │
│  - Reuse connections per request       │
└────────────────────────────────────────┘
```

---

## Monitoring & Observability

```
┌─────────────────────────────────────────────────────────────────┐
│                      METRICS TO TRACK                           │
└─────────────────────────────────────────────────────────────────┘

API Metrics
┌────────────────────────────────────────┐
│ - Request rate (req/sec)               │
│ - Response time (p50, p95, p99)        │
│ - Error rate (% of failed requests)    │
│ - Success rate (% of 2xx responses)    │
└────────────────────────────────────────┘

Business Metrics
┌────────────────────────────────────────┐
│ - Bookmark creation rate               │
│ - Saved search execution frequency     │
│ - Profile update frequency             │
│ - User engagement (active users)       │
└────────────────────────────────────────┘

Database Metrics
┌────────────────────────────────────────┐
│ - Query response time                  │
│ - Connection pool usage                │
│ - Lock wait time                       │
│ - Cache hit rate                       │
└────────────────────────────────────────┘

Alerts
┌────────────────────────────────────────┐
│ - Error rate > 5%                      │
│ - Response time > 2s (p95)             │
│ - Database connection failures         │
│ - RLS policy violations (suspicious)   │
└────────────────────────────────────────┘
```

---

## Deployment Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          PRODUCTION                             │
└─────────────────────────────────────────────────────────────────┘

┌─────────────┐
│   Users     │
└──────┬──────┘
       │
       ▼
┌─────────────────────────────┐
│      CDN (Cloudflare)       │
│  - Static assets            │
│  - DDoS protection          │
└──────┬──────────────────────┘
       │
       ▼
┌─────────────────────────────┐
│   Load Balancer (Render)   │
│  - SSL/TLS termination      │
│  - Health checks            │
└──────┬──────────────────────┘
       │
       ├────────────┬────────────┐
       ▼            ▼            ▼
┌───────────┐ ┌───────────┐ ┌───────────┐
│FastAPI    │ │FastAPI    │ │FastAPI    │
│Instance 1 │ │Instance 2 │ │Instance 3 │
│(Container)│ │(Container)│ │(Container)│
└─────┬─────┘ └─────┬─────┘ └─────┬─────┘
      │             │             │
      └─────────────┼─────────────┘
                    │
                    ▼
┌─────────────────────────────────────┐
│      Supabase (PostgreSQL)          │
│  - Primary database                 │
│  - Read replicas (auto-scaling)     │
│  - Automatic backups                │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│           Redis (Cache)             │
│  - User session cache               │
│  - Rate limiting counters           │
└─────────────────────────────────────┘
```

---

**Document Status:** Reference Architecture
**Last Updated:** January 2025
