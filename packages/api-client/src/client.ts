import axios, { AxiosInstance, AxiosRequestConfig, AxiosError } from 'axios';
import type {
  Institution,
  Program,
  UserProfile,
  Bookmark,
  Alert,
  ApplicationWindow,
  APIErrorResponse,
  ProgramFilters,
  SearchFilters,
  DeadlineFilters,
  CreateBookmarkRequest,
  CreateAlertRequest,
  PaginatedResponse,
  SearchParams,
} from '@admitly/types';

/**
 * Custom API Error class for better error handling
 */
export class APIError extends Error {
  code: string;
  statusCode: number;
  details?: Array<{ field: string; message: string }>;

  constructor(message: string, code: string, statusCode: number, details?: Array<{ field: string; message: string }>) {
    super(message);
    this.name = 'APIError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}

/**
 * Admitly API Client
 * Provides type-safe methods for all MVP API endpoints
 */
export class AdmitlyAPIClient {
  private client: AxiosInstance;

  constructor(baseURL: string, config?: AxiosRequestConfig) {
    this.client = axios.create({
      baseURL,
      headers: {
        'Content-Type': 'application/json',
      },
      ...config,
    });

    // Request interceptor - add auth token
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });

    // Response interceptor - unwrap { success: true, data: ... } responses
    this.client.interceptors.response.use(
      (response) => {
        // If response has { success: true, data: ... }, unwrap to just data
        if (response.data && response.data.success === true) {
          // For paginated responses, keep the pagination info
          if (response.data.pagination) {
            return {
              ...response,
              data: {
                data: response.data.data,
                pagination: response.data.pagination,
              },
            };
          }
          // For regular responses, just return the data
          return {
            ...response,
            data: response.data.data,
          };
        }
        return response;
      },
      (error: AxiosError<APIErrorResponse>) => {
        // Handle { success: false, error: ... } responses
        if (error.response?.data?.success === false) {
          const errorData = error.response.data.error;
          throw new APIError(
            errorData.message,
            errorData.code,
            error.response.status,
            errorData.details
          );
        }

        // Handle network errors and other failures
        if (error.response) {
          // Server responded with error status
          throw new APIError(
            error.message || 'An error occurred',
            'UNKNOWN_ERROR',
            error.response.status
          );
        } else if (error.request) {
          // Request made but no response
          throw new APIError(
            'Network error - please check your connection',
            'NETWORK_ERROR',
            0
          );
        } else {
          // Something else happened
          throw new APIError(
            error.message || 'An unexpected error occurred',
            'UNKNOWN_ERROR',
            0
          );
        }
      }
    );
  }

  private getToken(): string | null {
    // Get token from localStorage (browser) or other storage
    if (typeof window === 'undefined') return null;

    const token = localStorage.getItem('access_token');
    const expiry = localStorage.getItem('token_expiry');

    // Check if token exists and hasn't expired
    if (token && expiry) {
      const expiryTime = parseInt(expiry, 10);

      if (Date.now() < expiryTime) {
        return token;
      }

      // Token has expired, clean up
      this.clearToken();
      console.warn('[AdmitlyAPI] Token expired and cleared from storage');
    }

    return null;
  }

  /**
   * Set authentication token with expiration
   * @param token - JWT token
   * @param expiresIn - Expiration time in milliseconds (default: 1 hour)
   */
  setToken(token: string, expiresIn: number = 3600000) {
    if (typeof window === 'undefined') return;

    const expiryTime = Date.now() + expiresIn;
    localStorage.setItem('access_token', token);
    localStorage.setItem('token_expiry', expiryTime.toString());
  }

