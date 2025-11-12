# Frontend Specification Document
## Nigeria Student Data Services Platform

**Version:** 1.0
**Last Updated:** November 10, 2025
**Tech Stack:** React 18+, React Native with Expo, Tailwind CSS, shadcn/ui, Zustand, React Query, Render

---

## Table of Contents

1. [Component Architecture](#1-component-architecture)
2. [Page Specifications](#2-page-specifications)
3. [State Management](#3-state-management)
4. [Routing](#4-routing)
5. [PWA Implementation](#5-pwa-implementation)
6. [Performance Optimization](#6-performance-optimization)
7. [Responsive Design](#7-responsive-design)
8. [Accessibility](#8-accessibility)
9. [Styling System](#9-styling-system)
10. [Form Handling](#10-form-handling)

---

## 1. Component Architecture

### 1.1 Atomic Design Structure

```
src/
├── components/
│   ├── atoms/
│   │   ├── Button/
│   │   │   ├── Button.tsx
│   │   │   ├── Button.test.tsx
│   │   │   └── index.ts
│   │   ├── Input/
│   │   ├── Badge/
│   │   ├── Icon/
│   │   ├── Spinner/
│   │   ├── Avatar/
│   │   ├── Checkbox/
│   │   ├── Radio/
│   │   ├── Switch/
│   │   ├── Tooltip/
│   │   └── Typography/
│   ├── molecules/
│   │   ├── SearchBar/
│   │   ├── FilterChip/
│   │   ├── ProgramCard/
│   │   ├── InstitutionCard/
│   │   ├── DeadlineItem/
│   │   ├── CostBreakdown/
│   │   ├── ContactCard/
│   │   ├── ComparisonCell/
│   │   ├── DateRangePicker/
│   │   ├── FormField/
│   │   └── AlertBanner/
│   ├── organisms/
│   │   ├── Header/
│   │   ├── Footer/
│   │   ├── SearchFilters/
│   │   ├── ComparisonTable/
│   │   ├── InstitutionProfile/
│   │   ├── ProgramDetails/
│   │   ├── DeadlineCalendar/
│   │   ├── ChatInterface/
│   │   ├── PricingTable/
│   │   ├── AuthForm/
│   │   └── AdminSidebar/
│   ├── templates/
│   │   ├── MainLayout/
│   │   ├── DashboardLayout/
│   │   ├── AuthLayout/
│   │   ├── AdminLayout/
│   │   └── CompareLayout/
│   └── pages/
│       ├── HomePage/
│       ├── SearchResultsPage/
│       ├── InstitutionProfilePage/
│       ├── ProgramProfilePage/
│       ├── ComparePage/
│       ├── DeadlinesPage/
│       ├── DashboardPage/
│       ├── ChatPage/
│       ├── LoginPage/
│       ├── RegisterPage/
│       └── AdminPage/
```

### 1.2 Shared Component Library Structure

```typescript
// src/components/shared/index.ts
export { Button } from './atoms/Button';
export { Input } from './atoms/Input';
export { Badge } from './atoms/Badge';
// ... all shared components

// Usage in mobile app (React Native)
// src/mobile/components/shared/index.ts
export { Button } from './atoms/Button.native';
export { Input } from './atoms/Input.native';
```

**Strategy for Web/Mobile Code Sharing:**
- Use `.tsx` for web-specific components
- Use `.native.tsx` for React Native components
- Use `.shared.ts` for business logic and utilities
- Abstract platform-specific code using adapters

### 1.3 Component Naming Conventions

```typescript
// PascalCase for component names
export const ProgramCard = () => { /* ... */ };

// camelCase for component file folders
// src/components/molecules/programCard/

// Prefix with base functionality
export const SearchBar = () => { /* ... */ };
export const SearchFilters = () => { /* ... */ };
export const SearchResults = () => { /* ... */ };

// Use descriptive suffixes
export const ProgramCardSkeleton = () => { /* ... */ };
export const ProgramCardError = () => { /* ... */ };
export const ProgramCardEmpty = () => { /* ... */ };

// HOCs use 'with' prefix
export const withAuth = (Component) => { /* ... */ };
export const withLayout = (Component) => { /* ... */ };

// Hooks use 'use' prefix
export const useSearchFilters = () => { /* ... */ };
export const useProgramData = () => { /* ... */ };
```

### 1.4 Props Interface Standards

```typescript
// Base props for all components
interface BaseComponentProps {
  className?: string;
  testId?: string;
  children?: React.ReactNode;
}

// Variant-based props
interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  isDisabled?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  type?: 'button' | 'submit' | 'reset';
}

// Data-driven components
interface ProgramCardProps extends BaseComponentProps {
  program: Program; // from types/models
  onCompare?: (programId: string) => void;
  onBookmark?: (programId: string) => void;
  isComparing?: boolean;
  isBookmarked?: boolean;
  variant?: 'grid' | 'list';
}

// Composition patterns
interface SearchFiltersProps extends BaseComponentProps {
  filters: FilterState;
  onFilterChange: (filters: Partial<FilterState>) => void;
  onReset: () => void;
  isLoading?: boolean;
}

// Naming conventions:
// - Use descriptive names (onFilterChange vs onChange)
// - Boolean props use 'is', 'has', 'should' prefix
// - Event handlers use 'on' prefix
// - Optional props use '?' suffix
// - Required data props come first
```

### 1.5 Component Template

```typescript
// src/components/molecules/programCard/ProgramCard.tsx
import { FC, memo } from 'react';
import { Program } from '@/types/models';
import { Badge } from '@/components/atoms/Badge';
import { Button } from '@/components/atoms/Button';
import { cn } from '@/lib/utils';

interface ProgramCardProps {
  program: Program;
  onCompare?: (programId: string) => void;
  onBookmark?: (programId: string) => void;
  isComparing?: boolean;
  isBookmarked?: boolean;
  variant?: 'grid' | 'list';
  className?: string;
}

export const ProgramCard: FC<ProgramCardProps> = memo(({
  program,
  onCompare,
  onBookmark,
  isComparing = false,
  isBookmarked = false,
  variant = 'grid',
  className
}) => {
  return (
    <article
      className={cn(
        'program-card',
        variant === 'grid' ? 'flex-col' : 'flex-row',
        className
      )}
      data-testid="program-card"
    >
      {/* Component content */}
    </article>
  );
});

ProgramCard.displayName = 'ProgramCard';

// Export types for external use
export type { ProgramCardProps };
```

---

## 2. Page Specifications

### 2.1 Home Page

**Route:** `/`

**Components:**
```typescript
HomePage/
├── HeroSection
│   ├── SearchBar (organism)
│   ├── TrendingSearches (molecule)
│   └── StatsCounter (molecule)
├── FeaturedInstitutions
│   └── InstitutionCard[] (molecule)
├── ProgramCategories
│   └── CategoryCard[] (molecule)
├── UpcomingDeadlines
│   └── DeadlineItem[] (molecule)
├── HowItWorks
│   └── StepCard[] (molecule)
├── TestimonialsSection
│   └── TestimonialCard[] (molecule)
└── CTASection
    └── PremiumBanner (organism)
```

**State Requirements:**
- Featured institutions (React Query)
- Trending searches (React Query)
- Upcoming deadlines (React Query)
- Search query (local state)

**Key Features:**
- Global search with autocomplete
- Quick filters (Institution type, State, Program type)
- Featured institutions carousel
- Deadline countdown timers
- CTA for premium features

**Responsive Behavior:**
- Mobile: Single column, collapsible sections
- Tablet: 2-column grid for cards
- Desktop: 3-column grid, sticky search bar

### 2.2 Search Results Page

**Route:** `/search?q={query}&type={type}&state={state}&...`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Breadcrumb + Active Filters            │
├──────────┬──────────────────────────────┤
│          │  Sort: Relevance ▼  View: ⊞  │
│ Filters  ├──────────────────────────────┤
│ Sidebar  │                              │
│          │  Results (Grid/List)         │
│ [Sticky] │                              │
│          │  Pagination                  │
└──────────┴──────────────────────────────┘
```

**Components:**
```typescript
SearchResultsPage/
├── SearchHeader
│   ├── SearchBar (pre-filled)
│   ├── ResultsCount
│   └── ActiveFilters (dismissible chips)
├── FilterSidebar (sticky)
│   ├── InstitutionTypeFilter
│   ├── StateFilter
│   ├── ProgramDurationFilter
│   ├── TuitionRangeFilter
│   ├── AccreditationFilter
│   ├── ApplicationStatusFilter
│   └── ModalityFilter
├── SortControls
├── ViewToggle (grid/list)
├── ResultsGrid/ResultsList
│   └── ProgramCard[] or InstitutionCard[]
├── ComparisonTray (sticky bottom)
│   └── SelectedItems (max 3)
└── Pagination
```

**State Requirements:**
- Search query (URL sync)
- Active filters (URL sync, Zustand)
- Sort option (URL sync)
- View mode (localStorage)
- Selected items for comparison (Zustand)
- Results data (React Query)

**Key Features:**
- Faceted search with URL persistence
- Real-time filter application
- Comparison tray (sticky, up to 3 items)
- Save search functionality (auth required)
- Export results (CSV/PDF - premium)

**Performance:**
- Virtual scrolling for 100+ results
- Debounced filter changes (300ms)
- Optimistic UI updates
- Skeleton loading states

### 2.3 Institution Profile Page

**Route:** `/institutions/{slug}`

**Sections:**
```typescript
InstitutionProfilePage/
├── HeroSection
│   ├── InstitutionLogo
│   ├── InstitutionName + AccreditationBadge
│   ├── Location + Map Link
│   ├── VerifiedBadge + LastUpdated
│   └── ShareButton + BookmarkButton
├── QuickStats
│   ├── ProgramsCount
│   ├── AcceptanceRate
│   ├── TuitionRange
│   └── ApplicationStatus
├── TabNavigation
│   ├── Overview
│   │   ├── Description
│   │   ├── Accreditation
│   │   ├── Rankings
│   │   └── SocialChannels
│   ├── Programs
│   │   ├── ProgramSearch
│   │   └── ProgramCard[] (grouped by faculty)
│   ├── Admissions
│   │   ├── Requirements
│   │   ├── CutoffScores
│   │   ├── ApplicationProcess
│   │   └── ImportantDates
│   ├── Costs
│   │   ├── TuitionBreakdown
│   │   ├── OtherFees
│   │   ├── Scholarships
│   │   └── CostOfLiving
│   ├── Contacts
│   │   ├── FocalPersons[]
│   │   ├── Departments[]
│   │   └── OfficeLocations
│   └── Insights
│       ├── PopularityTrend
│       ├── GraduateOutcomes
│       └── EmploymentRates
├── RelatedInstitutions
└── CTASection (Apply/Request Callback)
```

**State Requirements:**
- Institution data (React Query with cache)
- Active tab (URL hash)
- Bookmark status (Zustand + auth)
- Comparison selection (Zustand)

**Key Features:**
- Tabbed navigation with deep linking
- Interactive location map
- Social proof (verified badge, stats)
- Quick actions (bookmark, share, compare)
- Responsive image gallery

### 2.4 Program Profile Page

**Route:** `/programs/{slug}`

**Layout:**
```typescript
ProgramProfilePage/
├── HeroSection
│   ├── ProgramName + Degree Type
│   ├── InstitutionLink + Location
│   ├── Duration + Modality
│   ├── AccreditationBadge
│   └── Actions (Compare, Bookmark, Share)
├── QuickFacts
│   ├── ApplicationDeadline (countdown)
│   ├── TotalCost
│   ├── CutoffScore
│   └── Seats Available
├── TabNavigation
│   ├── Overview
│   │   ├── Description
│   │   ├── LearningOutcomes
│   │   └── Curriculum
│   ├── Requirements
│   │   ├── EntryRequirements
│   │   ├── Documents Needed
│   │   └── EligibilityChecker (interactive)
│   ├── Timeline
│   │   ├── ApplicationWindow
│   │   ├── ExamDates
│   │   ├── InterviewPeriod
│   │   └── EnrollmentDate
│   ├── Costs
│   │   ├── TuitionBreakdown
│   │   ├── AcceptanceFee
│   │   ├── DepartmentalFees
│   │   └── BudgetCalculator (interactive)
│   ├── Career Outlook
│   │   ├── JobProspects (Nigeria/Africa/Global)
│   │   ├── SalaryRange
│   │   ├── TopEmployers
│   │   ├── RequiredSkills
│   │   └── CareerPaths
│   └── Reviews (future phase)
├── SimilarPrograms
├── ApplicationChecklist (premium)
└── CTASection
    ├── StartApplication
    └── GetAIGuidance (premium)
```

**State Requirements:**
- Program data (React Query)
- Active tab (URL hash)
- Bookmark/comparison status (Zustand)
- Eligibility checker inputs (local state)
- Budget calculator values (local state)

**Key Features:**
- Deadline countdown with alerts
- Interactive eligibility checker
- Budget calculator with cost breakdown
- Career insights with data sources
- Application checklist generator (premium)

### 2.5 Compare Tool

**Route:** `/compare?items={id1,id2,id3}&type={program|institution}`

**Layout:**
```
┌─────────────────────────────────────────┐
│  Compare (3 items) | Type: Programs ▼   │
├──────────┬──────────┬──────────┬─────────┤
│ Criteria │ Item 1   │ Item 2   │ Item 3  │
├──────────┼──────────┼──────────┼─────────┤
│ Name     │ ...      │ ...      │ ...     │
│ Cost     │ ...      │ ...      │ ...     │
│ Duration │ ...      │ ...      │ ...     │
│ ...      │ ...      │ ...      │ ...     │
└──────────┴──────────┴──────────┴─────────┘
```

**Components:**
```typescript
ComparePage/
├── CompareHeader
│   ├── ItemCount
│   ├── TypeSelector
│   ├── ExportButton (PDF/CSV - premium)
│   └── ShareButton
├── ComparisonTable
│   ├── TableHeader (sticky)
│   │   └── ItemCard[] (removable)
│   ├── TableBody
│   │   ├── CategoryRows (expandable)
│   │   │   ├── BasicInfo
│   │   │   ├── Costs
│   │   │   ├── Requirements
│   │   │   ├── Timeline
│   │   │   ├── Location
│   │   │   └── CareerOutlook
│   │   └── ComparisonCell (color-coded)
│   └── EmptySlots (for < 3 items)
├── AddMoreButton
└── StickyActions
    ├── AIRecommendation (premium)
    └── SaveComparison
```

**State Requirements:**
- Compared items (URL sync + Zustand)
- Comparison type (URL sync)
- Expanded categories (local state)
- Highlight mode (best/worst values)

**Key Features:**
- Side-by-side comparison (max 3)
- Color-coded cells (green=best, red=worst)
- Expandable categories
- Add/remove items dynamically
- Export to PDF/CSV (premium)
- AI-powered recommendation (premium)

**Responsive:**
- Mobile: Swipeable cards (one at a time)
- Tablet: 2-column comparison
- Desktop: 3-column table

### 2.6 Deadlines Calendar

**Route:** `/deadlines`

**Views:**
- Month view (default)
- Week view
- List view
- Timeline view

**Components:**
```typescript
DeadlinesPage/
├── CalendarHeader
│   ├── ViewToggle (month/week/list/timeline)
│   ├── DateNavigator
│   ├── TodayButton
│   └── FilterButton
├── FilterDrawer
│   ├── InstitutionFilter
│   ├── ProgramTypeFilter
│   ├── DeadlineTypeFilter (application/exam/enrollment)
│   └── StateFilter
├── CalendarView
│   ├── MonthView
│   │   └── DeadlineMarker[]
│   ├── WeekView
│   │   └── DeadlineCard[]
│   ├── ListView
│   │   └── DeadlineItem[] (grouped by date)
│   └── TimelineView
│       └── TimelineEvent[]
├── DeadlineDetails (modal/drawer)
│   ├── ProgramInfo
│   ├── Requirements
│   ├── CountdownTimer
│   └── AddToCalendar (.ics export)
└── UpcomingDeadlines (sidebar)
    └── NextDeadlines[] (top 5)
```

**State Requirements:**
- Selected date (URL sync)
- View mode (localStorage)
- Active filters (URL sync)
- Deadlines data (React Query)
- User alerts (Zustand + auth)

**Key Features:**
- Calendar sync (.ics export)
- Push notifications (PWA)
- Email reminders (premium)
- Color-coded by status (open/closing/closed)
- Quick actions (set reminder, bookmark)

### 2.7 User Dashboard

**Route:** `/dashboard` (auth required)

**Layout:**
```typescript
DashboardPage/
├── WelcomeHeader
│   ├── UserAvatar + Name
│   ├── SubscriptionBadge (free/premium)
│   └── QuickActions
├── DashboardTabs
│   ├── Overview
│   │   ├── SavedSearches[]
│   │   ├── Bookmarks[]
│   │   ├── UpcomingDeadlines[]
│   │   └── RecommendedPrograms[] (AI - premium)
│   ├── Applications (future)
│   │   └── ApplicationTracker[]
│   ├── Alerts
│   │   ├── DeadlineAlerts[]
│   │   ├── CostUpdateAlerts[]
│   │   └── NewProgramAlerts[]
│   ├── Comparisons
│   │   └── SavedComparisons[]
│   └── Settings
│       ├── ProfileForm
│       ├── Preferences
│       ├── NotificationSettings
│       └── SubscriptionManagement
└── UpgradeCTA (if free tier)
```

**State Requirements:**
- User profile (Zustand + auth)
- Bookmarks (React Query + Zustand)
- Alerts (React Query)
- Active tab (URL hash)

**Key Features:**
- Personalized recommendations (AI - premium)
- Saved searches with alerts
- Bookmark management
- Application tracking (future)
- Notification preferences

### 2.8 Premium AI Chat Interface

**Route:** `/chat` (premium auth required)

**Layout:**
```
┌─────────────────────────────────────────┐
│  AI Advisor | New Chat ⊕               │
├───────────┬─────────────────────────────┤
│           │  Chat Thread                │
│ History   │  ┌─────────────────────┐   │
│ Sidebar   │  │ User message        │   │
│           │  └─────────────────────┘   │
│ - Chat 1  │  ┌─────────────────────┐   │
│ - Chat 2  │  │ AI response         │   │
│ - Chat 3  │  │ [Data citations]    │   │
│           │  └─────────────────────┘   │
│           │                             │
│           │  Input: Type message...     │
└───────────┴─────────────────────────────┘
```

**Components:**
```typescript
ChatPage/
├── ChatHeader
│   ├── Title
│   ├── NewChatButton
│   └── ExportButton (conversation history)
├── Sidebar (collapsible)
│   ├── ChatHistory[]
│   └── SearchChats
├── ChatThread
│   ├── Messages[]
│   │   ├── UserMessage
│   │   └── AIMessage
│   │       ├── MessageText (markdown)
│   │       ├── DataCitations[]
│   │       ├── SuggestedActions[]
│   │       └── FeedbackButtons (helpful/not helpful)
│   └── WelcomeScreen (empty state)
│       └── SuggestedPrompts[]
├── InputArea
│   ├── TextArea (auto-expand)
│   ├── AttachButton (profile/preferences)
│   ├── SendButton
│   └── TypingIndicator
└── ContextPanel (optional sidebar)
    ├── UserProfile (budget, location, interests)
    ├── ReferencedPrograms[]
    └── ApplicationPlan
```

**State Requirements:**
- Active chat (React Query + Zustand)
- Chat history (React Query)
- Message stream (SSE/WebSocket)
- User context (Zustand)

**Key Features:**
- Real-time streaming responses
- Data source citations
- Conversation history
- Export chat (PDF/Markdown)
- Suggested prompts
- Context-aware responses
- What-if analysis
- Application plan generation

### 2.9 Auth Pages

**Routes:**
- `/login`
- `/register`
- `/forgot-password`
- `/reset-password`
- `/verify-email`

**Components:**
```typescript
AuthPages/
├── LoginPage
│   ├── LoginForm
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── RememberMeCheckbox
│   │   └── SubmitButton
│   ├── SocialLogin (Google, Facebook)
│   ├── ForgotPasswordLink
│   └── RegisterLink
├── RegisterPage
│   ├── RegisterForm
│   │   ├── NameInput
│   │   ├── EmailInput
│   │   ├── PasswordInput
│   │   ├── ConfirmPasswordInput
│   │   ├── UserTypeSelect (student/counselor/institution)
│   │   └── SubmitButton
│   ├── SocialLogin
│   └── LoginLink
├── ForgotPasswordPage
│   └── ForgotPasswordForm
│       ├── EmailInput
│       └── SubmitButton
└── ResetPasswordPage
    └── ResetPasswordForm
        ├── PasswordInput
        ├── ConfirmPasswordInput
        └── SubmitButton
```

**State Requirements:**
- Form values (React Hook Form)
- Auth status (Zustand + Supabase Auth)
- Redirect URL (for post-login navigation)

**Key Features:**
- Social OAuth (Google)
- Email verification
- Password strength indicator
- Form validation (Zod)
- Error handling
- Loading states
- Auto-redirect after login

### 2.10 Admin Portal

**Route:** `/admin/*` (admin auth required)

**Layout:**
```
┌─────────────────────────────────────────┐
│  Logo | Admin Portal | User ▼           │
├───────────┬─────────────────────────────┤
│           │  Page Content               │
│ Sidebar   │                             │
│           │                             │
│ Dashboard │                             │
│ Content   │                             │
│ Sources   │                             │
│ Users     │                             │
│ Analytics │                             │
│ Settings  │                             │
└───────────┴─────────────────────────────┘
```

**Pages:**
```typescript
AdminPortal/
├── Dashboard
│   ├── KPICards (DAU, programs, freshness)
│   ├── RecentActivity
│   ├── DataQualityMetrics
│   └── UserGrowthChart
├── ContentManagement
│   ├── InstitutionsList
│   ├── ProgramsList
│   ├── PendingUpdates (review queue)
│   └── ChangeLog
├── SourceManagement
│   ├── ScraperStatus
│   ├── SourceHealth
│   └── ConfigEditor
├── UserManagement
│   ├── UsersTable
│   ├── RoleAssignment
│   └── ActivityLogs
├── Analytics
│   ├── SearchAnalytics
│   ├── PopularPrograms
│   ├── ConversionFunnels
│   └── PremiumMetrics
└── Settings
    ├── SystemConfig
    ├── EmailTemplates
    └── FeatureFlags
```

**State Requirements:**
- Admin user (auth + role check)
- Dashboard data (React Query)
- Active filters (URL sync)
- Pending approvals count (real-time)

**Key Features:**
- Content review workflow
- Bulk operations
- Audit logs
- Real-time scraper status
- Data quality dashboard
- User activity monitoring

---

## 3. State Management

### 3.1 Zustand Store Structure

```typescript
// src/store/index.ts
import { create } from 'zustand';
import { persist, devtools } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';

// Store slices
import { createAuthSlice } from './slices/authSlice';
import { createCompareSlice } from './slices/compareSlice';
import { createSearchSlice } from './slices/searchSlice';
import { createBookmarkSlice } from './slices/bookmarkSlice';
import { createAlertSlice } from './slices/alertSlice';
import { createUISlice } from './slices/uiSlice';

export const useStore = create(
  devtools(
    persist(
      immer((set, get, api) => ({
        ...createAuthSlice(set, get, api),
        ...createCompareSlice(set, get, api),
        ...createSearchSlice(set, get, api),
        ...createBookmarkSlice(set, get, api),
        ...createAlertSlice(set, get, api),
        ...createUISlice(set, get, api),
      })),
      {
        name: 'admitly-storage',
        partialize: (state) => ({
          // Only persist these slices
          auth: state.auth,
          bookmarks: state.bookmarks,
          ui: state.ui,
        }),
      }
    )
  )
);
```

### 3.2 Store Slices

**Auth Slice:**
```typescript
// src/store/slices/authSlice.ts
export interface AuthSlice {
  user: User | null;
  session: Session | null;
  isAuthenticated: boolean;
  isPremium: boolean;
  setUser: (user: User | null) => void;
  setSession: (session: Session | null) => void;
  logout: () => void;
}

export const createAuthSlice: StateCreator<AuthSlice> = (set) => ({
  user: null,
  session: null,
  isAuthenticated: false,
  isPremium: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setSession: (session) => set({ session }),
  logout: () => set({ user: null, session: null, isAuthenticated: false }),
});
```

**Compare Slice:**
```typescript
export interface CompareSlice {
  items: Array<{ id: string; type: 'program' | 'institution' }>;
  maxItems: 3;
  addItem: (item: { id: string; type: string }) => void;
  removeItem: (id: string) => void;
  clearAll: () => void;
  canAddMore: () => boolean;
}

export const createCompareSlice: StateCreator<CompareSlice> = (set, get) => ({
  items: [],
  maxItems: 3,
  addItem: (item) => set((state) => {
    if (state.items.length >= state.maxItems) return;
    if (state.items.find(i => i.id === item.id)) return;
    state.items.push(item);
  }),
  removeItem: (id) => set((state) => {
    state.items = state.items.filter(i => i.id !== id);
  }),
  clearAll: () => set({ items: [] }),
  canAddMore: () => get().items.length < get().maxItems,
});
```

**Search Slice:**
```typescript
export interface SearchSlice {
  query: string;
  filters: SearchFilters;
  recentSearches: string[];
  savedSearches: SavedSearch[];
  setQuery: (query: string) => void;
  setFilters: (filters: Partial<SearchFilters>) => void;
  resetFilters: () => void;
  addRecentSearch: (query: string) => void;
  saveSearch: (search: SavedSearch) => void;
}
```

**Bookmark Slice:**
```typescript
export interface BookmarkSlice {
  programs: string[];
  institutions: string[];
  addProgram: (id: string) => void;
  removeProgram: (id: string) => void;
  addInstitution: (id: string) => void;
  removeInstitution: (id: string) => void;
  isBookmarked: (id: string, type: 'program' | 'institution') => boolean;
}
```

**UI Slice:**
```typescript
export interface UISlice {
  theme: 'light' | 'dark' | 'system';
  sidebarOpen: boolean;
  viewMode: 'grid' | 'list';
  setTheme: (theme: UISlice['theme']) => void;
  toggleSidebar: () => void;
  setViewMode: (mode: UISlice['viewMode']) => void;
}
```

### 3.3 React Query Hooks

**Query Structure:**
```typescript
// src/hooks/api/useInstitutions.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Query keys
export const institutionKeys = {
  all: ['institutions'] as const,
  lists: () => [...institutionKeys.all, 'list'] as const,
  list: (filters: string) => [...institutionKeys.lists(), filters] as const,
  details: () => [...institutionKeys.all, 'detail'] as const,
  detail: (id: string) => [...institutionKeys.details(), id] as const,
};

// Fetch all institutions
export const useInstitutions = (filters?: InstitutionFilters) => {
  return useQuery({
    queryKey: institutionKeys.list(JSON.stringify(filters)),
    queryFn: () => fetchInstitutions(filters),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes (formerly cacheTime)
  });
};

// Fetch single institution
export const useInstitution = (id: string) => {
  return useQuery({
    queryKey: institutionKeys.detail(id),
    queryFn: () => fetchInstitution(id),
    staleTime: 10 * 60 * 1000, // 10 minutes
    enabled: !!id,
  });
};

// Prefetch institution
export const usePrefetchInstitution = () => {
  const queryClient = useQueryClient();

  return (id: string) => {
    queryClient.prefetchQuery({
      queryKey: institutionKeys.detail(id),
      queryFn: () => fetchInstitution(id),
    });
  };
};
```

**Mutation Hooks:**
```typescript
// src/hooks/api/useBookmarks.ts
export const useAddBookmark = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { itemId: string; type: string }) =>
      addBookmark(data),
    onMutate: async (variables) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['bookmarks'] });
      const previous = queryClient.getQueryData(['bookmarks']);

      queryClient.setQueryData(['bookmarks'], (old: any) => ({
        ...old,
        items: [...old.items, variables],
      }));

      return { previous };
    },
    onError: (err, variables, context) => {
      // Rollback on error
      queryClient.setQueryData(['bookmarks'], context?.previous);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['bookmarks'] });
    },
  });
};
```

### 3.4 Client-Side Caching Strategy

**Cache Policies:**
```typescript
// src/lib/queryClient.ts
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default settings
      staleTime: 5 * 60 * 1000, // 5 minutes
      gcTime: 30 * 60 * 1000, // 30 minutes
      retry: 2,
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
    },
  },
});

// Custom cache times by data type
export const CACHE_TIMES = {
  // Rarely changes
  institutions: {
    staleTime: 60 * 60 * 1000, // 1 hour
    gcTime: 24 * 60 * 60 * 1000, // 24 hours
  },
  // Changes frequently
  deadlines: {
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
  },
  // User-specific
  bookmarks: {
    staleTime: 0, // Always fetch fresh
    gcTime: 5 * 60 * 1000, // 5 minutes
  },
  // Search results
  search: {
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  },
};
```

**Prefetching Strategy:**
```typescript
// Prefetch on hover
const handleMouseEnter = (programId: string) => {
  prefetchProgram(programId);
};

// Prefetch on route change
useEffect(() => {
  router.prefetch('/programs/[slug]');
}, [router]);

// Prefetch related data
useEffect(() => {
  if (institution?.relatedInstitutions) {
    institution.relatedInstitutions.forEach(id => {
      prefetchInstitution(id);
    });
  }
}, [institution]);
```

### 3.5 Optimistic Updates

```typescript
// src/hooks/api/useCompare.ts
export const useToggleCompare = () => {
  const queryClient = useQueryClient();
  const { items, addItem, removeItem } = useStore(state => state.compare);

  return useMutation({
    mutationFn: async (data: { id: string; type: string }) => {
      const isComparing = items.find(i => i.id === data.id);

      if (isComparing) {
        await removeFromCompare(data.id);
      } else {
        await addToCompare(data);
      }

      return { ...data, isComparing: !isComparing };
    },
    onMutate: async (data) => {
      // Update Zustand store immediately
      const isComparing = items.find(i => i.id === data.id);

      if (isComparing) {
        removeItem(data.id);
      } else {
        addItem(data);
      }

      return { isComparing };
    },
    onError: (err, data, context) => {
      // Rollback Zustand state
      if (context?.isComparing) {
        addItem(data);
      } else {
        removeItem(data.id);
      }
    },
  });
};
```

---

## 4. Routing

### 4.1 URL Structure

```typescript
// Public Routes
/                                    // Home
/search                              // Search results
  ?q={query}                         // Search query
  &type={program|institution}        // Entity type
  &state={state}                     // State filter
  &institution_type={type}           // Institution type
  &tuition_min={min}&tuition_max={max}  // Tuition range
  &duration={months}                 // Program duration
  &accreditation={status}            // Accreditation status
  &application_status={status}       // Application status
  &modality={on-campus|online}       // Study mode
  &sort={relevance|cost|deadline}    // Sort option
  &page={number}                     // Pagination

/institutions                        // All institutions
/institutions/{slug}                 // Institution profile
/institutions/{slug}#{tab}           // Deep link to tab

/programs                            // All programs
/programs/{slug}                     // Program profile
/programs/{slug}#{tab}               // Deep link to tab

/compare                             // Comparison tool
  ?items={id1,id2,id3}              // Items to compare
  &type={program|institution}        // Comparison type

/deadlines                           // Deadlines calendar
  ?view={month|week|list|timeline}   // View mode
  &date={yyyy-mm-dd}                 // Selected date
  &type={application|exam|enrollment}  // Deadline type

/about                               // About page
/contact                             // Contact page
/faq                                 // FAQ
/pricing                             // Pricing plans

// Auth Required Routes
/dashboard                           // User dashboard
/dashboard#{tab}                     // Dashboard tab

/chat                                // AI chat (premium)
/chat/{conversation-id}              // Specific conversation

/settings                            // User settings
/settings/profile                    // Profile settings
/settings/preferences                // Preferences
/settings/notifications              // Notification settings
/settings/subscription               // Subscription management

// Auth Routes
/login                               // Login
  ?redirect={path}                   // Post-login redirect
/register                            // Register
/forgot-password                     // Forgot password
/reset-password                      // Reset password
  ?token={token}                     // Reset token
/verify-email                        // Email verification
  ?token={token}                     // Verification token

// Admin Routes
/admin                               // Admin dashboard
/admin/content                       // Content management
/admin/content/institutions          // Institutions list
/admin/content/programs              // Programs list
/admin/content/pending               // Pending reviews
/admin/sources                       // Source management
/admin/users                         // User management
/admin/analytics                     // Analytics
/admin/settings                      // Admin settings

// Static Routes
/privacy                             // Privacy policy
/terms                               // Terms of service
/sitemap.xml                         // Sitemap
/robots.txt                          // Robots.txt
```

### 4.2 Route Configuration

```typescript
// src/routes/index.tsx
import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { AdminRoute } from './AdminRoute';
import { PageLoader } from '@/components/atoms/PageLoader';

// Lazy load pages
const HomePage = lazy(() => import('@/pages/HomePage'));
const SearchResultsPage = lazy(() => import('@/pages/SearchResultsPage'));
const InstitutionProfilePage = lazy(() => import('@/pages/InstitutionProfilePage'));
const ProgramProfilePage = lazy(() => import('@/pages/ProgramProfilePage'));
const ComparePage = lazy(() => import('@/pages/ComparePage'));
const DeadlinesPage = lazy(() => import('@/pages/DeadlinesPage'));
const DashboardPage = lazy(() => import('@/pages/DashboardPage'));
const ChatPage = lazy(() => import('@/pages/ChatPage'));
const LoginPage = lazy(() => import('@/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/pages/RegisterPage'));
const AdminPage = lazy(() => import('@/pages/AdminPage'));

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchResultsPage />} />
          <Route path="/institutions" element={<SearchResultsPage type="institution" />} />
          <Route path="/institutions/:slug" element={<InstitutionProfilePage />} />
          <Route path="/programs" element={<SearchResultsPage type="program" />} />
          <Route path="/programs/:slug" element={<ProgramProfilePage />} />
          <Route path="/compare" element={<ComparePage />} />
          <Route path="/deadlines" element={<DeadlinesPage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/pricing" element={<PricingPage />} />

          {/* Auth routes */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Protected routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>

          {/* Premium routes */}
          <Route element={<ProtectedRoute requirePremium />}>
            <Route path="/chat" element={<ChatPage />} />
            <Route path="/chat/:conversationId" element={<ChatPage />} />
          </Route>

          {/* Admin routes */}
          <Route element={<AdminRoute />}>
            <Route path="/admin/*" element={<AdminPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
```

### 4.3 Protected Routes

```typescript
// src/routes/ProtectedRoute.tsx
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useStore } from '@/store';

interface ProtectedRouteProps {
  requirePremium?: boolean;
}

export const ProtectedRoute = ({ requirePremium = false }: ProtectedRouteProps) => {
  const location = useLocation();
  const { isAuthenticated, isPremium } = useStore(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requirePremium && !isPremium) {
    return <Navigate to="/pricing" state={{ from: location }} replace />;
  }

  return <Outlet />;
};

// Admin route guard
export const AdminRoute = () => {
  const { user, isAuthenticated } = useStore(state => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (user?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
```

### 4.4 Dynamic Routes

```typescript
// src/pages/InstitutionProfilePage.tsx
import { useParams, useNavigate } from 'react-router-dom';
import { useInstitution } from '@/hooks/api/useInstitutions';

export const InstitutionProfilePage = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data: institution, isLoading, error } = useInstitution(slug!);

  if (error) {
    navigate('/404', { replace: true });
  }

  // ...
};
```

### 4.5 Deep Linking Strategy

```typescript
// Hash-based tab navigation
const handleTabChange = (tab: string) => {
  window.location.hash = tab;
};

// Listen to hash changes
useEffect(() => {
  const handleHashChange = () => {
    const hash = window.location.hash.replace('#', '');
    setActiveTab(hash || 'overview');
  };

  window.addEventListener('hashchange', handleHashChange);
  handleHashChange(); // Initial load

  return () => window.removeEventListener('hashchange', handleHashChange);
}, []);

// URL state synchronization
import { useSearchParams } from 'react-router-dom';

const [searchParams, setSearchParams] = useSearchParams();

const updateFilters = (newFilters: Partial<SearchFilters>) => {
  const params = new URLSearchParams(searchParams);

  Object.entries(newFilters).forEach(([key, value]) => {
    if (value) {
      params.set(key, String(value));
    } else {
      params.delete(key);
    }
  });

  setSearchParams(params);
};
```

---

## 5. PWA Implementation

### 5.1 Service Worker Strategy

**Workbox Configuration:**
```javascript
// public/service-worker.js
import { precacheAndRoute } from 'workbox-precaching';
import { registerRoute } from 'workbox-routing';
import { StaleWhileRevalidate, CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';
import { CacheableResponsePlugin } from 'workbox-cacheable-response';

// Precache build assets
precacheAndRoute(self.__WB_MANIFEST);

// Cache API responses
registerRoute(
  ({ url }) => url.pathname.startsWith('/api/'),
  new NetworkFirst({
    cacheName: 'api-cache',
    plugins: [
      new CacheableResponsePlugin({
        statuses: [0, 200],
      }),
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 5 * 60, // 5 minutes
      }),
    ],
  })
);

// Cache images
registerRoute(
  ({ request }) => request.destination === 'image',
  new CacheFirst({
    cacheName: 'image-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 30 * 24 * 60 * 60, // 30 days
      }),
    ],
  })
);

// Cache static assets
registerRoute(
  ({ request }) =>
    request.destination === 'style' ||
    request.destination === 'script' ||
    request.destination === 'font',
  new StaleWhileRevalidate({
    cacheName: 'static-cache',
  })
);

// Background sync for bookmarks/alerts
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-bookmarks') {
    event.waitUntil(syncBookmarks());
  }
});

// Push notifications
self.addEventListener('push', (event) => {
  const data = event.data.json();

  event.waitUntil(
    self.registration.showNotification(data.title, {
      body: data.body,
      icon: '/icon-192.png',
      badge: '/badge-72.png',
      data: data.url,
    })
  );
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow(event.notification.data)
  );
});
```

### 5.2 Offline Capabilities

**Offline Page:**
```typescript
// src/pages/OfflinePage.tsx
export const OfflinePage = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) {
    window.location.reload();
  }

  return (
    <div className="offline-page">
      <h1>You're Offline</h1>
      <p>Some features may be limited</p>
      {/* Show cached bookmarks, recent searches */}
    </div>
  );
};
```

**Offline Indicator:**
```typescript
// src/components/molecules/OfflineIndicator.tsx
export const OfflineIndicator = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="offline-indicator">
      <Icon name="wifi-off" />
      <span>You're offline</span>
    </div>
  );
};
```

### 5.3 App Manifest

```json
// public/manifest.json
{
  "name": "Admitly - Nigeria Student Data Services",
  "short_name": "Admitly",
  "description": "Discover, compare, and plan educational paths across Nigerian institutions",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#0066cc",
  "orientation": "portrait-primary",
  "scope": "/",
  "icons": [
    {
      "src": "/icon-72.png",
      "sizes": "72x72",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-96.png",
      "sizes": "96x96",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-128.png",
      "sizes": "128x128",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-144.png",
      "sizes": "144x144",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-152.png",
      "sizes": "152x152",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icon-384.png",
      "sizes": "384x384",
      "type": "image/png",
      "purpose": "any"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "shortcuts": [
    {
      "name": "Search Programs",
      "short_name": "Search",
      "description": "Search for programs and institutions",
      "url": "/search",
      "icons": [{ "src": "/shortcut-search.png", "sizes": "96x96" }]
    },
    {
      "name": "Deadlines",
      "short_name": "Deadlines",
      "description": "View application deadlines",
      "url": "/deadlines",
      "icons": [{ "src": "/shortcut-deadlines.png", "sizes": "96x96" }]
    },
    {
      "name": "Dashboard",
      "short_name": "Dashboard",
      "description": "Go to your dashboard",
      "url": "/dashboard",
      "icons": [{ "src": "/shortcut-dashboard.png", "sizes": "96x96" }]
    }
  ],
  "categories": ["education", "reference"],
  "screenshots": [
    {
      "src": "/screenshot-mobile-1.png",
      "sizes": "540x720",
      "type": "image/png",
      "form_factor": "narrow"
    },
    {
      "src": "/screenshot-desktop-1.png",
      "sizes": "1280x720",
      "type": "image/png",
      "form_factor": "wide"
    }
  ]
}
```

### 5.4 Install Prompts

```typescript
// src/hooks/usePWAInstall.ts
import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const usePWAInstall = () => {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
    };

    window.addEventListener('beforeinstallprompt', handler);

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }

    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const promptInstall = async () => {
    if (!installPrompt) return;

    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;

    if (outcome === 'accepted') {
      setIsInstalled(true);
    }

    setInstallPrompt(null);
  };

  return {
    canInstall: !!installPrompt,
    isInstalled,
    promptInstall,
  };
};

