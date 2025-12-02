"""Check data in Supabase"""
from dotenv import load_dotenv
import os
from supabase import create_client

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

# Get all institutions
institutions = supabase.table('institutions').select('id, name, short_name, state').order('name').execute()
print(f"\nINSTITUTIONS ({len(institutions.data)}):")
print("=" * 80)
for inst in institutions.data:
    print(f"  - {inst['name']} ({inst.get('short_name', 'N/A')}) - {inst['state']}")

# Get all programs
programs = supabase.table('programs').select('id, name, institution_name, degree_type').order('institution_name').execute()
print(f"\n\nPROGRAMS ({len(programs.data)}):")
print("=" * 80)

# Group by institution
from collections import defaultdict
programs_by_inst = defaultdict(list)
for prog in programs.data:
    programs_by_inst[prog['institution_name']].append(prog['name'])

for inst_name, progs in sorted(programs_by_inst.items()):
    print(f"\n{inst_name} ({len(progs)} programs):")
    for prog_name in progs:
        print(f"  - {prog_name}")

# Check which institutions have no programs
inst_names = {inst['name'] for inst in institutions.data}
inst_with_programs = set(programs_by_inst.keys())
inst_without_programs = inst_names - inst_with_programs

if inst_without_programs:
    print(f"\n\nINSTITUTIONS WITHOUT PROGRAMS ({len(inst_without_programs)}):")
    print("=" * 80)
    for name in sorted(inst_without_programs):
        print(f"  - {name}")

print(f"\n\n{'=' * 80}")
print(f"SUMMARY: {len(institutions.data)} institutions, {len(programs.data)} programs")
print(f"Coverage: {(len(institutions.data) / 50) * 100:.1f}% of 50-institution target")
print(f"{'=' * 80}\n")
