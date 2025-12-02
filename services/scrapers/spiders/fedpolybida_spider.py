"""
Spider for Federal Polytechnic Bida (FEDPOLYBIDA)
Institution Type: polytechnic
Location: Bida, Niger
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class FedpolybidaSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Federal Polytechnic Bida institution profile."""

    name = "fedpolybida_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Federal Polytechnic Bida"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing FEDPOLYBIDA institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Federal Polytechnic Bida',
                'short_name': 'FEDPOLYBIDA',
                'type': 'polytechnic',
                'state': 'Niger',
                'city': 'Bida',
                'website': 'https://fedpolybida.edu.ng',
                'description': 'Federal Polytechnic Bida is a prestigious polytechnic located in Bida, Niger state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolybida.edu.ng/about',
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


class FedpolybidaProgramsSpider(BaseSpider):
    """Dedicated spider for FEDPOLYBIDA programs."""

    name = "fedpolybida_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Federal Polytechnic Bida"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing FEDPOLYBIDA programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Federal Polytechnic Bida',
                'name': 'Agricultural Engineering',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Engineering',
                'specialization': 'Agricultural Engineering',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Agricultural Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolybida.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Bida',
                'name': 'Cooperative Economics and Management',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Management Sciences',
                'specialization': 'Cooperative Economics and Management',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Cooperative Economics and Management program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolybida.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Bida',
                'name': 'Surveying and Geo-Informatics',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Surveying and Geo-Informatics',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Surveying and Geo-Informatics program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fedpolybida.edu.ng/programmes',
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
