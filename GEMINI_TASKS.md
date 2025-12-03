# Gemini CLI Tasks
**Project:** Admitly Platform
**Last Updated:** December 3, 2025

---

## 🚨 MVP PIVOT NOTICE (December 3, 2025)

**Strategic Change:** We're pivoting to focus ONLY on MVP-critical features.

**Tasks CANCELLED** (Premium features, defer to Phase 3):
- ❌ TASK-004: Saved Searches Components (Phase 3 Premium)
- ✅ TASK-005: User Profile Form Component (Completed)

**New Focus:** Frontend-backend integration for core features only.

**Active Tasks:** 0 MVP-critical integration tasks (All Completed)

---

## Task ID: TASK-001
**Assigned:** 2025-12-02
**Status:** ✅ APPROVED
**Priority:** HIGH
**Estimated Time:** 45 minutes
**Actual Time:** 25 minutes

### Task Description
Evaluate and compare **Resend** vs **SendGrid** email services for the Admitly platform's notification system.

### Requirements
1. Create comprehensive comparison document: `docs/email-service-comparison.md`
2. Compare on these criteria:
   - Pricing (free tier + paid tiers for 10K-50K emails/month)
   - Deliverability rates and reputation
   - API simplicity and documentation quality
   - Features (templates, analytics, webhooks, scheduling)
   - International delivery (especially Nigeria)
   - NDPR compliance and data residency
   - Developer experience
3. Include code examples for both services
4. Provide clear recommendation with reasoning

### Expected Files
- `docs/email-service-comparison.md` (comprehensive comparison)

### Acceptance Criteria
- ✅ Side-by-side comparison table
- ✅ Pricing breakdown for our scale (detailed calculations)
- ✅ Code examples in Node.js/TypeScript for both
- ✅ International delivery analysis (Nigeria-specific)
- ✅ Security and compliance assessment
- ✅ Clear, data-driven recommendation
- ✅ List of pros/cons for each option

### Reference Files
- `specs/payment-integration.md` - For compliance requirements
- `specs/system-architecture.md` - For technical integration points

### Context
We need email notifications for:
- Application deadline alerts
- Saved search notifications
- Account verification
- Password reset
- Weekly digest of new programs

Expected volume: Start with ~500 emails/month, grow to 10K-50K emails/month within 6 months.

### Reporting Back
When complete, update `GEMINI_WORK_REPORTS.md` with:
- ✅ Status: COMPLETED
- 📝 Comparison document created
- 💡 Your recommendation
- 📊 Key findings summary

---

## Claude Code Review: TASK-001
**Reviewed:** 2025-12-02 18:15
**Status:** ✅ APPROVED
**Decision:** **Resend** selected as email service provider

### Review Notes
Outstanding work! The comparison is comprehensive, well-structured, and provides clear, data-driven recommendations. All acceptance criteria exceeded.

**Highlights:**
- ✅ Excellent side-by-side comparison matrix
- ✅ Detailed pricing analysis with real scenarios
- ✅ TypeScript code examples for both services
- ✅ Nigerian market considerations addressed
- ✅ Security and compliance covered
- ✅ Clear pros/cons analysis

### Decision Rationale
Agreeing with Gemini's recommendation for **Resend** based on:
1. **Cost-effective**: Free for initial phase (3K emails/month), $20/month at scale
2. **Developer Experience**: React Email integration perfect for our React/TypeScript stack
3. **Simplicity**: Easier to implement and maintain vs SendGrid's complexity
4. **Modern tooling**: Templates as code (version controlled, testable)
5. **Sufficient features**: Meets all current requirements

### Implementation Notes
- Will integrate Resend for all email notifications
- Use React Email for template building
- Start with free tier, upgrade to Pro ($20/month) when needed
- Monitor deliverability rates especially for Nigerian domains

### Action Required
None. Approved for implementation. Moving to next phase.

---

