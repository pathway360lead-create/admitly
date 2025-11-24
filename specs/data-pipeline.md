# Data Pipeline Specification

## Overview
Complete data pipeline specification for scraping, normalizing, validating, and publishing educational institution data for the Nigeria Student Data Services Platform.

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    SCHEDULER (APScheduler)                  │
│  Cron jobs trigger scrapers based on priority and frequency │
└────────────────────────┬────────────────────────────────────┘
                         │
         ┌───────────────┴───────────────┐
         │                               │
    ┌────▼────┐                    ┌────▼────┐
    │ High    │                    │ Low     │
    │ Priority│                    │ Priority│
    │ Queue   │                    │ Queue   │
    └────┬────┘                    └────┬────┘
         │                               │
    ┌────▼────────────────────────────────▼────┐
    │     Scrapy Workers (Render)              │
    │  - Institution Scraper                   │
    │  - Program Scraper                       │
    │  - Admission Scraper                     │
    │  - Deadline Scraper                      │
    │  - Fees Scraper                          │
    └────┬─────────────────────────────────────┘
         │
    ┌────▼────────────────────┐
    │  Normalization Service  │
    │  - Date standardization │
    │  - Currency conversion  │
    │  - Deduplication        │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │   Validation Service    │
    │  - Schema validation    │
    │  - Business rules       │
    │  - Conflict detection   │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │   Staging Tables        │
    │   (Supabase Postgres)   │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │  Approval Workflow      │
    │  - Auto-approve (safe)  │
    │  - Manual review queue  │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │  Production Tables      │
    │   + Change Log          │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │  Search Index Sync      │
    │   (Meilisearch)         │
    └────┬────────────────────┘
         │
    ┌────▼────────────────────┐
    │  Notification Service   │
    │  (Email/Push alerts)    │
    └─────────────────────────┘
```

---

## 1. Scraper Architecture

### 1.1 Project Structure
```
/scrapers
  /spiders
    - base_spider.py          # Base class for all spiders
    - institution_spider.py   # Institution profile scraper
    - program_spider.py       # Program listing scraper
    - admission_spider.py     # Cut-off and requirements scraper
    - deadline_spider.py      # Application deadlines scraper
    - fees_spider.py          # Tuition and fees scraper
  /items
    - models.py               # Pydantic models for scraped data
  /pipelines
    - validation.py           # Data validation pipeline
    - normalization.py        # Data normalization pipeline
    - storage.py              # Save to staging database
    - snapshot.py             # HTML snapshot storage
  /middlewares
    - user_agent.py           # Rotate user agents
    - throttle.py             # Rate limiting
    - retry.py                # Retry failed requests
  /config
    - sources.yaml            # Source configuration (URLs, selectors)
    - settings.py             # Scrapy settings
  /utils
    - parsers.py              # Date, currency, text parsers
    - validators.py           # Validation helpers
  scrapy.cfg
```

### 1.2 Base Spider Class
```python
# spiders/base_spider.py
from typing import Dict, Any, Optional
import scrapy
from scrapy.http import Response
from datetime import datetime
import hashlib

class BaseSpider(scrapy.Spider):
    """Base spider with common functionality"""

    # Override in subclasses
    source_type: str = None  # 'institution', 'program', etc.
    priority: int = 5  # 1-10, higher = more priority

    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.scraped_count = 0
        self.error_count = 0
        self.start_time = datetime.now()

    def parse(self, response: Response):
        """Override this method in subclasses"""
        raise NotImplementedError

    def extract_text(self, response: Response, selector: str) -> Optional[str]:
        """Safely extract text from CSS selector"""
        try:
            text = response.css(selector).get()
            return text.strip() if text else None
        except Exception as e:
            self.logger.error(f"Error extracting {selector}: {e}")
            return None

    def generate_hash(self, data: Dict[str, Any]) -> str:
        """Generate content hash for deduplication"""
        content = str(sorted(data.items()))
        return hashlib.sha256(content.encode()).hexdigest()

    def store_snapshot(self, response: Response, entity_id: str):
        """Store HTML snapshot to Supabase Storage"""
        filename = f"{entity_id}_{datetime.now().isoformat()}.html"
        # Upload to Supabase Storage
        # Implementation in storage pipeline

    def closed(self, reason):
        """Called when spider closes"""
        duration = (datetime.now() - self.start_time).total_seconds()
        self.logger.info(
            f"Spider closed: {reason} | "
            f"Scraped: {self.scraped_count} | "
            f"Errors: {self.error_count} | "
            f"Duration: {duration}s"
        )
