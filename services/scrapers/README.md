# Admitly Scrapers

**Phase 6 MVP - Production-Ready Data Pipeline**

Scrapy-based web scrapers for collecting educational data from Nigerian institutions.

## Quick Start

```bash
# Install dependencies
cd services/scrapers
pip install -r requirements.txt

# Set environment variables
# SUPABASE_URL and SUPABASE_SERVICE_KEY must be set

# Run a spider
scrapy crawl unilag_spider

# Run programs spider
scrapy crawl unilag_programs_spider
```

## Available Spiders

- `unilag_spider` - University of Lagos (institution profile)
- `unilag_programs_spider` - UNILAG programs
- `oau_spider` - Obafemi Awolowo University (institution profile)
- `oau_programs_spider` - OAU programs

**List all spiders:**
```bash
scrapy list
```

## Features

- **Automatic Validation**: Pydantic models ensure data quality
- **Database Sync**: Direct integration with Supabase
- **Error Handling**: Comprehensive logging and metrics
- **Extensible**: Easy to add new institutions (see documentation)
- **Production-Ready**: Follows specs/data-pipeline.md architecture

## Project Structure

```
services/scrapers/
├── config/
│   ├── settings.py         # Scrapy configuration
│   └── sources.yaml        # Institution configurations
├── spiders/
│   ├── base_spider.py      # Reusable base class
│   ├── unilag_spider.py    # UNILAG scraper
│   └── oau_spider.py       # OAU scraper
├── items/
│   └── models.py           # Pydantic data models
├── pipelines/
│   ├── validation.py       # Data validation pipeline
│   └── supabase_sync.py    # Database sync pipeline
├── tests/
│   └── test_spiders.py     # Unit tests
├── logs/                   # Spider metrics (auto-created)
├── PHASE6_MVP_IMPLEMENTATION.md  # Complete guide
└── README.md               # This file
```

## Documentation

**For complete documentation, see:**
- `PHASE6_MVP_IMPLEMENTATION.md` - Full implementation guide
- `../../../specs/data-pipeline.md` - Architecture specification

## Setup

### 1. Install Dependencies

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Configure Environment

Create `.env` file in project root:

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your-service-role-key
```

### 3. Verify Setup

```bash
scrapy list  # Should show 4 spiders
pytest tests/ -v  # Run tests
```

## Running Scrapers

### Basic Usage

```bash
# Run institution spider
scrapy crawl unilag_spider

# Run programs spider
scrapy crawl unilag_programs_spider

# Run with debug logging
scrapy crawl unilag_spider -s LOG_LEVEL=DEBUG

# Save output to JSON
scrapy crawl unilag_spider -o output.json
```

### Verify Data

After running spiders, check Supabase:
1. Open Supabase Dashboard → Table Editor
2. Check `institutions` table for institution data
3. Check `programs` table for program data

## Adding New Institutions

**5-minute process per institution:**

1. Add to `config/sources.yaml`:
```yaml
- id: new_uni
  name: New University
  url: https://newuni.edu.ng
  type: federal_university
  state: Lagos
```

2. Copy `unilag_spider.py` to `new_uni_spider.py`

3. Update spider class name and institution details

4. Test: `scrapy crawl new_uni_spider`

**See `PHASE6_MVP_IMPLEMENTATION.md` for detailed guide.**

## Testing

```bash
# Run all tests
pytest tests/ -v

# Run with coverage
pytest tests/ --cov=. --cov-report=html

# Run specific test
pytest tests/test_spiders.py::test_unilag_spider_initialization -v
```

## Monitoring

Spider metrics are logged to:
- Console (stdout)
- `logs/spider_metrics.jsonl` (JSON format)

**View metrics:**
```bash
tail -f logs/spider_metrics.jsonl | python -m json.tool
```

## Data Pipeline

```
Scrape → Validate → Filter Duplicates → Sync to Supabase
```

### Pipelines (in order):
1. **ValidationPipeline**: Validate against Pydantic models
2. **DuplicateFilterPipeline**: Filter duplicates in session
3. **SupabaseSyncPipeline**: Insert/update in database

## Best Practices

- **Respect robots.txt**: Enabled by default
- **Rate limiting**: 2 seconds delay between requests
- **Politeness**: 1 concurrent request per domain
- **Error handling**: All errors are logged with context
- **Data quality**: Validation ensures clean data

## Troubleshooting

### Common Issues

**1. "SUPABASE_URL and SUPABASE_SERVICE_KEY must be set"**
- Check `.env` file exists with correct values
- Use `SUPABASE_SERVICE_KEY` (not ANON_KEY)

**2. "Validation error: Invalid Nigerian state"**
- Use exact state names: "Lagos", "Oyo", "Osun", "FCT"
- Not: "lagos", "Lagos State"

**3. No data in Supabase**
- Check spider logs for validation errors
- Verify Supabase connection
- Check RLS policies allow service role to insert

**For more troubleshooting, see `PHASE6_MVP_IMPLEMENTATION.md`**

## Next Steps

1. Test MVP spiders
2. Add more institutions (48 remaining)
3. Implement staging tables + approval workflow
4. Add APScheduler for automation
5. Monitor and iterate

## Contributing

When adding new spiders:
1. Follow `base_spider.py` pattern
2. Use Pydantic models from `items/models.py`
3. Add tests to `tests/test_spiders.py`
4. Update `config/sources.yaml`
5. Document any website-specific quirks

---

**Version**: 1.0 (Phase 6 MVP)
**Last Updated**: January 11, 2025
**Status**: Production-Ready
