# Gemini CLI Tasks
**Project:** Admitly Platform
**Last Updated:** December 2, 2025

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

**Active Tasks:** 2 (TASK-002, TASK-003)
**Pending Tasks:** 0
**Completed Tasks:** 1 (TASK-001)
