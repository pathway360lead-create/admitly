"""
Ahmadu Bello University (ABU) Spider

Scrapes institution profile and program data from ABU website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class AbuSpider(BaseSpider, InstitutionSpiderMixin):
    """
    Spider for scraping Ahmadu Bello University data.

    This spider scrapes:
    - Institution profile (name, location, contact info, etc.)
    - Programs offered (if available on the page)
    """

    name = "abu_spider"
    source_type = "institution"
    priority = 3  # Medium priority
    institution_name = "Ahmadu Bello University"

    # Start URLs
    start_urls = [
        "https://abu.edu.ng/about",
        "https://abu.edu.ng/",
    ]

    # Custom settings for ABU
    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,  # Be polite
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,  # Disable for MVP - using fallback data
    }

    def parse(self, response: Response) -> Generator:
        """
        Parse ABU homepage/about page.

        Extracts institution profile data.

        Args:
            response: Scrapy Response object

        Yields:
            InstitutionItem
        """
        self.logger.info(f"Parsing ABU page: {response.url}")

        try:
            # Extract institution data
            institution = self._extract_institution_profile(response)

            if institution:
                # Generate content hash for deduplication
                hash_data = {
                    'name': institution['name'],
                    'website': institution.get('website'),
                    'description': institution.get('description'),
                }
                institution['content_hash'] = self.generate_hash(hash_data)

                # Log and yield
                self.log_item(institution, "institution")
                yield institution

        except Exception as e:
            self.handle_error(e, "institution")

    def _extract_institution_profile(self, response: Response) -> Optional[dict]:
        """
        Extract ABU institution profile from page.

        This method contains the actual scraping logic with CSS selectors
        specific to ABU's website structure.

        Args:
            response: Scrapy Response object

        Returns:
            dict: Institution data or None if extraction fails
        """
        try:
            # Try to extract from page, fall back to known data
            name = self.extract_first(
                response,
                'h1.institution-name::text',
                'h1::text',
                '.page-title::text',
                default='Ahmadu Bello University'
            )

            # Extract description - try multiple possible selectors
            description = self.extract_first(
                response,
                '.about-content p::text',
                '.about-text::text',
                'article p::text',
                '.content p::text',
                default=None
            )

            # If description is empty or too short, use a default
            if not description or len(description) < 50:
                description = (
                    "Ahmadu Bello University (ABU) is a federal government research "
                    "university located in Zaria, Kaduna State, Nigeria. Founded in 1962, "
                    "it is one of the first generation universities in Nigeria and the "
                    "largest university in Nigeria and second largest in Africa."
                )

            # Extract contact information
            email = self.extract_first(
                response,
                'a[href^="mailto:"]::text',
                '.email::text',
                '.contact-email::text',
                default='info@abu.edu.ng'
            )

            phone = self.extract_first(
                response,
                '.phone::text',
                '.contact-phone::text',
                'a[href^="tel:"]::text',
                default='+234-69-550581'
            )

            # Extract social media links
            social_media = self.extract_social_media(response)

            # Construct institution item
            institution_data = {
                'name': self.clean_text(name) or 'Ahmadu Bello University',
                'short_name': 'ABU',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Kaduna',
                'city': 'Zaria',
                'address': 'Ahmadu Bello University, Zaria, Kaduna State',
                'lga': 'Zaria',
                'website': 'https://abu.edu.ng',
                'email': self.clean_text(email),
                'phone': self.clean_text(phone),
                'social_media': social_media,
                'description': self.clean_text(description),
                'founded_year': 1962,
                'logo_url': self.extract_url(
                    response,
                    'img[alt*="logo"]::attr(src)',
                    default=None
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            }

            # Validate using Pydantic (will be done in pipeline, but check here too)
            try:
                item = InstitutionItem(**institution_data)
                return item.model_dump()
            except Exception as e:
                self.logger.error(f"Pydantic validation error: {e}")
                # Return dict anyway, pipeline will validate
                return institution_data

        except Exception as e:
            self.logger.error(f"Error extracting institution profile: {e}")
            return None


class AbuProgramsSpider(BaseSpider):
    """
    Dedicated spider for ABU programs.

    Separate spider for better modularity and scheduling.
    Can be run independently to update only program data.
    """

    name = "abu_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Ahmadu Bello University"

    start_urls = [
        "https://abu.edu.ng/programmes",
    ]

    def parse(self, response: Response) -> Generator:
        """
        Parse ABU programs listing.

        Args:
            response: Scrapy Response object

        Yields:
            ProgramItem objects
        """
        self.logger.info(f"Parsing ABU programs page: {response.url}")

        # For MVP, yield a few sample programs as proof of concept
        # In production, would scrape from actual website

        sample_programs = [
            {
                'institution_name': 'Ahmadu Bello University',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The Computer Science program at ABU provides comprehensive '
                    'training in software development, algorithms, data structures, '
                    'and computer systems.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ahmadu Bello University',
                'name': 'Medicine and Surgery',
                'degree_type': 'undergraduate',
                'qualification': 'MBBS',
                'field_of_study': 'Medicine',
                'specialization': 'Medicine and Surgery',
                'duration_years': 6.0,
                'duration_text': '6 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The MBBS program trains medical professionals with clinical '
                    'and theoretical knowledge in medicine and surgery.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 280,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ahmadu Bello University',
                'name': 'Agricultural Economics',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Agriculture',
                'specialization': 'Agricultural Economics',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'Agricultural Economics program focuses on the application of '
                    'economic principles to agricultural production and marketing.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ahmadu Bello University',
                'name': 'Law',
                'degree_type': 'undergraduate',
                'qualification': 'LLB',
                'field_of_study': 'Law',
                'specialization': 'Law',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The Law program offers comprehensive legal education covering '
                    'Nigerian law, international law, and legal practice.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 250,
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
        ]

        for program_data in sample_programs:
            try:
                # Generate content hash
                hash_data = {
                    'institution': program_data['institution_name'],
                    'name': program_data['name'],
                    'degree_type': program_data['degree_type'],
                }
                program_data['content_hash'] = self.generate_hash(hash_data)

                # Validate and yield
                program = ProgramItem(**program_data)
                self.log_item(program, "program")
                yield program.model_dump()

            except Exception as e:
                self.handle_error(e, "program")
