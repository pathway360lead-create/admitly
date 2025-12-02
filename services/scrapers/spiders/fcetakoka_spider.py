"""
Spider for Federal College of Education (Technical) Akoka (FCET Akoka)
Institution Type: college_of_education
Location: Akoka, Lagos
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class FcetakokaSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Federal College of Education (Technical) Akoka institution profile."""

    name = "fcetakoka_spider"
    source_type = "institution"
    priority = 6
    institution_name = "Federal College of Education (Technical) Akoka"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing FCET Akoka institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Federal College of Education (Technical) Akoka',
                'short_name': 'FCET Akoka',
                'type': 'college_of_education',
                'state': 'Lagos',
                'city': 'Akoka',
                'website': 'https://fcetakoka.edu.ng',
                'description': 'Federal College of Education (Technical) Akoka is a prestigious college_of_education located in Akoka, Lagos state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcetakoka.edu.ng/about',
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


class FcetakokaProgramsSpider(BaseSpider):
    """Dedicated spider for FCET Akoka programs."""

    name = "fcetakoka_programs_spider"
    source_type = "program"
    priority = 6
    institution_name = "Federal College of Education (Technical) Akoka"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing FCET Akoka programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Federal College of Education (Technical) Akoka',
                'name': 'Technical Education (Electrical/Electronics)',
                'degree_type': 'diploma',
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': 'Technical Education (Electrical/Electronics)',
                'duration_years': 3.0,
                'duration_text': '3 years',
                'mode': 'full_time',
                'curriculum_summary': 'Technical Education (Electrical/Electronics) program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcetakoka.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal College of Education (Technical) Akoka',
                'name': 'Technical Education (Mechanical)',
                'degree_type': 'diploma',
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': 'Technical Education (Mechanical)',
                'duration_years': 3.0,
                'duration_text': '3 years',
                'mode': 'full_time',
                'curriculum_summary': 'Technical Education (Mechanical) program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcetakoka.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Federal College of Education (Technical) Akoka',
                'name': 'Business Education',
                'degree_type': 'diploma',
                'qualification': 'NCE',
                'field_of_study': 'Education',
                'specialization': 'Business Education',
                'duration_years': 3.0,
                'duration_text': '3 years',
                'mode': 'full_time',
                'curriculum_summary': 'Business Education program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://fcetakoka.edu.ng/programmes',
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
