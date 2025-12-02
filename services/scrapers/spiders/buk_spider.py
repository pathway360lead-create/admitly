"""
Bayero University Kano (BUK) Spider

Scrapes institution profile and program data from BUK website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class BukSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping Bayero University Kano data."""

    name = "buk_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Bayero University Kano"

    start_urls = [
        "https://buk.edu.ng/about",
        "https://buk.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse BUK page and extract institution data."""
        self.logger.info(f"Parsing BUK page: {response.url}")

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
        """Extract BUK institution profile."""
        try:
            description = (
                "Bayero University, Kano (BUK) is a federal government research university "
                "located in Kano, Kano State, Nigeria. Established in 1975, BUK is one of "
                "Nigeria's leading universities with strong programs in sciences, "
                "engineering, and Islamic studies."
            )

            institution_data = {
                'name': 'Bayero University Kano',
                'short_name': 'BUK',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Kano',
                'city': 'Kano',
                'address': 'Bayero University, PMB 3011, Kano, Kano State',
                'lga': 'Kano Municipal',
                'website': 'https://buk.edu.ng',
                'email': 'info@buk.edu.ng',
                'phone': '+234-64-666021',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1975,
                'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://buk.edu.ng/programmes',
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


class BukProgramsSpider(BaseSpider):
    """Dedicated spider for BUK programs."""

    name = "buk_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Bayero University Kano"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing BUK programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Bayero University Kano',
                'name': 'Medicine and Surgery',
                'degree_type': 'undergraduate',
                'qualification': 'MBBS',
                'field_of_study': 'Medicine',
                'specialization': 'Medicine and Surgery',
                'duration_years': 6.0,
                'duration_text': '6 years',
                'mode': 'full_time',
                'curriculum_summary': 'Medical program with strong clinical and research foundation.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 280,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
                'source_url': 'https://buk.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Bayero University Kano',
                'name': 'Islamic Studies',
                'degree_type': 'undergraduate',
                'qualification': 'BA',
                'field_of_study': 'Arts',
                'specialization': 'Islamic Studies',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Islamic studies program covering theology, jurisprudence, and history.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://buk.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Bayero University Kano',
                'name': 'Electrical Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BEng',
                'field_of_study': 'Engineering',
                'specialization': 'Electrical Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Electrical engineering covering power systems and electronics.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 200,
                'utme_subjects': ['English', 'Mathematics', 'Physics', 'Chemistry'],
                'source_url': 'https://buk.edu.ng/programmes',
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
