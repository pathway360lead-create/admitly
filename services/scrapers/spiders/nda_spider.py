"""
Spider for Nigerian Defence Academy (NDA)
Institution Type: specialized
Location: Kaduna, Kaduna
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class NdaSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Nigerian Defence Academy institution profile."""

    name = "nda_spider"
    source_type = "institution"
    priority = 6
    institution_name = "Nigerian Defence Academy"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing NDA institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Nigerian Defence Academy',
                'short_name': 'NDA',
                'type': 'specialized',
                'state': 'Kaduna',
                'city': 'Kaduna',
                'website': 'https://nda.edu.ng',
                'description': 'Nigerian Defence Academy is a prestigious specialized located in Kaduna, Kaduna state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://nda.edu.ng/about',
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


class NdaProgramsSpider(BaseSpider):
    """Dedicated spider for NDA programs."""

    name = "nda_programs_spider"
    source_type = "program"
    priority = 6
    institution_name = "Nigerian Defence Academy"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing NDA programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Nigerian Defence Academy',
                'name': 'Military Science and Interdisciplinary Studies',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Military Science',
                'specialization': 'Military Science and Interdisciplinary Studies',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Military Science and Interdisciplinary Studies program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://nda.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Nigerian Defence Academy',
                'name': 'Aeronautical Engineering',
                'degree_type': 'undergraduate',
                'qualification': 'BEng',
                'field_of_study': 'Engineering',
                'specialization': 'Aeronautical Engineering',
                'duration_years': 5.0,
                'duration_text': '5 years',
                'mode': 'full_time',
                'curriculum_summary': 'Aeronautical Engineering program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://nda.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Nigerian Defence Academy',
                'name': 'Strategic Studies',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Strategic Studies',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Strategic Studies program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://nda.edu.ng/programmes',
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
