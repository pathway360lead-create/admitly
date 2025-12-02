"""
Spider for Ladoke Akintola University of Technology (LAUTECH)
Institution Type: state_university
Location: Ogbomoso, Oyo
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class LautechSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Ladoke Akintola University of Technology institution profile."""

    name = "lautech_spider"
    source_type = "institution"
    priority = 4
    institution_name = "Ladoke Akintola University of Technology"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing LAUTECH institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Ladoke Akintola University of Technology',
                'short_name': 'LAUTECH',
                'type': 'state_university',
                'state': 'Oyo',
                'city': 'Ogbomoso',
                'website': 'https://lautech.edu.ng',
                'description': 'Ladoke Akintola University of Technology is a prestigious state_university located in Ogbomoso, Oyo state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lautech.edu.ng/about',
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


class LautechProgramsSpider(BaseSpider):
    """Dedicated spider for LAUTECH programs."""

    name = "lautech_programs_spider"
    source_type = "program"
    priority = 4
    institution_name = "Ladoke Akintola University of Technology"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing LAUTECH programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Ladoke Akintola University of Technology',
                'name': 'Agricultural Extension and Rural Development',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Agriculture',
                'specialization': 'Agricultural Extension and Rural Development',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Agricultural Extension and Rural Development program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lautech.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ladoke Akintola University of Technology',
                'name': 'Pure and Applied Biology',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Pure and Applied Biology',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Pure and Applied Biology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lautech.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ladoke Akintola University of Technology',
                'name': 'Transport Management Technology',
                'degree_type': 'undergraduate',
                'qualification': 'BTech',
                'field_of_study': 'Management Sciences',
                'specialization': 'Transport Management Technology',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': 'Transport Management Technology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://lautech.edu.ng/programmes',
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
