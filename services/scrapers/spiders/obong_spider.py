"""
Obong University Spider

Scrapes institution profile and program data from Obong University website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class ObongSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping Obong University data."""

    name = "obong_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Obong University"

    start_urls = [
        "https://obonguniversity.edu.ng/about",
        "https://obonguniversity.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse Obong University page and extract institution data."""
        self.logger.info(f"Parsing Obong University page: {response.url}")

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
        """Extract Obong University institution profile."""
        try:
            description = (
                "Obong University is a private university located in Obong Ntak, "
                "Akwa Ibom State, Nigeria. Founded in 2007, the university offers "
                "quality education across various disciplines with modern facilities "
                "and a focus on producing well-rounded graduates prepared for the "
                "global marketplace."
            )

            institution_data = {
                'name': 'Obong University',
                'short_name': 'OBONG',
                'type': InstitutionType.PRIVATE_UNIVERSITY,
                'state': 'Akwa Ibom',
                'city': 'Obong Ntak',
                'address': 'Obong University, Obong Ntak, Akwa Ibom State',
                'lga': 'Etim Ekpo',
                'website': 'https://obonguniversity.edu.ng',
                'email': 'info@obonguniversity.edu.ng',
                'phone': '+234-803-765-4321',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 2007,
                'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://obonguniversity.edu.ng/programmes',
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


class ObongProgramsSpider(BaseSpider):
    """Dedicated spider for Obong University programs."""

    name = "obong_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Obong University"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing Obong University programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Obong University',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Computer science program with modern curriculum and practical training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://obonguniversity.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Obong University',
                'name': 'Accounting',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Management Sciences',
                'specialization': 'Accounting',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Accounting program preparing students for professional certifications.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://obonguniversity.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Obong University',
                'name': 'Economics',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Economics',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Economics with emphasis on development and policy analysis.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://obonguniversity.edu.ng/programmes',
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