// src/components/molecules/InstallPrompt.tsx
export const InstallPrompt = () => {
  const { canInstall, promptInstall } = usePWAInstall();
  const [dismissed, setDismissed] = useState(false);

  if (!canInstall || dismissed) return null;

  return (
    <div className="install-prompt">
      <p>Install Admitly for quick access</p>
      <Button onClick={promptInstall}>Install</Button>
      <Button variant="ghost" onClick={() => setDismissed(true)}>
        Dismiss
      </Button>
    </div>
  );
};
```

---

## 6. Performance Optimization

### 6.1 Code Splitting Strategy

```typescript
// Route-based splitting (already implemented with lazy)
const HomePage = lazy(() => import('@/pages/HomePage'));

// Component-based splitting
const HeavyChart = lazy(() => import('@/components/organisms/HeavyChart'));

// Conditional splitting
const AdminPanel = lazy(() => {
  return import('@/components/AdminPanel');
});

// Named exports
const { ProgramCard } = lazy(() =>
  import('@/components/molecules/ProgramCard').then(module => ({
    default: module.ProgramCard
  }))
);

// Prefetch on interaction
import { prefetch } from 'react-lazy-with-preload';

const ProgramProfilePage = prefetch(() => import('@/pages/ProgramProfilePage'));

// Usage
<Link
  to="/programs/123"
  onMouseEnter={() => ProgramProfilePage.preload()}