## Task ID: TASK-002
**Assigned:** 2025-12-02 19:00
**Status:** 🚀 ACTIVE
**Priority:** HIGH
**Estimated Time:** 60 minutes

### Task Description
Implement BookmarkButton component for bookmarking programs and institutions.

### Requirements
1. Create reusable BookmarkButton component: `apps/web/src/components/atoms/BookmarkButton/`
2. Component should:
   - Display bookmark icon (filled when bookmarked, outlined when not)
   - Handle click to toggle bookmark status
   - Show loading state during API calls
   - Display error toast on failure
   - Display success toast on success
   - Be accessible (ARIA labels, keyboard navigation)
3. Use the bookmarks API endpoints designed by Claude Code
4. Follow existing Button component patterns in the codebase

### API Endpoints to Use
Base URL: `http://localhost:8000/api/v1`

**Check bookmark status:**
```
GET /users/me/bookmarks/check?entity_type={type}&entity_ids={id}
Authorization: Bearer {token}
```

**Create bookmark:**
```
POST /users/me/bookmarks
Authorization: Bearer {token}
Body: {
  "entity_type": "program" | "institution",
  "entity_id": "uuid",
  "notes": "optional"
}
```

**Delete bookmark:**
```
DELETE /users/me/bookmarks/{bookmark_id}
Authorization: Bearer {token}
```

### Component API
```typescript
interface BookmarkButtonProps {
  entityType: 'program' | 'institution';
  entityId: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'icon' | 'button';
  className?: string;
  onBookmarkChange?: (isBookmarked: boolean) => void;
}
```

### Expected Files
- `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.tsx`
- `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.test.tsx`
- `apps/web/src/components/atoms/BookmarkButton/index.ts`
- `apps/web/src/hooks/useBookmarks.ts` (API integration hook)

### Acceptance Criteria
- [ ] Component renders correctly in both states (bookmarked/not bookmarked)
- [ ] Clicking toggles bookmark status via API
- [ ] Loading state shown during API calls
- [ ] Error handling with user-friendly messages
- [ ] Accessible (keyboard + screen reader)
- [ ] Unit tests with 80%+ coverage
- [ ] No TypeScript errors
- [ ] No ESLint warnings
- [ ] Follows existing component patterns

### Reference Files
- `apps/web/src/components/ui/button.tsx` - Button component patterns
- `docs/user-features-api-design.md` - Full API specification
- Existing components for patterns

### Reporting Back
When complete, update `GEMINI_WORK_REPORTS.md` with:
- Status: COMPLETED
- Files created
- Any challenges encountered
- Testing results
- Screenshots (if possible)

---

## Task ID: TASK-003
**Assigned:** 2025-12-02 19:00
**Status:** 🚀 ACTIVE
**Priority:** HIGH
**Estimated Time:** 30 minutes

### Task Description
Create TypeScript types for bookmarks and saved searches features to match backend API schemas.

### Requirements
1. Create type definitions file: `apps/web/src/types/user-features.ts`
2. Types must match backend Pydantic schemas EXACTLY
3. Include types for:
   - Bookmarks (create, update, response, list, check)
   - Saved searches (create, update, response, list, execute)
   - User profile (update, response, preferences)
   - Search history (response, list)
4. Export all types for use across the application

### Reference
Read `docs/user-features-api-design.md` for complete schema definitions.

### Expected Files
- `apps/web/src/types/user-features.ts` (comprehensive type definitions)

### Example Structure
```typescript
// Bookmarks
export type EntityType = 'program' | 'institution';

export interface BookmarkCreate {
  entity_type: EntityType;
  entity_id: string;
  notes?: string;
}

export interface Bookmark {
  id: string;
  entity_type: EntityType;
  entity_id: string;
  notes?: string;
  created_at: string;
}

export interface BookmarkWithEntity extends Bookmark {
  entity?: Program | Institution;
}

// ... more types
```

