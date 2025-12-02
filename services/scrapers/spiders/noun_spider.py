"""
Spider for National Open University of Nigeria (NOUN)
Institution Type: specialized
Location: Abuja, FCT
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class NounSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for National Open University of Nigeria institution profile."""

    name = "noun_spider"
    source_type = "institution"
    priority = 6
    institution_name = "National Open University of Nigeria"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing NOUN institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'National Open University of Nigeria',
                'short_name': 'NOUN',
                'type': 'specialized',
                'state': 'FCT',
                'city': 'Abuja',
                'website': 'https://noun.edu.ng',
                'description': 'National Open University of Nigeria is a prestigious specialized located in Abuja, FCT state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://noun.edu.ng/about',
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


class NounProgramsSpider(BaseSpider):
    """Dedicated spider for NOUN programs."""

    name = "noun_programs_spider"
    source_type = "program"
    priority = 6
    institution_name = "National Open University of Nigeria"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing NOUN programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'National Open University of Nigeria',
                'name': 'Business Administration (Distance Learning)',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Management Sciences',
                'specialization': 'Business Administration (Distance Learning)',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Business Administration (Distance Learning) program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://noun.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'National Open University of Nigeria',
                'name': 'Political Science (Distance Learning)',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Social Sciences',
                'specialization': 'Political Science (Distance Learning)',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Political Science (Distance Learning) program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://noun.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'National Open University of Nigeria',
                'name': 'Educational Management (Distance Learning)',
                'degree_type': 'undergraduate',
                'qualification': 'BEd',
                'field_of_study': 'Education',
                'specialization': 'Educational Management (Distance Learning)',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Educational Management (Distance Learning) program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://noun.edu.ng/programmes',
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
