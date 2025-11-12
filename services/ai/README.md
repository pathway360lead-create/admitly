# Admitly AI Service

AI-powered recommendations and guidance service using Google Gemini and Anthropic Claude.

## Setup

1. Create a virtual environment:

```bash
python -m venv venv
source venv/bin/activate
```

2. Install dependencies:

```bash
pip install -r requirements.txt
```

3. Configure API keys:

```bash
# Add to .env
GEMINI_API_KEY=your-key-here
CLAUDE_API_KEY=your-key-here
```

## Features

- Program recommendations based on user profile
- AI-powered chat for educational guidance
- Career path analysis
- Application planning assistance

## Usage

This service is called by the main FastAPI backend and is not exposed directly to clients.

## Cost Optimization

- Prompt caching (Redis)
- Token limits per request
- Rate limiting for free users
- Fallback to template responses when budget exhausted

## Models

- **Primary**: Google Gemini 1.5 Flash (cost-effective, fast)
- **Secondary**: Anthropic Claude 3 Sonnet (complex reasoning)
- **Fallback**: Template-based responses

## Budget

Target: ₦5,000/month (~$6 USD)