```

### 1.3 Institution Spider Example
```python
# spiders/institution_spider.py
from typing import Generator
import scrapy
from scrapy.http import Response
from ..items.models import InstitutionItem
from .base_spider import BaseSpider

class InstitutionSpider(BaseSpider):
    name = "institution_spider"
    source_type = "institution"
    priority = 3  # Low priority (quarterly scraping)

    # Load from config/sources.yaml
    start_urls = [
        "https://unilag.edu.ng/about",
        "https://ui.edu.ng/about",
        # ... 50 institutions
    ]

    custom_settings = {
        'DOWNLOAD_DELAY': 2,  # Polite scraping
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,
        'RETRY_TIMES': 3,
    }

    def parse(self, response: Response) -> Generator[InstitutionItem, None, None]:
        """Parse institution profile page"""

        # Extract data using CSS selectors (configured per source)
        institution = InstitutionItem(
            name=self.extract_text(response, 'h1.institution-name::text'),
            type=self.infer_type(response.url),
            website=response.url,
            address=self.extract_text(response, '.address::text'),
            phone=self.extract_text(response, '.phone::text'),
            email=self.extract_text(response, '.email::text'),
            description=self.extract_text(response, '.about-text::text'),
            founded_year=self.extract_year(response),
            source_url=response.url,
            scrape_timestamp=datetime.now(),
            content_hash=self.generate_hash({
                'name': name,
                'address': address,
                # ... other fields
            })
        )

        # Store HTML snapshot
        self.store_snapshot(response, institution.name)

        self.scraped_count += 1
        yield institution

        # Follow links to programs page if available
        programs_url = response.css('a[href*="programmes"]::attr(href)').get()
        if programs_url:
            yield response.follow(programs_url, self.parse_programs)

    def parse_programs(self, response: Response):
        """Parse institution programs listing"""
        # Implementation for program extraction
        pass

    def infer_type(self, url: str) -> str:
        """Infer institution type from URL/content"""
        # Logic to determine federal_university, polytechnic, etc.
        pass
```

---

## 2. Institution-Specific Scrapers

### 2.1 Top 50 Institutions Configuration

```yaml
# config/sources.yaml
institutions:
  - id: "unilag"
    name: "University of Lagos"
    type: "federal_university"
    base_url: "https://unilag.edu.ng"
    pages:
      profile: "/about"
      programs: "/programmes"
      admissions: "/admissions"
      fees: "/fees"
    selectors:
      name: "h1.page-title"
      description: ".about-content p"
      phone: ".contact-info .phone"
      email: ".contact-info .email"
      programs_list: ".programme-list .programme-item"
    scrape_frequency: "quarterly"
    last_scraped: "2025-01-01T00:00:00Z"
    robots_txt_compliant: true
    rate_limit: 1  # requests per second

  - id: "ui"
    name: "University of Ibadan"
    type: "federal_university"
    base_url: "https://ui.edu.ng"
    # ... similar structure

  # ... repeat for all 50 institutions
```

### 2.2 Scraping Strategies by Institution Type

**Federal Universities:**
- Well-structured websites
- Standard navigation patterns
- Use CSS selectors

**State Universities:**
- Varied website quality
- May need fallback to XPath
- Some may require JavaScript rendering (Playwright)

**Polytechnics:**
- Often outdated designs
- May need custom parsers
- Check for PDF documents

**JUPEB Centers:**
- Limited online presence
- Focus on contact details and fees
- Manual verification needed

---

## 3. Data Models (Pydantic)

### 3.1 Institution Item
```python
# items/models.py
from typing import Optional, Dict, Any
from pydantic import BaseModel, Field, validator
from datetime import datetime

