# API Specification

## Overview
Complete REST API specification for the Nigeria Student Data Services Platform using FastAPI with Supabase PostgREST integration.

---

## API Design Principles

1. **RESTful:** Resource-based URLs, HTTP verbs (GET, POST, PUT, PATCH, DELETE)
2. **JSON:** Request/response format
3. **Versioning:** `/api/v1` prefix
4. **Pagination:** Cursor-based for consistency
5. **Filtering:** Query parameters for filtering/sorting
6. **Authentication:** JWT Bearer tokens (Supabase Auth)
7. **Rate Limiting:** Per-user and per-IP
8. **Error Handling:** Consistent error format
9. **Documentation:** Auto-generated OpenAPI (Swagger)

---

## Base URL

**Development:** `http://localhost:8000/api/v1`
**Production:** `https://api.admitly.com.ng/api/v1`

---

## Authentication

### Headers
```http

Authorization: Bearer <jwt_token>
Content-Type: application/json
```

### Authentication Flow
1. User authenticates via Supabase Auth (frontend)
2. Receives JWT access token
3. Includes token in `Authorization` header
4. Backend verifies JWT signature (Supabase public key)
5. Extracts user ID and role from token
6. Applies RLS policies automatically (if using PostgREST)

---

## Standard Response Format

### Success Response

```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "request_id": "req_123abc"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ ... ],
  "pagination": {
    "total": 150,
    "page": 1,
    "page_size": 20,
    "total_pages": 8,
    "has_next": true,
    "has_prev": false,
    "next_cursor": "cursor_xyz",
    "prev_cursor": null
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "request_id": "req_123abc"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-10T12:00:00Z",
    "request_id": "req_123abc"
  }
}
```

### Standard Error Codes
- `400` - Bad Request (validation errors)
- `401` - Unauthorized (invalid/missing token)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `429` - Too Many Requests (rate limit exceeded)
- `500` - Internal Server Error
- `503` - Service Unavailable

---

## API Endpoints

## 1. Institutions API

### 1.1 List Institutions
```http
GET /api/v1/institutions
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number (default: 1) |
| `page_size` | integer | No | Items per page (default: 20, max: 100) |
| `type` | string | No | Filter by type (`federal_university`, `state_university`, etc.) |
| `state` | string | No | Filter by Nigerian state |
| `accreditation_status` | string | No | Filter by accreditation |
| `search` | string | No | Full-text search query |
| `sort` | string | No | Sort field (`name`, `founded_year`, default: `name`) |
| `order` | string | No | Sort order (`asc`, `desc`, default: `asc`) |

**Example Request:**
```bash
GET /api/v1/institutions?type=federal_university&state=Lagos&page=1&page_size=20
```

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "slug": "university-of-lagos",
      "name": "University of Lagos",
      "short_name": "UNILAG",
      "type": "federal_university",
      "accreditation_status": "fully_accredited",
      "state": "Lagos",
      "city": "Lagos",
      "logo_url": "https://storage.supabase.co/logos/unilag.png",
      "website": "https://unilag.edu.ng",
      "verified": true,
      "program_count": 120,
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 1.2 Get Institution Details
```http
GET /api/v1/institutions/{slug}
```

**Path Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `slug` | string | Yes | Institution slug (e.g., `university-of-lagos`) |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-1",
    "slug": "university-of-lagos",
    "name": "University of Lagos",
    "short_name": "UNILAG",
    "type": "federal_university",
    "accreditation_status": "fully_accredited",
    "accreditation_body": "NUC",
    "address": "Akoka, Yaba",
    "city": "Lagos",
    "state": "Lagos",
    "lga": "Yaba",
    "geolocation": { "lat": 6.5158, "lng": 3.3894 },
    "website": "https://unilag.edu.ng",
    "email": "info@unilag.edu.ng",
    "phone": "+234-1-4932396",
    "social_media": {
      "facebook": "unilagnigeria",
      "twitter": "unilag",
      "instagram": "unilagnigeria"
    },
    "description": "Premier university in Nigeria...",
    "founded_year": 1962,
    "logo_url": "https://...",
    "banner_image_url": "https://...",
    "verified": true,
    "program_count": 120,
    "contacts": [
      {
        "name": "Dr. John Doe",
        "role": "Admissions Officer",
        "email": "admissions@unilag.edu.ng",
        "phone": "+234-1-4932396"
      }
    ],
    "stats": {
      "total_programs": 120,
      "bookmark_count": 1500,
      "avg_tuition_range": { "min": 50000000, "max": 100000000 }
    },
    "last_scraped_at": "2025-01-09T00:00:00Z",
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-09T00:00:00Z"
  }
}
```

