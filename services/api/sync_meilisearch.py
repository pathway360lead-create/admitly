"""
Meilisearch Sync Script
Syncs institutions and programs from Supabase to Meilisearch

Usage:
    python sync_meilisearch.py --index institutions
    python sync_meilisearch.py --index programs
    python sync_meilisearch.py --index all
"""

import asyncio
import logging
import argparse
from typing import List, Dict, Any
import meilisearch
from supabase import create_client, Client
from core.config import settings

# Setup logging
logging.basicConfig(
    level=logging.INFO,
    format='{"asctime": "%(asctime)s", "name": "%(name)s", "levelname": "%(levelname)s", "message": "%(message)s"}',
)
logger = logging.getLogger(__name__)


class MeilisearchSync:
    """Sync data from Supabase to Meilisearch"""

    def __init__(self):
        """Initialize connections to Supabase and Meilisearch"""
        logger.info("Initializing Meilisearch sync...")

        # Initialize Supabase client
        self.supabase: Client = create_client(
            settings.SUPABASE_URL,
            settings.SUPABASE_SERVICE_KEY  # Use service key for admin access
        )
        logger.info(f"✓ Connected to Supabase: {settings.SUPABASE_URL}")

        # Initialize Meilisearch client
        self.meilisearch = meilisearch.Client(
            settings.MEILISEARCH_HOST,
            settings.MEILISEARCH_API_KEY
        )
        logger.info(f"✓ Connected to Meilisearch: {settings.MEILISEARCH_HOST}")

    def configure_institutions_index(self):
        """Configure institutions index with searchable attributes and filters"""
        logger.info("Configuring institutions index...")

        index = self.meilisearch.index('institutions')

        # Searchable attributes (what users can search)
        index.update_searchable_attributes([
            'name',
            'short_name',
            'description',
            'city',
            'state',
            'type',
        ])

        # Filterable attributes (for filters)
        index.update_filterable_attributes([
            'type',
            'state',
            'verified',
            'status',
        ])

        # Sortable attributes
        index.update_sortable_attributes([
            'name',
            'created_at',
            'program_count',
        ])

        # Display attributes (what gets returned in results)
        index.update_displayed_attributes([
            'id',
            'slug',
            'name',
            'short_name',
            'type',
            'state',
            'city',
            'logo_url',
            'website',
            'verified',
            'program_count',
            'description',
        ])

        logger.info("✓ Institutions index configured")

    def configure_programs_index(self):
        """Configure programs index with searchable attributes and filters"""
        logger.info("Configuring programs index...")

        index = self.meilisearch.index('programs')

        # Searchable attributes
        index.update_searchable_attributes([
            'name',
            'degree_type',
            'field_of_study',
            'specialization',
            'institution_name',
            'institution_state',
            'description',
        ])

        # Filterable attributes
        index.update_filterable_attributes([
            'degree_type',
            'field_of_study',
            'mode',
            'institution_state',
            'status',
            'is_active',
        ])

        # Sortable attributes
        index.update_sortable_attributes([
            'name',
            'created_at',
        ])

        # Display attributes
        index.update_displayed_attributes([
            'id',
            'slug',
            'name',
            'degree_type',
            'field_of_study',
            'specialization',
            'mode',
            'duration_years',
            'institution_id',
            'institution_name',
            'institution_slug',
            'institution_state',
            'description',
        ])

        logger.info("✓ Programs index configured")

    async def sync_institutions(self) -> int:
        """
        Sync institutions from Supabase to Meilisearch

        Returns:
            Number of institutions synced
        """
        logger.info("Syncing institutions from Supabase...")

        # Fetch all published, non-deleted institutions
        response = (
            self.supabase.table('institutions')
            .select('*')
            .eq('status', 'published')
            .is_('deleted_at', 'null')
            .order('name')
            .execute()
        )

        institutions = response.data
        logger.info(f"Fetched {len(institutions)} institutions from Supabase")

        if not institutions:
            logger.warning("No institutions found to sync")
            return 0

        # For each institution, get program count
        for inst in institutions:
            prog_response = (
                self.supabase.table('programs')
                .select('*', count='exact')
                .eq('institution_id', inst['id'])
                .eq('status', 'published')
                .is_('deleted_at', 'null')
                .limit(0)
                .execute()
            )
            inst['program_count'] = prog_response.count or 0

        # Format for Meilisearch (ensure all fields are present)
        documents = []
        for inst in institutions:
            documents.append({
                'id': inst['id'],
                'slug': inst['slug'],
                'name': inst['name'],
                'short_name': inst.get('short_name', ''),
                'type': inst['type'],
                'state': inst['state'],
                'city': inst.get('city', ''),
                'logo_url': inst.get('logo_url'),
                'website': inst.get('website'),
                'verified': inst.get('verified', False),
                'program_count': inst.get('program_count', 0),
                'description': inst.get('description', ''),
                'status': inst['status'],
                'created_at': inst.get('created_at', ''),
            })

        # Index in Meilisearch
        logger.info(f"Indexing {len(documents)} institutions in Meilisearch...")
        index = self.meilisearch.index('institutions')

        # Add or update documents
        task = index.add_documents(documents, primary_key='id')
        logger.info(f"✓ Institutions indexed. Task ID: {task.task_uid}")

        # Wait for task to complete
        logger.info("Waiting for indexing to complete...")
        status = self.meilisearch.wait_for_task(task.task_uid)
        logger.info(f"✓ Indexing status: {status['status']}")

        return len(documents)

    async def sync_programs(self) -> int:
        """
        Sync programs from Supabase to Meilisearch

        Returns:
            Number of programs synced
        """
        logger.info("Syncing programs from Supabase...")

        # Fetch all published, active, non-deleted programs with institution data
        response = (
            self.supabase.table('programs')
            .select('''
                *,
                institution:institutions (
                    name,
                    slug,
                    state
                )
            ''')
            .eq('status', 'published')
            .eq('is_active', True)
            .is_('deleted_at', 'null')
            .order('name')
            .execute()
        )

        programs = response.data
        logger.info(f"Fetched {len(programs)} programs from Supabase")

        if not programs:
            logger.warning("No programs found to sync")
            return 0

        # Format for Meilisearch
        documents = []
        for prog in programs:
            institution = prog.get('institution', {}) or {}

            documents.append({
                'id': prog['id'],
                'slug': prog.get('slug', ''),
                'name': prog['name'],
                'degree_type': prog.get('degree_type', ''),
                'field_of_study': prog.get('field_of_study', ''),
                'specialization': prog.get('specialization'),
                'mode': prog.get('mode', ''),
                'duration_years': prog.get('duration_years'),
                'institution_id': prog.get('institution_id', ''),
                'institution_name': institution.get('name', ''),
                'institution_slug': institution.get('slug', ''),
                'institution_state': institution.get('state', ''),
                'description': prog.get('description', ''),
                'status': prog['status'],
                'is_active': prog.get('is_active', True),
                'created_at': prog.get('created_at', ''),
            })

        # Index in Meilisearch
        logger.info(f"Indexing {len(documents)} programs in Meilisearch...")
        index = self.meilisearch.index('programs')

        # Add or update documents
        task = index.add_documents(documents, primary_key='id')
        logger.info(f"✓ Programs indexed. Task ID: {task.task_uid}")

        # Wait for task to complete
        logger.info("Waiting for indexing to complete...")
        status = self.meilisearch.wait_for_task(task.task_uid)
        logger.info(f"✓ Indexing status: {status['status']}")

        return len(documents)

    async def clear_index(self, index_name: str):
        """Clear all documents from an index"""
        logger.info(f"Clearing {index_name} index...")
        index = self.meilisearch.index(index_name)
        task = index.delete_all_documents()
        self.meilisearch.wait_for_task(task.task_uid)
        logger.info(f"✓ {index_name} index cleared")

    async def get_index_stats(self, index_name: str) -> Dict[str, Any]:
        """Get statistics for an index"""
        index = self.meilisearch.index(index_name)
        stats = index.get_stats()
        return stats


