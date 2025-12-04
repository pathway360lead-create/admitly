"""
Sync Meilisearch Production Instance
Syncs 686 programs from Supabase to production Meilisearch on Render
"""
import asyncio
import os
from supabase import create_client
import meilisearch
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Production URLs (from environment or hardcoded)
SUPABASE_URL = "https://jvmmexjbnolzukhdhwds.supabase.co"
SUPABASE_KEY = os.getenv("SUPABASE_KEY", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp2bW1leGpibm9senVraGRod2RzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjI4NTgxMzYsImV4cCI6MjA3ODQzNDEzNn0.dhUaZen1zQ2cAUyzWX8Yw8r45UtzyfMc7hD_zRhzBHM")

# Production Meilisearch on Render
MEILISEARCH_HOST = "https://admitly-search.onrender.com"
MEILISEARCH_API_KEY = os.getenv("MEILISEARCH_API_KEY", "masterKey")


async def sync_programs_to_meilisearch():
    """Sync all programs from Supabase to Meilisearch"""

    logger.info("Starting Meilisearch production sync...")

    # Connect to Supabase
    supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
    logger.info(f"✓ Connected to Supabase: {SUPABASE_URL}")

    # Connect to Meilisearch
    meilisearch_client = meilisearch.Client(MEILISEARCH_HOST, MEILISEARCH_API_KEY)
    logger.info(f"✓ Connected to Meilisearch: {MEILISEARCH_HOST}")

    # Fetch all programs from Supabase
    logger.info("Fetching programs from Supabase...")
    response = supabase.table("programs").select(
        "id, slug, name, degree_type, qualification, duration_years, description, "
        "institution_id, status, created_at, updated_at"
    ).eq("status", "published").is_("deleted_at", "null").execute()

    programs = response.data
    logger.info(f"✓ Fetched {len(programs)} programs")

    if len(programs) == 0:
        logger.error("No programs found in database!")
        return

    # Get institution names for each program
    logger.info("Enriching programs with institution data...")
    for program in programs:
        inst_response = supabase.table("institutions").select(
            "name, short_name, state, type"
        ).eq("id", program["institution_id"]).single().execute()

        if inst_response.data:
            program["institution_name"] = inst_response.data["name"]
            program["institution_short_name"] = inst_response.data.get("short_name")
            program["state"] = inst_response.data["state"]
            program["institution_type"] = inst_response.data["type"]

    logger.info(f"✓ Enriched {len(programs)} programs with institution data")

    # Configure programs index
    logger.info("Configuring programs index...")
    try:
        programs_index = meilisearch_client.index("programs")

        # Set searchable attributes
        programs_index.update_searchable_attributes([
            "name",
            "institution_name",
            "institution_short_name",
            "degree_type",
            "qualification",
            "description",
        ])

        # Set filterable attributes
        programs_index.update_filterable_attributes([
            "institution_id",
            "state",
            "institution_type",
            "degree_type",
            "qualification",
            "status",
        ])

        # Set sortable attributes
        programs_index.update_sortable_attributes([
            "name",
            "created_at",
            "updated_at",
        ])

        logger.info("✓ Programs index configured")
    except Exception as e:
        logger.error(f"Failed to configure index: {e}")
        # Continue anyway, index might already be configured

    # Add documents to Meilisearch
    logger.info(f"Adding {len(programs)} programs to Meilisearch...")
    try:
        task = programs_index.add_documents(programs, primary_key="id")
        logger.info(f"✓ Sync task created: {task}")

        # Wait for task to complete (optional)
        logger.info("Waiting for indexing to complete...")
        await asyncio.sleep(5)  # Give it time to index

        # Check index stats
        stats = programs_index.get_stats()
        logger.info(f"✓ Index stats: {stats['numberOfDocuments']} documents indexed")

        logger.info("=" * 50)
        logger.info("✅ PRODUCTION SYNC COMPLETE!")
        logger.info(f"✅ {len(programs)} programs synced to Meilisearch")
        logger.info(f"✅ Search URL: {MEILISEARCH_HOST}")
        logger.info("=" * 50)

        return {
            "success": True,
            "programs_synced": len(programs),
            "meilisearch_host": MEILISEARCH_HOST
        }

    except Exception as e:
        logger.error(f"✗ Sync failed: {e}")
        return {
            "success": False,
            "error": str(e)
        }


if __name__ == "__main__":
    result = asyncio.run(sync_programs_to_meilisearch())

    if result and result["success"]:
        print(f"\n✅ Successfully synced {result['programs_synced']} programs!")
        print(f"🔍 Test search: curl {result['meilisearch_host']}/indexes/programs/search?q=computer")
    else:
        print(f"\n❌ Sync failed!")
        if result:
            print(f"Error: {result['error']}")