  /**
   * Clear authentication token and expiry from storage
   */
  clearToken() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('access_token');
    localStorage.removeItem('token_expiry');
  }

  // ============================================================================
  // MVP API Methods (15 critical endpoints)
  // ============================================================================

  /**
   * 1. Get institution by slug
   * GET /api/v1/institutions/{slug}
   * Spec: lines 170-228
   */
  async getInstitutionBySlug(slug: string): Promise<Institution> {
    const { data } = await this.client.get<Institution>(`/api/v1/institutions/${slug}`);
    return data;
  }

  /**
   * 2. Get institution programs
   * GET /api/v1/institutions/{slug}/programs
   * Spec: lines 230-236
   */
  async getInstitutionPrograms(
    slug: string,
    params?: ProgramFilters
  ): Promise<{ data: Program[]; pagination: any }> {
    const { data } = await this.client.get<{ data: Program[]; pagination: any }>(
      `/api/v1/institutions/${slug}/programs`,
      { params }
    );
    return data;
  }

  /**
   * 3. Get program by ID
   * GET /api/v1/programs/{id}
   * Spec: lines 305-392
   */
  async getProgramById(id: string): Promise<Program> {
    const { data } = await this.client.get<Program>(`/api/v1/programs/${id}`);
    return data;
  }

  /**
   * 4. Global search
   * GET /api/v1/search
   * Spec: lines 398-448
   */
  async search(
    query: string,
    params?: Omit<SearchFilters, 'q'>
  ): Promise<{ institutions: Institution[]; programs: Program[]; total_results: number }> {
    const { data } = await this.client.get('/api/v1/search', {
      params: { q: query, ...params },
    });
    return data;
  }

  /**
   * 5. Autocomplete search
   * GET /api/v1/search/autocomplete
   * Spec: lines 450-471
   */
  async autocomplete(
    query: string,
    limit: number = 10
  ): Promise<Array<{ text: string; type: 'program' | 'institution' }>> {
    const { data } = await this.client.get('/api/v1/search/autocomplete', {
      params: { q: query, limit },
    });
    return data;
  }

  /**
   * 6. Get application deadlines
   * GET /api/v1/deadlines
   * Spec: lines 538-576
   */
  async getDeadlines(
    filters?: DeadlineFilters
  ): Promise<{ data: ApplicationWindow[]; pagination: any }> {
    const { data } = await this.client.get<{ data: ApplicationWindow[]; pagination: any }>(
      '/api/v1/deadlines',
      { params: filters }
    );
    return data;
  }

  /**
   * 7. Get deadline calendar view
   * GET /api/v1/deadlines/calendar
   * Spec: lines 578-610
   */
  async getDeadlineCalendar(
    month: number,
    year: number
  ): Promise<{
    month: number;
    year: number;
    events: Array<{
      date: string;
      events: Array<{
        type: string;
        institution: string;
        program: string;
      }>;
    }>;
  }> {
    const { data } = await this.client.get('/api/v1/deadlines/calendar', {
      params: { month, year },
    });
    return data;
  }

  /**
   * 8. Get user bookmarks
   * GET /api/v1/users/me/bookmarks
   * Spec: lines 721-729
   */
  async getBookmarks(type?: 'program' | 'institution'): Promise<Bookmark[]> {
    const { data } = await this.client.get<Bookmark[]>('/api/v1/users/me/bookmarks', {
      params: type ? { type } : undefined,
    });
    return data;
  }

  /**
   * 9. Create bookmark
   * POST /api/v1/users/me/bookmarks
   * Spec: lines 731-743
   */
  async createBookmark(request: CreateBookmarkRequest): Promise<Bookmark> {
    const { data } = await this.client.post<Bookmark>('/api/v1/users/me/bookmarks', request);
    return data;
  }

  /**
   * 10. Delete bookmark
   * DELETE /api/v1/users/me/bookmarks/{id}
   * Spec: lines 745-748
   */
  async deleteBookmark(id: string): Promise<void> {
    await this.client.delete(`/api/v1/users/me/bookmarks/${id}`);
  }

  /**
   * 11. Get user alerts
   * GET /api/v1/alerts
   * Spec: lines 652-655
   */
  async getAlerts(): Promise<Alert[]> {
    const { data } = await this.client.get<Alert[]>('/api/v1/alerts');
    return data;
  }

  /**
   * 12. Create alert
   * POST /api/v1/alerts
   * Spec: lines 615-649
   */
  async createAlert(request: CreateAlertRequest): Promise<Alert> {
    const { data } = await this.client.post<Alert>('/api/v1/alerts', request);
    return data;
  }

  /**
   * 13. Update alert
   * PATCH /api/v1/alerts/{id}
   * Spec: lines 659-662
   */
  async updateAlert(id: string, request: Partial<CreateAlertRequest>): Promise<Alert> {
    const { data } = await this.client.patch<Alert>(`/api/v1/alerts/${id}`, request);
    return data;
  }

  /**
   * 14. Delete alert
   * DELETE /api/v1/alerts/{id}
   * Spec: lines 664-667
   */
  async deleteAlert(id: string): Promise<void> {
    await this.client.delete(`/api/v1/alerts/${id}`);
  }

  /**
   * 15. Get user profile
   * GET /api/v1/users/me
   * Spec: lines 672-703
   */
  async getUserProfile(): Promise<UserProfile> {
    const { data } = await this.client.get<UserProfile>('/api/v1/users/me');
    return data;
  }

  /**
   * Update user profile
   * PATCH /api/v1/users/me
   * Spec: lines 705-719
   */
  async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
    const { data } = await this.client.patch<UserProfile>('/api/v1/users/me', updates);
    return data;
  }

  // ============================================================================
  // Legacy methods (for backward compatibility)
  // ============================================================================

  async getInstitutions(params?: SearchParams): Promise<PaginatedResponse<Institution>> {
    const { data } = await this.client.get('/api/v1/institutions', { params });
    return data;
  }

  async getInstitution(id: string): Promise<Institution> {
    const { data } = await this.client.get(`/api/v1/institutions/${id}`);
    return data;
  }

  async getPrograms(params?: SearchParams): Promise<PaginatedResponse<Program>> {
    const { data } = await this.client.get('/api/v1/programs', { params });
    return data;
  }

  async getProgram(id: string): Promise<Program> {
    const { data } = await this.client.get(`/api/v1/programs/${id}`);
    return data;
  }

  async health(): Promise<{ status: string }> {
    const { data } = await this.client.get('/health');
    return data;
  }
}

/**
 * Create API client instance
 * @param baseURL - API base URL (default: http://localhost:8000)
 */
export const createClient = (baseURL: string = 'http://localhost:8000') => {
  return new AdmitlyAPIClient(baseURL);
};
