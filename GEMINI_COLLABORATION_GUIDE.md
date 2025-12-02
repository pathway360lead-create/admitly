# Gemini CLI Collaboration Guide
**Admitly Platform Development**
**Version:** 1.0
**Last Updated:** December 2, 2025

---

## Purpose

This guide enables **Gemini CLI** to work in parallel with **Claude Code** on the Admitly platform. Each AI focuses on different aspects while maintaining consistency and quality.

---

## Work Distribution Strategy

### Claude Code Handles (Primary AI):
- ✅ Overall architecture and design decisions
- ✅ Backend API implementation (FastAPI endpoints)
- ✅ Database schema changes and migrations
- ✅ Complex integrations (Supabase, Meilisearch, payments)
- ✅ Git commits and deployment
- ✅ Quality verification of Gemini's work

### Gemini CLI Handles (Parallel Tasks):
- 📝 Frontend component implementation (React/TypeScript)
- 📝 UI/UX refinements and styling
- 📝 Test file creation (unit tests, component tests)
- 📝 Documentation updates
- 📝 Data seeding scripts
- 📝 Helper utilities and validation functions
- 📝 Type definitions (TypeScript interfaces)

---

## Task Assignment Format

When Claude Code assigns a task to Gemini, it will be documented in:
**File:** `GEMINI_TASKS.md`

**Format:**
```markdown
## Task ID: TASK-001
**Assigned:** 2025-12-02 14:00
**Status:** PENDING
**Priority:** HIGH
**Estimated Time:** 30 minutes

### Task Description
Implement the BookmarkButton component for the ProgramCard component.

### Requirements
1. Create `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.tsx`
2. Component should accept props: `programId`, `isBookmarked`, `onToggle`
3. Use Lucide React icons (Bookmark and BookmarkCheck)
4. Add hover states and loading states
5. Follow existing atom component patterns
6. Must be fully typed with TypeScript

### Expected Files
- `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.tsx`
- `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.test.tsx`
- `apps/web/src/components/atoms/BookmarkButton/index.ts`

### Acceptance Criteria
- ✅ Component renders correctly
- ✅ Handles click events properly
- ✅ Shows loading state during API calls
- ✅ Accessible (ARIA labels, keyboard navigation)
- ✅ Follows Tailwind CSS conventions
- ✅ Has unit tests with 80%+ coverage

### Reference Files
- Similar pattern: `apps/web/src/components/atoms/Button/Button.tsx`
- Design system: `apps/web/src/styles/theme.ts`

### Reporting Back
When complete, update this section with:
- ✅ Status: COMPLETED
- 📝 Files created/modified (list)
- 🧪 Test results (pass/fail)
- 📸 Screenshot (if UI component)
- ⚠️ Any issues or deviations from requirements
```

---

## Reporting Format

**File:** `GEMINI_WORK_REPORTS.md`

After completing each task, Gemini should append a report:

```markdown
---

## Report: TASK-001
**Completed:** 2025-12-02 14:30
**Time Taken:** 28 minutes
**Status:** ✅ COMPLETED

### Work Summary
Created BookmarkButton component with full TypeScript support, accessibility features, and loading states.

### Files Created
1. `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.tsx` (87 lines)
2. `apps/web/src/components/atoms/BookmarkButton/BookmarkButton.test.tsx` (145 lines)
3. `apps/web/src/components/atoms/BookmarkButton/index.ts` (3 lines)

### Files Modified
None

### Test Results
```
PASS  src/components/atoms/BookmarkButton/BookmarkButton.test.tsx
  BookmarkButton
    ✓ renders unbookmarked state (24 ms)
    ✓ renders bookmarked state (18 ms)
    ✓ calls onToggle when clicked (31 ms)
    ✓ shows loading state (22 ms)
    ✓ is keyboard accessible (19 ms)

Test Suites: 1 passed, 1 total
Tests:       5 passed, 5 total
Coverage:    87.5%
```

### Code Quality
- ✅ TypeScript strict mode: No errors
- ✅ ESLint: No warnings
- ✅ Prettier: Formatted
- ✅ Accessibility: WCAG AA compliant

### Deviations from Requirements
None. All acceptance criteria met.

### Issues Encountered
- Minor: Had to adjust icon size from 18px to 20px for better visibility
- Resolved: Tested on mobile viewports, looks good

### Next Steps (if any)
Ready for Claude Code review. Consider adding animation transitions for smoother UX.

### Screenshot
![BookmarkButton States](./assets/bookmark-button-states.png)
- Shows: Default, Hover, Loading, Bookmarked states

---
```

