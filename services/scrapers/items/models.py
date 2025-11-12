"""
Scrapy Item Models
"""
import scrapy
from datetime import datetime


class InstitutionItem(scrapy.Item):
    """Institution data item"""

    name = scrapy.Field()
    short_name = scrapy.Field()
    type = scrapy.Field()
    state = scrapy.Field()
    city = scrapy.Field()
    address = scrapy.Field()
    website = scrapy.Field()
    email = scrapy.Field()
    phone = scrapy.Field()
    description = scrapy.Field()
    logo_url = scrapy.Field()

    # Metadata
    source_url = scrapy.Field()
    scrape_timestamp = scrapy.Field()


class ProgramItem(scrapy.Item):
    """Program data item"""

    institution_id = scrapy.Field()
    name = scrapy.Field()
    degree_type = scrapy.Field()
    duration_years = scrapy.Field()
    mode = scrapy.Field()
    description = scrapy.Field()
    tuition_per_year = scrapy.Field()
    accreditation_status = scrapy.Field()

    # Metadata
    source_url = scrapy.Field()
    scrape_timestamp = scrapy.Field()


class AdmissionWindowItem(scrapy.Item):
    """Admission window data item"""

    program_id = scrapy.Field()
    application_start = scrapy.Field()
    application_end = scrapy.Field()
    screening_date = scrapy.Field()
    admission_list_date = scrapy.Field()

    # Metadata
    source_url = scrapy.Field()
    scrape_timestamp = scrapy.Field()
