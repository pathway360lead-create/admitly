import type { InstitutionType, DegreeType, UserRole, SubscriptionStatus, NigerianState } from './enums';
export interface Institution {
    id: string;
    slug: string;
    name: string;
    short_name?: string;
    type: InstitutionType;
    state: NigerianState;
    city: string;
    address?: string;
    logo_url?: string;
    website?: string;
    email?: string;
    phone?: string;
    description?: string;
    verified: boolean;
    status: 'draft' | 'published' | 'archived';
    program_count: number;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}
export interface Program {
    id: string;
    institution_id: string;
    slug: string;
    name: string;
    degree_type: DegreeType;
    duration_years: number;
    mode: 'full_time' | 'part_time' | 'online' | 'hybrid';
    accreditation_status?: string;
    description?: string;
    tuition_per_year: number;
    acceptance_fee?: number;
    cutoff_score?: number;
    status: 'draft' | 'published' | 'archived';
    created_at: string;
    updated_at: string;
    deleted_at?: string;
    institution?: Institution;
}
export interface UserProfile {
    id: string;
    email: string;
    full_name?: string;
    role: UserRole;
    subscription_status?: SubscriptionStatus;
    subscription_expires_at?: string;
    preferences?: Record<string, any>;
    created_at: string;
    updated_at: string;
}
export interface Bookmark {
    id: string;
    user_id: string;
    program_id?: string;
    institution_id?: string;
    notes?: string;
    created_at: string;
}
export interface Alert {
    id: string;
    user_id: string;
    alert_type: 'deadline' | 'cost_change' | 'new_program' | 'cutoff_release';
    entity_type: 'program' | 'institution';
    entity_id: string;
    frequency: 'real_time' | 'daily' | 'weekly';
    is_active: boolean;
    created_at: string;
}
export interface ApplicationWindow {
    id: string;
    program_id: string;
    application_start: string;
    application_end: string;
    screening_date?: string;
    admission_list_date?: string;
    acceptance_deadline?: string;
    registration_start?: string;
    registration_end?: string;
    status: 'upcoming' | 'open' | 'closing_soon' | 'closed';
    created_at: string;
    updated_at: string;
}
//# sourceMappingURL=models.d.ts.map