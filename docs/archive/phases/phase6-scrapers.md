# Phase 6 MVP - Data Pipeline Implementation Guide

**Version:** 1.0
**Date:** January 11, 2025
**Status:** Complete
**Author:** Claude (Sonnet 4.5)

---

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Setup & Installation](#setup--installation)
5. [Running the Spiders](#running-the-spiders)
6. [Adding New Institutions](#adding-new-institutions)
7. [Testing](#testing)
8. [Monitoring](#monitoring)
9. [Troubleshooting](#troubleshooting)
10. [Upgrade Path to Full Spec](#upgrade-path-to-full-spec)

---

## Overview

### What Was Built

Phase 6 MVP implements a **production-quality, extensible data pipeline** for scraping Nigerian educational institution data. The implementation focuses on **quality over quantity** - 2 working spiders with excellent architecture rather than 50 spiders with poor maintainability.

### Key Features

- **Extensible Base Spider Architecture**: Easy to add 48 more institutions
- **Robust Validation**: Pydantic models ensure data quality
- **Automatic Database Sync**: Direct integration with Supabase
- **Comprehensive Error Handling**: Logging, metrics, retries
- **Production-Ready Patterns**: Follows specs/data-pipeline.md design
- **Well-Tested**: Unit tests for all components

### What's Included

#### Core Components (8 files)
1. `items/models.py` - Pydantic data models with validation
2. `spiders/base_spider.py` - Reusable base spider class
3. `spiders/unilag_spider.py` - University of Lagos spider
4. `spiders/oau_spider.py` - Obafemi Awolowo University spider
5. `pipelines/validation.py` - Data validation pipeline
6. `pipelines/supabase_sync.py` - Database synchronization
7. `config/sources.yaml` - Institution configurations
8. `config/settings.py` - Scrapy settings

#### Supporting Files
9. `tests/test_spiders.py` - Comprehensive unit tests
10. `requirements.txt` - Updated dependencies
11. `README.md` - Updated quick start guide
12. `PHASE6_MVP_IMPLEMENTATION.md` - This file

---

## Architecture

### Data Flow

```
┌─────────────────┐
│  Spider Start   │
│   (Scrapy)      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   Scrape Data   │ ← base_spider.py (common logic)
│  from Website   │   unilag_spider.py / oau_spider.py
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Raw Item Dict  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  ValidationPipeline             │
│  - Validate against Pydantic    │
│  - Check business rules         │
│  - Drop invalid items           │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  DuplicateFilterPipeline        │
│  - Filter duplicates in session │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  SupabaseSyncPipeline           │
│  - Find existing by slug/name   │
│  - Insert or update             │
│  - Track metadata               │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Supabase DB    │
│  (institutions, │
│   programs)     │
└─────────────────┘
```

### Component Relationships

```
BaseSpider (base_spider.py)
    ├── InstitutionSpiderMixin
    │   ├── infer_institution_type()
    │   └── extract_social_media()
    │
    ├── UnilagSpider (unilag_spider.py)
    │   └── UnilagProgramsSpider
    │
    └── OauSpider (oau_spider.py)
        └── OauProgramsSpider

Pydantic Models (items/models.py)
    ├── InstitutionItem
    ├── ProgramItem
    ├── ApplicationWindowItem
    ├── CostItem
    └── ContactItem

Pipelines
    ├── ValidationPipeline (validation.py)
    │   ├── _validate_institution()
    │   ├── _validate_program()
    │   ├── _validate_cost()
    │   └── _validate_application_window()
    │
    ├── DuplicateFilterPipeline (validation.py)
    │
    └── SupabaseSyncPipeline (supabase_sync.py)
        ├── _sync_institution()
        ├── _sync_program()
        ├── _sync_cost()
        └── _sync_application_window()
```

---

## Components

### 1. Pydantic Data Models (`items/models.py`)

**Purpose**: Define data schemas with automatic validation

**Key Classes**:
- `InstitutionItem`: Institution profile data
- `ProgramItem`: Program/course data
- `ApplicationWindowItem`: Deadline information
- `CostItem`: Tuition and fees
- `ContactItem`: Institution contacts

**Features**:
- Field-level validation (email, URL, year ranges, etc.)
- Nigerian state validation
- Type safety with Enums
- Matches database schema exactly

**Example**:
```python
from items.models import InstitutionItem, InstitutionType

institution = InstitutionItem(
    name="University of Lagos",
    type=InstitutionType.FEDERAL_UNIVERSITY,
    state="Lagos",
    source_url="https://unilag.edu.ng"
)
```

### 2. Base Spider (`spiders/base_spider.py`)

**Purpose**: Reusable spider logic for all institutions

**Key Features**:
- Configuration loading from `sources.yaml`
- Helper methods for data extraction (`extract_text`, `extract_first`, etc.)
- Content hash generation for deduplication
- Metrics tracking (scraped count, errors)
- Error handling and logging
- Lifecycle management

**Usage**:
```python
class NewInstitutionSpider(BaseSpider):
    name = "new_institution_spider"
    source_type = "institution"
    institution_name = "New University"
    start_urls = ["https://newuni.edu.ng"]

    def parse(self, response):
        # Use helper methods
        name = self.extract_text(response, 'h1::text')
        description = self.clean_text(response.css('.about::text').get())

        # Create item
        yield InstitutionItem(
            name=name,
            description=description,
            # ... more fields
        )
```

### 3. Validation Pipeline (`pipelines/validation.py`)

**Purpose**: Ensure data quality before storage

**Components**:
- `ValidationPipeline`: Validates against Pydantic models and business rules
- `DuplicateFilterPipeline`: Filters duplicates within a scraping session

**Business Rules Examples**:
- Founded year must be between 1900-2030
- UTME scores must be 100-400
- Fees must be reasonable (< ₦5,000,000)
- Application end date must be after start date

**Metrics**:
- Items validated
- Validation errors
- Success rate

### 4. Supabase Sync Pipeline (`pipelines/supabase_sync.py`)

**Purpose**: Store scraped data in Supabase database

**Features**:
- Automatic upserts (insert or update based on slug/name)
- Institution ID lookup for related entities
- Slug generation from names
- Metadata tracking (source_url, scrape_timestamp)
- Error handling and retry logic

**For MVP**: Direct insert to production tables (no staging/approval)

**Statistics Tracked**:
- Items inserted
- Items updated
- Items failed
- Success rate

### 5. Institution Spiders

#### UNILAG Spider (`spiders/unilag_spider.py`)
- Scrapes University of Lagos data
- Institution profile + sample programs
- Demonstrates full implementation pattern

#### OAU Spider (`spiders/oau_spider.py`)
- Scrapes Obafemi Awolowo University data
- Shows how easy it is to add new institutions
- Identical structure to UNILAG spider

**Both spiders include**:
- Institution spider (profiles)
- Programs spider (course listings)

---

## Setup & Installation

### Prerequisites

- Python 3.10+
- Supabase account with database set up
- Environment variables configured

### Step 1: Install Dependencies

```bash
cd services/scrapers

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

**New dependencies added**:
- `python-slugify==8.0.1` - For generating URL slugs
- `pydantic==2.5.3` - For data validation

### Step 2: Configure Environment Variables

Create `.env` file in project root (if not exists):

```bash
# Supabase Configuration (REQUIRED)
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key

# Scraper Configuration (OPTIONAL)
SCRAPER_USER_AGENT=Mozilla/5.0 (compatible; AdmitlyBot/1.0; +https://admitly.com.ng)
SCRAPER_CONCURRENT_REQUESTS=16
SCRAPER_DOWNLOAD_DELAY=2
```

**Important**: Use `SUPABASE_SERVICE_KEY` not `SUPABASE_ANON_KEY` for scrapers (needs write access)

### Step 3: Verify Setup

```bash
# Check Scrapy installation
scrapy version

# List available spiders
scrapy list

# Expected output:
# oau_programs_spider
# oau_spider
# unilag_programs_spider
# unilag_spider
```

---

## Running the Spiders

### Basic Usage

```bash
cd services/scrapers

# Run UNILAG institution spider
scrapy crawl unilag_spider

# Run UNILAG programs spider
scrapy crawl unilag_programs_spider

# Run OAU institution spider
scrapy crawl oau_spider

# Run OAU programs spider
scrapy crawl oau_programs_spider
```

### With Custom Settings

```bash
# Run with debug logging
scrapy crawl unilag_spider -s LOG_LEVEL=DEBUG

# Run with custom delay
scrapy crawl unilag_spider -s DOWNLOAD_DELAY=5

# Save output to JSON
scrapy crawl unilag_spider -o output.json
```

### Expected Output

```
2025-01-11 14:30:00 [unilag_spider] INFO: Initialized unilag_spider spider | Type: institution | Priority: 3
2025-01-11 14:30:01 [unilag_spider] INFO: Parsing UNILAG page: https://unilag.edu.ng/
2025-01-11 14:30:02 [unilag_spider] DEBUG: Scraped institution | Count: 1 | Item: University of Lagos
2025-01-11 14:30:02 [ValidationPipeline] DEBUG: Validated institution item: University of Lagos
2025-01-11 14:30:03 [SupabaseSyncPipeline] INFO: Inserted institution: University of Lagos (ID: uuid...)

======================================================================
Spider Closed: unilag_spider
Reason: finished
Duration: 3.45s
Items Scraped: 1
Errors: 0
Validation Errors: 0
Success Rate: 100.0%
======================================================================
```

### Verify in Supabase

1. Go to Supabase Dashboard → Table Editor
2. Open `institutions` table
3. You should see:
   - University of Lagos
   - Obafemi Awolowo University
4. Open `programs` table
5. You should see sample programs for both institutions

---

## Adding New Institutions

### Quick Start (5 minutes per institution)

**Step 1**: Add to `config/sources.yaml`

```yaml
institutions:
  # ... existing institutions ...

  - id: new_uni
    name: New University Name
    url: https://newuni.edu.ng
    type: federal_university  # or state_university, private_university, etc.
    state: Lagos  # Nigerian state
    scrape_config:
      programs_url: https://newuni.edu.ng/programmes
      admissions_url: https://newuni.edu.ng/admissions
      schedule: daily
      requires_js: false
```

**Step 2**: Create spider file `spiders/new_uni_spider.py`

```python
"""New University Spider"""

from typing import Generator, Optional
from scrapy.http import Response
from datetime import datetime

from .base_spider import BaseSpider, InstitutionSpiderMixin
from ..items.models import InstitutionItem, InstitutionType

class NewUniSpider(BaseSpider, InstitutionSpiderMixin):
    """Spider for New University"""

    name = "new_uni_spider"
    source_type = "institution"
    priority = 3
    institution_name = "New University Name"

    start_urls = [
        "https://newuni.edu.ng/",
        "https://newuni.edu.ng/about",
    ]

    def parse(self, response: Response) -> Generator:
        """Parse New University page"""
        self.logger.info(f"Parsing New Uni page: {response.url}")

        try:
            institution = self._extract_institution_profile(response)

            if institution:
                hash_data = {
                    'name': institution['name'],
                    'website': institution.get('website'),
                }
                institution['content_hash'] = self.generate_hash(hash_data)

                self.log_item(institution, "institution")
                yield institution

        except Exception as e:
            self.handle_error(e, "institution")

    def _extract_institution_profile(self, response: Response) -> Optional[dict]:
        """Extract institution profile"""
        try:
            # Use helper methods from BaseSpider
            name = self.extract_first(
                response,
                'h1.title::text',
                'h1::text',
                default='New University Name'
            )

            description = self.extract_first(
                response,
                '.about-content p::text',
                '.description::text',
                default='University description...'
            )

            # Build item dict
            institution_data = {
                'name': self.clean_text(name),
                'short_name': 'NEWUNI',
                'type': InstitutionType.FEDERAL_UNIVERSITY,
                'state': 'Lagos',  # Update as needed
                'city': 'City Name',
                'address': 'Full address',
                'website': 'https://newuni.edu.ng',
                'email': self.extract_text(response, 'a[href^="mailto:"]::text', default='info@newuni.edu.ng'),
                'phone': self.extract_text(response, '.phone::text', default=None),
                'social_media': self.extract_social_media(response),
                'description': self.clean_text(description),
                'founded_year': self.parse_year(description),  # Try to extract
                'accreditation_status': 'fully_accredited',
                'accreditation_body': 'NUC',
                'source_url': response.url,
                'scrape_timestamp': datetime.now(),
            }

            # Validate
            item = InstitutionItem(**institution_data)
            return item.model_dump()

        except Exception as e:
            self.logger.error(f"Error extracting profile: {e}")
            return None
```

**Step 3**: Test the spider

```bash
# Check spider is listed
scrapy list | grep new_uni

# Run with debug logging
scrapy crawl new_uni_spider -s LOG_LEVEL=DEBUG

# Verify data in Supabase
```

**That's it!** The spider will automatically:
- Validate data with Pydantic models
- Filter duplicates
- Sync to Supabase
- Log metrics

### Advanced: Custom Selectors

For websites with unique HTML structure, customize the selectors:

```python
def _extract_institution_profile(self, response: Response) -> Optional[dict]:
    # Website-specific selectors
    name = response.css('.institution-header h1::text').get()
    description = ' '.join(response.css('.about-section p::text').getall())
    email = response.css('.contact-info .email a::attr(href)').get()

    # Remove 'mailto:' prefix
    if email and email.startswith('mailto:'):
        email = email[7:]

    # Continue as normal...
```

### Tips for Adding Spiders

1. **Start with existing data**: Use known information (name, location, founded year)
2. **Extract what's available**: Not all fields are required
3. **Test incrementally**: Run spider frequently during development
4. **Check validation errors**: Pipeline will tell you what's wrong
5. **Use debug logging**: `scrapy crawl spider_name -s LOG_LEVEL=DEBUG`
6. **Verify in Supabase**: Check data appears correctly

---

## Testing

### Run Unit Tests

```bash
cd services/scrapers

# Run all tests
pytest tests/ -v

# Run specific test file
pytest tests/test_spiders.py -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html

# Run specific test
pytest tests/test_spiders.py::test_unilag_spider_initialization -v
```

### Test Coverage

Current tests cover:
- Spider initialization
- Data extraction helpers
- Text cleaning and parsing
- Hash generation
- Social media extraction
- Pydantic model validation
- Error handling
- Metrics tracking
- Integration with mock responses

**Expected output**:
```
tests/test_spiders.py::test_unilag_spider_initialization PASSED
tests/test_spiders.py::test_oau_spider_initialization PASSED
tests/test_spiders.py::test_extract_text PASSED
tests/test_spiders.py::test_generate_hash PASSED
tests/test_spiders.py::test_clean_text PASSED
tests/test_spiders.py::test_institution_item_validation PASSED
... (more tests)

==================== 20 passed in 2.34s ====================
```

### Manual Testing

```bash
# Test spider without saving to database
# (Disable SupabaseSyncPipeline in settings)

scrapy crawl unilag_spider -o test_output.json

# Check output
cat test_output.json | python -m json.tool
```

---

## Monitoring

### Spider Metrics

Each spider tracks:
- **Items scraped**: Count of successfully scraped items
- **Errors**: Count of errors encountered
- **Validation errors**: Count of items that failed validation
- **Duration**: Time taken to complete
- **Success rate**: Percentage of successful items

**View metrics**:
```bash
# Metrics are logged to console during spider run
# And saved to services/scrapers/logs/spider_metrics.jsonl

tail -f services/scrapers/logs/spider_metrics.jsonl | python -m json.tool
```

### Pipeline Statistics

**Validation Pipeline**:
```
======================================================================
Validation Pipeline Statistics
Items Validated: 10
Validation Errors: 1
Success Rate: 90.0%
======================================================================
```

**Supabase Sync Pipeline**:
```
======================================================================
Supabase Sync Pipeline Statistics
Total Items: 10
Inserted: 7
Updated: 3
Failed: 0
Success Rate: 100.0%
======================================================================
```

### Logs

Logs are saved to:
- Console (stdout)
- `services/scrapers/logs/spider_metrics.jsonl` (JSON lines format)

**Example log entry**:
```json
{
  "spider_name": "unilag_spider",
  "source_type": "institution",
  "duration_seconds": 3.45,
  "items_scraped": 1,
  "errors": 0,
  "validation_errors": 0,
  "success_rate": 100.0,
  "closed_reason": "finished",
  "timestamp": "2025-01-11T14:30:05Z"
}
```

---

## Troubleshooting

### Common Issues

#### 1. "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"

**Problem**: Environment variables not configured

**Solution**:
```bash
# Check if .env exists
ls -la .env

# Verify variables are set
echo $SUPABASE_URL
echo $SUPABASE_SERVICE_KEY

# If not set, create .env file with correct values
# Make sure to use SUPABASE_SERVICE_KEY (not ANON_KEY)
```

#### 2. "ModuleNotFoundError: No module named 'pydantic'"

**Problem**: Dependencies not installed

**Solution**:
```bash
pip install -r requirements.txt

# Or install specifically
pip install pydantic==2.5.3 python-slugify==8.0.1
```

#### 3. "Validation error for InstitutionItem: Invalid Nigerian state"

**Problem**: State name doesn't match validation list

**Solution**:
```python
# Use exact state names from items/models.py NIGERIAN_STATES list
# Examples: "Lagos", "Oyo", "Osun", "FCT"

# Not: "lagos", "Lagos State", "Oyo State"
```

#### 4. Spider runs but no data in Supabase

**Problem**: Could be validation errors, Supabase connection issues, or RLS policies

**Solution**:
```bash
# 1. Check spider logs for validation errors
scrapy crawl spider_name -s LOG_LEVEL=DEBUG

# 2. Check Supabase connection
python -c "from supabase import create_client; import os; client = create_client(os.getenv('SUPABASE_URL'), os.getenv('SUPABASE_SERVICE_KEY')); print('Connected:', client)"

# 3. Check RLS policies in Supabase dashboard
# Make sure service role can insert into institutions/programs tables

# 4. Test pipeline directly
python -c "from pipelines.supabase_sync import SupabaseSyncPipeline; p = SupabaseSyncPipeline()"
```

#### 5. "Institution not found for program"

**Problem**: Program spider can't find institution ID

**Solution**:
```bash
# 1. Make sure institution spider ran first
scrapy crawl unilag_spider

# 2. Verify institution exists in database
# Check Supabase institutions table

# 3. Make sure institution name matches exactly
# In program spider: institution_name = "University of Lagos"
# In database: name = "University of Lagos"
```

#### 6. Duplicate items being created

**Problem**: Slug generation or duplicate detection not working

**Solution**:
```python
# Check if content_hash is being generated
# In spider, add:
self.logger.info(f"Content hash: {item['content_hash']}")

# Check if slug matches
# In Supabase, institution slug should be: "university-of-lagos"
```

### Debug Mode

Run spider with maximum verbosity:

```bash
scrapy crawl unilag_spider \
  -s LOG_LEVEL=DEBUG \
  -s LOG_FILE=spider_debug.log \
  -s CLOSESPIDER_ITEMCOUNT=1  # Stop after 1 item for testing
```

### Getting Help

1. **Check logs**: `services/scrapers/logs/spider_metrics.jsonl`
2. **Enable debug logging**: `-s LOG_LEVEL=DEBUG`
3. **Review specs**: `specs/data-pipeline.md` for architecture
4. **Check database schema**: `specs/database-schema.md`
5. **Verify test cases**: Run `pytest tests/ -v`

---

## Upgrade Path to Full Spec

The MVP provides a **solid foundation** for the full implementation. Here's what to add:

### Phase 6.1: More Institutions (Easy)

- Add 10 more top institutions using the same pattern
- Estimated time: 1 hour per institution
- Just copy UNILAG spider template

### Phase 6.2: Staging Database (Medium)

Currently: Direct insert to production tables
Full spec: Insert to staging tables → manual review → publish

**Add**:
```python
# pipelines/supabase_sync.py
def _sync_institution(self, item, spider):
    # Change table from 'institutions' to 'staging_institutions'
    result = self.supabase.table('staging_institutions').insert(data).execute()
```

**Create staging tables**:
```sql
CREATE TABLE staging_institutions (LIKE public.institutions INCLUDING ALL);
CREATE TABLE staging_programs (LIKE public.programs INCLUDING ALL);
-- Add review_status, reviewed_by, etc.
```

### Phase 6.3: Approval Workflow (Medium)

Add admin review interface:
- API endpoints for reviewing changes
- Conflict detection
- Auto-approval rules for low-risk changes

Refer to: `specs/data-pipeline.md` lines 739-793

### Phase 6.4: Scheduling (Easy)

Add APScheduler for automatic scraping:

```python
# scheduler.py
from apscheduler.schedulers.blocking import BlockingScheduler

scheduler = BlockingScheduler()

# Run UNILAG spider daily
scheduler.add_job(
    run_spider,
    'cron',
    args=['unilag_spider'],
    hour='6',  # 6 AM daily
    id='unilag_scraper'
)

scheduler.start()
```

### Phase 6.5: Advanced Features (Hard)

- **JavaScript rendering**: For websites requiring JS (use Playwright)
- **PDF extraction**: For fee schedules in PDF format
- **Email scraping**: Contact form automation
- **Real-time monitoring**: Prometheus metrics
- **Alert system**: Slack/email notifications on failures
- **HTML snapshots**: Store original HTML for debugging

Refer to: `specs/data-pipeline.md` complete specification

---

## Summary

### What Was Achieved

- ✅ **Production-quality architecture** that's easily extensible
- ✅ **2 working spiders** (UNILAG, OAU) demonstrating the pattern
- ✅ **Automatic validation** catching bad data before storage
- ✅ **Seamless Supabase integration** with upserts
- ✅ **Comprehensive tests** for all components
- ✅ **Clear documentation** for adding more institutions
- ✅ **Follows best practices** from specs/data-pipeline.md

### Time Investment to Full Implementation

| Task | Complexity | Time Estimate |
|------|-----------|---------------|
| Add 48 more institution spiders | Easy | 48-96 hours |
| Implement staging database | Medium | 8-16 hours |
| Build approval workflow | Medium | 16-24 hours |
| Add APScheduler automation | Easy | 4-8 hours |
| Implement monitoring dashboard | Medium | 16-24 hours |
| Add advanced features (JS, PDF, etc.) | Hard | 40-60 hours |
| **Total** | | **132-228 hours** |

### Next Steps

1. **Test the MVP**: Run all spiders, verify data in Supabase
2. **Add 5 more institutions**: Practice the pattern
3. **Implement staging tables**: Prepare for review workflow
4. **Set up scheduling**: Automate daily scraping
5. **Monitor and iterate**: Watch for errors, improve selectors

---

**Last Updated**: January 11, 2025
**Documentation Version**: 1.0
**Status**: Ready for Production Testing
