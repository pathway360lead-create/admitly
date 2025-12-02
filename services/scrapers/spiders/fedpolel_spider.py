"""
Spider for Federal Polytechnic Ilaro (FEDPOLEL)
Institution Type: polytechnic
Location: Ilaro, Ogun
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class FedpolelSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Federal Polytechnic Ilaro institution profile."""

    name = "fedpolel_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Federal Polytechnic Ilaro"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing FEDPOLEL institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Federal Polytechnic Ilaro',
                'short_name': 'FEDPOLEL',
                'type': 'polytechnic',
                'state': 'Ogun',
                'city': 'Ilaro',
                'website': 'https://federalpolyilaro.edu.ng',
                'description': 'Federal Polytechnic Ilaro is a prestigious polytechnic located in Ilaro, Ogun state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://federalpolyilaro.edu.ng/about',
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


class FedpolelProgramsSpider(BaseSpider):
    """Dedicated spider for FEDPOLEL programs."""

    name = "fedpolel_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Federal Polytechnic Ilaro"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing FEDPOLEL programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Federal Polytechnic Ilaro',
                'name': 'Food Technology',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Science',
                'specialization': 'Food Technology',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Food Technology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://federalpolyilaro.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Ilaro',
                'name': 'Office Technology and Management',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Management Sciences',
                'specialization': 'Office Technology and Management',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Office Technology and Management program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://federalpolyilaro.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal Polytechnic Ilaro',
                'name': 'Urban and Regional Planning',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Urban and Regional Planning',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Urban and Regional Planning program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://federalpolyilaro.edu.ng/programmes',
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