class InstitutionItem(BaseModel):
    # Core fields
    name: str = Field(..., min_length=3, max_length=200)
    short_name: Optional[str] = Field(None, max_length=20)
    type: str = Field(..., regex="^(federal_university|state_university|...)$")

    # Location
    address: Optional[str]
    city: Optional[str]
    state: str
    lga: Optional[str]

    # Contact
    website: Optional[str]
    email: Optional[str]
    phone: Optional[str]
    social_media: Optional[Dict[str, str]] = {}

    # Details
    description: Optional[str]
    founded_year: Optional[int] = Field(None, ge=1800, le=2030)

    # Accreditation
    accreditation_status: Optional[str]
    accreditation_body: Optional[str]

    # Meta
    source_url: str
    scrape_timestamp: datetime
    content_hash: str

    @validator('email')
    def validate_email(cls, v):
        if v and '@' not in v:
            raise ValueError('Invalid email format')
        return v

    @validator('state')
    def validate_state(cls, v):
        """Ensure state is valid Nigerian state"""
        nigerian_states = ['Lagos', 'Ogun', 'Oyo', ...]  # 36 states + FCT
        if v not in nigerian_states:
            raise ValueError(f'Invalid state: {v}')
        return v

    class Config:
        json_schema_extra = {
            "example": {
                "name": "University of Lagos",
                "short_name": "UNILAG",
                "type": "federal_university",
                "state": "Lagos",
                "website": "https://unilag.edu.ng",
                # ...
            }
        }
```

### 3.2 Program Item
```python
class ProgramItem(BaseModel):
    institution_name: str
    institution_id: Optional[str]  # If known

    name: str
    degree_type: str
    qualification: Optional[str]
    field_of_study: Optional[str]
    specialization: Optional[str]

    duration_years: Optional[float]
    duration_text: Optional[str]
    mode: Optional[str]

    curriculum_summary: Optional[str]

    # Accreditation
    accreditation_status: Optional[str]

    # Meta
    source_url: str
    scrape_timestamp: datetime
    content_hash: str
```

### 3.3 Fees Item
```python
class FeesItem(BaseModel):
    institution_name: str
    program_name: Optional[str]

    fee_type: str
    fee_name: str
    amount_text: str  # Raw scraped text: "N50,000", "50000", etc.
    amount_kobo: Optional[int]  # Normalized in pipeline

    academic_year: Optional[str]
    student_category: Optional[str]
    payment_frequency: Optional[str]

    source_url: str
    scrape_timestamp: datetime
```

---

## 4. Data Pipelines

### 4.1 Validation Pipeline
```python
# pipelines/validation.py
from scrapy import Spider
from scrapy.exceptions import DropItem
from ..items.models import InstitutionItem, ProgramItem

class ValidationPipeline:
    """Validate scraped items against schema"""

    def process_item(self, item, spider: Spider):
        # Pydantic validation happens automatically
        try:
            if isinstance(item, dict):
                # Convert dict to Pydantic model
                if spider.source_type == 'institution':
                    item = InstitutionItem(**item)
                elif spider.source_type == 'program':
                    item = ProgramItem(**item)
                # ... other types

            # Additional business logic validation
            if not self.validate_business_rules(item, spider):
                raise ValueError("Business rule validation failed")

            return item

        except Exception as e:
            spider.logger.error(f"Validation error: {e}")
            spider.error_count += 1
            raise DropItem(f"Invalid item: {e}")

    def validate_business_rules(self, item, spider) -> bool:
        """Custom validation logic"""
        # Example: Fees must be reasonable
        if hasattr(item, 'amount_kobo') and item.amount_kobo:
            if item.amount_kobo < 0 or item.amount_kobo > 50000000000:  # ₦500k max
                return False

        # Example: Founded year must be reasonable
        if hasattr(item, 'founded_year') and item.founded_year:
            if item.founded_year < 1900 or item.founded_year > datetime.now().year:
                return False

        return True
