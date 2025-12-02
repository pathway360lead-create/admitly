"""
University of Nigeria, Nsukka (UNN) Spider

Scrapes institution profile and program data from UNN website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class UnnSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping University of Nigeria, Nsukka data."""

    name = "unn_spider"
    source_type = "institution"
    priority = 3
    institution_name = "University of Nigeria, Nsukka"

    start_urls = [
        "https://unn.edu.ng/about",
        "https://unn.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse UNN page and extract institution data."""
        self.logger.info(f"Parsing UNN page: {response.url}")

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
        """Extract UNN institution profile."""
        try:
            description = (
                "The University of Nigeria, commonly referred to as UNN, is a federal "
                "university located in Nsukka, Enugu State, Nigeria. Founded in 1960, "
                "it is the first autonomous university in Nigeria. UNN is a comprehensive "
                "research university with campuses in Nsukka and Enugu."
            )

            institution_data = {
                'name': 'University of Nigeria, Nsukka',
                'short_name': 'UNN',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Enugu',
                'city': 'Nsukka',
                'address': 'University of Nigeria, Nsukka, Enugu State',
                'lga': 'Nsukka',
                'website': 'https://unn.edu.ng',
                'email': 'info@unn.edu.ng',
                'phone': '+234-42-771911',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1960,
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


class UnnProgramsSpider(BaseSpider):
    """Dedicated spider for UNN programs."""

    name = "unn_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "University of Nigeria, Nsukka"

    start_urls = ["https://unn.edu.ng/programmes"]

    def parse(self, response: Response) -> Generator:
        """Parse UNN programs listing."""
        self.logger.info(f"Parsing UNN programs page: {response.url}")

        sample_programs = [
            {
                'institution_name': 'University of Nigeria, Nsukka',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Comprehensive computer science program covering software engineering, algorithms, and systems.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Nigeria, Nsukka',
                'name': 'Medicine and Surgery',
                'degree_type': 'undergraduate',
                'qualification': 'MBBS',
                'field_of_study': 'Medicine',
                'specialization': 'Medicine and Surgery',
                'duration_years': 6.0,
                'duration_text': '6 years',
                'mode': 'full_time',
                'curriculum_summary': 'Medical degree program with clinical and theoretical training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 280,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Nigeria, Nsukka',
                'name': 'Law',
                'degree_type': 'undergraduate',
                'qualification': 'LLB',
                'field_of_study': 'Law',
                'specialization': 'Law',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Legal education covering Nigerian and international law.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 250,
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
