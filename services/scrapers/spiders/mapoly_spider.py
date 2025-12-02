"""
Spider for Moshood Abiola Polytechnic (MAPOLY)
Institution Type: polytechnic
Location: Abeokuta, Ogun
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class MapolySpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Moshood Abiola Polytechnic institution profile."""

    name = "mapoly_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Moshood Abiola Polytechnic"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing MAPOLY institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Moshood Abiola Polytechnic',
                'short_name': 'MAPOLY',
                'type': 'polytechnic',
                'state': 'Ogun',
                'city': 'Abeokuta',
                'website': 'https://mapoly.edu.ng',
                'description': 'Moshood Abiola Polytechnic is a prestigious polytechnic located in Abeokuta, Ogun state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://mapoly.edu.ng/about',
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


class MapolyProgramsSpider(BaseSpider):
    """Dedicated spider for MAPOLY programs."""

    name = "mapoly_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Moshood Abiola Polytechnic"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing MAPOLY programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Moshood Abiola Polytechnic',
                'name': 'Hospitality Management',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Management Sciences',
                'specialization': 'Hospitality Management',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Hospitality Management program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://mapoly.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Moshood Abiola Polytechnic',
                'name': 'Banking and Finance',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Management Sciences',
                'specialization': 'Banking and Finance',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Banking and Finance program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://mapoly.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Moshood Abiola Polytechnic',
                'name': 'Computer Engineering',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Engineering',
                'specialization': 'Computer Engineering',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Computer Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://mapoly.edu.ng/programmes',
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