```

### 4.2 Normalization Pipeline
```python
# pipelines/normalization.py
import re
from datetime import datetime
from typing import Optional

class NormalizationPipeline:
    """Normalize data to standard formats"""

    def process_item(self, item, spider):
        # Normalize fees
        if hasattr(item, 'amount_text') and item.amount_text:
            item.amount_kobo = self.normalize_currency(item.amount_text)

        # Normalize dates
        if hasattr(item, 'application_start_date') and isinstance(item.application_start_date, str):
            item.application_start_date = self.normalize_date(item.application_start_date)

        # Normalize phone numbers
        if hasattr(item, 'phone') and item.phone:
            item.phone = self.normalize_phone(item.phone)

        # Clean text fields
        if hasattr(item, 'description') and item.description:
            item.description = self.clean_text(item.description)

        return item

    def normalize_currency(self, amount_text: str) -> Optional[int]:
        """Convert various currency formats to kobo"""
        # Remove currency symbols and commas
        cleaned = re.sub(r'[₦N,\s]', '', amount_text)

        # Handle written amounts: "fifty thousand" -> 50000
        if cleaned.isalpha():
            cleaned = self.text_to_number(cleaned)

        try:
            # Convert to float then to kobo (multiply by 100)
            naira = float(cleaned)
            kobo = int(naira * 100)
            return kobo
        except ValueError:
            return None

    def normalize_date(self, date_str: str) -> Optional[datetime]:
        """Parse various date formats to ISO"""
        formats = [
            "%Y-%m-%d",
            "%d/%m/%Y",
            "%d-%m-%Y",
            "%B %d, %Y",  # January 15, 2025
            "%d %B %Y",   # 15 January 2025
            "%d %b %Y",   # 15 Jan 2025
        ]

        for fmt in formats:
            try:
                return datetime.strptime(date_str.strip(), fmt)
            except ValueError:
                continue

        return None

    def normalize_phone(self, phone: str) -> str:
        """Normalize phone numbers to +234XXXXXXXXXX"""
        # Remove non-digits
        digits = re.sub(r'\D', '', phone)

        # Handle various formats
        if digits.startswith('0'):
            digits = '234' + digits[1:]
        elif not digits.startswith('234'):
            digits = '234' + digits

        return '+' + digits

    def clean_text(self, text: str) -> str:
        """Clean and normalize text"""
        # Remove extra whitespace
        text = re.sub(r'\s+', ' ', text).strip()
        # Remove HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&amp;', '&')
        return text

    def text_to_number(self, text: str) -> str:
        """Convert text numbers to digits"""
        # Simplified implementation
        mappings = {
            'fifty thousand': '50000',
            'hundred thousand': '100000',
            # ... more mappings
        }
        return mappings.get(text.lower(), '0')
```

### 4.3 Storage Pipeline
```python
# pipelines/storage.py
from supabase import create_client, Client
import os

class StoragePipeline:
    """Save items to Supabase staging tables"""

    def __init__(self):
        self.supabase: Client = create_client(
            os.getenv('SUPABASE_URL'),
            os.getenv('SUPABASE_SERVICE_KEY')
        )

    def process_item(self, item, spider):
        # Convert Pydantic model to dict
        data = item.dict()

        # Determine table based on source type
        if spider.source_type == 'institution':
            table = 'staging_institutions'
        elif spider.source_type == 'program':
            table = 'staging_programs'
        elif spider.source_type == 'fees':
            table = 'staging_costs'
        # ... other types

        # Check for duplicates by content_hash
        existing = self.supabase.table(table).select('id').eq('content_hash', data['content_hash']).execute()

        if existing.data:
            spider.logger.info(f"Duplicate detected: {data.get('name')}")
            # Update last_scraped_at
            self.supabase.table(table).update({
                'last_scraped_at': data['scrape_timestamp']
            }).eq('id', existing.data[0]['id']).execute()
        else:
            # Insert new record
            result = self.supabase.table(table).insert(data).execute()
            spider.logger.info(f"Saved to {table}: {data.get('name')}")

        return item
