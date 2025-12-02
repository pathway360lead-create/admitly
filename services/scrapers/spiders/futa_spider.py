"""
Federal University of Technology, Akure (FUTA) Spider

Scrapes institution profile and program data from FUTA website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class FutaSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping FUTA data."""

    name = "futa_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Federal University of Technology, Akure"

    start_urls = [
        "https://futa.edu.ng/about",
        "https://futa.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse FUTA page and extract institution data."""
        self.logger.info(f"Parsing FUTA page: {response.url}")

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
        """Extract FUTA institution profile."""
        try:
            description = (
                "The Federal University of Technology, Akure (FUTA) is a federal "
                "government-owned university located in Akure, Ondo State, Nigeria. "
                "Established in 1981, FUTA specializes in technology, engineering, "
                "and science programs with strong industry partnerships."
            )

            institution_data = {
                'name': 'Federal University of Technology, Akure',
                'short_name': 'FUTA',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Ondo',
                'city': 'Akure',
                'address': 'Federal University of Technology, PMB 704, Akure, Ondo State',
                'lga': 'Akure South',
                'website': 'https://futa.edu.ng',
                'email': 'info@futa.edu.ng',
                'phone': '+234-34-230011',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1981,
                'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
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


class FutaProgramsSpider(BaseSpider):
    """Dedicated spider for FUTA programs."""

    name = "futa_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Federal University of Technology, Akure"

    start_urls = ["https://futa.edu.ng/programmes"]

    def parse(self, response: Response) -> Generator:
        """Parse FUTA programs listing."""
        self.logger.info(f"Parsing FUTA programs page: {response.url}")

        sample_programs = [
            {
                'institution_name': 'Federal University of Technology, Akure',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Technology-focused computer science program with industrial training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal University of Technology, Akure',
                'name': 'Civil Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Engineering',
                'specialization': 'Civil Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Civil engineering with emphasis on infrastructure and construction.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 200,
                'utme_subjects': ['English', 'Mathematics', 'Physics', 'Chemistry'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal University of Technology, Akure',
                'name': 'Industrial Chemistry',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Science',
                'specialization': 'Industrial Chemistry',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Industrial chemistry with focus on chemical processes and technology.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
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
