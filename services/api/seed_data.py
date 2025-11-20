"""
Seed script to populate the database with sample data for testing
"""
import asyncio
from datetime import datetime
from supabase import create_client, Client
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")

if not SUPABASE_URL or not SUPABASE_SERVICE_KEY:
    raise ValueError("SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in .env file")

supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

# Sample institutions data
INSTITUTIONS = [
    {
        "slug": "unilag",
        "name": "University of Lagos",
        "short_name": "UNILAG",
        "type": "federal_university",
        "state": "Lagos",
        "city": "Akoka",
        "description": "Premier federal university in Nigeria, established in 1962",
        "website": "https://unilag.edu.ng",
        "verified": True,
        "status": "published",
        "program_count": 0  # Will be updated after programs are seeded
    },
    {
        "slug": "oau",
        "name": "Obafemi Awolowo University",
        "short_name": "OAU",
        "type": "federal_university",
        "state": "Osun",
        "city": "Ile-Ife",
        "description": "Top-ranked federal university in southwestern Nigeria",
        "website": "https://oauife.edu.ng",
        "verified": True,
        "status": "published",
        "program_count": 0
    },
    {
        "slug": "unn",
        "name": "University of Nigeria, Nsukka",
        "short_name": "UNN",
        "type": "federal_university",
        "state": "Enugu",
        "city": "Nsukka",
        "description": "First autonomous university in Nigeria, established in 1960",
        "website": "https://unn.edu.ng",
        "verified": True,
        "status": "published",
        "program_count": 0
    },
    {
        "slug": "ui",
        "name": "University of Ibadan",
        "short_name": "UI",
        "type": "federal_university",
        "state": "Oyo",
        "city": "Ibadan",
        "description": "Nigeria's oldest university, established in 1948",
        "website": "https://ui.edu.ng",
        "verified": True,
        "status": "published",
        "program_count": 0
    },
    {
        "slug": "covenant",
        "name": "Covenant University",
        "short_name": "CU",
        "type": "private_university",
        "state": "Ogun",
        "city": "Ota",
        "description": "Leading private university in Nigeria",
        "website": "https://covenantuniversity.edu.ng",
        "verified": True,
        "status": "published",
        "program_count": 0
    },
    {
        "slug": "yabatech",
        "name": "Yaba College of Technology",
        "short_name": "YABATECH",
        "type": "polytechnic",
        "state": "Lagos",
        "city": "Yaba",
        "description": "Premier polytechnic in Nigeria",
        "website": "https://yabatech.edu.ng",
        "verified": True,
        "status": "published",
        "program_count": 0
    }
]

# Sample programs data (will be linked to institutions after they're created)
PROGRAMS_TEMPLATE = [
    {
        "name": "Computer Science",
        "degree_type": "bachelor",
        "field_of_study": "Engineering & Technology",
        "duration_years": 4,
        "accreditation_status": "accredited",
        "description": "Comprehensive computer science program covering software engineering, algorithms, and systems",
        "status": "published"
    },
    {
        "name": "Medicine and Surgery",
        "degree_type": "bachelor",
        "field_of_study": "Medicine & Health Sciences",
        "duration_years": 6,
        "accreditation_status": "accredited",
        "description": "Professional medical degree program",
        "status": "published"
    },
    {
        "name": "Law",
        "degree_type": "bachelor",
        "field_of_study": "Law",
        "duration_years": 5,
        "accreditation_status": "accredited",
        "description": "Comprehensive legal education program",
        "status": "published"
    },
    {
        "name": "Business Administration",
        "degree_type": "bachelor",
        "field_of_study": "Business & Management",
        "duration_years": 4,
        "accreditation_status": "accredited",
        "description": "Business management and administration program",
        "status": "published"
    },
    {
        "name": "Electrical Engineering",
        "degree_type": "bachelor",
        "field_of_study": "Engineering & Technology",
        "duration_years": 5,
        "accreditation_status": "accredited",
        "description": "Electrical and electronics engineering program",
        "status": "published"
    }
]


async def seed_institutions():
    """Seed institutions table"""
    print("Seeding institutions...")

    try:
        # Get all institutions (we already have some)
        response = supabase.table('institutions').select('*').execute()
        if response.data:
            print(f"[OK] Found {len(response.data)} existing institutions")
            return response.data

        # Insert institutions if none exist
        response = supabase.table('institutions').insert(INSTITUTIONS).execute()
        print(f"[OK] Inserted {len(response.data)} institutions")
        return response.data
    except Exception as e:
        print(f"[ERROR] Error seeding institutions: {e}")
        raise


async def seed_programs(institutions):
    """Seed programs table"""
    print("Seeding programs...")

    try:
        # Check if programs already exist
        existing = supabase.table('programs').select('id').limit(1).execute()
        if existing.data:
            print(f"Found existing programs. Skipping...")
            return

        programs = []

        # Create programs for each institution
        for institution in institutions:
            institution_id = institution['id']
            institution_state = institution['state']

            for program_template in PROGRAMS_TEMPLATE:
                program = {
                    **program_template,
                    "institution_id": institution_id,
                    "institution_state": institution_state
                }
                programs.append(program)

        # Insert programs in batches
        response = supabase.table('programs').insert(programs).execute()
        print(f"[OK] Inserted {len(response.data)} programs")
        return response.data
    except Exception as e:
        print(f"[ERROR] Error seeding programs: {e}")
        raise


async def update_program_counts():
    """
    NOTE: program_count is now computed dynamically in the backend service,
    so this function is no longer needed. Keeping it for reference.
    """
    print("Skipping program count update (now computed dynamically)")
    pass


async def main():
    """Main seeding function"""
    print("=" * 60)
    print("ADMITLY DATABASE SEEDING")
    print("=" * 60)
    print()

    try:
        # Seed institutions
        institutions = await seed_institutions()

        if institutions:
            # Seed programs
            await seed_programs(institutions)

        # Update program counts (always run to fix existing data)
        await update_program_counts()

        print()
        print("=" * 60)
        print("[SUCCESS] SEEDING COMPLETED SUCCESSFULLY")
        print("=" * 60)

    except Exception as e:
        print()
        print("=" * 60)
        print(f"[FAILED] SEEDING FAILED: {e}")
        print("=" * 60)
        raise


if __name__ == "__main__":
    asyncio.run(main())