async def main():
    """Main entry point for sync script"""
    parser = argparse.ArgumentParser(description='Sync data to Meilisearch')
    parser.add_argument(
        '--index',
        choices=['institutions', 'programs', 'all'],
        default='all',
        help='Which index to sync (default: all)'
    )
    parser.add_argument(
        '--clear',
        action='store_true',
        help='Clear index before syncing'
    )
    parser.add_argument(
        '--stats',
        action='store_true',
        help='Show index statistics after sync'
    )

    args = parser.parse_args()

    # Initialize sync
    sync = MeilisearchSync()

    try:
        # Sync institutions
        if args.index in ['institutions', 'all']:
            if args.clear:
                await sync.clear_index('institutions')

            # Configure index
            sync.configure_institutions_index()

            # Sync data
            count = await sync.sync_institutions()
            logger.info(f"✓ Synced {count} institutions")

            # Show stats
            if args.stats:
                stats = await sync.get_index_stats('institutions')
                logger.info(f"Institutions index stats: {stats}")

        # Sync programs
        if args.index in ['programs', 'all']:
            if args.clear:
                await sync.clear_index('programs')

            # Configure index
            sync.configure_programs_index()

            # Sync data
            count = await sync.sync_programs()
            logger.info(f"✓ Synced {count} programs")

            # Show stats
            if args.stats:
                stats = await sync.get_index_stats('programs')
                logger.info(f"Programs index stats: {stats}")

        logger.info("=" * 50)
        logger.info("✓ Meilisearch sync completed successfully!")
        logger.info("=" * 50)

    except Exception as e:
        logger.error(f"✗ Sync failed: {str(e)}", exc_info=True)
        raise


if __name__ == "__main__":
    asyncio.run(main())