>
```

### 6.2 Lazy Loading

**Images:**
```typescript
// src/components/atoms/LazyImage.tsx
import { useState, useEffect, useRef } from 'react';

interface LazyImageProps {
  src: string;
  alt: string;
  placeholder?: string;
  className?: string;
}

export const LazyImage = ({
  src,
  alt,
  placeholder = '/placeholder.svg',
  className
}: LazyImageProps) => {
  const [imageSrc, setImageSrc] = useState(placeholder);
  const [isLoaded, setIsLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setImageSrc(src);
            observer.disconnect();
          }
        });
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, [src]);

  return (
    <img
      ref={imgRef}
      src={imageSrc}
      alt={alt}
      className={cn(className, !isLoaded && 'blur-sm')}
      onLoad={() => setIsLoaded(true)}
    />
  );
};
```

**Components:**
```typescript
// Virtual scrolling for lists
import { useVirtualizer } from '@tanstack/react-virtual';

export const ProgramList = ({ programs }: { programs: Program[] }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: programs.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 120,
    overscan: 5,
  });

  return (
    <div ref={parentRef} className="h-screen overflow-auto">
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: 'relative',
        }}
      >
        {virtualizer.getVirtualItems().map((virtualRow) => (
          <div
            key={virtualRow.index}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              transform: `translateY(${virtualRow.start}px)`,
            }}
          >
            <ProgramCard program={programs[virtualRow.index]} />
          </div>
        ))}
      </div>
    </div>
  );
};
```

### 6.3 Image Optimization

```typescript
// next.config.js (if using Next.js)
module.exports = {
  images: {
    domains: ['supabase.co', 'cdn.admitly.com.ng'],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
};

// Vite config
import { defineConfig } from 'vite';
import imagemin from 'vite-plugin-imagemin';

export default defineConfig({
  plugins: [
    imagemin({
      gifsicle: { optimizationLevel: 7 },
      optipng: { optimizationLevel: 7 },
      mozjpeg: { quality: 80 },
      pngquant: { quality: [0.8, 0.9], speed: 4 },
      svgo: {
        plugins: [
          { name: 'removeViewBox', active: false },
          { name: 'removeEmptyAttrs', active: false },
        ],
      },
    }),
  ],
});

// Responsive images component
export const ResponsiveImage = ({ src, alt }: { src: string; alt: string }) => {
  return (
    <picture>
      <source
        type="image/avif"
        srcSet={`${src}?format=avif&w=400 400w, ${src}?format=avif&w=800 800w`}
      />
      <source
        type="image/webp"
        srcSet={`${src}?format=webp&w=400 400w, ${src}?format=webp&w=800 800w`}
      />
      <img
        src={`${src}?w=800`}
        alt={alt}
        loading="lazy"
        decoding="async"
      />
    </picture>
  );
};
```

### 6.4 Bundle Size Targets

**Targets:**
- Initial bundle: < 200KB (gzipped)
- Total JavaScript: < 500KB (gzipped)
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3.5s
- Lighthouse score: > 90

**Bundle Analysis:**
```bash
# Vite
npm run build -- --mode analyze

# Webpack
npm install --save-dev webpack-bundle-analyzer
```

```javascript
// vite.config.ts
import { visualizer } from 'rollup-plugin-visualizer';

export default defineConfig({
  plugins: [
    visualizer({
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
  ],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom', 'react-router-dom'],
          'ui-vendor': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
          'query-vendor': ['@tanstack/react-query', 'zustand'],
        },
      },
    },
  },
});
```

**Tree Shaking:**
```typescript
// Import only what you need
import { debounce } from 'lodash-es'; // ✓
import _ from 'lodash'; // ✗