```

---

## 5. Scheduling System

### 5.1 APScheduler Configuration
```python
# scheduler.py
from apscheduler.schedulers.blocking import BlockingScheduler
from apscheduler.jobstores.redis import RedisJobStore
from apscheduler.executors.pool import ThreadPoolExecutor
from datetime import datetime
import subprocess

# Job store (Redis)
jobstores = {
    'default': RedisJobStore(
        host=os.getenv('REDIS_HOST'),
        port=6379,
        db=0
    )
}

# Executors
executors = {
    'default': ThreadPoolExecutor(10),
    'high_priority': ThreadPoolExecutor(5)
}

# Job defaults
job_defaults = {
    'coalesce': False,
    'max_instances': 1,
    'misfire_grace_time': 300  # 5 minutes
}

scheduler = BlockingScheduler(
    jobstores=jobstores,
    executors=executors,
    job_defaults=job_defaults
)

# Schedule jobs
def schedule_jobs():
    # High priority: Deadlines (daily during admission season)
    scheduler.add_job(
        run_spider,
        'cron',
        args=['deadline_spider'],
        hour='6',  # 6 AM daily
        id='deadline_scraper',
        executor='high_priority'
    )

    # Medium priority: Fees (biweekly)
    scheduler.add_job(
        run_spider,
        'cron',
        args=['fees_spider'],
        day='1,15',  # 1st and 15th of month
        hour='7',
        id='fees_scraper'
    )

    # Low priority: Institutions (quarterly)
    scheduler.add_job(
        run_spider,
        'cron',
        args=['institution_spider'],
        month='1,4,7,10',  # Jan, Apr, Jul, Oct
        day='1',
        hour='8',
        id='institution_scraper'
    )

    # Programs (monthly)
    scheduler.add_job(
        run_spider,
        'cron',
        args=['program_spider'],
        day='5',  # 5th of each month
        hour='9',
        id='program_scraper'
    )

    # Update application window statuses (daily)
    scheduler.add_job(
        update_window_statuses,
        'cron',
        hour='0',  # Midnight
        id='update_statuses'
    )

def run_spider(spider_name: str):
    """Execute Scrapy spider"""
    cmd = f"scrapy crawl {spider_name}"
    result = subprocess.run(cmd, shell=True, capture_output=True)

    if result.returncode != 0:
        # Log error, send alert
        send_alert(f"Spider {spider_name} failed: {result.stderr}")

def update_window_statuses():
    """Call Supabase function to update window statuses"""
    # Implementation
    pass

if __name__ == '__main__':
    schedule_jobs()
    scheduler.start()
```

### 5.2 Priority Queue
```python
# Use Redis Queue (RQ) for job prioritization
from redis import Redis
from rq import Queue

redis_conn = Redis(host='localhost', port=6379)

high_priority_queue = Queue('high', connection=redis_conn)
medium_priority_queue = Queue('medium', connection=redis_conn)
low_priority_queue = Queue('low', connection=redis_conn)

# Enqueue jobs
high_priority_queue.enqueue(run_spider, 'deadline_spider')
medium_priority_queue.enqueue(run_spider, 'fees_spider')
low_priority_queue.enqueue(run_spider, 'institution_spider')
```

---

## 6. Approval Workflow

### 6.1 Auto-Approval Rules
```python
# approval/rules.py
from typing import Dict, Any

