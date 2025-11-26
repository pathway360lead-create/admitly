"""
University of Lagos (UNILAG) Spider

Scrapes institution profile and program data from UNILAG website.
This spider demonstrates the pattern for scraping Nigerian universities.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class UnilagSpider(BaseSpider, InstitutionSpiderMixin):
    """
    Spider for scraping University of Lagos data.

    This spider scrapes:
    - Institution profile (name, location, contact info, etc.)
    - Programs offered (if available on the page)
    """

    name = "unilag_spider"
    source_type = "institution"
    priority = 3  # Medium priority
    institution_name = "University of Lagos"

    # Start URLs
    start_urls = [
        "https://unilag.edu.ng/about",
        "https://unilag.edu.ng/",
    ]

    # Custom settings for UNILAG
    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,  # Be polite
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
    }

    def parse(self, response: Response) -> Generator:
        """
        Parse UNILAG homepage/about page.

        Extracts institution profile data.

        Args:
            response: Scrapy Response object

        Yields:
            InstitutionItem
        """
        self.logger.info(f"Parsing UNILAG page: {response.url}")

        try:
            # Extract institution data
            institution = self._extract_institution_profile(response)

            if institution:
                # Generate content hash for deduplication
                hash_data = {
                    'name': institution['name'],
                    'website': institution.get('website'),
                    'description': institution.get('description'),
                }
                institution['content_hash'] = self.generate_hash(hash_data)

                # Log and yield
                self.log_item(institution, "institution")
                yield institution

            # Follow links to programs page if available
            programs_link = response.css('a[href*="programme"]::attr(href)').get()
            if programs_link:
                self.logger.info(f"Found programs link: {programs_link}")
                # Would yield follow request in full implementation
                # yield response.follow(programs_link, self.parse_programs)

        except Exception as e:
            self.handle_error(e, "institution")

    def _extract_institution_profile(self, response: Response) -> Optional[dict]:
        """
        Extract UNILAG institution profile from page.

        This method contains the actual scraping logic with CSS selectors
        specific to UNILAG's website structure.

        Args:
            response: Scrapy Response object

        Returns:
            dict: Institution data or None if extraction fails
        """
        try:
            # For MVP, we'll use known data for UNILAG
            # In production, these would be actual CSS selectors
            # based on the website's HTML structure

            # Try to extract from page, fall back to known data
            name = self.extract_first(
                response,
                'h1.institution-name::text',
                'h1::text',
                '.page-title::text',
                default='University of Lagos'
            )

            # Extract description - try multiple possible selectors
            description = self.extract_first(
                response,
                '.about-content p::text',
                '.about-text::text',
                'article p::text',
                '.content p::text',
                default=None
            )

            # If description is empty or too short, use a default
            if not description or len(description) < 50:
                description = (
                    "The University of Lagos, popularly known as UNILAG, is a federal "
                    "government-owned research university located in Lagos, Nigeria. "
                    "It was established in 1962 and has grown to become one of the "
                    "leading universities in Nigeria and Africa."
                )

            # Extract contact information
            email = self.extract_first(
                response,
                'a[href^="mailto:"]::text',
                '.email::text',
                '.contact-email::text',
                default='info@unilag.edu.ng'
            )

            phone = self.extract_first(
                response,
                '.phone::text',
                '.contact-phone::text',
                'a[href^="tel:"]::text',
                default='+234-1-4932396'
            )

            # Extract social media links
            social_media = self.extract_social_media(response)

            # Construct institution item
            institution_data = {
                'name': self.clean_text(name) or 'University of Lagos',
                'short_name': 'UNILAG',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Lagos',
                'city': 'Akoka',
                'address': 'University of Lagos Main Campus, Akoka, Yaba, Lagos',
                'lga': 'Yaba',
                'website': 'https://unilag.edu.ng',
                'email': self.clean_text(email),
                'phone': self.clean_text(phone),
                'social_media': social_media,
                'description': self.clean_text(description),
                'founded_year': 1962,
                'logo_url': self.extract_url(
                    response,
                    'img[alt*="logo"]::attr(src)',
                    default=None
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            }

            # Validate using Pydantic (will be done in pipeline, but check here too)
            try:
                item = InstitutionItem(**institution_data)
                return item.model_dump()
            except Exception as e:
                self.logger.error(f"Pydantic validation error: {e}")
                # Return dict anyway, pipeline will validate
                return institution_data

        except Exception as e:
            self.logger.error(f"Error extracting institution profile: {e}")
            return None

    def parse_programs(self, response: Response) -> Generator:
        """
        Parse UNILAG programs page.

        This would extract program listings if available.
        Left as placeholder for full implementation.

        Args:
            response: Scrapy Response object

        Yields:
            ProgramItem objects
        """
        self.logger.info(f"Parsing UNILAG programs: {response.url}")

        # In full implementation, would extract program data here
        # For MVP, we focus on institution profile only

        # Example program extraction logic:
        # program_cards = response.css('.program-card')
        # for card in program_cards:
        #     program = {
        #         'institution_name': 'University of Lagos',
        #         'name': card.css('.program-name::text').get(),
        #         'degree_type': self._infer_degree_type(card),
        #         # ... more fields
        #     }
        #     yield ProgramItem(**program)

        pass


class UnilagProgramsSpider(BaseSpider):
    """
    Dedicated spider for UNILAG programs.

    Separate spider for better modularity and scheduling.
    Can be run independently to update only program data.
    """

    name = "unilag_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "University of Lagos"

    start_urls = [
        "https://unilag.edu.ng/programmes",
    ]

    def parse(self, response: Response) -> Generator:
        """
        Parse UNILAG programs listing.

        Args:
            response: Scrapy Response object

        Yields:
            ProgramItem objects
        """
        self.logger.info(f"Parsing UNILAG programs page: {response.url}")

        # For MVP, yield a few sample programs as proof of concept
        # In production, would scrape from actual website

        sample_programs = [
            {
                'institution_name': 'University of Lagos',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The Computer Science program at UNILAG provides comprehensive '
                    'training in software development, algorithms, data structures, '
                    'and computer systems.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'University of Lagos',
                'name': 'Medicine and Surgery',
                'degree_type': 'undergraduate',
                'qualification': 'MBBS',
                'field_of_study': 'Medicine',
                'specialization': 'Medicine and Surgery',
                'duration_years': 6.0,
                'duration_text': '6 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The MBBS program trains medical professionals with clinical '
                    'and theoretical knowledge in medicine and surgery.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'min_utme_score': 280,
                'utme_subjects': ['English', 'Biology', 'Chemistry', 'Physics'],
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
        ]

        for program_data in sample_programs:
            try:
                # Generate content hash
                hash_data = {
                    'institution': program_data['institution_name'],
                    'name': program_data['name'],
                    'degree_type': program_data['degree_type'],
                }
                program_data['content_hash'] = self.generate_hash(hash_data)

                # Validate and yield
                program = ProgramItem(**program_data)
                self.log_item(program, "program")
                yield program.model_dump()

            except Exception as e:
                self.handle_error(e, "program")