// Use side-effect free imports
import 'some-package/dist/esm/module'; // ✓
import 'some-package'; // ✗ (might include side effects)
```

---

## 7. Responsive Design

### 7.1 Breakpoints

```typescript
// src/lib/breakpoints.ts
export const breakpoints = {
  xs: '320px',   // Small mobile
  sm: '640px',   // Mobile
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px', // Extra large
};

// Tailwind config
module.exports = {
  theme: {
    screens: {
      xs: '320px',
      sm: '640px',
      md: '768px',
      lg: '1024px',
      xl: '1280px',
      '2xl': '1536px',
    },
  },
};

// React hook for responsive behavior
import { useMediaQuery } from '@/hooks/useMediaQuery';

export const useResponsive = () => {
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');

  return { isMobile, isTablet, isDesktop };
};
```

### 7.2 Mobile-First Approach

```css
/* Base styles - mobile */
.program-card {
  @apply flex flex-col p-4 gap-3;
}

/* Tablet and up */
@media (min-width: 768px) {
  .program-card {
    @apply p-6 gap-4;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .program-card {
    @apply flex-row items-center gap-6;
  }
}

/* Tailwind utility classes */
<div className="
  flex flex-col gap-3 p-4
  md:gap-4 md:p-6
  lg:flex-row lg:items-center lg:gap-6
">
```

### 7.3 Touch-Friendly UI

```typescript
// Minimum touch target size: 44x44px (iOS), 48x48px (Android)
<button className="min-h-[48px] min-w-[48px] p-3">
  <Icon />
</button>

// Touch gestures
import { useSwipeable } from 'react-swipeable';

export const SwipeableCard = ({ onSwipeLeft, onSwipeRight }) => {
  const handlers = useSwipeable({
    onSwipedLeft: onSwipeLeft,
    onSwipedRight: onSwipeRight,
    trackMouse: true, // Enable mouse for testing
  });

  return <div {...handlers}>Swipeable content</div>;
};

// Prevent accidental clicks
const [isPressing, setIsPressing] = useState(false);

<button
  onTouchStart={() => setIsPressing(true)}
  onTouchEnd={() => {
    setTimeout(() => setIsPressing(false), 100);
  }}
  onClick={(e) => {
    if (isPressing) return;
    handleClick();
  }}
>
```

### 7.4 Responsive Typography

```css
/* tailwind.config.js */
module.exports = {
  theme: {
    fontSize: {
      xs: ['0.75rem', { lineHeight: '1rem' }],
      sm: ['0.875rem', { lineHeight: '1.25rem' }],
      base: ['1rem', { lineHeight: '1.5rem' }],
      lg: ['1.125rem', { lineHeight: '1.75rem' }],
      xl: ['1.25rem', { lineHeight: '1.75rem' }],
      '2xl': ['1.5rem', { lineHeight: '2rem' }],
      '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
      '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      '5xl': ['3rem', { lineHeight: '1' }],
    },
  },
};

/* Fluid typography */
.heading {
  font-size: clamp(1.5rem, 5vw, 3rem);
}

/* Usage */
<h1 className="text-2xl md:text-4xl lg:text-5xl font-bold">
  Welcome to Admitly
</h1>
```

---

## 8. Accessibility

### 8.1 WCAG 2.1 AA Compliance

**Requirements:**
- Color contrast ratio: 4.5:1 (normal text), 3:1 (large text)
- Keyboard navigation support
- Screen reader compatibility
- Focus indicators
- Alternative text for images
- Semantic HTML
- ARIA labels and roles

### 8.2 Keyboard Navigation

```typescript
// Keyboard shortcuts
import { useEffect } from 'react';

export const useKeyboardShortcuts = () => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd/Ctrl + K for search
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        document.getElementById('search-input')?.focus();
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        // Close modal logic
      }

      // Arrow keys for navigation
      if (e.key === 'ArrowDown') {
        // Navigate down
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
};

