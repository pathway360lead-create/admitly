// Enums and constants

export type InstitutionType =
  | 'federal_university'
  | 'state_university'
  | 'private_university'
  | 'polytechnic'
  | 'college_of_education'
  | 'specialized'
  | 'jupeb_center';

export type DegreeType =
  | 'undergraduate'
  | 'nd'
  | 'hnd'
  | 'pre_degree'
  | 'jupeb'
  | 'postgraduate';

export type UserRole =
  | 'anonymous'
  | 'student'
  | 'premium'
  | 'counselor'
  | 'institution_admin'
  | 'internal_admin';

export type SubscriptionStatus =
  | 'active'
  | 'cancelled'
  | 'expired'
  | 'trial';

export type ApplicationStatus =
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'accepted'
  | 'rejected';

export const NIGERIAN_STATES = [
  'Abia',
  'Adamawa',
  'Akwa Ibom',
  'Anambra',
  'Bauchi',
  'Bayelsa',
  'Benue',
  'Borno',
  'Cross River',
  'Delta',
  'Ebonyi',
  'Edo',
  'Ekiti',
  'Enugu',
  'FCT',
  'Gombe',
  'Imo',
  'Jigawa',
  'Kaduna',
  'Kano',
  'Katsina',
  'Kebbi',
  'Kogi',
  'Kwara',
  'Lagos',
  'Nasarawa',
  'Niger',
  'Ogun',
  'Ondo',
  'Osun',
  'Oyo',
  'Plateau',
  'Rivers',
  'Sokoto',
  'Taraba',
  'Yobe',
  'Zamfara',
] as const;

export type NigerianState = typeof NIGERIAN_STATES[number];
