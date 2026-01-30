export type InstitutionType =
  | 'federal_university'
  | 'state_university'
  | 'private_university'
  | 'polytechnic'
  | 'college_of_education'
  | 'specialized'
  | 'jupeb_center';

export type InstitutionStatus = 'draft' | 'published' | 'archived';

export const INSTITUTION_TYPES: { value: InstitutionType; label: string }[] = [
  { value: 'federal_university', label: 'Federal University' },
  { value: 'state_university', label: 'State University' },
  { value: 'private_university', label: 'Private University' },
  { value: 'polytechnic', label: 'Polytechnic' },
  { value: 'college_of_education', label: 'College of Education' },
  { value: 'specialized', label: 'Specialized Institution' },
  { value: 'jupeb_center', label: 'JUPEB Center' },
];

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
  'FCT',
];
