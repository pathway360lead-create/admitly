"""
Spider for University of Calabar (UNICAL)
Institution Type: federal_university
Location: Calabar, Cross River
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class UnicalSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for University of Calabar institution profile."""

    name = "unical_spider"
    source_type = "institution"
    priority = 3
    institution_name = "University of Calabar"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing UNICAL institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'University of Calabar',
                'short_name': 'UNICAL',
                'type': 'federal_university',
                'state': 'Cross River',
                'city': 'Calabar',
                'website': 'https://unical.edu.ng',
                'description': 'University of Calabar is a prestigious federal_university located in Calabar, Cross River state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unical.edu.ng/about',
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


class UnicalProgramsSpider(BaseSpider):
    """Dedicated spider for UNICAL programs."""

    name = "unical_programs_spider"
    source_type = "program"
    priority = 3
    institution_name = "University of Calabar"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing UNICAL programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'University of Calabar',
                'name': 'Law',
                'degree_type': 'undergraduate',
                'qualification': 'LLB',
                'field_of_study': 'Law',
                'specialization': 'Law',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Law program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unical.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Calabar',
                'name': 'Biochemistry',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Biochemistry',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Biochemistry program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unical.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Calabar',
                'name': 'Architecture',
                'degree_type': 'undergraduate',
                'qualification': 'BArch',
                'field_of_study': 'Environmental Sciences',
                'specialization': 'Architecture',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Architecture program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unical.edu.ng/programmes',
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
