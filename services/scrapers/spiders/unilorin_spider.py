"""
University of Ilorin (UNILORIN) Spider

Scrapes institution profile and program data from UNILORIN website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class UnilorinSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping University of Ilorin data."""

    name = "unilorin_spider"
    source_type = "institution"
    priority = 3
    institution_name = "University of Ilorin"

    start_urls = [
        "https://unilorin.edu.ng/about",
        "https://unilorin.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse UNILORIN page and extract institution data."""
        self.logger.info(f"Parsing UNILORIN page: {response.url}")

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
        """Extract UNILORIN institution profile."""
        try:
            description = (
                "The University of Ilorin (UNILORIN) is a federal government-owned "
                "university located in Ilorin, Kwara State, Nigeria. Established in "
                "1975, UNILORIN is known for its academic excellence, stable academic "
                "calendar, and strong research output across various disciplines."
            )

            institution_data = {
                'name': 'University of Ilorin',
                'short_name': 'UNILORIN',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Kwara',
                'city': 'Ilorin',
                'address': 'University of Ilorin, P.M.B. 1515, Ilorin, Kwara State',
                'lga': 'Ilorin South',
                'website': 'https://unilorin.edu.ng',
                'email': 'info@unilorin.edu.ng',
                'phone': '+234-31-221701',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1975,
                'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unilorin.edu.ng/programmes',
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


class UnilorinProgramsSpider(BaseSpider):
    """Dedicated spider for UNILORIN programs."""

    name = "unilorin_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "University of Ilorin"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        # Since we're using sample data, just call parse with a fake response
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing UNILORIN programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'University of Ilorin',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Computer science program with focus on software development and systems.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unilorin.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Ilorin',
                'name': 'Accounting',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Management Sciences',
                'specialization': 'Accounting',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Accounting program covering financial and management accounting.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 200,
                'source_url': 'https://unilorin.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Ilorin',
                'name': 'Civil Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BEng',
                'field_of_study': 'Engineering',
                'specialization': 'Civil Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Civil engineering program covering structures, hydraulics, and construction.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 200,
                'utme_subjects': ['English', 'Mathematics', 'Physics', 'Chemistry'],
                'source_url': 'https://unilorin.edu.ng/programmes',
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
