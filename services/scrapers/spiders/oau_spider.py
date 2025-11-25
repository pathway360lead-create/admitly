"""
Obafemi Awolowo University (OAU) Spider

Scrapes institution profile and program data from OAU website.
Demonstrates reusability of base spider pattern.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from .base_spider import BaseSpider, InstitutionSpiderMixin
from ..items.models import InstitutionItem, ProgramItem, InstitutionType


class OauSpider(BaseSpider, InstitutionSpiderMixin):
    """
    Spider for scraping Obafemi Awolowo University data.

    This spider demonstrates how easy it is to create new spiders
    by inheriting from BaseSpider and following the established pattern.
    """

    name = "oau_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Obafemi Awolowo University"

    start_urls = [
        "https://oauife.edu.ng/",
        "https://oauife.edu.ng/about",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
    }

    def parse(self, response: Response) -> Generator:
        """
        Parse OAU homepage/about page.

        Args:
            response: Scrapy Response object

        Yields:
            InstitutionItem
        """
        self.logger.info(f"Parsing OAU page: {response.url}")

        try:
            institution = self._extract_institution_profile(response)

            if institution:
                # Generate content hash
                hash_data = {
                    'name': institution['name'],
                    'website': institution.get('website'),
                    'description': institution.get('description'),
                }
                institution['content_hash'] = self.generate_hash(hash_data)

                self.log_item(institution, "institution")
                yield institution

            # Follow programs link if available
            programs_link = response.css('a[href*="programme"]::attr(href)').get()
            if programs_link:
                self.logger.info(f"Found programs link: {programs_link}")
                # yield response.follow(programs_link, self.parse_programs)

        except Exception as e:
            self.handle_error(e, "institution")

    def _extract_institution_profile(self, response: Response) -> Optional[dict]:
        """
        Extract OAU institution profile.

        Args:
            response: Scrapy Response object

        Returns:
            dict: Institution data or None
        """
        try:
            # Extract name
            name = self.extract_first(
                response,
                'h1.institution-name::text',
                'h1::text',
                '.page-title::text',
                default='Obafemi Awolowo University'
            )

            # Extract description
            description = self.extract_first(
                response,
                '.about-content p::text',
                '.about-text::text',
                'article p::text',
                '.content p::text',
                default=None
            )

            if not description or len(description) < 50:
                description = (
                    "Obafemi Awolowo University (OAU), formerly known as University of Ife, "
                    "is a federal government-owned university in Ile-Ife, Osun State, Nigeria. "
                    "Established in 1962, OAU is among Nigeria's most prestigious universities "
                    "and is known for its beautiful campus and academic excellence."
                )

            # Extract contact info
            email = self.extract_first(
                response,
                'a[href^="mailto:"]::text',
                '.email::text',
                default='info@oauife.edu.ng'
            )

            phone = self.extract_first(
                response,
                '.phone::text',
                'a[href^="tel:"]::text',
                default='+234-36-230290'
            )

            # Social media
            social_media = self.extract_social_media(response)

            # Construct item
            institution_data = {
                'name': self.clean_text(name) or 'Obafemi Awolowo University',
                'short_name': 'OAU',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Osun',
                'city': 'Ile-Ife',
                'address': 'Obafemi Awolowo University, Ile-Ife, Osun State',
                'lga': 'Ife Central',
                'website': 'https://oauife.edu.ng',
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

            # Validate
            try:
                item = InstitutionItem(**institution_data)
                return item.model_dump()
            except Exception as e:
                self.logger.error(f"Pydantic validation error: {e}")
                return institution_data

        except Exception as e:
            self.logger.error(f"Error extracting institution profile: {e}")
            return None

    def parse_programs(self, response: Response) -> Generator:
        """
        Parse OAU programs page.

        Args:
            response: Scrapy Response object

        Yields:
            ProgramItem objects
        """
        self.logger.info(f"Parsing OAU programs: {response.url}")
        # Placeholder for full implementation
        pass


class OauProgramsSpider(BaseSpider):
    """
    Dedicated spider for OAU programs.
    """

    name = "oau_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Obafemi Awolowo University"

    start_urls = [
        "https://oauife.edu.ng/programmes",
    ]

    def parse(self, response: Response) -> Generator:
        """
        Parse OAU programs listing.

        Args:
            response: Scrapy Response object

        Yields:
            ProgramItem objects
        """
        self.logger.info(f"Parsing OAU programs page: {response.url}")

        # Sample programs for proof of concept
        sample_programs = [
            {
                'institution_name': 'Obafemi Awolowo University',
                'name': 'Computer Science and Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Engineering',
                'specialization': 'Computer Science and Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The Computer Science and Engineering program at OAU combines '
                    'software engineering principles with computer systems design.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Obafemi Awolowo University',
                'name': 'Law',
                'degree_type': 'undergraduate',
                'qualification': 'LLB',
                'field_of_study': 'Law',
                'specialization': 'Law',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The LLB program provides comprehensive legal education covering '
                    'Nigerian and international law.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 250,
                'utme_subjects': ['English', 'Literature', 'Government', 'Economics'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Obafemi Awolowo University',
                'name': 'Pharmacy',
                'degree_type': 'undergraduate',
                'qualification': 'BPharm',
                'field_of_study': 'Pharmacy',
                'specialization': 'Pharmacy',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The Pharmacy program trains students in pharmaceutical sciences, '
                    'drug development, and patient care.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 260,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
        ]

        for program_data in sample_programs:
            try:
                # Generate hash
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
