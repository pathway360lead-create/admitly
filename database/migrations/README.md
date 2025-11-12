# Database Migrations

Supabase database migrations for the Admitly platform.

## Setup

1. Install Supabase CLI:

```bash
npm install -g supabase
```

2. Initialize Supabase (if not already done):

```bash
supabase init
```

3. Link to your Supabase project:

```bash
supabase link --project-ref your-project-ref
```

## Creating Migrations

```bash
supabase migration new migration_name
```

This creates a new SQL file in `database/migrations/` with a timestamp prefix.

## Applying Migrations

### Local Development

```bash
supabase db reset  # Reset local database
supabase db push   # Apply migrations
```

### Production

```bash
supabase db push --db-url postgresql://...
```

## Migration Guidelines

1. **Always test locally first**
2. **Use transactions** for multiple operations
3. **Include rollback instructions** in comments
4. **Version control** all migration files
5. **Never modify existing migrations** after deployment

## Migration Order

Migrations are applied in chronological order based on the timestamp prefix.

## See Also

- Database Schema: `specs/database-schema.md`
- Supabase Docs: https://supabase.com/docs/guides/cli
