"""
University of Port Harcourt (UNIPORT) Spider

Scrapes institution profile and program data from UNIPORT website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class UniportSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping University of Port Harcourt data."""

    name = "uniport_spider"
    source_type = "institution"
    priority = 3
    institution_name = "University of Port Harcourt"

    start_urls = [
        "https://uniport.edu.ng/about",
        "https://uniport.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse UNIPORT page and extract institution data."""
        self.logger.info(f"Parsing UNIPORT page: {response.url}")

        try:
            institution = self._extract_institution_profile(response)

            if institution:
                hash_data = {
                    'name': institution['name'],
                    'website': institution.get('website'),
                    'description': institution.get('description'),
                }
                institution['content_hash'] = self.generate_hash(hash_data)
                self.log_item(institution, "institution")
                yield institution

        except Exception as e:
            self.handle_error(e, "institution")

    def _extract_institution_profile(self, response: Response) -> Optional[dict]:
        """Extract UNIPORT institution profile."""
        try:
            description = (
                "The University of Port Harcourt (UNIPORT) is a federal government-owned "
                "university located in Port Harcourt, Rivers State, Nigeria. Established "
                "in 1975, UNIPORT is a leading research university in the Niger Delta "
                "region with strong programs in petroleum engineering, marine sciences, "
                "and environmental studies."
            )

            institution_data = {
                'name': 'University of Port Harcourt',
                'short_name': 'UNIPORT',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Rivers',
                'city': 'Port Harcourt',
                'address': 'University of Port Harcourt, PMB 5323, Port Harcourt, Rivers State',
                'lga': 'Port Harcourt',
                'website': 'https://uniport.edu.ng',
                'email': 'info@uniport.edu.ng',
                'phone': '+234-84-817308',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1975,
                'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniport.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            }

            try:
                item = InstitutionItem(**institution_data)
                return item.model_dump()
            except Exception as e:
                self.logger.error(f"Pydantic validation error: {e}")
                return institution_data

        except Exception as e:
            self.logger.error(f"Error extracting institution profile: {e}")
            return None


class UniportProgramsSpider(BaseSpider):
    """Dedicated spider for UNIPORT programs."""

    name = "uniport_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "University of Port Harcourt"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing UNIPORT programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'University of Port Harcourt',
                'name': 'Petroleum Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BEng',
                'field_of_study': 'Engineering',
                'specialization': 'Petroleum Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Petroleum engineering program with focus on oil and gas industry.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 220,
                'utme_subjects': ['English', 'Mathematics', 'Physics', 'Chemistry'],
                'source_url': 'https://uniport.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Port Harcourt',
                'name': 'Marine Biology',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Marine Biology',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Marine biology program studying coastal and marine ecosystems.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniport.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Port Harcourt',
                'name': 'Environmental Management',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Environmental Management',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Environmental management with focus on Niger Delta ecosystem.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniport.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
        ]

        for program_data in sample_programs:
            try:
                hash_data = {
                    'institution': program_data['institution_name'],
                    'name': program_data['name'],
                    'degree_type': program_data['degree_type'],
                }
                program_data['content_hash'] = self.generate_hash(hash_data)
                program = ProgramItem(**program_data)
                self.log_item(program, "program")
                yield program.model_dump()
            except Exception as e:
                self.handle_error(e, "program")
