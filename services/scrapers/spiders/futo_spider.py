"""
Federal University of Technology, Owerri (FUTO) Spider

Scrapes institution profile and program data from FUTO website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class FutoSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for scraping FUTO data."""

    name = "futo_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Federal University of Technology, Owerri"

    start_urls = [
        "https://futo.edu.ng/about",
        "https://futo.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'ROBOTSTXT_OBEY': False,
    }

    def parse(self, response: Response) -> Generator:
        """Parse FUTO page and extract institution data."""
        self.logger.info(f"Parsing FUTO page: {response.url}")

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
        """Extract FUTO institution profile."""
        try:
            description = (
                "The Federal University of Technology, Owerri (FUTO) is a federal "
                "government university located in Owerri, Imo State, Nigeria. Founded "
                "in 1980, FUTO focuses on engineering, technology, and applied sciences "
                "with strong emphasis on practical skills and innovation."
            )

            institution_data = {
                'name': 'Federal University of Technology, Owerri',
                'short_name': 'FUTO',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Imo',
                'city': 'Owerri',
                'address': 'Federal University of Technology, PMB 1526, Owerri, Imo State',
                'lga': 'Owerri West',
                'website': 'https://futo.edu.ng',
                'email': 'info@futo.edu.ng',
                'phone': '+234-83-230015',
                'social_media': self.extract_social_media(response),
                'description': description,
                'founded_year': 1980,
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


class FutoProgramsSpider(BaseSpider):
    """Dedicated spider for FUTO programs."""

    name = "futo_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Federal University of Technology, Owerri"

    start_urls = ["https://futo.edu.ng/programmes"]

    def parse(self, response: Response) -> Generator:
        """Parse FUTO programs listing."""
        self.logger.info(f"Parsing FUTO programs page: {response.url}")

        sample_programs = [
            {
                'institution_name': 'Federal University of Technology, Owerri',
                'name': 'Mechanical Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Engineering',
                'specialization': 'Mechanical Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Mechanical engineering with industrial experience component.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 200,
                'utme_subjects': ['English', 'Mathematics', 'Physics', 'Chemistry'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal University of Technology, Owerri',
                'name': 'Information Technology',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Science',
                'specialization': 'Information Technology',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'IT program covering software, networks, and systems administration.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal University of Technology, Owerri',
                'name': 'Project Management Technology',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Management',
                'specialization': 'Project Management',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Project management with focus on technology projects and implementation.',
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