### 1.3 Get Institution Programs
```http
GET /api/v1/institutions/{slug}/programs
```

**Query Parameters:** Same as List Programs API (see below)

---

## 2. Programs API

### 2.1 List Programs
```http
GET /api/v1/programs
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `page` | integer | No | Page number |
| `page_size` | integer | No | Items per page |
| `institution_id` | uuid | No | Filter by institution |
| `degree_type` | string | No | Filter by degree type |
| `field_of_study` | string | No | Filter by field |
| `mode` | string | No | Filter by mode (`full_time`, `part_time`, etc.) |
| `min_duration` | number | No | Min duration in years |
| `max_duration` | number | No | Max duration in years |
| `search` | string | No | Full-text search |
| `sort` | string | No | Sort field |
| `order` | string | No | Sort order |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-2",
      "slug": "computer-engineering",
      "name": "Computer Engineering",
      "institution": {
        "id": "uuid-1",
        "name": "University of Lagos",
        "slug": "university-of-lagos",
        "logo_url": "https://..."
      },
      "degree_type": "undergraduate",
      "qualification": "BEng",
      "field_of_study": "Engineering",
      "specialization": "Computer Engineering",
      "duration_years": 5.0,
      "duration_text": "5 years",
      "mode": "full_time",
      "accreditation_status": "fully_accredited",
      "is_active": true,
      "annual_intake": 100,
      "requirements": {
        "min_utme_score": 250,
        "utme_subjects": ["English", "Mathematics", "Physics", "Chemistry"],
        "min_credit_passes": 5,
        "required_subjects": ["English", "Mathematics", "Physics", "Chemistry"]
      },
      "cutoff": {
        "academic_year": "2024/2025",
        "aggregate_score": 275.50,
        "acceptance_rate": 15.5
      },
      "tuition_range": { "min": 50000000, "max": 60000000 },
      "created_at": "2025-01-01T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 2.2 Get Program Details
```http
GET /api/v1/programs/{id}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-2",
    "slug": "computer-engineering",
    "name": "Computer Engineering",
    "institution": { ... },
    "degree_type": "undergraduate",
    "qualification": "BEng",
    "field_of_study": "Engineering",
    "specialization": "Computer Engineering",
    "duration_years": 5.0,
    "mode": "full_time",
    "curriculum_summary": "Comprehensive engineering program...",
    "accreditation_status": "fully_accredited",
    "accreditation_body": "COREN",
    "is_active": true,
    "annual_intake": 100,
    "requirements": {
      "min_utme_score": 250,
      "utme_subjects": ["English", "Mathematics", "Physics", "Chemistry"],
      "min_credit_passes": 5,
      "required_subjects": ["English", "Mathematics", "Physics", "Chemistry"],
      "alternative_subjects": [],
      "has_post_utme": true,
      "post_utme_cutoff": 50,
      "accepts_direct_entry": true,
      "de_qualifications": ["ND", "HND"],
      "de_min_grade": "Upper Credit",
      "special_requirements": null,
      "age_limit": null
    },
    "cutoffs": [
      {
        "academic_year": "2024/2025",
        "aggregate_score": 275.50,
        "utme_cutoff": 250,
        "post_utme_cutoff": 50,
        "total_applicants": 1500,
        "total_admitted": 100,
        "acceptance_rate": 6.67
      }
    ],
    "costs": [
      {
        "fee_type": "tuition",
        "fee_name": "Tuition Fee",
        "amount": 50000000,
        "currency": "NGN",
        "student_category": "new_student",
        "payment_frequency": "per_year",
        "is_mandatory": true,
        "effective_date": "2024-09-01"
      }
    ],
    "application_windows": [
      {
        "academic_year": "2025/2026",
        "intake_type": "main",
        "application_start_date": "2025-05-01",
        "application_end_date": "2025-08-31",
        "status": "pending",
        "application_portal_url": "https://..."
      }
    ],
    "career_insights": [
      {
        "career_title": "Software Engineer",
        "salary_range": { "min": 240000000, "max": 600000000 },
        "demand_score": 0.95,
        "demand_trend": "growing",
        "available_in_nigeria": true,
        "required_skills": ["Python", "JavaScript", "Problem Solving"]
      }
    ],
    "related_programs": [ ... ],
    "last_scraped_at": "2025-01-09T00:00:00Z",
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

---

## 3. Search API

