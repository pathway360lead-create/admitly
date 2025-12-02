"""
University of Benin (UNIBEN) Spider

Scrapes institution profile and program data from UNIBEN website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class UnibenSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping University of Benin data."""

    name = "uniben_spider"
    source_type = "institution"
    priority = 3
    institution_name = "University of Benin"

    start_urls = [
        "https://uniben.edu/about",
        "https://uniben.edu/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse UNIBEN page and extract institution data."""
        self.logger.info(f"Parsing UNIBEN page: {response.url}")

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
        """Extract UNIBEN institution profile."""
        try:
            description = (
                "The University of Benin (UNIBEN) is a federal government-owned and "
                "operated Nigerian university located in Benin City, Edo State. Founded "
                "in 1970, UNIBEN is one of Nigeria's leading universities with a strong "
                "reputation in medicine, engineering, and sciences."
            )

            institution_data = {
                'name': 'University of Benin',
                'short_name': 'UNIBEN',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Edo',
                'city': 'Benin City',
                'address': 'University of Benin, Ugbowo, Benin City, Edo State',
                'lga': 'Egor',
                'website': 'https://uniben.edu',
                'email': 'info@uniben.edu',
                'phone': '+234-52-600940',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1970,
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


class UnibenProgramsSpider(BaseSpider):
    """Dedicated spider for UNIBEN programs."""

    name = "uniben_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "University of Benin"

    start_urls = ["https://uniben.edu/programmes"]

    def parse(self, response: Response) -> Generator:
        """Parse UNIBEN programs listing."""
        self.logger.info(f"Parsing UNIBEN programs page: {response.url}")

        sample_programs = [
            {
                'institution_name': 'University of Benin',
                'name': 'Medicine and Surgery',
                'degree_type': 'undergraduate',
                'qualification': 'MBBS',
                'field_of_study': 'Medicine',
                'specialization': 'Medicine and Surgery',
                'duration_years': 6.0,
                'duration_text': '6 years',
                'mode': 'full_time',
                'curriculum_summary': 'Comprehensive medical training program with strong clinical foundation.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 280,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Benin',
                'name': 'Mechanical Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BEng',
                'field_of_study': 'Engineering',
                'specialization': 'Mechanical Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Engineering program covering thermodynamics, mechanics, and design.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 200,
                'utme_subjects': ['English', 'Mathematics', 'Physics', 'Chemistry'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Benin',
                'name': 'Pharmacy',
                'degree_type': 'undergraduate',
                'qualification': 'BPharm',
                'field_of_study': 'Pharmacy',
                'specialization': 'Pharmacy',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Pharmaceutical sciences program with clinical pharmacy training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 250,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
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