def should_auto_approve(entity_type: str, changes: Dict[str, Any]) -> bool:
    """Determine if changes can be auto-approved"""

    # Auto-approve new institutions (low risk)
    if entity_type == 'institution' and changes.get('action') == 'create':
        return True

    # Auto-approve minor text changes
    if 'description' in changes and len(changes) == 1:
        return True

    # Reject auto-approval for financial changes >20%
    if 'amount_kobo' in changes:
        old_amount = changes['amount_kobo']['old']
        new_amount = changes['amount_kobo']['new']
        if old_amount and abs(new_amount - old_amount) / old_amount > 0.20:
            return False  # Require manual review

    # Reject auto-approval for cut-off changes >10 points
    if 'cutoff_score' in changes:
        old_score = changes['cutoff_score']['old']
        new_score = changes['cutoff_score']['new']
        if abs(new_score - old_score) > 10:
            return False

    # Default: auto-approve
    return True
```

### 6.2 Conflict Detection
```python
# approval/conflicts.py
def detect_conflicts(staging_item: Dict, production_item: Dict) -> list:
    """Detect conflicts between staging and production data"""
    conflicts = []

    for field in ['name', 'amount_kobo', 'cutoff_score', 'deadline']:
        if field in staging_item and field in production_item:
            if staging_item[field] != production_item[field]:
                conflicts.append({
                    'field': field,
                    'staging_value': staging_item[field],
                    'production_value': production_item[field],
                    'change_percentage': calculate_change(
                        production_item[field],
                        staging_item[field]
                    )
                })

    return conflicts
```

---

## 7. Search Index Sync

### 7.1 Postgres → Meilisearch Sync
```python
# sync/meilisearch_sync.py
import meilisearch
from supabase import create_client

# Initialize clients
meili_client = meilisearch.Client('http://localhost:7700', 'masterKey')
supabase = create_client(SUPABASE_URL, SUPABASE_KEY)

def sync_institutions():
    """Sync institutions from Postgres to Meilisearch"""
    # Fetch published institutions
    result = supabase.table('institutions').select('*').eq('status', 'published').execute()
    institutions = result.data

    # Transform for Meilisearch
    documents = [
        {
            'id': inst['id'],
            'name': inst['name'],
            'type': inst['type'],
            'state': inst['state'],
            'description': inst['description'],
            'search_text': f"{inst['name']} {inst['short_name']} {inst['description']}",
            'updated_at': inst['updated_at']
        }
        for inst in institutions
    ]

    # Index in Meilisearch
    index = meili_client.index('institutions')
    index.add_documents(documents)

def sync_programs():
    """Sync programs from Postgres to Meilisearch"""
    # Similar implementation
    pass

# Trigger sync on data changes (via Supabase trigger or webhook)
```

### 7.2 Real-time Sync (Supabase Trigger)
```sql
-- Create trigger for real-time sync
CREATE OR REPLACE FUNCTION notify_meilisearch_sync()
RETURNS TRIGGER AS $$
BEGIN
    -- Send webhook to sync service
    PERFORM pg_notify('meilisearch_sync', json_build_object(
        'table', TG_TABLE_NAME,
        'operation', TG_OP,
        'data', row_to_json(NEW)
    )::text);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER institution_updated
AFTER INSERT OR UPDATE ON public.institutions
FOR EACH ROW EXECUTE FUNCTION notify_meilisearch_sync();
```

---

## 8. Monitoring & Alerting

### 8.1 Metrics Collection
```python
# monitoring/metrics.py
from prometheus_client import Counter, Histogram, Gauge
import time

# Define metrics
scraper_runs = Counter('scraper_runs_total', 'Total scraper runs', ['spider_name', 'status'])
scraper_duration = Histogram('scraper_duration_seconds', 'Scraper execution time', ['spider_name'])
items_scraped = Counter('items_scraped_total', 'Total items scraped', ['spider_name', 'item_type'])
scraper_errors = Counter('scraper_errors_total', 'Total scraper errors', ['spider_name', 'error_type'])
data_freshness = Gauge('data_freshness_hours', 'Hours since last successful scrape', ['source'])