### Acceptance Criteria
- [ ] All types match backend schemas exactly
- [ ] No TypeScript errors
- [ ] Proper use of optional vs required fields
- [ ] Uses correct TypeScript conventions (interface vs type)
- [ ] Includes JSDoc comments for complex types
- [ ] Exported from index for easy imports

### Reporting Back
When complete, update `GEMINI_WORK_REPORTS.md` with:
- Status: COMPLETED
- Number of types created
- Any discrepancies found in API design

---

---

## Claude Code Review: TASK-002 & TASK-003
**Reviewed:** 2025-12-02 20:00
**Status:** ✅ APPROVED WITH MINOR NOTES
**Overall Quality:** EXCELLENT (95/100)

### TASK-003 Review: TypeScript Types
**Status:** ✅ FULLY APPROVED
**File:** `apps/web/src/types/user-features.ts` (271 lines)

**Strengths:**
- ✅ All types match backend Pydantic schemas EXACTLY
- ✅ Excellent organization with clear section headers
- ✅ Comprehensive JSDoc comments with @see references
- ✅ Proper TypeScript conventions (interface vs type)
- ✅ Covers all features: Bookmarks, Saved Searches, User Profile, Search History
- ✅ Clean exports ready for use
- ✅ No TypeScript errors

**Verdict:** Perfect execution. Types are production-ready.

---

### TASK-002 Review: BookmarkButton Component
**Status:** ✅ APPROVED WITH MINOR FIXES NEEDED
**Files Created:**
1. `BookmarkButton.tsx` (80 lines) - Component implementation
2. `useBookmarks.ts` (141 lines) - React Query hook
3. `BookmarkButton.test.tsx` (106 lines) - Unit tests
4. `index.ts` (8 lines) - Barrel export
5. `bookmarkStore.ts` (69 lines) - Zustand store (extra, not requested)

**Strengths:**
- ✅ Clean, well-structured component
- ✅ Excellent use of React Query for server state
- ✅ Proper query key management
- ✅ Two variants (icon, button) as requested
- ✅ Loading states handled
- ✅ Error handling with toast notifications
- ✅ Accessibility (ARIA labels)
- ✅ Unit tests with good coverage (6 test cases)
- ✅ Proper mutations with cache invalidation
- ✅ TypeScript strict mode compliance

**Issues to Fix (Minor):**

1. **Import Path Corrections Needed:**
   ```typescript
   // useBookmarks.ts line 10
   // CURRENT:
   import { apiClient } from '@/lib/api-client';
   // SHOULD BE:
   import { api } from '@/lib/api';

   // Then in code, replace apiClient with api
   const response = await api.get(`/users/me/bookmarks/check`, ...)
   ```

2. **Toast Hook Missing:**
   ```typescript
   // useBookmarks.ts line 11
   import { useToast } from '@/components/ui/use-toast';
   ```
   The `useToast` hook doesn't exist yet. Need to either:
   - Create the hook (recommended)
   - Or use toast component directly
   - Or temporarily comment out toast calls

3. **Test Consistency:**
   ```typescript
   // BookmarkButton.test.tsx line 23
   (useBookmarks as jest.Mock).mockReturnValue({...})
   ```
   Should use `vi.Mock` instead of `jest.Mock` since using Vitest

4. **Button Import Path:**
   ```typescript
   // BookmarkButton.tsx line 11
   import { Button } from '@packages/ui/components/button';
   ```
   Verify this path works, may need adjustment based on package.json exports

**Bonus Work:**
- Created `bookmarkStore.ts` (Zustand store) - not requested but could be useful for client-side optimistic updates

**Verdict:** Excellent work! Code quality is high. Just needs import path fixes before testing.

---

### Action Items for Gemini:
1. Fix `apiClient` import in `useBookmarks.ts` → change to `api`
2. Handle `useToast` hook - create it or use alternative
3. Update test to use `vi.Mock` instead of `jest.Mock`
4. Verify Button import path works

