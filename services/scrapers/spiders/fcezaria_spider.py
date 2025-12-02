"""
Spider for Federal College of Education Zaria (FCEZARIA)
Institution Type: college_of_education
Location: Zaria, Kaduna
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class FcezariaSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Federal College of Education Zaria institution profile."""

    name = "fcezaria_spider"
    source_type = "institution"
    priority = 6
    institution_name = "Federal College of Education Zaria"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing FCEZARIA institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Federal College of Education Zaria',
                'short_name': 'FCEZARIA',
                'type': 'college_of_education',
                'state': 'Kaduna',
                'city': 'Zaria',
                'website': 'https://fcezaria.edu.ng',
                'description': 'Federal College of Education Zaria is a prestigious college_of_education located in Zaria, Kaduna state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcezaria.edu.ng/about',
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


class FcezariaProgramsSpider(BaseSpider):
    """Dedicated spider for FCEZARIA programs."""

    name = "fcezaria_programs_spider"
    source_type = "program"
    priority = 6
    institution_name = "Federal College of Education Zaria"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing FCEZARIA programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Federal College of Education Zaria',
                'name': 'Education and Mathematics',
                'degree_type': 'diploma',
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': 'Education and Mathematics',
                'duration_years': 3.0,
                'duration_text': '3 years',
                'mode': 'full_time',
                'curriculum_summary': 'Education and Mathematics program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcezaria.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal College of Education Zaria',
                'name': 'Education and English Language',
                'degree_type': 'diploma',
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': 'Education and English Language',
                'duration_years': 3.0,
                'duration_text': '3 years',
                'mode': 'full_time',
                'curriculum_summary': 'Education and English Language program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcezaria.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal College of Education Zaria',
                'name': 'Education and Biology',
                'degree_type': 'diploma',
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': 'Education and Biology',
                'duration_years': 3.0,
                'duration_text': '3 years',
                'mode': 'full_time',
                'curriculum_summary': 'Education and Biology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcezaria.edu.ng/programmes',
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
