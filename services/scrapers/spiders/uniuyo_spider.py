"""
Spider for University of Uyo (UNIUYO)
Institution Type: federal_university
Location: Uyo, Akwa Ibom
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class UniuyoSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for University of Uyo institution profile."""

    name = "uniuyo_spider"
    source_type = "institution"
    priority = 3
    institution_name = "University of Uyo"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing UNIUYO institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'University of Uyo',
                'short_name': 'UNIUYO',
                'type': 'federal_university',
                'state': 'Akwa Ibom',
                'city': 'Uyo',
                'website': 'https://uniuyo.edu.ng',
                'description': 'University of Uyo is a prestigious federal_university located in Uyo, Akwa Ibom state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniuyo.edu.ng/about',
                'scrape_timestamp': datetime.now(),
            }

            # Generate content hash
            hash_data = {
                'name': institution_data['name'],
                'type': institution_data['type'],
                'state': institution_data['state'],
            }
            institution_data['content_hash'] = self.generate_hash(hash_data)

            # Validate and yield
            institution = InstitutionItem(**institution_data)
            self.log_item(institution, "institution")
            yield institution.model_dump()

        except Exception as e:
            self.logger.error(f"Error extracting institution profile: {e}")
            return None


class UniuyoProgramsSpider(BaseSpider):
    """Dedicated spider for UNIUYO programs."""

    name = "uniuyo_programs_spider"
    source_type = "program"
    priority = 3
    institution_name = "University of Uyo"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing UNIUYO programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'University of Uyo',
                'name': 'Nursing Science',
                'degree_type': 'undergraduate',
                'qualification': 'BNSc',
                'field_of_study': 'Medicine',
                'specialization': 'Nursing Science',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Nursing Science program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniuyo.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Uyo',
                'name': 'Agricultural Economics',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Agriculture',
                'specialization': 'Agricultural Economics',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Agricultural Economics program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniuyo.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Uyo',
                'name': 'Geology',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Geology',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Geology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://uniuyo.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            }
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