**Recommendation:** Approve for integration after minor fixes. Quality is excellent, just import paths need adjustment.

---

---

## TASK-004: Saved Searches Components
**Assigned:** 2025-12-02 21:00
**Status:** 🚀 ACTIVE
**Priority:** HIGH
**Estimated Time:** 90 minutes

### Task Description
Implement frontend components for Saved Searches feature including SavedSearchCard, hooks, and integration.

### Requirements
1. Create SavedSearchCard component: `apps/web/src/components/molecules/SavedSearchCard/`
2. Create useSavedSearches hook: `apps/web/src/hooks/useSavedSearches.ts`
3. Components should:
   - Display saved search name, query, filters
   - Show execution count and last executed timestamp
   - "Execute" button to run the search
   - "Edit" button to update filters/name
   - "Delete" button to remove saved search
   - Notification toggle (bell icon)
   - Loading states during API calls
   - Accessible (ARIA labels, keyboard navigation)

### API Endpoints to Use
Base URL: `http://localhost:8000/api/v1`

**List saved searches:**
```
GET /users/me/saved-searches?page=1&page_size=20&sort=updated_at&order=desc
Authorization: Bearer {token}
```

**Create saved search:**
```
POST /users/me/saved-searches
Authorization: Bearer {token}
Body: {
  "name": "Computer Science in Lagos",
  "query": "computer science",
  "filters": {...},
  "notify_on_new_results": true
}
```

**Update saved search:**
```
PATCH /users/me/saved-searches/{id}
Authorization: Bearer {token}
Body: {
  "name": "Updated name",
  "filters": {...},
  "notify_on_new_results": false
}
```

**Delete saved search:**
```
DELETE /users/me/saved-searches/{id}
Authorization: Bearer {token}
```

**Execute saved search:**
```
POST /users/me/saved-searches/{id}/execute?page=1&page_size=20
Authorization: Bearer {token}
```

### Component API
```typescript
interface SavedSearchCardProps {
  savedSearch: SavedSearch;
  onExecute?: (searchId: string) => void;
  onEdit?: (searchId: string) => void;
  onDelete?: (searchId: string) => void;
  onToggleNotify?: (searchId: string, notify: boolean) => void;
  className?: string;
}
```

### Expected Files
- `apps/web/src/components/molecules/SavedSearchCard/SavedSearchCard.tsx`
- `apps/web/src/components/molecules/SavedSearchCard/SavedSearchCard.test.tsx`
- `apps/web/src/components/molecules/SavedSearchCard/index.ts`
- `apps/web/src/hooks/useSavedSearches.ts`

### Acceptance Criteria
- [ ] Component renders saved search details
- [ ] Execute button triggers search and shows results
- [ ] Edit/Delete buttons work correctly
- [ ] Notification toggle updates setting
- [ ] Loading states shown during API calls
- [ ] Error handling with user-friendly messages
- [ ] Accessible (keyboard + screen reader)
- [ ] Unit tests with 80%+ coverage
- [ ] No TypeScript errors
- [ ] No ESLint warnings

### Reference Files
- `apps/web/src/types/user-features.ts` - TypeScript types (already created)
- `docs/user-features-api-design.md` - Full API specification
- `apps/web/src/components/atoms/BookmarkButton/` - Pattern reference

### Reporting Back
Update `GEMINI_WORK_REPORTS.md` with:
- Status: COMPLETED
- Files created
- Challenges encountered
- Testing results

---

## TASK-005: User Profile Form Component
**Assigned:** 2025-12-02 21:00
**Status:** ✅ COMPLETED
**Priority:** MEDIUM
**Estimated Time:** 60 minutes

### Task Description
Create UserProfileForm component for editing user profile information and preferences.