---

## Quality Standards (MANDATORY)

### Code Quality Checklist
Before marking any task as complete, ensure:

- [ ] **TypeScript**: No type errors, strict mode enabled
- [ ] **ESLint**: Zero warnings, zero errors
- [ ] **Prettier**: Code is formatted
- [ ] **Tests**: Unit tests written, 80%+ coverage
- [ ] **Accessibility**: ARIA labels, keyboard navigation, screen reader support
- [ ] **Performance**: No unnecessary re-renders, memoization where needed
- [ ] **Documentation**: JSDoc comments for complex functions
- [ ] **Naming**: Follows project conventions (PascalCase for components, camelCase for functions)
- [ ] **Imports**: Absolute imports using `@/` alias
- [ ] **Comments**: Minimal but meaningful, explain "why" not "what"

### Testing Requirements
Every component must have:
```typescript
// Minimum test coverage
describe('ComponentName', () => {
  it('renders without crashing', () => {});
  it('displays correct content', () => {});
  it('handles user interactions', () => {});
  it('handles loading state', () => {});
  it('handles error state', () => {});
  it('is accessible', () => {});
});
```

### React Component Patterns
Follow these patterns strictly:

**1. Component Structure:**
```typescript
// ComponentName.tsx
import { FC } from 'react';
import { cn } from '@/lib/utils';

interface ComponentNameProps {
  // Props with JSDoc
  /** The unique identifier */
  id: string;
  /** Optional CSS classes */
  className?: string;
}

export const ComponentName: FC<ComponentNameProps> = ({
  id,
  className
}) => {
  // Hooks at the top
  const [state, setState] = useState();

  // Event handlers
  const handleClick = () => {};

  // Render
  return (
    <div className={cn('base-classes', className)}>
      {/* Content */}
    </div>
  );
};

ComponentName.displayName = 'ComponentName';
```

**2. File Organization:**
```
ComponentName/
├── ComponentName.tsx       # Main component
├── ComponentName.test.tsx  # Tests
├── ComponentName.stories.tsx # Storybook (optional)
├── index.ts                # Export
└── types.ts                # Component-specific types (if complex)
```

---

## Communication Protocol

### When to Ask Claude Code for Help
Ask Claude Code if:
- ❓ Requirements are unclear or ambiguous
- ❓ Need access to database schema or API specifications
- ❓ Encounter breaking changes in dependencies
- ❓ Need architectural decisions (state management, data flow)
- ❓ Task requires backend changes
- ❓ Stuck on a problem for >30 minutes

**How to Ask:**
Add to `GEMINI_QUESTIONS.md`:
```markdown
## Question: TASK-001-Q1
**Date:** 2025-12-02 14:15
**Task:** TASK-001
**Priority:** MEDIUM

### Question
The BookmarkButton component needs to call an API endpoint. Should I use:
1. React Query mutation directly in the component?
2. A custom hook like `useBookmarkProgram`?
3. Zustand store action?

### Context
The button will be used in multiple places (ProgramCard, ProgramDetailPage, ComparisonTable).

### Blocking?
No, I can continue with other tasks while waiting for answer.
```

### When to Report Issues
Report immediately if:
- 🚨 Tests are failing unexpectedly
- 🚨 TypeScript errors cannot be resolved
- 🚨 Requirements conflict with existing code
- 🚨 Security vulnerability discovered
- 🚨 Performance issue detected

**How to Report:**
Add to `GEMINI_ISSUES.md` with severity level:
```markdown
## Issue: TASK-001-I1
**Severity:** 🔴 HIGH / 🟡 MEDIUM / 🟢 LOW
**Date:** 2025-12-02
**Task:** TASK-001

### Issue Description
The BookmarkButton component crashes when programId is undefined.

### Steps to Reproduce
1. Render BookmarkButton without programId prop
2. Click the button
3. App crashes with TypeError

### Expected Behavior
Should show error boundary or disable button if programId is missing.

### Actual Behavior
Uncaught TypeError: Cannot read property 'id' of undefined

### Proposed Solution
Add prop validation and early return:
```typescript
if (!programId) {
  console.warn('BookmarkButton: programId is required');
  return null;
}
```

### Needs Immediate Attention?
Yes / No
```

