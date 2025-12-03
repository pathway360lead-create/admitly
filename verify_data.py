"""
Script to verify data in Supabase after spider runs
"""
import os
from supabase import create_client, Client
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Supabase client
url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
supabase: Client = create_client(url, key)

def verify_data():
    """Verify institutions and programs in database"""

    print("=" * 60)
    print("SUPABASE DATA VERIFICATION")
    print("=" * 60)

    # Count institutions
    institutions_response = supabase.table('institutions').select('id, name, state, type', count='exact').execute()
    total_institutions = len(institutions_response.data)

    print(f"\n📊 INSTITUTIONS: {total_institutions} total")
    print("-" * 60)

    # Group by type
    types = {}
    for inst in institutions_response.data:
        inst_type = inst.get('type', 'unknown')
        if inst_type not in types:
            types[inst_type] = []
        types[inst_type].append(inst['name'])

    for inst_type, names in types.items():
        print(f"\n{inst_type.upper()} ({len(names)}):")
        for name in names:
            print(f"  • {name}")

    # Count programs
    programs_response = supabase.table('programs').select('id, name, institution_name, degree_type', count='exact').execute()
    total_programs = len(programs_response.data)

    print(f"\n\n📚 PROGRAMS: {total_programs} total")
    print("-" * 60)

    # Group by institution
    programs_by_institution = {}
    for prog in programs_response.data:
        inst_name = prog.get('institution_name', 'unknown')
        if inst_name not in programs_by_institution:
            programs_by_institution[inst_name] = []
        programs_by_institution[inst_name].append(prog['name'])

    for inst_name, programs in sorted(programs_by_institution.items()):
        print(f"\n{inst_name} ({len(programs)} programs):")
        for prog_name in programs:
            print(f"  • {prog_name}")

    print("\n" + "=" * 60)
    print("SUMMARY")
    print("=" * 60)
    print(f"Total Institutions: {total_institutions}")
    print(f"Total Programs: {total_programs}")
    print(f"Coverage: {(total_institutions / 50) * 100:.1f}% of 50-institution target")
    print("=" * 60)

if __name__ == "__main__":
    verify_data()