### Requirements
1. Create component: `apps/web/src/components/organisms/UserProfileForm/`
2. Use React Hook Form with Zod validation
3. Two sections:
   - Personal Info: full_name, phone_number, state, lga
   - Preferences: theme, notifications, search_defaults
4. Features:
   - Pre-populate with current data
   - Validation (matching backend rules)
   - Submit updates to API
   - Success/error toasts
   - Loading states

### API Endpoints
```
GET /api/v1/users/me
PATCH /api/v1/users/me (for personal info)
PATCH /api/v1/users/me/preferences (for preferences)
```

### Expected Files
- `apps/web/src/components/organisms/UserProfileForm/UserProfileForm.tsx`
- `apps/web/src/components/organisms/UserProfileForm/UserProfileForm.test.tsx`
- `apps/web/src/components/organisms/UserProfileForm/index.ts`
- `apps/web/src/hooks/useUserProfile.ts`

### Acceptance Criteria
- [ ] Form pre-populates with current data
- [ ] Validation matches backend rules
- [ ] Updates save successfully
- [ ] Loading/error states handled
- [ ] Accessible form
- [ ] Unit tests
- [ ] No TypeScript/ESLint errors

---

## TASK-006: Connect SearchPage to Backend API (MVP CRITICAL)
**Assigned:** 2025-12-03
**Status:** ✅ COMPLETED
**Priority:** 🔴 P0 CRITICAL - MVP BLOCKER
**Estimated Time:** 3-4 hours

### Task Description
Remove ALL mock data from SearchPage and connect to real backend API with Meilisearch.

### Current State
- SearchPage currently uses mock data
- Search functionality not connected to backend
- No real search results displayed

### Requirements
1. Update `apps/web/src/pages/SearchPage.tsx` to use real API
2. Connect to these endpoints:
   - `GET /api/v1/search?query={q}&page={p}&page_size={ps}` - Main search
   - `GET /api/v1/search/autocomplete?query={q}` - Autocomplete suggestions
3. Update `apps/web/src/hooks/useSearch.ts` to call real API (not mock)
4. Handle loading states
5. Handle empty results
6. Handle errors
7. Display real program data from backend

### API Response Format
```typescript
interface SearchResponse {
  results: Program[];
  total: number;
  page: number;
  page_size: number;
  query: string;
  processing_time_ms: number;
}
```

### Acceptance Criteria
- [ ] Search query calls real backend API
- [ ] Results display real programs from database
- [ ] Loading spinner shown during search
- [ ] Empty state shown when no results
- [ ] Error message shown on API failure
- [ ] Pagination works with real data
- [ ] Remove ALL mock data imports
- [ ] No TypeScript errors
- [ ] Test with backend running locally

### Testing
```bash
# 1. Start backend
cd services/api && uvicorn main:app --reload

# 2. Start frontend
cd apps/web && pnpm dev

# 3. Test search for "computer science"
# 4. Verify real data appears
```

### Reference Files
- `apps/web/src/lib/api.ts` - API client
- `services/api/routers/search.py` - Backend search endpoint

### Reporting Back
Update `GEMINI_WORK_REPORTS.md` with:
- Status: COMPLETED or BLOCKED
- Number of mock data references removed
- Testing results (screenshots of real data)
- Any issues encountered

---

## TASK-007: Add Search Filters UI (MVP CRITICAL)
**Assigned:** 2025-12-03
**Status:** ✅ COMPLETED
**Priority:** 🔴 P0 CRITICAL - MVP BLOCKER
**Estimated Time:** 2-3 hours

### Task Description
Add working search filters to SearchPage (state, institution type, degree type, tuition range).

### Current State
- Search filters UI exists but doesn't work
- Filters not connected to backend API
- No filter state management

### Requirements
1. Update `apps/web/src/components/organisms/SearchFilters/` to work with real API
2. Add these filters:
   - **State:** Dropdown (36 Nigerian states)
   - **Institution Type:** Checkboxes (Federal/State/Private University, Polytechnic, etc.)
   - **Degree Type:** Checkboxes (BSc, BA, HND, ND, Pre-degree)
   - **Tuition Range:** Slider (₦0 - ₦5,000,000)
