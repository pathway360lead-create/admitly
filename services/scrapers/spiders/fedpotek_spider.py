"""
Spider for Federal Polytechnic Ado-Ekiti (FEDPOTEK)
Institution Type: polytechnic
Location: Ado-Ekiti, Ekiti
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class FedpotekSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Federal Polytechnic Ado-Ekiti institution profile."""

    name = "fedpotek_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Federal Polytechnic Ado-Ekiti"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing FEDPOTEK institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Federal Polytechnic Ado-Ekiti',
                'short_name': 'FEDPOTEK',
                'type': 'polytechnic',
                'state': 'Ekiti',
                'city': 'Ado-Ekiti',
                'website': 'https://fedpolyado.edu.ng',
                'description': 'Federal Polytechnic Ado-Ekiti is a prestigious polytechnic located in Ado-Ekiti, Ekiti state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolyado.edu.ng/about',
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


class FedpotekProgramsSpider(BaseSpider):
    """Dedicated spider for FEDPOTEK programs."""

    name = "fedpotek_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Federal Polytechnic Ado-Ekiti"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing FEDPOTEK programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Federal Polytechnic Ado-Ekiti',
                'name': 'Agricultural Technology',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Agriculture',
                'specialization': 'Agricultural Technology',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Agricultural Technology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolyado.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Ado-Ekiti',
                'name': 'Estate Management and Valuation',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Estate Management and Valuation',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Estate Management and Valuation program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolyado.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Ado-Ekiti',
                'name': 'Statistics',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Science',
                'specialization': 'Statistics',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Statistics program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolyado.edu.ng/programmes',
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
