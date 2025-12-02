"""
Spider for Ekiti State University (EKSU)
Institution Type: state_university
Location: Ado-Ekiti, Ekiti
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class EksuSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Ekiti State University institution profile."""

    name = "eksu_spider"
    source_type = "institution"
    priority = 4
    institution_name = "Ekiti State University"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing EKSU institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Ekiti State University',
                'short_name': 'EKSU',
                'type': 'state_university',
                'state': 'Ekiti',
                'city': 'Ado-Ekiti',
                'website': 'https://eksu.edu.ng',
                'description': 'Ekiti State University is a prestigious state_university located in Ado-Ekiti, Ekiti state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://eksu.edu.ng/about',
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


class EksuProgramsSpider(BaseSpider):
    """Dedicated spider for EKSU programs."""

    name = "eksu_programs_spider"
    source_type = "program"
    priority = 4
    institution_name = "Ekiti State University"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing EKSU programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Ekiti State University',
                'name': 'Microbiology',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Microbiology',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Microbiology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://eksu.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ekiti State University',
                'name': 'Public Administration',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Public Administration',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Public Administration program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://eksu.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ekiti State University',
                'name': 'Estate Management',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Estate Management',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Estate Management program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://eksu.edu.ng/programmes',
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
