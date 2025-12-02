"""
Supabase sync pipeline for storing scraped data.

This pipeline handles:
- Inserting/updating data in Supabase
- Duplicate detection and handling
- Error handling and logging
- Metadata tracking (source_url, scrape_timestamp)
"""

from scrapy import Spider
from scrapy.exceptions import DropItem
from supabase import create_client, Client
from typing import Dict, Any, Optional
import logging
import os
from datetime import datetime
from slugify import slugify


class SupabaseSyncPipeline:
    """
    Pipeline to sync scraped data to Supabase database.

    For MVP, we insert directly into production tables.
    For full implementation, would use staging tables + approval workflow.
    """

    def __init__(self):
        """Initialize Supabase client"""
        self.logger = logging.getLogger(self.__class__.__name__)

        # Get Supabase credentials from environment
        supabase_url = os.getenv('SUPABASE_URL')
        supabase_key = os.getenv('SUPABASE_SERVICE_KEY')

        if not supabase_url or not supabase_key:
            raise ValueError(
                "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set in environment"
            )

        # Initialize Supabase client
        try:
            self.supabase: Client = create_client(supabase_url, supabase_key)
            self.logger.info("Supabase client initialized successfully")
        except Exception as e:
            self.logger.error(f"Failed to initialize Supabase client: {e}")
            raise

        # Statistics
        self.items_inserted = 0
        self.items_updated = 0
        self.items_failed = 0

    def process_item(self, item: Dict[str, Any], spider: Spider) -> Dict[str, Any]:
        """
        Process and store item in Supabase.

        Args:
            item: Validated item dict
            spider: Spider that scraped the item

        Returns:
            Item if successful

        Raises:
            DropItem: If storage fails
        """
        try:
            source_type = getattr(spider, 'source_type', 'institution')

            # Route to appropriate handler based on source type
            if source_type == 'institution':
                self._sync_institution(item, spider)
            elif source_type == 'program':
                self._sync_program(item, spider)
            elif source_type == 'application_window':
                self._sync_application_window(item, spider)
            elif source_type == 'cost':
                self._sync_cost(item, spider)
            elif source_type == 'contact':
                self._sync_contact(item, spider)
            else:
                raise ValueError(f"Unknown source type: {source_type}")

            return item

        except Exception as e:
            self.items_failed += 1
            self.logger.error(f"Failed to sync item to Supabase: {e}")
            # Don't drop item, just log error for now
            # In production, might want to retry or store in dead letter queue
            return item

    def _sync_institution(self, item: Dict[str, Any], spider: Spider):
        """
        Sync institution data to Supabase.

        Args:
            item: Institution item dict
            spider: Spider that scraped the item
        """
        # Generate slug from name
        slug = slugify(item['name'])

        # Prepare data for Supabase (match database schema)
        data = {
            'slug': slug,
            'name': item['name'],
            'short_name': item.get('short_name'),
            'type': item['type'],
            'state': item['state'],
            'city': item.get('city'),
            'address': item.get('address'),
            'lga': item.get('lga'),
            'website': item.get('website'),
            'email': item.get('email'),
            'phone': item.get('phone'),
            'social_media': item.get('social_media', {}),
            'description': item.get('description'),
            'founded_year': item.get('founded_year'),
            'logo_url': item.get('logo_url'),
            'accreditation_status': item.get('accreditation_status'),
            'accreditation_body': item.get('accreditation_body'),
            'source_url': item['source_url'],
            'last_scraped_at': item.get('scrape_timestamp', datetime.now()).isoformat(),
            'status': 'published',  # MVP: auto-publish, no approval workflow
            'verified': False,  # Can be manually verified later
        }

        # Check if institution already exists (by slug or name)
        existing = self._find_existing_institution(slug, item['name'])

        if existing:
            # Update existing institution
            self._update_institution(existing['id'], data, item)
        else:
            # Insert new institution
            self._insert_institution(data, item)

    def _find_existing_institution(
        self,
        slug: str,
        name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find existing institution by slug or name.

        Args:
            slug: Institution slug
            name: Institution name

        Returns:
            Existing institution dict or None
        """
        try:
            # Try to find by slug first
            result = self.supabase.table('institutions')\
                .select('id, slug, name, updated_at')\
                .eq('slug', slug)\
                .is_('deleted_at', 'null')\
                .execute()

            if result.data:
                return result.data[0]

            # Try to find by name
            result = self.supabase.table('institutions')\
                .select('id, slug, name, updated_at')\
                .eq('name', name)\
                .is_('deleted_at', 'null')\
                .execute()

            if result.data:
                return result.data[0]

            return None

        except Exception as e:
            self.logger.error(f"Error finding existing institution: {e}")
            return None

    def _insert_institution(self, data: Dict[str, Any], item: Dict[str, Any]):
        """
        Insert new institution into Supabase.

        Args:
            data: Prepared data for Supabase
            item: Original item dict
        """
        try:
            result = self.supabase.table('institutions')\
                .insert(data)\
                .execute()

            if result.data:
                self.items_inserted += 1
                self.logger.info(
                    f"Inserted institution: {item['name']} "
                    f"(ID: {result.data[0]['id']})"
                )
            else:
                raise Exception("No data returned from insert")

        except Exception as e:
            self.items_failed += 1
            self.logger.error(f"Failed to insert institution {item['name']}: {e}")
            raise

    def _update_institution(
        self,
        institution_id: str,
        data: Dict[str, Any],
        item: Dict[str, Any]
    ):
        """
        Update existing institution in Supabase.

        Args:
            institution_id: UUID of existing institution
            data: Updated data
            item: Original item dict
        """
        try:
            # Update only if data has changed
            # Remove slug from update (it's immutable)
            update_data = {k: v for k, v in data.items() if k != 'slug'}

            result = self.supabase.table('institutions')\
                .update(update_data)\
                .eq('id', institution_id)\
                .execute()

            if result.data:
                self.items_updated += 1
                self.logger.info(
                    f"Updated institution: {item['name']} "
                    f"(ID: {institution_id})"
                )
            else:
                self.logger.warning(f"No update for institution {item['name']}")

        except Exception as e:
            self.items_failed += 1
            self.logger.error(f"Failed to update institution {item['name']}: {e}")
            raise

    def _sync_program(self, item: Dict[str, Any], spider: Spider):
        """
        Sync program data to Supabase.

        Args:
            item: Program item dict
            spider: Spider that scraped the item
        """
        # First, find the institution ID
        institution_id = self._find_institution_id(item['institution_name'])

        if not institution_id:
            self.logger.warning(
                f"Institution not found for program: {item['name']} "
                f"(Institution: {item['institution_name']})"
            )
            # Skip this program for now
            return

        # Generate slug
        slug = slugify(item['name'])

        # Prepare data
        data = {
            'institution_id': institution_id,
            'slug': slug,
            'name': item['name'],
            'degree_type': item['degree_type'],
            'qualification': item.get('qualification'),
            'field_of_study': item.get('field_of_study'),
            'specialization': item.get('specialization'),
            'duration_years': item.get('duration_years'),
            'duration_text': item.get('duration_text'),
            'mode': item.get('mode'),
            'curriculum_summary': item.get('curriculum_summary'),
            'accreditation_status': item.get('accreditation_status'),
            'accreditation_body': item.get('accreditation_body'),
            'annual_intake': item.get('annual_intake'),
            'source_url': item['source_url'],
            'last_scraped_at': item.get('scrape_timestamp', datetime.now()).isoformat(),
            'status': 'published',
            'is_active': True,
        }

        # Check if program exists
        existing = self._find_existing_program(institution_id, slug, item['name'])

        if existing:
            # Update
            update_data = {k: v for k, v in data.items() if k != 'slug'}
            result = self.supabase.table('programs')\
                .update(update_data)\
                .eq('id', existing['id'])\
                .execute()
            self.items_updated += 1
            self.logger.info(f"Updated program: {item['name']}")
        else:
            # Insert
            result = self.supabase.table('programs')\
                .insert(data)\
                .execute()
            self.items_inserted += 1
            self.logger.info(f"Inserted program: {item['name']}")

    def _find_institution_id(self, institution_name: str) -> Optional[str]:
        """
        Find institution ID by name with multiple matching strategies.

        Tries in order:
        1. Exact name match
        2. Case-insensitive name match
        3. Short name match
        4. Partial name match (contains)

        Args:
            institution_name: Name of institution

        Returns:
            Institution UUID or None
        """
        try:
            # Strategy 1: Exact name match
            result = self.supabase.table('institutions')\
                .select('id, name')\
                .eq('name', institution_name)\
                .is_('deleted_at', 'null')\
                .execute()

            if result.data:
                self.logger.debug(f"Found institution by exact match: {institution_name}")
                return result.data[0]['id']

            # Strategy 2: Case-insensitive match by fetching all and comparing
            all_institutions = self.supabase.table('institutions')\
                .select('id, name, short_name')\
                .is_('deleted_at', 'null')\
                .execute()

            institution_name_lower = institution_name.lower()

            # Try case-insensitive name match
            for inst in all_institutions.data:
                if inst['name'].lower() == institution_name_lower:
                    self.logger.info(
                        f"Found institution by case-insensitive match: "
                        f"{institution_name} -> {inst['name']}"
                    )
                    return inst['id']

            # Strategy 3: Short name match
            for inst in all_institutions.data:
                if inst.get('short_name') and inst['short_name'].lower() == institution_name_lower:
                    self.logger.info(
                        f"Found institution by short name: "
                        f"{institution_name} -> {inst['name']}"
                    )
                    return inst['id']

            # Strategy 4: Partial match (contains)
            for inst in all_institutions.data:
                if institution_name_lower in inst['name'].lower():
                    self.logger.info(
                        f"Found institution by partial match: "
                        f"{institution_name} -> {inst['name']}"
                    )
                    return inst['id']

            # No match found
            self.logger.warning(
                f"Institution not found with any strategy: {institution_name}. "
                f"Available institutions: {[inst['name'] for inst in all_institutions.data[:5]]}"
            )
            return None

        except Exception as e:
            self.logger.error(f"Error finding institution ID for '{institution_name}': {e}")
            return None

    def _find_existing_program(
        self,
        institution_id: str,
        slug: str,
        name: str
    ) -> Optional[Dict[str, Any]]:
        """
        Find existing program.

        Args:
            institution_id: Institution UUID
            slug: Program slug
            name: Program name

        Returns:
            Existing program dict or None
        """
        try:
            # Try slug first
            result = self.supabase.table('programs')\
                .select('id')\
                .eq('institution_id', institution_id)\
                .eq('slug', slug)\
                .is_('deleted_at', 'null')\
                .execute()

            if result.data:
                return result.data[0]

            # Try name
            result = self.supabase.table('programs')\
                .select('id')\
                .eq('institution_id', institution_id)\
                .eq('name', name)\
                .is_('deleted_at', 'null')\
                .execute()

            if result.data:
                return result.data[0]

            return None

        except Exception as e:
            self.logger.error(f"Error finding existing program: {e}")
            return None

    def _sync_application_window(self, item: Dict[str, Any], spider: Spider):
        """
        Sync application window data to Supabase.

        Args:
            item: Application window item dict
            spider: Spider that scraped the item
        """
        # Find institution ID
        institution_id = self._find_institution_id(item['institution_name'])

        if not institution_id:
            self.logger.warning(
                f"Institution not found for application window: "
                f"{item['institution_name']}"
            )
            return

        # Prepare data
        data = {
            'institution_id': institution_id if item['level'] == 'institution' else None,
            'program_id': item.get('program_id'),
            'level': item['level'],
            'academic_year': item['academic_year'],
            'intake_type': item.get('intake_type'),
            'application_start_date': item.get('application_start_date'),
            'application_end_date': item.get('application_end_date'),
            'screening_date': item.get('screening_date'),
            'admission_list_date': item.get('admission_list_date'),
            'application_portal_url': item.get('application_portal_url'),
            'information_url': item.get('information_url'),
            'source_url': item['source_url'],
            'last_verified_at': item.get('scrape_timestamp', datetime.now()).isoformat(),
            'status': 'pending',  # Will be updated by cron job
        }

        # Insert (for MVP, always insert new windows)
        result = self.supabase.table('application_windows')\
            .insert(data)\
            .execute()

        self.items_inserted += 1
        self.logger.info(f"Inserted application window for {item['institution_name']}")

    def _sync_cost(self, item: Dict[str, Any], spider: Spider):
        """
        Sync cost/fee data to Supabase.

        Args:
            item: Cost item dict
            spider: Spider that scraped the item
        """
        # Find institution ID
        institution_id = self._find_institution_id(item['institution_name'])

        if not institution_id:
            self.logger.warning(
                f"Institution not found for cost: {item['institution_name']}"
            )
            return

        # Prepare data
        data = {
            'institution_id': institution_id if item['level'] == 'institution' else None,
            'program_id': item.get('program_id'),
            'level': item['level'],
            'fee_type': item['fee_type'],
            'fee_name': item['fee_name'],
            'amount': item.get('amount_kobo'),  # amount_kobo -> amount (stored as bigint kobo)
            'currency': item.get('currency', 'NGN'),
            'academic_year': item.get('academic_year'),
            'student_category': item.get('student_category'),
            'payment_frequency': item.get('payment_frequency'),
            'is_mandatory': item.get('is_mandatory', True),
            'effective_date': item.get('effective_date'),
            'description': item.get('description'),
            'source_url': item['source_url'],
        }

        # Insert
        result = self.supabase.table('costs')\
            .insert(data)\
            .execute()

        self.items_inserted += 1
        self.logger.info(f"Inserted cost: {item['fee_name']}")

    def _sync_contact(self, item: Dict[str, Any], spider: Spider):
        """
        Sync contact data to Supabase.

        Args:
            item: Contact item dict
            spider: Spider that scraped the item
        """
        # Find institution ID
        institution_id = self._find_institution_id(item['institution_name'])

        if not institution_id:
            self.logger.warning(
                f"Institution not found for contact: {item['institution_name']}"
            )
            return

        # Prepare data
        data = {
            'institution_id': institution_id,
            'name': item['name'],
            'role': item.get('role'),
            'department': item.get('department'),
            'email': item.get('email'),
            'phone': item.get('phone'),
            'office_hours': item.get('office_hours'),
            'is_primary': item.get('is_primary', False),
            'verified': False,
        }

        # Insert
        result = self.supabase.table('institution_contacts')\
            .insert(data)\
            .execute()

        self.items_inserted += 1
        self.logger.info(f"Inserted contact: {item['name']}")

    def close_spider(self, spider: Spider):
        """
        Log sync statistics when spider closes.

        Args:
            spider: Spider being closed
        """
        total = self.items_inserted + self.items_updated + self.items_failed
        success_rate = ((total - self.items_failed) / total * 100) if total > 0 else 0.0

        self.logger.info(
            f"\n{'='*70}\n"
            f"Supabase Sync Pipeline Statistics\n"
            f"Total Items: {total}\n"
            f"Inserted: {self.items_inserted}\n"
            f"Updated: {self.items_updated}\n"
            f"Failed: {self.items_failed}\n"
            f"Success Rate: {success_rate:.1f}%\n"
            f"{'='*70}"
        )
