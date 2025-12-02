"""
Spider for Nnamdi Azikiwe University (UNIZIK)
Institution Type: federal_university
Location: Awka, Anambra
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class UnizikSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Nnamdi Azikiwe University institution profile."""

    name = "unizik_spider"
    source_type = "institution"
    priority = 3
    institution_name = "Nnamdi Azikiwe University"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing UNIZIK institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Nnamdi Azikiwe University',
                'short_name': 'UNIZIK',
                'type': 'federal_university',
                'state': 'Anambra',
                'city': 'Awka',
                'website': 'https://unizik.edu.ng',
                'description': 'Nnamdi Azikiwe University is a prestigious federal_university located in Awka, Anambra state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unizik.edu.ng/about',
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


class UnizikProgramsSpider(BaseSpider):
    """Dedicated spider for UNIZIK programs."""

    name = "unizik_programs_spider"
    source_type = "program"
    priority = 3
    institution_name = "Nnamdi Azikiwe University"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing UNIZIK programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Nnamdi Azikiwe University',
                'name': 'Banking and Finance',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Management Sciences',
                'specialization': 'Banking and Finance',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Banking and Finance program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unizik.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Nnamdi Azikiwe University',
                'name': 'Statistics',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Statistics',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Statistics program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unizik.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Nnamdi Azikiwe University',
                'name': 'Mass Communication',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Mass Communication',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Mass Communication program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://unizik.edu.ng/programmes',
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