// Focus trap for modals
import { FocusTrap } from '@headlessui/react';

export const Modal = ({ children, isOpen }) => {
  return (
    <FocusTrap active={isOpen}>
      <div role="dialog" aria-modal="true">
        {children}
      </div>
    </FocusTrap>
  );
};

// Skip to main content
<a href="#main-content" className="sr-only focus:not-sr-only">
  Skip to main content
</a>
```

### 8.3 Screen Reader Support

```typescript
// ARIA labels
<button aria-label="Close dialog">
  <Icon name="x" aria-hidden="true" />
</button>

// Live regions for dynamic content
<div aria-live="polite" aria-atomic="true">
  {searchResults.length} results found
</div>

// Announcements
const [announcement, setAnnouncement] = useState('');

const announceToScreenReader = (message: string) => {
  setAnnouncement(message);
  setTimeout(() => setAnnouncement(''), 1000);
};

<div role="status" aria-live="polite" className="sr-only">
  {announcement}
</div>

// Form validation
<input
  aria-invalid={!!errors.email}
  aria-describedby={errors.email ? 'email-error' : undefined}
/>
{errors.email && (
  <span id="email-error" role="alert">
    {errors.email.message}
  </span>
)}

// Loading states
<button disabled={isLoading} aria-busy={isLoading}>
  {isLoading ? 'Loading...' : 'Submit'}
