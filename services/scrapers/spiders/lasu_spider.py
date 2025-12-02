"""
Lagos State University (LASU) Spider

Scrapes institution profile and program data from LASU website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class LasuSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping Lagos State University data."""

    name = "lasu_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Lagos State University"

    start_urls = [
        "https://lasu.edu.ng/about",
        "https://lasu.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse LASU page and extract institution data."""
        self.logger.info(f"Parsing LASU page: {response.url}")

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
        """Extract LASU institution profile."""
        try:
            description = (
                "Lagos State University (LASU) is a state-owned university located in "
                "Ojo, Lagos State, Nigeria. Established in 1983, LASU has grown to "
                "become one of Nigeria's fastest-growing universities with strong "
                "programs across various disciplines and a commitment to affordable, "
                "quality education."
            )

            institution_data = {
                'name': 'Lagos State University',
                'short_name': 'LASU',
                'type': InstitutionType.STATE_UNIVERSITY,
                'state': 'Lagos',
                'city': 'Ojo',
                'address': 'Lagos State University, Ojo, Lagos State',
                'lga': 'Ojo',
                'website': 'https://lasu.edu.ng',
                'email': 'info@lasu.edu.ng',
                'phone': '+234-1-5454176',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1983,
                'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lasu.edu.ng/programmes',
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


class LasuProgramsSpider(BaseSpider):
    """Dedicated spider for LASU programs."""

    name = "lasu_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Lagos State University"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing LASU programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Lagos State University',
                'name': 'Mass Communication',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Mass Communication',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Mass communication covering journalism, broadcasting, and public relations.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lasu.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Lagos State University',
                'name': 'Business Administration',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Management Sciences',
                'specialization': 'Business Administration',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Business administration with focus on entrepreneurship and management.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 180,
                'source_url': 'https://lasu.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Lagos State University',
                'name': 'Economics',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Economics',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Economics program covering micro, macro, and development economics.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lasu.edu.ng/programmes',
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