### 3.1 Global Search
```http
GET /api/v1/search
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query |
| `type` | string | No | Search type (`all`, `institutions`, `programs`) |
| `filters` | object | No | Additional filters (JSON encoded) |
| `page` | integer | No | Page number |
| `page_size` | integer | No | Items per page (max: 50) |

**Example Request:**
```bash
GET /api/v1/search?q=computer%20science&type=programs&filters=%7B%22state%22%3A%22Lagos%22%7D
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "institutions": [
      {
        "id": "uuid-1",
        "name": "University of Lagos",
        "type": "federal_university",
        "state": "Lagos",
        "_highlights": {
          "name": "<mark>University</mark> of Lagos"
        }
      }
    ],
    "programs": [
      {
        "id": "uuid-2",
        "name": "Computer Science",
        "institution_name": "University of Lagos",
        "degree_type": "undergraduate",
        "_highlights": {
          "name": "<mark>Computer</mark> <mark>Science</mark>"
        }
      }
    ],
    "total_results": 25
  },
  "pagination": { ... }
}
```

### 3.2 Autocomplete
```http
GET /api/v1/search/autocomplete
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `q` | string | Yes | Search query (min 2 chars) |
| `limit` | integer | No | Max results (default: 10) |

**Example Response:**
```json
{
  "success": true,
  "data": [
    { "text": "Computer Science", "type": "program" },
    { "text": "Computer Engineering", "type": "program" },
    { "text": "University of Lagos", "type": "institution" }
  ]
}
```

---

## 4. Compare API

### 4.1 Compare Programs
```http
POST /api/v1/compare/programs
```

**Request Body:**
```json
{
  "program_ids": ["uuid-2", "uuid-3", "uuid-4"]
}
```

**Validation:**
- Max 3 programs
- All programs must exist

**Example Response:**
```json
{
  "success": true,
  "data": {
    "programs": [
      {
        "id": "uuid-2",
        "name": "Computer Engineering",
        "institution": { ... },
        "duration_years": 5.0,
        "tuition": 50000000,
        "cutoff_score": 275.50,
        "requirements": { ... },
        "career_outlook": { ... }
      },
      { ... },
      { ... }
    ],
    "comparison_matrix": {
      "duration": [5.0, 4.0, 5.0],
      "tuition": [50000000, 45000000, 60000000],
      "cutoff": [275.50, 260.00, 280.00],
      "acceptance_rate": [6.67, 10.5, 5.2]
    }
  }
}
```

### 4.2 Compare Institutions
```http
POST /api/v1/compare/institutions
```

**Request Body:**
```json
{
  "institution_ids": ["uuid-1", "uuid-5", "uuid-6"]
}
```

---

## 5. Deadlines API

### 5.1 List Application Windows
```http
GET /api/v1/deadlines
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `status` | string | No | Filter by status (`open`, `closing_soon`, `closed`) |
| `institution_id` | uuid | No | Filter by institution |
| `program_id` | uuid | No | Filter by program |
| `from_date` | date | No | Start date filter (ISO 8601) |
| `to_date` | date | No | End date filter |
| `page` | integer | No | Page number |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-7",
      "institution": { ... },
      "program": { ... },
      "academic_year": "2025/2026",
      "intake_type": "main",
      "application_start_date": "2025-05-01",
      "application_end_date": "2025-08-31",
      "screening_date": "2025-09-15",
      "admission_list_date": "2025-10-01",
      "status": "pending",
      "days_until_deadline": 112,
      "application_portal_url": "https://...",
      "last_verified_at": "2025-01-09T00:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 5.2 Calendar View
```http
GET /api/v1/deadlines/calendar
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `month` | integer | Yes | Month (1-12) |
| `year` | integer | Yes | Year |

**Example Response:**
```json
{
  "success": true,
  "data": {
    "month": 5,
    "year": 2025,
    "events": [
      {
        "date": "2025-05-01",
        "events": [
          {
            "type": "application_start",
            "institution": "University of Lagos",
            "program": "Computer Engineering"
          }
        ]
      }
    ]
  }
}
```

---

## 6. Alerts API

### 6.1 Create Alert
```http
POST /api/v1/alerts
```

**Authentication:** Required (Student/Premium)

**Request Body:**
```json
{
  "alert_type": "deadline",
  "institution_ids": ["uuid-1"],
  "program_ids": [],
  "states": ["Lagos"],
  "degree_types": ["undergraduate"],
  "email_enabled": true,
  "push_enabled": true
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-8",
    "alert_type": "deadline",
    "filters": { ... },
    "email_enabled": true,
    "push_enabled": true,
    "is_active": true,
    "created_at": "2025-01-10T12:00:00Z"
  }
}
```

### 6.2 List User Alerts
```http
GET /api/v1/alerts
```

