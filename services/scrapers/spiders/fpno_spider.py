"""
Spider for Federal Polytechnic Nekede (FPNO)
Institution Type: polytechnic
Location: Owerri, Imo
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class FpnoSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Federal Polytechnic Nekede institution profile."""

    name = "fpno_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Federal Polytechnic Nekede"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing FPNO institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Federal Polytechnic Nekede',
                'short_name': 'FPNO',
                'type': 'polytechnic',
                'state': 'Imo',
                'city': 'Owerri',
                'website': 'https://fpno.edu.ng',
                'description': 'Federal Polytechnic Nekede is a prestigious polytechnic located in Owerri, Imo state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fpno.edu.ng/about',
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


class FpnoProgramsSpider(BaseSpider):
    """Dedicated spider for FPNO programs."""

    name = "fpno_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Federal Polytechnic Nekede"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing FPNO programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Federal Polytechnic Nekede',
                'name': 'Computer Science',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Computer Science program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fpno.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Nekede',
                'name': 'Electrical/Electronics Engineering',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Engineering',
                'specialization': 'Electrical/Electronics Engineering',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Electrical/Electronics Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fpno.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Nekede',
                'name': 'Business Administration and Management',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Management Sciences',
                'specialization': 'Business Administration and Management',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Business Administration and Management program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fpno.edu.ng/programmes',
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