---

## Example Tasks for Gemini

### Task Type 1: Component Implementation
**Typical Tasks:**
- Create reusable UI components (buttons, cards, modals)
- Implement form components with validation
- Build page layouts from designs
- Add loading skeletons and empty states

**Example:**
```
Task: Implement SavedSearchCard component
Files: apps/web/src/components/molecules/SavedSearchCard/
Requirements: Display saved search with edit/delete actions
Reference: InstitutionCard component pattern
```

### Task Type 2: Test Writing
**Typical Tasks:**
- Write unit tests for existing components
- Add integration tests for user flows
- Create test utilities and mocks

**Example:**
```
Task: Add tests for BookmarkButton component
Files: apps/web/src/components/atoms/BookmarkButton/BookmarkButton.test.tsx
Requirements: 80%+ coverage, test all user interactions
Reference: Button.test.tsx
```

### Task Type 3: Type Definitions
**Typical Tasks:**
- Create TypeScript interfaces for API responses
- Define component prop types
- Add utility types for common patterns

**Example:**
```
Task: Create TypeScript types for bookmarks feature
Files: apps/web/src/types/bookmarks.ts
Requirements: Match backend API schema exactly
Reference: specs/api-specification.md, apps/web/src/types/models.ts
```

### Task Type 4: Utilities & Helpers
**Typical Tasks:**
- Create formatting functions (dates, currency, text)
- Build validation helpers
- Implement data transformation utilities

**Example:**
```
Task: Create formatDeadline utility function
Files: apps/web/src/lib/formatDeadline.ts
Requirements: Format deadline dates with human-friendly text
Reference: apps/web/src/lib/formatCurrency.ts
```

### Task Type 5: Documentation
**Typical Tasks:**
- Write component documentation
- Update README files
- Create usage examples

**Example:**
```
Task: Document bookmarks feature
Files: docs/features/bookmarks.md
Requirements: User guide + developer guide
Reference: docs/features/search.md
```

---

## Work Verification Process

### Claude Code's Verification Steps
1. ✅ **Code Review**: Check code quality, patterns, TypeScript
2. ✅ **Test Verification**: Run tests, check coverage
3. ✅ **Integration Check**: Ensure works with existing code
4. ✅ **Performance**: Check for performance issues
5. ✅ **Accessibility**: Verify WCAG compliance
6. ✅ **Security**: Check for vulnerabilities
7. ✅ **Documentation**: Ensure adequate documentation

### Approval Process
**Status Updates:**
- ✅ **APPROVED**: Ready to merge, no changes needed
- 🔄 **CHANGES REQUESTED**: Minor fixes needed, resubmit
- ❌ **REJECTED**: Major issues, needs rework

Claude Code will update `GEMINI_TASKS.md`:
```markdown
## Claude Code Review: TASK-001
**Reviewed:** 2025-12-02 15:00
**Status:** ✅ APPROVED

### Review Notes
Excellent work! Component follows all patterns correctly, tests are comprehensive.

### Minor Suggestions (Optional)
- Consider adding animation for state transitions
- Could extract icon size to theme constants

### Action Required
None. Approved for merge.
```

---

## File Locations

All collaboration files are in project root:

```
admitly/
├── GEMINI_TASKS.md              # Task assignments from Claude Code
├── GEMINI_WORK_REPORTS.md       # Work reports from Gemini
├── GEMINI_QUESTIONS.md          # Questions for Claude Code
├── GEMINI_ISSUES.md             # Issue reports
└── GEMINI_COLLABORATION_GUIDE.md # This file
```

---

## Best Practices

### DO:
✅ Read requirements carefully before starting
✅ Follow existing code patterns and conventions
✅ Write tests BEFORE marking task complete
✅ Ask questions early if unclear
✅ Report blockers immediately
✅ Keep commits small and focused
✅ Document complex logic
✅ Test on multiple screen sizes (mobile, tablet, desktop)
✅ Check accessibility with screen readers
✅ Verify TypeScript has zero errors