</button>
```

### 8.4 Color Contrast Requirements

```typescript
// src/lib/colors.ts
export const colors = {
  // Primary (contrast ratio: 4.5:1)
  primary: {
    DEFAULT: '#0066cc', // on white
    foreground: '#ffffff',
  },

  // Text colors
  text: {
    primary: '#1a1a1a',    // 16:1 on white
    secondary: '#4d4d4d',  // 9:1 on white
    tertiary: '#737373',   // 4.5:1 on white
  },

  // Status colors
  success: '#047857',  // 4.5:1 on white
  warning: '#d97706',  // 4.5:1 on white
  error: '#dc2626',    // 4.5:1 on white
  info: '#0284c7',     // 4.5:1 on white
};

// Check contrast in design
import { contrast } from 'wcag-contrast';

const ratio = contrast('#0066cc', '#ffffff'); // 4.54:1 ✓
```

### 8.5 Semantic HTML

```typescript
// Use semantic elements
<header>
  <nav aria-label="Main navigation">
    <ul>
      <li><a href="/">Home</a></li>
    </ul>
  </nav>
</header>

<main id="main-content">
  <article>
    <h1>Program Name</h1>
    <section aria-labelledby="overview-heading">
      <h2 id="overview-heading">Overview</h2>
      {/* content */}
    </section>
  </article>
