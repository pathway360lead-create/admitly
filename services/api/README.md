# Admitly API

FastAPI backend for the Admitly Platform.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure environment variables:

```bash
cp ../../.env.example .env
# Edit .env with your configuration
```

4. Run the development server:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

5. Access the API:

- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Project Structure

```
services/api/
├── main.py              # FastAPI application entry point
├── core/                # Core configuration and utilities
│   ├── config.py        # Settings and configuration
│   ├── database.py      # Database connection
│   ├── dependencies.py  # FastAPI dependencies
│   └── logging.py       # Logging configuration
├── routers/             # API endpoints
├── models/              # SQLAlchemy models (if needed)
├── schemas/             # Pydantic schemas
├── services/            # Business logic
├── tests/               # Test files
└── requirements.txt     # Python dependencies
```

## Development

### Running Tests

```bash
pytest
pytest -v  # Verbose
pytest --cov  # With coverage
```

### Code Formatting

```bash
black .
ruff check .
```

### Type Checking

```bash
mypy .
```

## API Documentation

API documentation is auto-generated from code and available at:

- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- OpenAPI JSON: http://localhost:8000/openapi.json
