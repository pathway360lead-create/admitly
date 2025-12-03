"""
Generate 500+ programs by expanding sample data for each institution.

This script creates realistic program data by:
1. Taking the existing 3 sample programs per institution
2. Expanding them with variations and additional programs
3. Inserting directly into Supabase
"""

from dotenv import load_dotenv
import os
from supabase import create_client
from datetime import datetime
import uuid

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

# Common Nigerian university programs by field
PROGRAMS_BY_FIELD = {
    'Science': [
        'Computer Science', 'Mathematics', 'Statistics', 'Physics', 'Chemistry',
        'Biochemistry', 'Microbiology', 'Biology', 'Botany', 'Zoology',
        'Geology', 'Geography', 'Marine Biology', 'Fisheries', 'Environmental Science'
    ],
    'Engineering': [
        'Computer Engineering', 'Electrical/Electronics Engineering', 'Mechanical Engineering',
        'Civil Engineering', 'Chemical Engineering', 'Petroleum Engineering',
        'Agricultural Engineering', 'Marine Engineering', 'Aeronautical Engineering',
        'Mechatronics Engineering', 'Systems Engineering', 'Biomedical Engineering'
    ],
    'Medicine': [
        'Medicine and Surgery', 'Nursing Science', 'Pharmacy', 'Physiotherapy',
        'Medical Laboratory Science', 'Anatomy', 'Physiology', 'Dentistry',
        'Public Health', 'Radiography', 'Optometry'
    ],
    'Social Sciences': [
        'Economics', 'Political Science', 'Sociology', 'Psychology', 'Mass Communication',
        'International Relations', 'Public Administration', 'Social Work',
        'Criminology', 'Demography and Social Statistics'
    ],
    'Arts': [
        'English Language', 'History', 'Philosophy', 'Religious Studies', 'Fine Arts',
        'Performing Arts', 'Music', 'Linguistics', 'Languages', 'Theatre Arts'
    ],
    'Business': [
        'Accounting', 'Business Administration', 'Banking and Finance', 'Marketing',
        'Insurance', 'Actuarial Science', 'Entrepreneurship', 'Human Resource Management'
    ],
    'Law': ['Law'],
    'Agriculture': [
        'Agricultural Economics', 'Agronomy', 'Animal Science', 'Crop Science',
        'Soil Science', 'Agricultural Extension', 'Food Science and Technology'
    ],
    'Environmental Studies': [
        'Architecture', 'Estate Management', 'Urban and Regional Planning',
        'Quantity Surveying', 'Building', 'Surveying and Geo-Informatics'
    ],
    'Education': [
        'Education and Mathematics', 'Education and English Language', 'Education and Biology',
        'Education and Chemistry', 'Education and Physics', 'Educational Management',
        'Guidance and Counselling', 'Early Childhood Education'
    ]
}

# Polytechnic programs (HND/ND)
POLYTECHNIC_PROGRAMS = [
    'Computer Science', 'Electrical/Electronics Engineering', 'Mechanical Engineering',
    'Civil Engineering Technology', 'Science Laboratory Technology', 'Mass Communication',
    'Accountancy', 'Business Administration and Management', 'Banking and Finance',
    'Office Technology and Management', 'Estate Management and Valuation',
    'Quantity Surveying', 'Building Technology', 'Urban and Regional Planning',
    'Agricultural Technology', 'Food Technology', 'Statistics',
    'Hospitality Management', 'Tourism Management', 'Marketing'
]

# College of Education programs (NCE)
COE_PROGRAMS = [
    'Education and Mathematics', 'Education and English Language', 'Education and Biology',
    'Education and Chemistry', 'Education and Physics', 'Technical Education (Electrical/Electronics)',
    'Technical Education (Mechanical)', 'Technical Education (Building)', 'Business Education',
    'Home Economics Education', 'Agricultural Science Education', 'Computer Science Education'
]

def get_institutions():
    """Get all institutions from database"""
    result = supabase.table('institutions').select('id, name, type').execute()
    return result.data

def generate_slug(program_name, degree_type):
    """Generate URL-friendly slug from program name and degree type"""
    import re
    # Convert to lowercase and replace spaces with hyphens
    slug = program_name.lower()
    # Remove special characters
    slug = re.sub(r'[^a-z0-9\s-]', '', slug)
    # Replace spaces with hyphens
    slug = re.sub(r'\s+', '-', slug)
    # Add degree type suffix
    slug = f"{slug}-{degree_type}"
    return slug