# Usage in spider
class MonitoredSpider(BaseSpider):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.start_time = time.time()

    def closed(self, reason):
        duration = time.time() - self.start_time

        # Record metrics
        scraper_runs.labels(spider_name=self.name, status=reason).inc()
        scraper_duration.labels(spider_name=self.name).observe(duration)
        items_scraped.labels(spider_name=self.name, item_type=self.source_type).inc(self.scraped_count)
        scraper_errors.labels(spider_name=self.name, error_type='parse_error').inc(self.error_count)
```

### 8.2 Alerting Rules
```yaml
# alerts.yaml
alerts:
  - name: "Scraper Failure"
    condition: "scraper_runs_total{status='error'} > 3"
    window: "1h"
    action: "send_email"
    recipients: ["admin@scholardata.ng"]
    message: "Scraper has failed 3 times in the last hour"

  - name: "Data Freshness Warning"
    condition: "data_freshness_hours{source='deadlines'} > 48"
    action: "send_slack"
    channel: "#alerts"
    message: "Deadline data is stale (>48 hours)"

  - name: "High Error Rate"
    condition: "scraper_errors_total > 50"
    window: "1h"
    action: "send_email"
```

---

## 9. Configuration Management

### 9.1 Source Catalog (sources.yaml)
```yaml
# Detailed configuration for each institution
# See section 2.1 for full example
```

### 9.2 Robots.txt Compliance
```python
# Check robots.txt before scraping
from urllib.robotparser import RobotFileParser

def is_allowed(url: str, user_agent: str) -> bool:
    """Check if scraping is allowed by robots.txt"""
    rp = RobotFileParser()
    rp.set_url(f"{url}/robots.txt")
    rp.read()
    return rp.can_fetch(user_agent, url)

# Usage in spider
if not is_allowed(self.start_urls[0], self.user_agent):
    self.logger.warning(f"Scraping not allowed by robots.txt: {self.start_urls[0]}")
    return
```

---

## 10. Deployment (Render)

### 10.1 Render Configuration
```yaml
# render.yaml
services:
  - type: worker
    name: scraper-worker-high
    env: python
    buildCommand: "pip install -r requirements.txt"
    startCommand: "rq worker high --url $REDIS_URL"
    envVars:
      - key: SUPABASE_URL
        sync: false
      - key: SUPABASE_SERVICE_KEY
        sync: false
      - key: REDIS_URL
        fromService:
          type: redis
          name: redis-queue
    scaling:
      minInstances: 1
      maxInstances: 5

  - type: worker
    name: scraper-scheduler
    env: python
    startCommand: "python scheduler.py"
    envVars:
      - key: SUPABASE_URL
        sync: false
    scaling:
      minInstances: 1
      maxInstances: 1  # Only one scheduler instance

  - type: redis
    name: redis-queue
    plan: starter
    maxmemoryPolicy: noeviction
```

### 10.2 Environment Variables
```bash
# .env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-key
REDIS_URL=redis://localhost:6379
MEILISEARCH_URL=http://localhost:7700
MEILISEARCH_KEY=masterKey
SENTRY_DSN=https://...
```

---

## Implementation Checklist

- [ ] Set up Scrapy project structure
- [ ] Configure sources.yaml for top 50 institutions
- [ ] Implement base spider class
- [ ] Create institution spider
- [ ] Create program spider
- [ ] Create fees spider
- [ ] Create deadline spider
- [ ] Implement validation pipeline
- [ ] Implement normalization pipeline
- [ ] Implement storage pipeline
- [ ] Set up APScheduler
- [ ] Configure Redis Queue
- [ ] Implement approval workflow
- [ ] Set up Meilisearch sync
- [ ] Configure monitoring (Prometheus)
- [ ] Set up alerting (email/Slack)
- [ ] Deploy to Render
- [ ] Test end-to-end pipeline
- [ ] Document scraping strategy per institution

---

## Next Steps
1. Prototype institution spider for UNILAG
2. Test validation and normalization pipelines
3. Set up staging database
4. Configure scheduler for test runs
5. Deploy worker to Render
6. Monitor first scraping cycle