</main>

<aside aria-label="Related programs">
  {/* sidebar content */}
</aside>

<footer>
  {/* footer content */}
</footer>

// Form structure
<form>
  <fieldset>
    <legend>Personal Information</legend>
    <label htmlFor="name">Name</label>
    <input id="name" type="text" />
  </fieldset>
</form>

// Tables
<table>
  <caption>Tuition Comparison</caption>
  <thead>
    <tr>
      <th scope="col">Program</th>
      <th scope="col">Cost</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Program 1</td>
      <td>₦500,000</td>
    </tr>
  </tbody>
</table>
```

---

## 9. Styling System

### 9.1 Tailwind Configuration

```javascript
// tailwind.config.js
const { fontFamily } = require('tailwindcss/defaultTheme');

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ['class'],
  content: [
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: {
        DEFAULT: '1rem',
        sm: '2rem',
        lg: '4rem',
        xl: '5rem',
        '2xl': '6rem',
      },
      screens: {
        '2xl': '1400px',
      },
    },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        destructive: {
          DEFAULT: 'hsl(var(--destructive))',
          foreground: 'hsl(var(--destructive-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        popover: {
          DEFAULT: 'hsl(var(--popover))',
          foreground: 'hsl(var(--popover-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      fontFamily: {
        sans: ['Inter var', ...fontFamily.sans],
        heading: ['Cal Sans', ...fontFamily.sans],
      },
      keyframes: {
        'accordion-down': {
          from: { height: 0 },
          to: { height: 'var(--radix-accordion-content-height)' },
        },
        'accordion-up': {
          from: { height: 'var(--radix-accordion-content-height)' },
          to: { height: 0 },
        },
        'fade-in': {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
        'slide-in': {
          from: { transform: 'translateY(20px)', opacity: 0 },
          to: { transform: 'translateY(0)', opacity: 1 },
        },
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out',
        'fade-in': 'fade-in 0.3s ease-in-out',
        'slide-in': 'slide-in 0.4s ease-out',
      },
    },
  },
  plugins: [
    require('tailwindcss-animate'),
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
  ],
};
```

### 9.2 Theme Tokens

```css
/* src/styles/globals.css */
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Colors */
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;

    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;

    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;

    --primary: 221.2 83.2% 53.3%;
    --primary-foreground: 210 40% 98%;

    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;

    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;

    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;

    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;

    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 221.2 83.2% 53.3%;

    --radius: 0.5rem;

    /* Spacing */
    --spacing-xs: 0.25rem;
    --spacing-sm: 0.5rem;
    --spacing-md: 1rem;
    --spacing-lg: 1.5rem;
    --spacing-xl: 2rem;
    --spacing-2xl: 3rem;

    /* Typography */
    --font-size-xs: 0.75rem;
    --font-size-sm: 0.875rem;
    --font-size-base: 1rem;
    --font-size-lg: 1.125rem;
    --font-size-xl: 1.25rem;
    --font-size-2xl: 1.5rem;
    --font-size-3xl: 1.875rem;
    --font-size-4xl: 2.25rem;

    /* Shadows */
    --shadow-sm: 0 1px 2px 0 rgb(0 0 0 / 0.05);
    --shadow-md: 0 4px 6px -1px rgb(0 0 0 / 0.1);
    --shadow-lg: 0 10px 15px -3px rgb(0 0 0 / 0.1);
    --shadow-xl: 0 20px 25px -5px rgb(0 0 0 / 0.1);
  }

  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;

    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;

    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;

    --primary: 217.2 91.2% 59.8%;
    --primary-foreground: 222.2 47.4% 11.2%;

    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;

    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;

    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;

    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;

    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 224.3 76.3% 48%;
  }
}

@layer base {
  * {
    @apply border-border;
  }

  body {
    @apply bg-background text-foreground;
    font-feature-settings: 'rlig' 1, 'calt' 1;
  }
}

@layer utilities {
  .text-balance {
    text-wrap: balance;
  }
}
```

### 9.3 Dark Mode Support

```typescript
// src/hooks/useTheme.ts
import { useEffect } from 'react';
import { useStore } from '@/store';

export const useTheme = () => {
  const { theme, setTheme } = useStore(state => state.ui);

  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  return { theme, setTheme };
};

// Theme toggle component
export const ThemeToggle = () => {
  const { theme, setTheme } = useTheme();

  return (
    <button
      onClick={() => {
        const next = theme === 'light' ? 'dark' : 'light';
        setTheme(next);
      }}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  );
};
```

### 9.4 Component Variants

```typescript
// src/components/atoms/Button/Button.tsx
import { cva, type VariantProps } from 'class-variance-authority';

