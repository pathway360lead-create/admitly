"""
Spider for Afe Babalola University (ABUAD)
Institution Type: private_university
Location: Ado-Ekiti, Ekiti
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class AbuadSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Afe Babalola University institution profile."""

    name = "abuad_spider"
    source_type = "institution"
    priority = 4
    institution_name = "Afe Babalola University"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing ABUAD institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Afe Babalola University',
                'short_name': 'ABUAD',
                'type': 'private_university',
                'state': 'Ekiti',
                'city': 'Ado-Ekiti',
                'website': 'https://abuad.edu.ng',
                'description': 'Afe Babalola University is a prestigious private_university located in Ado-Ekiti, Ekiti state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://abuad.edu.ng/about',
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


class AbuadProgramsSpider(BaseSpider):
    """Dedicated spider for ABUAD programs."""

    name = "abuad_programs_spider"
    source_type = "program"
    priority = 4
    institution_name = "Afe Babalola University"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing ABUAD programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Afe Babalola University',
                'name': 'Petroleum and Gas Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BEng',
                'field_of_study': 'Engineering',
                'specialization': 'Petroleum and Gas Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Petroleum and Gas Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://abuad.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Afe Babalola University',
                'name': 'Cyber Security',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Cyber Security',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Cyber Security program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://abuad.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Afe Babalola University',
                'name': 'Anatomy',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Medicine',
                'specialization': 'Anatomy',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Anatomy program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://abuad.edu.ng/programmes',
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
