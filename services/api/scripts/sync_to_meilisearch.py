"""
Meilisearch Sync Script
Syncs data from Supabase to Meilisearch indexes
"""
import asyncio
import sys
from pathlib import Path
from typing import Dict, List, Any

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import meilisearch
from supabase import create_client, Client
from core.config import settings


def get_supabase_client() -> Client:
    """Create Supabase client"""
    return create_client(settings.SUPABASE_URL, settings.SUPABASE_SERVICE_KEY)


def get_meilisearch_client() -> meilisearch.Client:
    """Create Meilisearch client"""
    return meilisearch.Client(
        settings.MEILISEARCH_HOST,
        settings.MEILISEARCH_API_KEY
    )


async def sync_institutions(
    supabase: Client,
    meilisearch_client: meilisearch.Client
) -> None:
    """
    Sync institutions from Supabase to Meilisearch

    Steps:
    1. Fetch all published institutions from Supabase
    2. Transform data for Meilisearch
    3. Batch update to Meilisearch index
    """
    print("\n[1/2] Syncing institutions...")

    try:
        # Fetch institutions from Supabase
        print("  → Fetching institutions from Supabase...")
        response = (
            supabase.table('institutions')
            .select('*')
            .eq('status', 'published')
            .is_('deleted_at', 'null')
            .execute()
        )

        institutions = response.data
        print(f"  ✓ Fetched {len(institutions)} institutions")

        if not institutions:
            print("  ℹ No institutions to sync")
            return

        # Get program counts for all institutions
        print("  → Calculating program counts...")
        institution_ids = [inst['id'] for inst in institutions]

        programs_response = (
            supabase.table('programs')
            .select('institution_id')
            .in_('institution_id', institution_ids)
            .eq('status', 'published')
            .is_('deleted_at', 'null')
            .execute()
        )

        # Count programs per institution
        program_counts: Dict[str, int] = {}
        for program in programs_response.data:
            inst_id = program['institution_id']
            program_counts[inst_id] = program_counts.get(inst_id, 0) + 1

        print(f"  ✓ Calculated program counts for {len(program_counts)} institutions")

        # Transform data for Meilisearch
        print("  → Transforming data for Meilisearch...")
        documents = []
        for inst in institutions:
            # Add program_count
            inst['program_count'] = program_counts.get(inst['id'], 0)

            # Convert datetime to string
            if inst.get('created_at'):
                inst['created_at'] = str(inst['created_at'])
            if inst.get('updated_at'):
                inst['updated_at'] = str(inst['updated_at'])

            # Remove fields not needed for search
            fields_to_keep = [
                'id', 'slug', 'name', 'short_name', 'type', 'state', 'city',
                'logo_url', 'website', 'verified', 'accreditation_status',
                'program_count', 'description', 'status', 'created_at'
            ]

            document = {k: v for k, v in inst.items() if k in fields_to_keep}
            documents.append(document)

        print(f"  ✓ Transformed {len(documents)} documents")

        # Update Meilisearch index
        print("  → Updating Meilisearch index...")
        index = meilisearch_client.index('institutions')

        # Delete all existing documents first (clean sync)
        print("    → Deleting existing documents...")
        index.delete_all_documents()

        # Add new documents in batches
        BATCH_SIZE = 100
        total_batches = (len(documents) + BATCH_SIZE - 1) // BATCH_SIZE

        for i in range(0, len(documents), BATCH_SIZE):
            batch = documents[i:i + BATCH_SIZE]
            batch_num = (i // BATCH_SIZE) + 1

            task = index.add_documents(batch)
            print(f"    → Batch {batch_num}/{total_batches}: Added {len(batch)} documents (Task ID: {task.task_uid})")

        print(f"  ✓ Institutions index updated successfully!")

    except Exception as e:
        print(f"  ✗ Error syncing institutions: {str(e)}")
        raise


async def sync_programs(
    supabase: Client,
    meilisearch_client: meilisearch.Client
) -> None:
    """
    Sync programs from Supabase to Meilisearch

    Steps:
    1. Fetch all published programs from Supabase (with institution data)
    2. Transform data for Meilisearch
    3. Batch update to Meilisearch index
    """
    print("\n[2/2] Syncing programs...")

    try:
        # Fetch programs with institution data from Supabase
        print("  → Fetching programs from Supabase...")
        response = (
            supabase.table('programs')
            .select(
                '''
                *,
                institution:institutions (
                    name,
                    slug,
                    state
                )
                '''
            )
            .eq('status', 'published')
            .is_('deleted_at', 'null')
            .execute()
        )

        programs = response.data
        print(f"  ✓ Fetched {len(programs)} programs")

        if not programs:
            print("  ℹ No programs to sync")
            return

        # Transform data for Meilisearch
        print("  → Transforming data for Meilisearch...")
        documents = []
        for prog in programs:
            # Extract institution data
            institution_data = prog.get('institution', {})
            institution_name = institution_data.get('name', 'Unknown')
            institution_slug = institution_data.get('slug', '')
            institution_state = institution_data.get('state', '')

            # Get cutoff score (aggregate from program_cutoffs table - we'll add a simple fallback)
            # For now, set to None - can be enhanced later
            cutoff_score = None

            # Get tuition (aggregate from program_costs table - we'll add a simple fallback)
            # For now, set to None - can be enhanced later
            tuition_annual = None

            # Convert datetime to string
            created_at = str(prog['created_at']) if prog.get('created_at') else None

            # Build document
            fields_to_keep = [
                'id', 'institution_id', 'slug', 'name', 'degree_type',
                'field_of_study', 'specialization', 'qualification',
                'duration_years', 'duration_text', 'mode', 'description',
                'status', 'is_active'
            ]

            document = {k: v for k, v in prog.items() if k in fields_to_keep}

            # Add institution fields
            document['institution_name'] = institution_name
            document['institution_slug'] = institution_slug
            document['institution_state'] = institution_state
            document['created_at'] = created_at
            document['tuition_annual'] = tuition_annual
            document['cutoff_score'] = cutoff_score

            documents.append(document)

        print(f"  ✓ Transformed {len(documents)} documents")

        # Update Meilisearch index
        print("  → Updating Meilisearch index...")
        index = meilisearch_client.index('programs')

        # Delete all existing documents first (clean sync)
        print("    → Deleting existing documents...")
        index.delete_all_documents()

        # Add new documents in batches
        BATCH_SIZE = 100
        total_batches = (len(documents) + BATCH_SIZE - 1) // BATCH_SIZE

        for i in range(0, len(documents), BATCH_SIZE):
            batch = documents[i:i + BATCH_SIZE]
            batch_num = (i // BATCH_SIZE) + 1

            task = index.add_documents(batch)
            print(f"    → Batch {batch_num}/{total_batches}: Added {len(batch)} documents (Task ID: {task.task_uid})")

        print(f"  ✓ Programs index updated successfully!")

    except Exception as e:
        print(f"  ✗ Error syncing programs: {str(e)}")
        raise


async def main():
    """
    Main function to sync data to Meilisearch
    """
    print("=" * 60)
    print("Meilisearch Data Sync - Admitly Platform")
    print("=" * 60)

    try:
        # Connect to Supabase
        print(f"\nConnecting to Supabase at {settings.SUPABASE_URL}...")
        supabase = get_supabase_client()
        print("✓ Connected to Supabase")

        # Connect to Meilisearch
        print(f"\nConnecting to Meilisearch at {settings.MEILISEARCH_HOST}...")
        meilisearch_client = get_meilisearch_client()
        health = meilisearch_client.health()
        print(f"✓ Connected to Meilisearch (Status: {health.get('status', 'unknown')})")

        # Sync data
        await sync_institutions(supabase, meilisearch_client)
        await sync_programs(supabase, meilisearch_client)

        # Show final status
        print("\n" + "=" * 60)
        print("✓ Sync completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Test search endpoints:")
        print("     GET http://localhost:8000/api/v1/search?q=computer")
        print("  2. Test autocomplete:")
        print("     GET http://localhost:8000/api/v1/search/autocomplete?q=uni")
        print()

    except Exception as e:
        print(f"\n✗ Error during sync: {str(e)}")
        print("\nTroubleshooting:")
        print("  1. Ensure Meilisearch indexes are set up:")
        print("     python scripts/setup_meilisearch.py")
        print("  2. Check Supabase connection and data")
        print("  3. Verify environment variables in .env")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