**Authentication:** Required

### 6.3 Update Alert
```http
PATCH /api/v1/alerts/{id}
```

### 6.4 Delete Alert
```http
DELETE /api/v1/alerts/{id}
```

---

## 7. User API

### 7.1 Get User Profile
```http
GET /api/v1/users/me
```

**Authentication:** Required

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-9",
    "full_name": "John Doe",
    "email": "john@example.com",
    "phone_number": "+234801234567",
    "state": "Lagos",
    "role": "premium",
    "subscription_status": "active",
    "subscription_tier": "monthly",
    "subscription_end_date": "2025-02-10T12:00:00Z",
    "preferences": {
      "theme": "light",
      "notifications": {
        "email": true,
        "push": true
      }
    },
    "created_at": "2025-01-01T00:00:00Z"
  }
}
```

### 7.2 Update User Profile
```http
PATCH /api/v1/users/me
```

**Request Body:**
```json
{
  "full_name": "John Doe",
  "phone_number": "+234801234567",
  "state": "Lagos",
  "preferences": { ... }
}
```

### 7.3 Get User Bookmarks
```http
GET /api/v1/users/me/bookmarks
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `type` | string | No | Filter by type (`institution`, `program`) |

### 7.4 Create Bookmark
```http
POST /api/v1/users/me/bookmarks
```

**Request Body:**
```json
{
  "entity_type": "program",
  "entity_id": "uuid-2",
  "notes": "Interested in this program"
}
```

### 7.5 Delete Bookmark
```http
DELETE /api/v1/users/me/bookmarks/{id}
```

### 7.6 Get Search History
```http
GET /api/v1/users/me/search-history
```

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `limit` | integer | No | Max results (default: 50) |

---

## 8. AI API (Premium Only)

### 8.1 Create Conversation
```http
POST /api/v1/ai/conversations
```

**Authentication:** Required (Premium)

**Request Body:**
```json
{
  "title": "Choosing the right program",
  "user_profile": {
    "budget": 1000000,
    "preferred_states": ["Lagos", "Ogun"],
    "interests": ["technology", "engineering"],
    "career_goal": "Software Engineer"
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-10",
    "title": "Choosing the right program",
    "user_profile": { ... },
    "is_active": true,
    "created_at": "2025-01-10T12:00:00Z"
  }
}
```

### 8.2 Send Message
```http
POST /api/v1/ai/conversations/{id}/messages
```

**Request Body:**
```json
{
  "content": "What are the best computer science programs in Lagos?"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid-11",
    "conversation_id": "uuid-10",
    "role": "user",
    "content": "What are the best computer science programs in Lagos?",
    "created_at": "2025-01-10T12:00:00Z"
  }
}
```

**AI Response (Server-Sent Events):**
```
data: {"type": "chunk", "content": "Based on "}
data: {"type": "chunk", "content": "your budget..."}
data: {"type": "citation", "data": {"type": "program", "id": "uuid-2", "name": "Computer Science - UNILAG"}}
data: {"type": "done"}
```

### 8.3 Get Conversation Messages
```http
GET /api/v1/ai/conversations/{id}/messages
```

### 8.4 List Conversations
```http
GET /api/v1/ai/conversations
```

### 8.5 Get Recommendations
```http
POST /api/v1/ai/recommendations
```

**Request Body:**
```json
{
  "preferences": {
    "budget": 1000000,
    "location": ["Lagos"],
    "interests": ["technology"],
    "career_goals": ["Software Engineer"]
  }
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "recommendations": [
      {
        "program": { ... },
        "score": 0.95,
        "reasons": [
          "Matches your budget (₦500,000/year)",
          "Located in Lagos as preferred",
          "Strong career outcomes in software engineering"
        ],
        "pros": ["High placement rate", "Industry partnerships"],
        "cons": ["High competition (6% acceptance rate)"]
      }
    ],
    "rationale": "I've analyzed 120 programs...",
    "citations": [ ... ]
  }
}
```

---

## 9. Payment API

### 9.1 Initialize Payment
```http
POST /api/v1/payments/initialize
```

**Authentication:** Required

**Request Body:**
```json
{
  "subscription_tier": "monthly"
}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid-12",
    "paystack_reference": "ref_123abc",
    "amount": 150000,
    "authorization_url": "https://checkout.paystack.com/...",
    "access_code": "abc123"
  }
}
```

### 9.2 Verify Payment
```http
GET /api/v1/payments/verify/{reference}
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "transaction_id": "uuid-12",
    "status": "success",
    "amount": 150000,
    "subscription_start_date": "2025-01-10T12:00:00Z",
    "subscription_end_date": "2025-02-10T12:00:00Z"
  }
}
```

