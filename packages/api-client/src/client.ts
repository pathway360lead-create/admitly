import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import type {
  Institution,
  Program,
  PaginatedResponse,
  SearchParams,
  SearchResponse,
} from '@admitly/types';

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

    // Add auth token interceptor
    this.client.interceptors.request.use((config) => {
      const token = this.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    });
  }

  private getToken(): string | null {
    // Get token from localStorage (browser) or other storage
    if (typeof window !== 'undefined') {
      return localStorage.getItem('access_token');
    }
    return null;
  }

  setToken(token: string) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('access_token', token);
    }
  }

  clearToken() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('access_token');
    }
  }

  // Institutions
  async getInstitutions(params?: SearchParams): Promise<PaginatedResponse<Institution>> {
    const { data } = await this.client.get('/api/v1/institutions', { params });
    return data;
  }

  async getInstitution(id: string): Promise<Institution> {
    const { data } = await this.client.get(`/api/v1/institutions/${id}`);
    return data;
  }

  // Programs
  async getPrograms(params?: SearchParams): Promise<PaginatedResponse<Program>> {
    const { data } = await this.client.get('/api/v1/programs', { params });
    return data;
  }

  async getProgram(id: string): Promise<Program> {
    const { data } = await this.client.get(`/api/v1/programs/${id}`);
    return data;
  }

  // Search
  async search<T>(query: string, params?: SearchParams): Promise<SearchResponse<T>> {
    const { data } = await this.client.get('/api/v1/search', {
      params: { q: query, ...params },
    });
    return data;
  }

  // Health check
  async health(): Promise<{ status: string }> {
    const { data } = await this.client.get('/health');
    return data;
  }
}

// Create default instance
export const createClient = (baseURL: string = 'http://localhost:8000') => {
  return new AdmitlyAPIClient(baseURL);
};