def generate_programs_for_institution(institution):
    """Generate realistic programs for an institution based on its type"""
    inst_type = institution['type']
    inst_name = institution['name']
    inst_id = institution['id']

    programs = []

    if 'university' in inst_type:
        # Universities: 15-25 programs covering multiple fields
        num_programs = 20
        # Select programs from multiple fields
        all_programs = []
        for field in ['Science', 'Engineering', 'Medicine', 'Social Sciences', 'Arts', 'Business', 'Law', 'Agriculture']:
            all_programs.extend([(p, field) for p in PROGRAMS_BY_FIELD.get(field, [])[:3]])

        # Take first 20
        for program_name, field in all_programs[:num_programs]:
            degree_type = 'undergraduate'
            programs.append({
                'institution_id': inst_id,
                'slug': generate_slug(program_name, degree_type),
                'name': program_name,
                'degree_type': degree_type,
                'qualification': get_qualification(program_name, degree_type),
                'field_of_study': field,
                'specialization': program_name,
                'duration_years': get_duration(program_name, degree_type),
                'mode': 'full_time',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
            })

    elif inst_type == 'polytechnic':
        # Polytechnics: 15 programs (ND and HND)
        for program_name in POLYTECHNIC_PROGRAMS[:15]:
            # Create both ND and HND versions
            for degree_type, qual, duration in [('nd', 'ND', 2.0), ('hnd', 'HND', 2.0)]:
                programs.append({
                    'institution_id': inst_id,
                    'slug': generate_slug(program_name, degree_type),
                    'name': program_name,
                    'degree_type': degree_type,
                    'qualification': qual,
                    'field_of_study': infer_field(program_name),
                    'specialization': program_name,
                    'duration_years': duration,
                    'mode': 'full_time',
                    'accreditation_status': 'fully_accredited',
                    'accreditation_body': 'NBTE',
                })

    elif 'college_of_education' in inst_type or 'education' in inst_type.lower():
        # Colleges of Education: 10-12 NCE programs
        for program_name in COE_PROGRAMS[:12]:
            degree_type = 'diploma'
            programs.append({
                'institution_id': inst_id,
                'slug': generate_slug(program_name, degree_type),
                'name': program_name,
                'degree_type': degree_type,
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': program_name,
                'duration_years': 3.0,
                'mode': 'full_time',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NCCE',
            })

    elif inst_type == 'specialized':
        # Specialized institutions (e.g., NDA): 10-15 programs
        special_programs = [
            'Military Science and Interdisciplinary Studies',
            'Aeronautical Engineering',
            'Strategic Studies',
            'Defence and Security Studies',
            'Computer Science',
            'Electrical Engineering',
            'Mechanical Engineering',
            'Civil Engineering',
            'International Relations',
            'Economics',
        ]
        for program_name in special_programs:
            degree_type = 'undergraduate'
            programs.append({
                'institution_id': inst_id,
                'slug': generate_slug(program_name, degree_type),
                'name': program_name,
                'degree_type': degree_type,
                'qualification': get_qualification(program_name, degree_type),
                'field_of_study': infer_field(program_name),
                'specialization': program_name,
                'duration_years': 5.0,  # NDA has longer duration
                'mode': 'full_time',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
            })

    return programs

def get_qualification(program_name, degree_type):
    """Get appropriate qualification based on program and degree type"""
    if 'Medicine' in program_name or 'Surgery' in program_name:
        return 'MBBS'
    elif 'Law' in program_name:
        return 'LLB'
    elif 'Pharmacy' in program_name:
        return 'BPharm'
    elif 'Engineering' in program_name or 'Technology' in program_name:
        return 'BEng'
    elif degree_type == 'undergraduate':
        return 'BSc'
    elif degree_type == 'nd':
        return 'ND'
    elif degree_type == 'hnd':
        return 'HND'
    elif degree_type == 'diploma':
        return 'NCE'
    else:
        return 'BSc'

def get_duration(program_name, degree_type):
    """Get program duration"""
    if 'Medicine' in program_name or 'Surgery' in program_name:
        return 6.0
    elif 'Pharmacy' in program_name:
        return 5.0
    elif 'Engineering' in program_name:
        return 5.0
    elif 'Law' in program_name:
        return 5.0
    elif degree_type == 'undergraduate':
        return 4.0
    elif degree_type in ['nd', 'hnd']:
        return 2.0
    elif degree_type == 'diploma':
        return 3.0
    else:
        return 4.0

def infer_field(program_name):
    """Infer field of study from program name"""
    program_lower = program_name.lower()

    if any(word in program_lower for word in ['engineering', 'technology']):
        return 'Engineering'
    elif any(word in program_lower for word in ['medicine', 'surgery', 'nursing', 'pharmacy']):
        return 'Medicine'
    elif any(word in program_lower for word in ['education', 'teaching']):
        return 'Education'
    elif any(word in program_lower for word in ['business', 'accounting', 'finance', 'management']):
        return 'Business'
    elif any(word in program_lower for word in ['computer', 'information', 'software']):
        return 'Science'
    elif any(word in program_lower for word in ['law', 'legal']):
        return 'Law'
    elif any(word in program_lower for word in ['agriculture', 'farming']):
        return 'Agriculture'
    elif any(word in program_lower for word in ['economics', 'political', 'sociology']):
        return 'Social Sciences'
    else:
        return 'Arts'

def main():
    print("=" * 80)
    print("GENERATING 500+ PROGRAMS FROM SAMPLE DATA")
    print("=" * 80)
    print()

    # Get all institutions
    institutions = get_institutions()
    print(f"Found {len(institutions)} institutions in database")
    print()

    total_programs_added = 0
    failed = 0

    for i, institution in enumerate(institutions, 1):
        print(f"[{i:2d}/{len(institutions)}] Processing {institution['name'][:50]:50s} ", end="")

        try:
            # Generate programs for this institution
            programs = generate_programs_for_institution(institution)

            if programs:
                # Insert programs into database
                result = supabase.table('programs').insert(programs).execute()
                total_programs_added += len(programs)
                print(f"[OK] {len(programs)} programs")
            else:
                print("[SKIP] No programs generated")

        except Exception as e:
            print(f"[FAILED] {str(e)[:50]}")
            failed += 1

    print()
    print("=" * 80)
    print(f"GENERATION COMPLETED")
    print("=" * 80)
    print(f"Total programs added: {total_programs_added}")
    print(f"Failed: {failed}")
    print()

    # Verify final count
    result = supabase.table('programs').select('id', count='exact').execute()
    print(f"Total programs now in database: {result.count}")
    print("=" * 80)

if __name__ == '__main__':
    main()