const buttonVariants = cva(
  'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
  {
    variants: {
      variant: {
        primary: 'bg-primary text-primary-foreground hover:bg-primary/90',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        danger: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
      },
      size: {
        sm: 'h-9 px-3 text-xs',
        md: 'h-10 px-4 py-2',
        lg: 'h-11 px-8 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  isLoading?: boolean;
}

export const Button = ({
  variant,
  size,
  isLoading,
  className,
  children,
  ...props
}: ButtonProps) => {
  return (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      disabled={isLoading}
      {...props}
    >
      {isLoading && <Spinner className="mr-2" />}
      {children}
    </button>
  );
};
```

---

## 10. Form Handling

### 10.1 Form Validation with Zod

```typescript
// src/lib/validations/auth.ts
import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  rememberMe: z.boolean().optional(),
});

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
  confirmPassword: z.string(),
  userType: z.enum(['student', 'counselor', 'institution']),
  acceptTerms: z.boolean().refine(val => val === true, {
    message: 'You must accept the terms and conditions',
  }),
}).refine(data => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export const searchSchema = z.object({
  query: z.string().min(2, 'Search query must be at least 2 characters'),
  type: z.enum(['program', 'institution']).optional(),
  state: z.string().optional(),
  institutionType: z.string().optional(),
  tuitionMin: z.number().min(0).optional(),
  tuitionMax: z.number().min(0).optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type RegisterInput = z.infer<typeof registerSchema>;
export type SearchInput = z.infer<typeof searchSchema>;
```

### 10.2 Error Handling

```typescript
// src/components/molecules/FormField.tsx
import { useFormContext } from 'react-hook-form';

interface FormFieldProps {
  name: string;
  label: string;
  type?: string;
  placeholder?: string;
  description?: string;
}

export const FormField = ({
  name,
  label,
  type = 'text',
  placeholder,
  description,
}: FormFieldProps) => {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  const error = errors[name];

  return (
    <div className="space-y-2">
      <label htmlFor={name} className="text-sm font-medium">
        {label}
      </label>

      <input
        id={name}
        type={type}
        placeholder={placeholder}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : description ? `${name}-description` : undefined}
        className={cn(
          'input',
          error && 'border-destructive focus:ring-destructive'
        )}
        {...register(name)}
      />

      {description && !error && (
        <p id={`${name}-description`} className="text-sm text-muted-foreground">
          {description}
        </p>
      )}

      {error && (
        <p id={`${name}-error`} role="alert" className="text-sm text-destructive">
          {error.message as string}
        </p>
      )}
    </div>
  );
};
```

### 10.3 Loading States

```typescript
// src/components/organisms/LoginForm.tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput } from '@/lib/validations/auth';
import { useLogin } from '@/hooks/api/useAuth';

export const LoginForm = () => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const { mutate: login, isPending } = useLogin();

  const onSubmit = (data: LoginInput) => {
    login(data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        name="email"
        label="Email"
        type="email"
        placeholder="you@example.com"
      />

      <FormField
        name="password"
        label="Password"
        type="password"
        placeholder="••••••••"
      />

      <div className="flex items-center">
        <input
          id="rememberMe"
          type="checkbox"
          {...register('rememberMe')}
        />
        <label htmlFor="rememberMe" className="ml-2 text-sm">
          Remember me
        </label>
      </div>

      <Button
        type="submit"
        isLoading={isPending || isSubmitting}
        className="w-full"
      >
        {isPending ? 'Signing in...' : 'Sign in'}
      </Button>
    </form>
  );
};
```

### 10.4 Success Feedback

```typescript
// src/components/organisms/RegisterForm.tsx
import { toast } from 'sonner';

export const RegisterForm = () => {
  const navigate = useNavigate();
  const { mutate: register, isPending } = useRegister({
    onSuccess: () => {
      toast.success('Account created successfully!', {
        description: 'Please check your email to verify your account.',
      });
      navigate('/verify-email');
    },
    onError: (error) => {
      toast.error('Registration failed', {
        description: error.message || 'Please try again.',
      });
    },
  });

  // ... rest of form
};

// Global toast provider
// src/App.tsx
import { Toaster } from 'sonner';

export const App = () => {
  return (
    <>
      <AppRoutes />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
};
```

### 10.5 Form Patterns

**Multi-step Form:**
```typescript
// src/components/organisms/MultiStepForm.tsx
export const MultiStepForm = () => {
  const [step, setStep] = useState(1);
  const totalSteps = 3;

  const methods = useForm();

  const onSubmit = (data: any) => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else {
      // Final submission
      submitForm(data);
    }
  };

  return (
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit)}>
        {/* Progress indicator */}
        <div className="flex justify-between mb-8">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-2 flex-1 mx-1 rounded',
                i < step ? 'bg-primary' : 'bg-muted'
              )}
            />
          ))}
        </div>

        {/* Step content */}
        {step === 1 && <Step1 />}
        {step === 2 && <Step2 />}
        {step === 3 && <Step3 />}

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          {step > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep(step - 1)}
            >
              Back
            </Button>
          )}

          <Button type="submit">
            {step === totalSteps ? 'Submit' : 'Next'}
          </Button>
        </div>
      </form>
    </FormProvider>
  );
};
```

**Search Form with Debouncing:**
```typescript
// src/hooks/useDebouncedSearch.ts
import { useState, useEffect } from 'react';
import { useDebounce } from 'use-debounce';

export const useDebouncedSearch = (initialQuery = '', delay = 300) => {
  const [query, setQuery] = useState(initialQuery);
  const [debouncedQuery] = useDebounce(query, delay);

  return { query, setQuery, debouncedQuery };
};

// Usage
export const SearchBar = () => {
  const { query, setQuery, debouncedQuery } = useDebouncedSearch();

  const { data: results, isLoading } = useSearch(debouncedQuery, {
    enabled: debouncedQuery.length >= 2,
  });

  return (
    <div>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search programs..."
      />
      {isLoading && <Spinner />}
      {results && <SearchResults results={results} />}
    </div>
  );
};
```

---

## Implementation Checklist

### Phase 1: Foundation (Weeks 1-2)
- [ ] Set up project with Vite + React + TypeScript
- [ ] Configure Tailwind CSS + shadcn/ui
- [ ] Set up Zustand store structure
- [ ] Configure React Query
- [ ] Implement routing with React Router
- [ ] Create base component library (atoms)
- [ ] Set up Supabase client
- [ ] Implement authentication flow

### Phase 2: Core Pages (Weeks 3-4)
- [ ] Build Home page
- [ ] Build Search Results page
- [ ] Build Institution Profile page
- [ ] Build Program Profile page
- [ ] Implement comparison tool
- [ ] Build deadlines calendar
- [ ] Create user dashboard

### Phase 3: Premium Features (Week 5)
- [ ] Implement AI chat interface
- [ ] Build premium subscription flow
- [ ] Integrate payment (Paystack)
- [ ] Create admin portal

### Phase 4: PWA & Optimization (Week 6)
- [ ] Implement service worker
- [ ] Configure PWA manifest
- [ ] Add offline support
- [ ] Optimize bundle size
- [ ] Implement lazy loading
- [ ] Add image optimization

### Phase 5: Mobile & Polish (Week 7-8)
- [ ] Build React Native app
- [ ] Ensure responsive design
- [ ] Accessibility audit
- [ ] Performance testing
- [ ] Cross-browser testing
- [ ] User testing & feedback

### Phase 6: Launch Prep (Week 8)
- [ ] SEO optimization
- [ ] Analytics integration
- [ ] Error tracking (Sentry)
- [ ] Documentation
- [ ] Deployment to Render (static site)
- [ ] App store submission (mobile)

---

## File Structure

```
admitly/
├── public/
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   ├── service-worker.js
│   └── icons/
├── src/
│   ├── components/
│   │   ├── atoms/
│   │   ├── molecules/
│   │   ├── organisms/
│   │   ├── templates/
│   │   └── pages/
│   ├── hooks/
│   │   ├── api/
│   │   ├── useMediaQuery.ts
│   │   ├── useDebounce.ts
│   │   └── useTheme.ts
│   ├── lib/
│   │   ├── supabase.ts
│   │   ├── queryClient.ts
│   │   ├── utils.ts
│   │   └── validations/
│   ├── routes/
│   │   ├── index.tsx
│   │   ├── ProtectedRoute.tsx
│   │   └── AdminRoute.tsx
│   ├── store/
│   │   ├── index.ts
│   │   └── slices/
│   ├── styles/
│   │   └── globals.css
│   ├── types/
│   │   ├── models.ts
│   │   └── api.ts
│   ├── App.tsx
│   └── main.tsx
├── .env.example
├── index.html
├── package.json
├── tailwind.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## Conclusion

This frontend specification provides a comprehensive blueprint for building the Nigeria Student Data Services Platform. It covers all aspects from component architecture to performance optimization, ensuring a high-quality, accessible, and performant user experience across web and mobile platforms.

**Key Principles:**
1. **Mobile-first responsive design** with PWA capabilities
2. **Component-driven architecture** using Atomic Design
3. **Type-safe development** with TypeScript
4. **Accessible by default** following WCAG 2.1 AA
5. **Performance-optimized** with code splitting and lazy loading
6. **Scalable state management** with Zustand + React Query
7. **Consistent styling** with Tailwind CSS and design tokens

**Next Steps:**
1. Review and approve this specification
2. Set up development environment
3. Begin Phase 1 implementation
4. Establish design system in Figma
5. Create initial prototypes for user testing

This specification should be treated as a living document and updated as requirements evolve and new insights are gained during development.
