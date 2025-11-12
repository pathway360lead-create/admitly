# Admitly Scrapers

Scrapy-based web scrapers for collecting educational data from Nigerian institutions.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
playwright install  # Install browsers for Playwright
```

3. Configure environment variables:

```bash
cp ../../.env.example .env
# Edit .env with your configuration
```

## Running Scrapers

### List all spiders

```bash
scrapy list
```

### Run a specific spider

```bash
scrapy crawl unilag_spider
```

### Run with settings override

```bash
scrapy crawl unilag_spider -s LOG_LEVEL=DEBUG
```

### Schedule scrapers

The scrapers are scheduled to run automatically via APScheduler. See `worker.py` for the scheduling configuration.

## Project Structure

```
services/scrapers/
├── config/
│   ├── settings.py      # Scrapy settings
│   └── sources.yaml     # Institution data sources
├── spiders/             # Spider implementations
├── pipelines/           # Data processing pipelines
│   ├── validation.py    # Validate scraped data
│   ├── normalization.py # Normalize data formats
│   └── storage.py       # Store data in Supabase
├── items/
│   └── models.py        # Scrapy item models
└── requirements.txt     # Python dependencies
```

## Adding New Institutions

1. Add institution configuration to `config/sources.yaml`
2. Create a new spider in `spiders/` directory
3. Implement data extraction logic
4. Test the spider locally
5. Deploy to production

## Data Pipeline

1. **Scraping**: Extract data from institution websites
2. **Validation**: Validate data against schema
3. **Normalization**: Normalize dates, currency, text
4. **Storage**: Store in Supabase staging tables
5. **Approval**: Admin reviews and approves data
6. **Publishing**: Approved data moves to production tables

## Best Practices

- Respect robots.txt
- Use reasonable rate limiting (2-5 seconds delay)
- Scrape during off-peak hours
- Store HTML snapshots for debugging
- Monitor scraper health and success rates
- Handle errors gracefully
