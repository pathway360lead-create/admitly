# Seed Data

Sample data for development and testing.

## Usage

Seed data is useful for:

- Local development
- Testing
- Demo environments
- Populating reference data (states, institution types, etc.)

## Adding Seed Data

1. Create a SQL file in this directory (e.g., `01_reference_data.sql`)
2. Write INSERT statements
3. Apply using Supabase CLI:

```bash
psql -U postgres -d postgres -f database/seed/01_reference_data.sql
```

## Example Structure

```
database/seed/
├── 01_reference_data.sql    # States, types, enums
├── 02_sample_institutions.sql  # Sample institutions
├── 03_sample_programs.sql   # Sample programs
└── 04_sample_users.sql      # Test users
```

## Guidelines

- Use realistic but fake data
- Don't include sensitive information
- Keep seed files idempotent (safe to run multiple times)
- Use ON CONFLICT clauses to handle duplicates
- Include comments explaining the data

## Example Seed File

```sql
-- Sample seed data for Nigerian states
INSERT INTO public.reference_states (code, name) VALUES
  ('LA', 'Lagos'),
  ('OY', 'Oyo'),
  ('AB', 'Abia')
ON CONFLICT (code) DO NOTHING;
```
