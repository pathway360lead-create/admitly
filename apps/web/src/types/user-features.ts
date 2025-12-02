/**
 * @file Type definitions for user-centric features like bookmarks, saved searches, and user profiles.
 * @description These types are designed to match the backend Pydantic schemas EXACTLY.
 * @version 1.0
 * @task TASK-003
 */

// =================================================================
// General & Common Types
// =================================================================

/**
 * Represents the type of entity that can be bookmarked or interacted with.
 */
export type EntityType = 'program' | 'institution';

/**
 * Standard pagination response structure.
 */
export interface Pagination {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

// =================================================================
// Bookmarks
// =================================================================

/**
 * Schema for creating a new bookmark.
 * @see services/api/schemas/bookmarks.py -> BookmarkCreate
 */
export interface BookmarkCreate {
  entity_type: EntityType;
  entity_id: string; // UUID
  notes?: string;
}

/**
 * Schema for updating an existing bookmark.
 * @see services/api/schemas/bookmarks.py -> BookmarkUpdate
 */
export interface BookmarkUpdate {
  notes?: string;
}

/**
 * The core bookmark object returned from the API.
 * @see services/api/schemas/bookmarks.py -> BookmarkResponse
 */
export interface Bookmark {
  id: string; // UUID
  entity_type: EntityType;
  entity_id: string; // UUID
  notes?: string;
  created_at: string; // ISO 8601 date string
}

/**
 * A bookmark object that includes the full data of the bookmarked entity.
 * Used in list responses.
 */
export interface BookmarkWithEntity extends Bookmark {
  // These are simplified versions for the frontend.
  // Replace with actual Program and Institution types when available.
  entity?: {
    id: string;
    name: string;
    slug: string;
    state?: string;
    institution?: {
      id: string;
      name: string;
      slug: string;
      state: string;
    };
  };
}

/**
 * Response for a paginated list of bookmarks.
 * @see services/api/schemas/bookmarks.py -> BookmarkListResponse
 */
export interface BookmarkListResponse {
  data: BookmarkWithEntity[];
  pagination: Pagination;
}

/**
 * Response from checking if entities are bookmarked.
 * The key is the entity_id (UUID string).
 * @see services/api/schemas/bookmarks.py -> BookmarkCheckResponse
 */
export interface BookmarkCheckResponse {
  bookmarks: Record<string, {
    is_bookmarked: boolean;
    bookmark_id: string | null; // UUID or null
  }>;
}

// =================================================================
// Saved Searches
// =================================================================

/**
 * Valid filter keys for a saved search.
 * @see services/api/schemas/saved_searches.py -> SavedSearchCreate
 */
export interface SavedSearchFilters {
  state?: string[];
  type?: string[];
  degree_type?: string[];
  field_of_study?: string[];
  mode?: string[];
  min_tuition?: number;
  max_tuition?: number;
  min_cutoff?: number;
  max_cutoff?: number;
}

/**
 * Schema for creating a new saved search.
 * @see services/api/schemas/saved_searches.py -> SavedSearchCreate
 */
export interface SavedSearchCreate {
  name: string;
  query: string;
  filters?: SavedSearchFilters;
  notify_on_new_results?: boolean;
}

/**
 * Schema for updating an existing saved search.
 * @see services/api/schemas/saved_searches.py -> SavedSearchUpdate
 */
export interface SavedSearchUpdate {
  name?: string;
  filters?: SavedSearchFilters;
  notify_on_new_results?: boolean;
}

/**
 * The core saved search object returned from the API.
 * @see services/api/schemas/saved_searches.py -> SavedSearchResponse
 */
export interface SavedSearch {
  id: string; // UUID
  name: string;
  query: string;
  filters: SavedSearchFilters;
  notify_on_new_results: boolean;
  last_notified_at?: string; // ISO 8601 date string
  execution_count: number;
  last_executed_at?: string; // ISO 8601 date string
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Response for a paginated list of saved searches.
 * @see services/api/schemas/saved_searches.py -> SavedSearchListResponse
 */
export interface SavedSearchListResponse {
  data: SavedSearch[];
  pagination: Pagination;
}

// =================================================================
// User Profile
// =================================================================

/**
 * User's notification preferences.
 */
export interface UserNotificationPreferences {
  email?: boolean;
  push?: boolean;
  deadline_alerts?: boolean;
  new_programs?: boolean;
  cost_changes?: boolean;
}

/**
 * User's default search preferences.
 */
export interface UserSearchDefaults {
  state?: string;
  degree_type?: string;
  sort_by?: string;
}

/**
 * The user's preferences object.
 */
export interface UserPreferences {
  theme?: 'light' | 'dark' | 'system';
  notifications?: UserNotificationPreferences;
  search_defaults?: UserSearchDefaults;
}

/**
 * The full user profile object returned from the API.
 * @see services/api/schemas/user_profile.py -> UserProfileResponse
 */
export interface UserProfile {
  id: string; // UUID
  email: string;
  full_name: string;
  phone_number?: string;
  state?: string;
  lga?: string;
  role: 'student' | 'premium' | 'counselor' | 'institution_admin' | 'internal_admin';
  subscription_status?: 'free' | 'active' | 'expired' | 'cancelled';
  subscription_tier?: 'free' | 'monthly' | 'yearly';
  subscription_start_date?: string; // ISO 8601 date string
  subscription_end_date?: string; // ISO 8601 date string
  preferences: UserPreferences;
  metadata: Record<string, any>;
  created_at: string; // ISO 8601 date string
  updated_at: string; // ISO 8601 date string
}

/**
 * Schema for updating the user's profile information.
 * @see services/api/schemas/user_profile.py -> UserProfileUpdate
 */
export interface UserProfileUpdate {
  full_name?: string;
  phone_number?: string;
  state?: string;
  lga?: string;
}

/**
 * Schema for updating the user's preferences.
 * @see services/api/schemas/user_profile.py -> UserPreferencesUpdate
 */
export type UserPreferencesUpdate = UserPreferences;


// =================================================================
// Search History
// =================================================================

/**
 * A single search history entry.
 * @see services/api/schemas/search_history.py -> SearchHistoryResponse
 */
export interface SearchHistoryEntry {
  id: string; // UUID
  query: string;
  filters: Record<string, any>;
  results_count?: number;
  created_at: string; // ISO 8601 date string
}

/**
 * Response for a list of search history entries.
 * @see services/api/schemas/search_history.py -> SearchHistoryListResponse
 */
export interface SearchHistoryListResponse {
  data: SearchHistoryEntry[];
  total: number;
  limit: number;
  offset: number;
}
