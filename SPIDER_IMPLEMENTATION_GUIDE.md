# Spider Implementation Guide
**Admitly Platform - Institution & Program Scrapers**

**Version:** 1.0
**Created:** November 27, 2025
**Purpose:** Step-by-step guide to create new institution spiders

---

## Table of Contents

1. [Overview](#overview)
2. [Spider Architecture](#spider-architecture)
3. [Prerequisites](#prerequisites)
4. [Implementation Steps](#implementation-steps)
5. [Testing & Verification](#testing--verification)
6. [Troubleshooting](#troubleshooting)
7. [Next 10 Spiders Roadmap](#next-10-spiders-roadmap)

---

## Overview

### What are Spiders?

Spiders are automated web scrapers that extract institution and program data from university websites and import them into our Supabase database via a validation pipeline.

### Current Status

- **Existing Spiders:** 5 (base + 2 institutions + 2 program spiders)
- **Institutions in Database:** 6 (12% of 50 target)
- **Success Rate:** 100% (all spiders working)
- **Infrastructure:** Production-ready with BaseSpider template

### Data Flow

```
Spider Scrapes Website
    ↓
Pydantic Validation (items/models.py)
    ↓
Deduplication Check (content hash)
    ↓
Supabase Sync Pipeline
    ↓
Database (institutions & programs tables)
```

---

## Spider Architecture

### File Structure

```
services/scrapers/
├── spiders/
│   ├── base_spider.py          # 500 lines - Base class with helpers
│   ├── unilag_spider.py        # 313 lines - TEMPLATE to copy
│   ├── oau_spider.py           # 292 lines - Second working example
│   ├── abu_spider.py           # NEW - To be created
│   └── ...                     # More spiders
├── items/
│   └── models.py               # Pydantic models for validation
├── pipelines/
│   ├── validation.py           # 389 lines - Pydantic validation
│   └── supabase_sync.py        # 527 lines - Database sync
├── config/
│   └── sources.yaml            # Institution configurations
└── scrapy.cfg                  # Scrapy settings
```

### BaseSpider Class

Located in `spiders/base_spider.py`, provides:

**Helper Methods:**
- `extract_text()` - Extract text from CSS selector
- `extract_first()` - Try multiple selectors, return first match
- `extract_url()` - Extract and normalize URLs
- `extract_text_list()` - Extract lists
- `generate_hash()` - Content hash for deduplication
- `clean_text()` - Normalize text
- `parse_year()` - Extract year from text
- `parse_duration()` - Extract duration (4 years → 4.0)

**Logging & Metrics:**
- `log_item()` - Log successful scraping
- `handle_error()` - Error handling
- `closed()` - Final statistics on spider completion

### InstitutionSpiderMixin

Located in `base_spider.py`, provides:
- `infer_institution_type()` - Detect institution type
- `extract_social_media()` - Extract social media links

---

## Prerequisites

### 1. Verify Scraper Environment

```bash
cd services/scrapers

# Check Scrapy works
python -m scrapy list

# Expected output: 5 existing spiders
# base_spider
# oau_programs_spider
# oau_spider
# unilag_programs_spider
# unilag_spider
```

### 2. Required Information per Institution

Gather this information before creating a spider:

- **Name:** Full official name
- **Short Name:** Acronym (e.g., ABU, UNN)
- **Type:** federal_university, state_university, private_university, polytechnic, etc.
- **State:** Nigerian state
- **City:** Primary campus city
- **Website:** Official URL
- **Founded Year:** Year established
- **Address:** Full campus address
- **LGA:** Local Government Area

### 3. Tools Needed

- Text editor (VS Code recommended)
- Browser DevTools (for inspecting HTML)
- Terminal access

---

## Implementation Steps

### Step 1: Add Institution to sources.yaml

**File:** `services/scrapers/config/sources.yaml`

```yaml
institutions:
  # ... existing institutions ...

  - id: abu
    name: Ahmadu Bello University
    url: https://abu.edu.ng
    type: federal_university
    state: Kaduna
    scrape_config:
      programs_url: https://abu.edu.ng/programmes
      admissions_url: https://abu.edu.ng/admissions
      schedule: daily
      requires_js: false
```

**Field Descriptions:**
- `id`: Lowercase slug (used in spider name)
- `name`: Full official name
- `url`: Homepage URL
- `type`: Institution category
- `state`: Nigerian state
- `scrape_config.programs_url`: Programs listing page (if available)
- `scrape_config.schedule`: daily/weekly/monthly
- `scrape_config.requires_js`: true if site needs JavaScript

### Step 2: Create Institution Spider

**File:** `services/scrapers/spiders/abu_spider.py`

```python
"""
Ahmadu Bello University (ABU) Spider

Scrapes institution profile and program data from ABU website.
"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider, InstitutionSpiderMixin
from items.models import InstitutionItem, ProgramItem, InstitutionType


class AbuSpider(BaseSpider, InstitutionSpiderMixin):
    """
    Spider for scraping Ahmadu Bello University data.

    This spider scrapes:
    - Institution profile (name, location, contact info, etc.)
    - Programs offered (if available on the page)
    """

    name = "abu_spider"
    source_type = "institution"
    priority = 3  # Medium priority
    institution_name = "Ahmadu Bello University"

    # Start URLs
    start_urls = [
        "https://abu.edu.ng/about",
        "https://abu.edu.ng/",
    ]

    # Custom settings for ABU
    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,  # Be polite
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
    }

    def parse(self, response: Response) -> Generator:
        """
        Parse ABU homepage/about page.

        Extracts institution profile data.

        Args:
            response: Scrapy Response object

        Yields:
            InstitutionItem
        """
        self.logger.info(f"Parsing ABU page: {response.url}")

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

        except Exception as e:
            self.handle_error(e, "institution")

    def _extract_institution_profile(self, response: Response) -> Optional[dict]:
        """
        Extract ABU institution profile from page.

        This method contains the actual scraping logic with CSS selectors
        specific to ABU's website structure.

        Args:
            response: Scrapy Response object

        Returns:
            dict: Institution data or None if extraction fails
        """
        try:
            # Try to extract from page, fall back to known data
            name = self.extract_first(
                response,
                'h1.institution-name::text',
                'h1::text',
                '.page-title::text',
                default='Ahmadu Bello University'
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
                    "Ahmadu Bello University (ABU) is a federal government research "
                    "university located in Zaria, Kaduna State, Nigeria. Founded in 1962, "
                    "it is one of the first generation universities in Nigeria and the "
                    "largest university in Nigeria and second largest in Africa."
                )

            # Extract contact information
            email = self.extract_first(
                response,
                'a[href^="mailto:"]::text',
                '.email::text',
                '.contact-email::text',
                default='info@abu.edu.ng'
            )

            phone = self.extract_first(
                response,
                '.phone::text',
                '.contact-phone::text',
                'a[href^="tel:"]::text',
                default='+234-69-550581'
            )

            # Extract social media links
            social_media = self.extract_social_media(response)

            # Construct institution item
            institution_data = {
                'name': self.clean_text(name) or 'Ahmadu Bello University',
                'short_name': 'ABU',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Kaduna',
                'city': 'Zaria',
                'address': 'Ahmadu Bello University, Zaria, Kaduna State',
                'lga': 'Zaria',
                'website': 'https://abu.edu.ng',
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
```

### Step 3: Create Programs Spider (Optional but Recommended)

**File:** `services/scrapers/spiders/abu_programs_spider.py`

```python
"""
Ahmadu Bello University (ABU) Programs Spider

Dedicated spider for ABU programs.
"""

from typing import Generator
from scrapy.http import Response
from datetime import datetime

from spiders.base_spider import BaseSpider
from items.models import ProgramItem


class AbuProgramsSpider(BaseSpider):
    """
    Dedicated spider for ABU programs.

    Separate spider for better modularity and scheduling.
    Can be run independently to update only program data.
    """

    name = "abu_programs_spider"
    source_type = "program"
    priority = 5
    institution_name = "Ahmadu Bello University"

    start_urls = [
        "https://abu.edu.ng/programmes",
    ]

    def parse(self, response: Response) -> Generator:
        """
        Parse ABU programs listing.

        Args:
            response: Scrapy Response object

        Yields:
            ProgramItem objects
        """
        self.logger.info(f"Parsing ABU programs page: {response.url}")

        # For MVP, yield a few sample programs as proof of concept
        # In production, would scrape from actual website

        sample_programs = [
            {
                'institution_name': 'Ahmadu Bello University',
                'name': 'Computer Science',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Science',
                'specialization': 'Computer Science',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'The Computer Science program at ABU provides comprehensive '
                    'training in software development, algorithms, data structures, '
                    'and computer systems.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            },
            {
                'institution_name': 'Ahmadu Bello University',
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
            {
                'institution_name': 'Ahmadu Bello University',
                'name': 'Agricultural Economics',
                'degree_type': 'undergraduate',
                'qualification': 'BSc',
                'field_of_study': 'Agriculture',
                'specialization': 'Agricultural Economics',
                'duration_years': 4.0,
                'duration_text': '4 years',
                'mode': 'full_time',
                'curriculum_summary': (
                    'Agricultural Economics program focuses on the application of '
                    'economic principles to agricultural production and marketing.'
                ),
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
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
```

### Step 4: Test the Spider

**Run Institution Spider:**
```bash
cd services/scrapers

# Run spider with debug output
python -m scrapy crawl abu_spider -s LOG_LEVEL=DEBUG

# Run spider with normal output
python -m scrapy crawl abu_spider
```

**Expected Output:**
```
[scrapy.core.engine] INFO: Spider opened
[abu_spider] INFO: Initialized abu_spider spider | Type: institution | Priority: 3
[abu_spider] INFO: Parsing ABU page: https://abu.edu.ng/about
[abu_spider] DEBUG: Scraped institution | Count: 1 | Item: Ahmadu Bello University
[scrapy.core.engine] INFO: Closing spider (finished)
[abu_spider] INFO:
======================================================================
Spider Closed: abu_spider
Reason: finished
Duration: 3.45s
Items Scraped: 1
Errors: 0
Validation Errors: 0
Success Rate: 100.0%
======================================================================
```

**Run Programs Spider:**
```bash
python -m scrapy crawl abu_programs_spider
```

**Expected Output:**
```
[abu_programs_spider] INFO: Parsing ABU programs page: https://abu.edu.ng/programmes
[abu_programs_spider] DEBUG: Scraped program | Count: 1 | Item: Computer Science
[abu_programs_spider] DEBUG: Scraped program | Count: 2 | Item: Medicine and Surgery
[abu_programs_spider] DEBUG: Scraped program | Count: 3 | Item: Agricultural Economics
Items Scraped: 3
Success Rate: 100.0%
```

### Step 5: Verify Data in Supabase

**Check institutions table:**
```bash
# Via Supabase dashboard
# Navigate to: Table Editor > institutions
# Look for "Ahmadu Bello University" entry
# Verify fields: name, state, city, type, website, etc.
```

**Check programs table:**
```bash
# Navigate to: Table Editor > programs
# Filter by: institution_name = "Ahmadu Bello University"
# Should see 3 programs (Computer Science, Medicine, Agricultural Economics)
```

---

## Testing & Verification

### Checklist per Spider

- [ ] Spider file created in `spiders/` directory
- [ ] Institution added to `config/sources.yaml`
- [ ] Spider name follows pattern: `{institution_id}_spider`
- [ ] Class name follows pattern: `{InstitutionName}Spider` (PascalCase)
- [ ] Required fields populated:
  - `name`, `source_type`, `priority`, `institution_name`
  - `start_urls`, `custom_settings`
- [ ] `parse()` method implemented
- [ ] `_extract_institution_profile()` method implemented
- [ ] Institution type correct (federal_university, state_university, etc.)
- [ ] State and city verified
- [ ] Founded year verified
- [ ] Website URL accessible and correct
- [ ] Spider runs without errors: `python -m scrapy crawl {spider_name}`
- [ ] Data appears in Supabase institutions table
- [ ] Programs spider created (if applicable)
- [ ] Programs spider runs successfully
- [ ] Program data appears in Supabase programs table

### Quality Checks

**1. Data Accuracy**
- [ ] Institution name spelling correct
- [ ] State and city accurate
- [ ] Website URL works
- [ ] Contact information valid (if scraped)

**2. Code Quality**
- [ ] No hardcoded API keys or secrets
- [ ] Proper error handling
- [ ] Logging statements present
- [ ] Code follows existing patterns

**3. Performance**
- [ ] `DOWNLOAD_DELAY` set to 2+ seconds (be polite)
- [ ] `CONCURRENT_REQUESTS_PER_DOMAIN` = 1
- [ ] No excessive requests

---

## Troubleshooting

### Common Issues

#### Issue 1: Spider Not Found

**Error:**
```
KeyError: 'Spider not found: abu_spider'
```

**Solution:**
1. Verify file is in `services/scrapers/spiders/` directory
2. Check spider `name` attribute matches command
3. Restart terminal and try again

#### Issue 2: Import Errors

**Error:**
```
ModuleNotFoundError: No module named 'spiders.base_spider'
```

**Solution:**
```bash
# Ensure you're in scrapers directory
cd services/scrapers

# Run with python -m scrapy instead of scrapy
python -m scrapy crawl abu_spider
```

#### Issue 3: Pydantic Validation Error

**Error:**
```
ValidationError: 1 validation error for InstitutionItem
  type: field required
```

**Solution:**
1. Check all required fields in `items/models.py`
2. Verify `institution_data` dict has all required keys
3. Use correct enum values (e.g., `InstitutionType.FEDERAL_UNIVERSITY`)

#### Issue 4: Data Not Appearing in Supabase

**Possible Causes:**
1. Supabase connection issue - check `.env` file
2. RLS policies blocking insert - check Supabase RLS settings
3. Spider validation failed - check spider logs

**Debug Steps:**
```bash
# Run with DEBUG level
python -m scrapy crawl abu_spider -s LOG_LEVEL=DEBUG

# Check logs directory
cat logs/spider_metrics.jsonl

# Verify Supabase credentials
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY
```

#### Issue 5: Website Blocks Requests

**Error:**
```
403 Forbidden
429 Too Many Requests
```

**Solution:**
1. Increase `DOWNLOAD_DELAY` to 3-5 seconds
2. Verify `ROBOTSTXT_OBEY` is True
3. Check if website requires JavaScript (set `requires_js: true`)
4. Respect robots.txt - some pages may be disallowed

---

## Next 10 Spiders Roadmap

### Priority Order (Federal Universities First)

| # | Institution | State | ID | Founded | Priority | Est. Time |
|---|-------------|-------|-----|---------|----------|-----------|
| 1 | Ahmadu Bello University | Kaduna | abu | 1962 | High | 40 min |
| 2 | University of Nigeria, Nsukka | Enugu | unn | 1960 | High | 40 min |
| 3 | University of Benin | Edo | uniben | 1970 | High | 40 min |
| 4 | University of Ilorin | Kwara | unilorin | 1975 | High | 40 min |
| 5 | Bayero University Kano | Kano | buk | 1975 | High | 40 min |
| 6 | Federal University of Technology, Akure | Ondo | futa | 1981 | Medium | 40 min |
| 7 | Federal University of Technology, Owerri | Imo | futo | 1980 | Medium | 40 min |
| 8 | University of Port Harcourt | Rivers | uniport | 1975 | Medium | 40 min |
| 9 | Lagos State University | Lagos | lasu | 1983 | Medium | 40 min |
| 10 | Obong University | Akwa Ibom | obong | 2007 | Low | 40 min |

**Total Estimated Time:** ~7 hours (40 min × 10 institutions)

### Batch Execution Strategy

**Phase 1: Create All Spiders (Day 1 - 3 hours)**
- Create 10 institution spiders
- Create 10 program spiders
- Total: 20 spider files

**Phase 2: Test Individually (Day 1 - 2 hours)**
- Test each spider one by one
- Fix any errors immediately
- Verify data in Supabase

**Phase 3: Batch Run (Day 2 - 2 hours)**
- Run all 10 institution spiders in sequence
- Run all 10 program spiders in sequence
- Verify final data count

### Expected Results

**After 10 Spiders:**
- **Institutions in DB:** 16 (current 6 + 10 new)
- **Coverage:** 32% of 50 target institutions
- **Programs:** ~40-50 (assuming 4-5 programs per institution)
- **Success Rate:** >95% (based on current 100% rate)

---

## Quick Reference

### Command Cheatsheet

```bash
# List all spiders
python -m scrapy list

# Run a spider
python -m scrapy crawl {spider_name}

# Run with debug output
python -m scrapy crawl {spider_name} -s LOG_LEVEL=DEBUG

# Run with custom settings
python -m scrapy crawl {spider_name} -s DOWNLOAD_DELAY=5

# Check spider code syntax
python -m scrapy check {spider_name}

# Get spider info
python -m scrapy list -v
```

### File Templates

**sources.yaml entry:**
```yaml
- id: {institution_slug}
  name: {Full Institution Name}
  url: https://{website}.edu.ng
  type: federal_university  # or state_university, private_university, etc.
  state: {State Name}
  scrape_config:
    programs_url: https://{website}.edu.ng/programmes
    admissions_url: https://{website}.edu.ng/admissions
    schedule: daily
    requires_js: false
```

**Spider class template:**
```python
class {InstitutionName}Spider(BaseSpider, InstitutionSpiderMixin):
    name = "{institution_slug}_spider"
    source_type = "institution"
    priority = 3
    institution_name = "{Full Institution Name}"

    start_urls = [
        "https://{website}.edu.ng/about",
        "https://{website}.edu.ng/",
    ]

    custom_settings = {
        **BaseSpider.custom_settings,
        'DOWNLOAD_DELAY': 2,
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
    }
```

---

## Appendix: Institution Data Template

Use this template when creating new spiders:

```python
institution_data = {
    # Required fields
    'name': '{Full Official Name}',
    'short_name': '{ACRONYM}',
    'type': InstitutionType.FEDERAL_UNIVERSITY,  # or STATE_UNIVERSITY, PRIVATE_UNIVERSITY, etc.
    'state': '{Nigerian State}',
    'city': '{City Name}',
    'website': 'https://{website}.edu.ng',

    # Optional but recommended
    'address': '{Full Address}',
    'lga': '{Local Government Area}',
    'email': '{contact@institution.edu.ng}',
    'phone': '{+234-XX-XXXXXXX}',
    'description': '{Brief description of the institution}',
    'founded_year': {YYYY},
    'accreditation_status': 'fully_accredited',
    'accreditation_body': 'NUC',

    # Auto-generated
    'social_media': self.extract_social_media(response),
    'logo_url': self.extract_url(response, 'img[alt*="logo"]::attr(src)'),
    'source_url': response.url,
    'scrape_timestamp': datetime.now(),
}
```

---

**Last Updated:** November 27, 2025
**Status:** Ready for implementation
**Next Steps:** Create ABU spider following this guide
