"""
Meilisearch Setup Script
Creates and configures search indexes for institutions and programs
"""
import asyncio
import sys
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

import meilisearch
from core.config import settings


async def setup_institutions_index(client: meilisearch.Client) -> None:
    """
    Configure institutions index with search settings
    """
    index_name = "institutions"
    print(f"\n[1/2] Setting up '{index_name}' index...")

    # Create/get index
    index = client.index(index_name)
    print(f"  ✓ Index '{index_name}' created/accessed")

    # Configure searchable attributes (in order of importance)
    searchable_attributes = [
        "name",
        "short_name",
        "description",
        "city",
        "state",
    ]
    index.update_searchable_attributes(searchable_attributes)
    print(f"  ✓ Searchable attributes configured: {', '.join(searchable_attributes)}")

    # Configure filterable attributes
    filterable_attributes = [
        "type",
        "state",
        "verified",
        "accreditation_status",
        "status",
    ]
    index.update_filterable_attributes(filterable_attributes)
    print(f"  ✓ Filterable attributes configured: {', '.join(filterable_attributes)}")

    # Configure sortable attributes
    sortable_attributes = [
        "name",
        "program_count",
        "created_at",
    ]
    index.update_sortable_attributes(sortable_attributes)
    print(f"  ✓ Sortable attributes configured: {', '.join(sortable_attributes)}")

    # Configure ranking rules (in order of importance)
    ranking_rules = [
        "words",        # Number of matching words
        "typo",         # Number of typos (fewer is better)
        "proximity",    # Proximity of query words
        "attribute",    # Attribute order from searchableAttributes
        "sort",         # Custom sort
        "exactness",    # Exactness of the match
    ]
    index.update_ranking_rules(ranking_rules)
    print(f"  ✓ Ranking rules configured: {', '.join(ranking_rules)}")

    # Configure displayed attributes (all by default)
    displayed_attributes = [
        "id",
        "slug",
        "name",
        "short_name",
        "type",
        "state",
        "city",
        "logo_url",
        "website",
        "verified",
        "accreditation_status",
        "program_count",
        "description",
        "created_at",
    ]
    index.update_displayed_attributes(displayed_attributes)
    print(f"  ✓ Displayed attributes configured ({len(displayed_attributes)} fields)")

    # Configure typo tolerance
    typo_tolerance = {
        "enabled": True,
        "minWordSizeForTypos": {
            "oneTypo": 4,   # Words >= 4 chars: allow 1 typo
            "twoTypos": 8,  # Words >= 8 chars: allow 2 typos
        },
        "disableOnWords": [],
        "disableOnAttributes": [],
    }
    index.update_typo_tolerance(typo_tolerance)
    print(f"  ✓ Typo tolerance configured (oneTypo: 4 chars, twoTypos: 8 chars)")

    # Configure pagination
    pagination = {
        "maxTotalHits": 1000,  # Maximum number of results
    }
    index.update_pagination(pagination)
    print(f"  ✓ Pagination configured (maxTotalHits: 1000)")

    print(f"✓ Institutions index configured successfully!\n")


async def setup_programs_index(client: meilisearch.Client) -> None:
    """
    Configure programs index with search settings
    """
    index_name = "programs"
    print(f"[2/2] Setting up '{index_name}' index...")

    # Create/get index
    index = client.index(index_name)
    print(f"  ✓ Index '{index_name}' created/accessed")

    # Configure searchable attributes (in order of importance)
    searchable_attributes = [
        "name",
        "field_of_study",
        "specialization",
        "institution_name",
        "description",
    ]
    index.update_searchable_attributes(searchable_attributes)
    print(f"  ✓ Searchable attributes configured: {', '.join(searchable_attributes)}")

    # Configure filterable attributes
    filterable_attributes = [
        "degree_type",
        "field_of_study",
        "institution_id",
        "institution_state",
        "mode",
        "tuition_annual",
        "cutoff_score",
        "status",
        "is_active",
    ]
    index.update_filterable_attributes(filterable_attributes)
    print(f"  ✓ Filterable attributes configured: {', '.join(filterable_attributes)}")

    # Configure sortable attributes
    sortable_attributes = [
        "name",
        "tuition_annual",
        "cutoff_score",
        "duration_years",
        "created_at",
    ]
    index.update_sortable_attributes(sortable_attributes)
    print(f"  ✓ Sortable attributes configured: {', '.join(sortable_attributes)}")

    # Configure ranking rules (in order of importance)
    ranking_rules = [
        "words",        # Number of matching words
        "typo",         # Number of typos (fewer is better)
        "proximity",    # Proximity of query words
        "attribute",    # Attribute order from searchableAttributes
        "sort",         # Custom sort
        "exactness",    # Exactness of the match
    ]
    index.update_ranking_rules(ranking_rules)
    print(f"  ✓ Ranking rules configured: {', '.join(ranking_rules)}")

    # Configure displayed attributes (all by default)
    displayed_attributes = [
        "id",
        "institution_id",
        "slug",
        "name",
        "degree_type",
        "field_of_study",
        "specialization",
        "qualification",
        "duration_years",
        "duration_text",
        "mode",
        "tuition_annual",
        "cutoff_score",
        "institution_name",
        "institution_slug",
        "institution_state",
        "description",
        "is_active",
        "created_at",
    ]
    index.update_displayed_attributes(displayed_attributes)
    print(f"  ✓ Displayed attributes configured ({len(displayed_attributes)} fields)")

    # Configure typo tolerance
    typo_tolerance = {
        "enabled": True,
        "minWordSizeForTypos": {
            "oneTypo": 4,   # Words >= 4 chars: allow 1 typo
            "twoTypos": 8,  # Words >= 8 chars: allow 2 typos
        },
        "disableOnWords": [],
        "disableOnAttributes": [],
    }
    index.update_typo_tolerance(typo_tolerance)
    print(f"  ✓ Typo tolerance configured (oneTypo: 4 chars, twoTypos: 8 chars)")

    # Configure pagination
    pagination = {
        "maxTotalHits": 1000,  # Maximum number of results
    }
    index.update_pagination(pagination)
    print(f"  ✓ Pagination configured (maxTotalHits: 1000)")

    print(f"✓ Programs index configured successfully!\n")


async def main():
    """
    Main function to set up Meilisearch indexes
    """
    print("=" * 60)
    print("Meilisearch Setup - Admitly Platform")
    print("=" * 60)

    try:
        # Connect to Meilisearch
        print(f"\nConnecting to Meilisearch at {settings.MEILISEARCH_HOST}...")
        client = meilisearch.Client(
            settings.MEILISEARCH_HOST,
            settings.MEILISEARCH_API_KEY
        )

        # Test connection
        health = client.health()
        print(f"✓ Connected successfully! Status: {health.get('status', 'unknown')}")

        # Setup indexes
        await setup_institutions_index(client)
        await setup_programs_index(client)

        # Show final status
        print("=" * 60)
        print("✓ Setup completed successfully!")
        print("=" * 60)
        print("\nNext steps:")
        print("  1. Run sync script to populate indexes:")
        print("     python scripts/sync_to_meilisearch.py")
        print("  2. Test search endpoints:")
        print("     GET http://localhost:8000/api/v1/search?q=computer")
        print()

    except Exception as e:
        print(f"\n✗ Error during setup: {str(e)}")
        print("\nTroubleshooting:")
        print("  1. Ensure Meilisearch is running:")
        print("     docker-compose -f docker-compose.meilisearch.yml up -d")
        print("  2. Check MEILISEARCH_HOST and MEILISEARCH_API_KEY in .env")
        print("  3. Verify connection: curl http://localhost:7700/health")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())