### DON'T:
❌ Skip tests ("will add later")
❌ Copy-paste code without understanding
❌ Ignore TypeScript errors
❌ Use `any` type excessively
❌ Hard-code values that should be constants
❌ Modify files outside task scope
❌ Skip accessibility features
❌ Assume requirements - ask if unclear
❌ Leave console.log statements
❌ Use inline styles (use Tailwind CSS)

---

## Workflow Example

### Step 1: Claude Code Assigns Task
```markdown
# GEMINI_TASKS.md

## Task ID: TASK-010
**Status:** PENDING
**Task:** Implement BookmarkButton component
[Full details...]
```

### Step 2: Gemini Acknowledges
```markdown
# GEMINI_WORK_REPORTS.md

## TASK-010: Started
**Started:** 2025-12-02 14:00
Working on BookmarkButton component. ETA: 30 minutes.
```

### Step 3: Gemini Asks Question (if needed)
```markdown
# GEMINI_QUESTIONS.md

## Question: TASK-010-Q1
Should BookmarkButton use optimistic updates?
```

### Step 4: Claude Code Answers
```markdown
# GEMINI_QUESTIONS.md (Updated)

## Question: TASK-010-Q1
**Answer:** Yes, use optimistic updates with React Query's onMutate.
See: apps/web/src/hooks/usePrograms.ts for pattern.
```

### Step 5: Gemini Completes & Reports
```markdown
# GEMINI_WORK_REPORTS.md

## Report: TASK-010
**Status:** ✅ COMPLETED
[Full report with files, tests, screenshots...]
```

### Step 6: Claude Code Reviews
```markdown
# GEMINI_TASKS.md (Updated)

## Task ID: TASK-010
**Status:** ✅ APPROVED
**Review:** Great work! Tests pass, accessibility checked.
```

### Step 7: Claude Code Commits
```bash
git add apps/web/src/components/atoms/BookmarkButton
git commit -m "feat: Add BookmarkButton component

Implemented by: Gemini CLI
Reviewed by: Claude Code
Task: TASK-010
"
git push origin main
```

---

## Email Service Decision

### Task: Evaluate Resend vs SendGrid

**Criteria to Compare:**
1. **Pricing**: Free tier limits, paid tiers
2. **Deliverability**: Reputation, spam rates
3. **Developer Experience**: API simplicity, documentation
4. **Features**: Templates, analytics, webhooks
5. **Nigerian Market**: International delivery reliability
6. **Compliance**: NDPR, data residency

**Gemini's Task:**
Create comparison table in `docs/email-service-comparison.md` with:
- Feature comparison matrix
- Pricing breakdown for our expected volume (10K-50K emails/month)
- Code examples for both
- Recommendation with reasoning

**Claude Code will:**
- Review comparison
- Make final decision
- Implement chosen service

---

## Success Metrics

Track these metrics for Gemini's work:

### Quality Metrics
- Test coverage: Target 80%+
- TypeScript errors: Target 0
- ESLint warnings: Target 0
- Accessibility score: Target 95%+

### Velocity Metrics
- Tasks completed per day
- Average time per task type
- Rework rate (tasks needing changes)

### Collaboration Metrics
- Question response time
- Issue resolution time
- Approval rate (first submission)

---

## Getting Started Checklist

Before starting first task:

- [ ] Read this entire guide
- [ ] Understand project structure (`CLAUDE.md`)
- [ ] Review coding standards (`genrules.md`)
- [ ] Check existing component patterns
- [ ] Set up local development environment
- [ ] Run `pnpm install` in `apps/web`
- [ ] Verify tests run: `pnpm test`
- [ ] Read API specifications (`specs/api-specification.md`)
- [ ] Understand database schema (`specs/database-schema.md`)
- [ ] Review TypeScript types (`apps/web/src/types/`)

---

## Contact & Support

**For Claude Code:**
- Check `GEMINI_QUESTIONS.md` regularly
- Review `GEMINI_WORK_REPORTS.md` daily
- Respond to questions within 2 hours (work hours)

**For Gemini CLI:**
- Ask questions early and often
- Report issues immediately
- Update status frequently
- Communicate blockers ASAP

---

**Remember:** We're building something that will help 50,000+ Nigerian students. Quality and reliability matter more than speed. Take time to do it right.

**Let's build something amazing together! 🚀**

---

**Version History:**
- v1.0 (2025-12-02): Initial guide created