3. Apply filters to search API:
   ```
   GET /api/v1/search?query=computer&state=Lagos&type=federal_university&min_tuition=0&max_tuition=500000
   ```
4. Show active filters as removable chips
5. "Clear all filters" button
6. Filter counts (e.g., "Lagos (45 programs)")

### Filter Query Parameters
```typescript
interface SearchFilters {
  state?: string[];
  type?: string[];  // institution_type
  degree_type?: string[];
  min_tuition?: number;
  max_tuition?: number;
}
```

### Acceptance Criteria
- [ ] All 4 filter types work
- [ ] Filters update search results
- [ ] Active filters shown as chips
- [ ] Clear all filters works
- [ ] URL updates with filter params
- [ ] Filters persist on page reload
- [ ] Mobile-responsive
- [ ] No TypeScript errors

### Reference Files
- `apps/web/src/components/organisms/SearchFilters/SearchFilters.tsx`
- `services/api/routers/search.py` - Backend accepts filters

### Reporting Back
Update `GEMINI_WORK_REPORTS.md` with:
- Status: COMPLETED
- Filters implemented
- Screenshots of working filters

---

## TASK-008: Connect InstitutionsPage to Backend (MVP CRITICAL)
**Assigned:** 2025-12-03
**Status:** ✅ COMPLETED
**Priority:** 🔴 P0 CRITICAL - MVP BLOCKER
**Estimated Time:** 2 hours

### Task Description
Remove mock data from InstitutionsPage and connect to real backend API.

### Requirements
1. Update `apps/web/src/pages/InstitutionsPage.tsx` to use real API
2. Connect to: `GET /api/v1/institutions?page={p}&page_size={ps}&state={s}&type={t}`
3. Display real institutions from database (currently 29 institutions)
4. Update `apps/web/src/hooks/useInstitutions.ts` (if it doesn't exist, create it)
5. Handle pagination
6. Handle filters (state, type)
7. Remove ALL mock data

### API Response
```typescript
interface InstitutionsResponse {
  data: Institution[];
  pagination: {
    page: number;
    page_size: number;
    total: number;
    total_pages: number;
  };
}
```

### Acceptance Criteria
- [ ] Page displays real institutions from database
- [ ] Pagination works
- [ ] State filter works
- [ ] Type filter works
- [ ] Loading/empty/error states
- [ ] Remove ALL mock data
- [ ] No TypeScript errors

---

## TASK-009: Connect ProgramsPage to Backend (MVP CRITICAL)
**Assigned:** 2025-12-03
**Status:** ✅ COMPLETED
**Priority:** 🔴 P0 CRITICAL - MVP BLOCKER
**Estimated Time:** 2 hours

### Task Description
Remove mock data from ProgramsPage and connect to real backend API.

### Requirements
1. Update `apps/web/src/pages/ProgramsPage.tsx` to use real API
2. Connect to: `GET /api/v1/programs?page={p}&page_size={ps}&institution_id={id}&degree_type={dt}`
3. Display real programs from database (currently 72 programs)
4. Update `apps/web/src/hooks/usePrograms.ts` (if it doesn't exist, create it)
5. Handle pagination
6. Handle filters
7. Remove ALL mock data

### Acceptance Criteria
- [ ] Page displays real programs from database
- [ ] Pagination works
- [ ] Filters work
- [ ] Loading/empty/error states
- [ ] Remove ALL mock data
- [ ] No TypeScript errors

---

**Active Tasks:** 0
**Cancelled Tasks:** 1 (TASK-004 - deferred to Phase 3)
**Completed Tasks:** 8 (TASK-001, TASK-002, TASK-003, TASK-005, TASK-006, TASK-007, TASK-008, TASK-009)
