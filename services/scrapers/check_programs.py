"""Check programs in Supabase"""
from dotenv import load_dotenv
import os
from supabase import create_client
from collections import defaultdict

load_dotenv()
supabase = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY'))

# Get all programs
programs = supabase.table('programs').select('id, name, institution_id, degree_type').execute()
print(f'\nTotal programs: {len(programs.data)}')

if programs.data:
    print('\nPrograms by institution ID:')
    prog_by_inst = defaultdict(list)
    for p in programs.data:
        prog_by_inst[p['institution_id']].append(p['name'])

    for inst_id, progs in prog_by_inst.items():
        print(f'  {inst_id}: {len(progs)} programs')
        for prog in progs:
            print(f'    - {prog}')
else:
    print('\nNo programs found in database')

# Get institutions for reference
institutions = supabase.table('institutions').select('id, name').execute()
print(f'\n\nInstitutions mapping:')
for inst in institutions.data:
    print(f'  {inst["id"]}: {inst["name"]}')
