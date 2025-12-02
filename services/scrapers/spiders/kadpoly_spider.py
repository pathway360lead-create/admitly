"""
Spider for Kaduna Polytechnic (KADPOLY)
Institution Type: polytechnic
Location: Kaduna, Kaduna
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class KadpolySpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Kaduna Polytechnic institution profile."""

    name = "kadpoly_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Kaduna Polytechnic"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing KADPOLY institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Kaduna Polytechnic',
                'short_name': 'KADPOLY',
                'type': 'polytechnic',
                'state': 'Kaduna',
                'city': 'Kaduna',
                'website': 'https://kadunapolytechnic.edu.ng',
                'description': 'Kaduna Polytechnic is a prestigious polytechnic located in Kaduna, Kaduna state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://kadunapolytechnic.edu.ng/about',
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


class KadpolyProgramsSpider(BaseSpider):
    """Dedicated spider for KADPOLY programs."""

    name = "kadpoly_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Kaduna Polytechnic"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing KADPOLY programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Kaduna Polytechnic',
                'name': 'Architectural Technology',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Architectural Technology',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Architectural Technology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://kadunapolytechnic.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Kaduna Polytechnic',
                'name': 'Accountancy',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Management Sciences',
                'specialization': 'Accountancy',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Accountancy program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://kadunapolytechnic.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Kaduna Polytechnic',
                'name': 'Mechanical Engineering',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Engineering',
                'specialization': 'Mechanical Engineering',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Mechanical Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://kadunapolytechnic.edu.ng/programmes',
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
