import axios, { AxiosInstance } from 'axios';
import { createClient } from '@supabase/supabase-js';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Supabase client for authentication
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Axios instance for admin API calls
const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, redirect to login
      await supabase.auth.signOut();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ========== ADMIN API METHODS ==========

export interface InstitutionCreateData {
  name: string;
  short_name?: string;
  type: string;
  state: string;
  city: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  year_established?: number;
  accreditation_status?: string;
  verified?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface InstitutionUpdateData {
  name?: string;
  short_name?: string;
  type?: string;
  state?: string;
  city?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  year_established?: number;
  accreditation_status?: string;
  verified?: boolean;
  status?: 'draft' | 'published' | 'archived';
}

export interface Institution {
  id: string;
  slug: string;
  name: string;
  short_name?: string;
  type: string;
  state: string;
  city: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  banner_url?: string;
  year_established?: number;
  accreditation_status?: string;
  verified: boolean;
  status: string;
  program_count: number;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
}

export interface PaginationMetadata {
  page: number;
  page_size: number;
  total: number;
  total_pages: number;
  has_prev: boolean;
  has_next: boolean;
}

export interface InstitutionsListResponse {
  data: Institution[];
  pagination: PaginationMetadata;
}

export interface ProgramCreateData {
  institution_id: string;
  name: string;
  degree_type: 'undergraduate' | 'nd' | 'hnd' | 'pre_degree' | 'jupeb' | 'postgraduate';
  duration_years: number;
  mode: 'full_time' | 'part_time' | 'online' | 'hybrid';
  tuition_per_year: number;
  acceptance_fee?: number;
  cutoff_score?: number;
  accreditation_status?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface ProgramUpdateData {
  institution_id?: string;
  name?: string;
  degree_type?: 'undergraduate' | 'nd' | 'hnd' | 'pre_degree' | 'jupeb' | 'postgraduate';
  duration_years?: number;
  mode?: 'full_time' | 'part_time' | 'online' | 'hybrid';
  tuition_per_year?: number;
  acceptance_fee?: number;
  cutoff_score?: number;
  accreditation_status?: string;
  description?: string;
  status?: 'draft' | 'published' | 'archived';
}

export interface Program {
  id: string;
  institution_id: string;
  slug: string;
  name: string;
  degree_type: string;
  duration_years: number;
  mode: string;
  tuition_per_year: number;
  acceptance_fee?: number;
  cutoff_score?: number;
  accreditation_status?: string;
  description?: string;
  status: string;
  created_at: string;
  updated_at: string;
  deleted_at?: string;
  institution?: {
    id: string;
    name: string;
    short_name?: string;
  };
}

export interface ProgramsListResponse {
  data: Program[];
  pagination: PaginationMetadata;
}

// ========== DEADLINE API METHODS ==========

export interface DeadlineCreateData {
  title: string;
  description?: string;
  start_date?: string; // ISO string
  end_date: string;    // ISO string
  screening_date?: string; // ISO string
  type: 'exam' | 'admission' | 'scholarship' | 'event' | 'other';
  priority: 'high' | 'medium' | 'low';
  related_entity_type?: 'program' | 'institution' | 'none';
  related_entity_id?: string;
  link?: string;
}

export interface DeadlineUpdateData extends Partial<DeadlineCreateData> { }

export interface Deadline {
  id: string;
  title: string;
  description?: string;
  start_date?: string;
  end_date: string;
  screening_date?: string;
  type: string;
  priority: string;
  related_entity_type: string;
  related_entity_id?: string;
  link?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
  program?: any;
  institution?: any;
}

export const adminAPI = {
  // ... existing methods ...

  // Deadlines
  listDeadlines: async (params?: {
    type?: string;
    priority?: string;
    from_date?: string;
    limit?: number;
    offset?: number;
  }): Promise<Deadline[]> => {
    const { data } = await apiClient.get('/api/v1/deadlines', { params });
    return data;
  },

  getDeadline: async (id: string): Promise<Deadline> => {
    const { data } = await apiClient.get(`/api/v1/deadlines/${id}`);
    return data;
  },

  createDeadline: async (deadline: DeadlineCreateData): Promise<Deadline> => {
    const { data } = await apiClient.post('/api/v1/deadlines', deadline);
    return data;
  },

  updateDeadline: async (id: string, updates: DeadlineUpdateData): Promise<Deadline> => {
    const { data } = await apiClient.patch(`/api/v1/deadlines/${id}`, updates);
    return data;
  },

  deleteDeadline: async (id: string): Promise<void> => {
    await apiClient.delete(`/api/v1/deadlines/${id}`);
  },

  // ... (keep previous methods like healthCheck, listInstitutions etc.)
  healthCheck: async () => {
    const { data } = await apiClient.get('/api/v1/admin/health');
    return data;
  },

  // Institutions
  listInstitutions: async (params?: {
    page?: number;
    page_size?: number;
    status_filter?: string;
    search?: string;
  }): Promise<InstitutionsListResponse> => {
    const { data } = await apiClient.get('/api/v1/admin/institutions', { params });
    return data;
  },

  getInstitution: async (id: string): Promise<Institution> => {
    const { data } = await apiClient.get(`/api/v1/admin/institutions/${id}`);
    return data;
  },

  createInstitution: async (institution: InstitutionCreateData): Promise<Institution> => {
    const { data } = await apiClient.post('/api/v1/admin/institutions', institution);
    return data;
  },

  updateInstitution: async (id: string, updates: InstitutionUpdateData): Promise<Institution> => {
    const { data } = await apiClient.put(`/api/v1/admin/institutions/${id}`, updates);
    return data;
  },

  deleteInstitution: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/api/v1/admin/institutions/${id}`);
    return data;
  },

  updateInstitutionStatus: async (
    id: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<Institution> => {
    const { data } = await apiClient.patch(`/api/v1/admin/institutions/${id}/status`, { status });
    return data;
  },

  // Programs
  listPrograms: async (params?: {
    page?: number;
    page_size?: number;
    institution_id?: string;
    degree_type?: string;
    status_filter?: string;
    search?: string;
  }): Promise<ProgramsListResponse> => {
    const { data } = await apiClient.get('/api/v1/admin/programs', { params });
    return data;
  },

  getProgram: async (id: string): Promise<Program> => {
    const { data } = await apiClient.get(`/api/v1/admin/programs/${id}`);
    return data;
  },

  createProgram: async (program: ProgramCreateData): Promise<Program> => {
    const { data } = await apiClient.post('/api/v1/admin/programs', program);
    return data;
  },

  updateProgram: async (id: string, updates: ProgramUpdateData): Promise<Program> => {
    const { data } = await apiClient.put(`/api/v1/admin/programs/${id}`, updates);
    return data;
  },

  deleteProgram: async (id: string): Promise<{ message: string }> => {
    const { data } = await apiClient.delete(`/api/v1/admin/programs/${id}`);
    return data;
  },

  updateProgramStatus: async (
    id: string,
    status: 'draft' | 'published' | 'archived'
  ): Promise<Program> => {
    const { data } = await apiClient.patch(`/api/v1/admin/programs/${id}/status`, { status });
    return data;
  },
};

export default apiClient;
