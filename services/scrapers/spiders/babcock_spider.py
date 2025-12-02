"""
Spider for Babcock University (BABCOCK)
Institution Type: private_university
Location: Ilishan-Remo, Ogun
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class BabcockSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Babcock University institution profile."""

    name = "babcock_spider"
    source_type = "institution"
    priority = 4
    institution_name = "Babcock University"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing BABCOCK institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Babcock University',
                'short_name': 'BABCOCK',
                'type': 'private_university',
                'state': 'Ogun',
                'city': 'Ilishan-Remo',
                'website': 'https://babcock.edu.ng',
                'description': 'Babcock University is a prestigious private_university located in Ilishan-Remo, Ogun state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://babcock.edu.ng/about',
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


class BabcockProgramsSpider(BaseSpider):
    """Dedicated spider for BABCOCK programs."""

    name = "babcock_programs_spider"
    source_type = "program"
    priority = 4
    institution_name = "Babcock University"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing BABCOCK programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Babcock University',
                'name': 'Medicine and Surgery',
                'degree_type': 'undergraduate',
                'qualification': 'MBBS',
                'field_of_study': 'Medicine',
                'specialization': 'Medicine and Surgery',
                'duration_years': 6.0,
                'duration_text': '6 years',
                'mode': 'full_time',
                'curriculum_summary': 'Medicine and Surgery program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://babcock.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Babcock University',
                'name': 'Software Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Software Engineering',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Software Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://babcock.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Babcock University',
                'name': 'International Relations',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'International Relations',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'International Relations program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://babcock.edu.ng/programmes',
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