### 9.3 Get Transaction History
```http
GET /api/v1/payments/transactions
```

**Authentication:** Required

---

## 10. Admin API

### 10.1 Review Queue
```http
GET /api/v1/admin/review-queue
```

**Authentication:** Required (Internal Admin)

**Query Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `entity_type` | string | No | Filter by entity type |
| `status` | string | No | Filter by review status |

**Example Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-13",
      "entity_type": "institution",
      "entity_id": "uuid-1",
      "action": "update",
      "changes": {
        "tuition": { "old": 50000000, "new": 55000000 }
      },
      "source": "scraper",
      "source_url": "https://...",
      "review_status": "pending",
      "created_at": "2025-01-10T10:00:00Z"
    }
  ],
  "pagination": { ... }
}
```

### 10.2 Approve Change
```http
POST /api/v1/admin/review-queue/{id}/approve
```

**Request Body:**
```json
{
  "review_notes": "Verified from official website"
}
```

### 10.3 Reject Change
```http
POST /api/v1/admin/review-queue/{id}/reject
```

### 10.4 Analytics Dashboard
```http
GET /api/v1/admin/analytics
```

**Example Response:**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 1500,
      "premium": 150,
      "growth_rate": 15.5
    },
    "content": {
      "institutions": 50,
      "programs": 1200,
      "data_freshness": 0.85
    },
    "scraping": {
      "success_rate": 0.95,
      "last_run": "2025-01-10T06:00:00Z"
    },
    "revenue": {
      "mrr": 225000,
      "arr": 2700000
    }
  }
}
```

---

## Rate Limiting

### Limits by Role
| Role | Requests per Hour |
|------|-------------------|
| Anonymous | 100 |
| Student | 1,000 |
| Premium | 5,000 |
| Admin | Unlimited |

### Rate Limit Headers
```http
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1704902400
```

### Rate Limit Exceeded Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 15 minutes.",
    "retry_after": 900
  }
}
```

---

## WebSocket API (Real-time)

### Connect to Real-time Updates
```javascript
const ws = new WebSocket('wss://api.admitly.com.ng/ws');

// Subscribe to institution updates
ws.send(JSON.stringify({
  type: 'subscribe',
  channel: 'institutions',
  filters: { state: 'Lagos' }
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  // { type: 'institution_updated', data: { ... } }
};
```

---

## Webhooks (Paystack)

### Payment Success
```http
POST /api/v1/webhooks/paystack
```

**Headers:**
```http
x-paystack-signature: <signature>
```

**Request Body:**
```json
{
  "event": "charge.success",
  "data": {
    "reference": "ref_123abc",
    "amount": 150000,
    "customer": { ... }
  }
}
```

---

## API Client Libraries

### Python (example)
```python
from admitly import AdmitlyClient

client = AdmitlyClient(api_key="your_jwt_token")

# Search institutions
institutions = client.institutions.list(state="Lagos", type="federal_university")

# Get program details
program = client.programs.get("uuid-2")

# Compare programs
comparison = client.compare.programs(["uuid-2", "uuid-3"])
```

### JavaScript/TypeScript (example)
```typescript
import { AdmitlyClient } from '@admitly/sdk';

const client = new AdmitlyClient({ apiKey: 'your_jwt_token' });

// Search
const results = await client.search.query('computer science', {
  filters: { state: 'Lagos' }
});

// AI Chat
const conversation = await client.ai.createConversation({
  title: 'Career planning'
});

await client.ai.sendMessage(conversation.id, 'What should I study?');
```

---

## Error Handling Best Practices

### Client-side
```typescript
try {
  const response = await fetch('/api/v1/institutions');
  const data = await response.json();

  if (!data.success) {
    // Handle API error
    console.error(data.error.message);
  }
} catch (error) {
  // Handle network error
  console.error('Network error:', error);
}
```

---

## Versioning Strategy

- Current version: `v1`
- Breaking changes: New version (`v2`)
- Non-breaking changes: Same version
- Deprecation: 6 months notice

---

## OpenAPI Documentation

**Swagger UI:** `https://api.admitly.com.ng/docs`
**ReDoc:** `https://api.admitly.com.ng/redoc`
**OpenAPI Spec:** `https://api.admitly.com.ng/openapi.json`

---

## Next Steps
1. Implement FastAPI routers
2. Add request/response validation (Pydantic)
3. Set up rate limiting (Redis)
4. Configure CORS
5. Add API documentation
6. Create client SDKs
