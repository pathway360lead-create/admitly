"""
Spider for Auchi Polytechnic (AUCHIPOLY)
Institution Type: polytechnic
Location: Auchi, Edo
"""
from datetime import datetime
from typing import Generator
from scrapy.http import Response
from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem


class AuchipolySpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for Auchi Polytechnic institution profile."""

    name = "auchipoly_spider"
    source_type = "institution"
    priority = 5
    institution_name = "Auchi Polytechnic"

    # No start_urls needed for sample data
    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample institution data for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample institution data."""
        self.logger.info(f"Parsing AUCHIPOLY institution (sample data)")

        try:
            # Sample institution data
            institution_data = {
                'name': 'Auchi Polytechnic',
                'short_name': 'AUCHIPOLY',
                'type': 'polytechnic',
                'state': 'Edo',
                'city': 'Auchi',
                'website': 'https://auchipoly.edu.ng',
                'description': 'Auchi Polytechnic is a prestigious polytechnic located in Auchi, Edo state.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://auchipoly.edu.ng/about',
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


class AuchipolyProgramsSpider(BaseSpider):
    """Dedicated spider for AUCHIPOLY programs."""

    name = "auchipoly_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Auchi Polytechnic"

    start_urls = []

    def start_requests(self):
        """Override to yield sample data directly without HTTP requests."""
        self.logger.info(f"Generating sample programs for {self.institution_name}")
        yield from self.parse_sample_data()

    def parse_sample_data(self) -> Generator:
        """Generate sample programs data."""
        self.logger.info(f"Parsing AUCHIPOLY programs (sample data)")

        sample_programs = [
            {
                'institution_name': 'Auchi Polytechnic',
                'name': 'Civil Engineering Technology',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Engineering',
                'specialization': 'Civil Engineering Technology',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Civil Engineering Technology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://auchipoly.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Auchi Polytechnic',
                'name': 'Science Laboratory Technology',
                'degree_type': 'hnd',
                'qualification': 'HND',
                'field_of_study': 'Science',
                'specialization': 'Science Laboratory Technology',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Science Laboratory Technology program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://auchipoly.edu.ng/programmes',
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Auchi Polytechnic',
                'name': 'Mass Communication',
                'degree_type': 'nd',
                'qualification': 'ND',
                'field_of_study': 'Social Sciences',
                'specialization': 'Mass Communication',
                'duration_years': 2.0,
                'duration_text': '2 years',
                'mode': 'full_time',
                'curriculum_summary': 'Mass Communication program offering comprehensive training.',
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': 'https://auchipoly.edu.ng/programmes',
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
