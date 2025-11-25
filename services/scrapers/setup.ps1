# Setup script for scrapers (Windows PowerShell)

Write-Host "===========================================" -ForegroundColor Green
Write-Host "Admitly Scrapers - Phase 6 MVP Setup" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""

# Check Python version
Write-Host "Checking Python version..." -ForegroundColor Yellow
$pythonVersion = python --version 2>&1
Write-Host "Python version: $pythonVersion"

# Create virtual environment
Write-Host ""
Write-Host "Creating virtual environment..." -ForegroundColor Yellow
if (-not (Test-Path "venv")) {
    python -m venv venv
    Write-Host "√ Virtual environment created" -ForegroundColor Green
} else {
    Write-Host "√ Virtual environment already exists" -ForegroundColor Green
}

# Activate virtual environment
Write-Host ""
Write-Host "Activating virtual environment..." -ForegroundColor Yellow
& .\venv\Scripts\Activate.ps1
Write-Host "√ Virtual environment activated" -ForegroundColor Green

# Install dependencies
Write-Host ""
Write-Host "Installing dependencies..." -ForegroundColor Yellow
pip install --upgrade pip
pip install -r requirements.txt
Write-Host "√ Dependencies installed" -ForegroundColor Green

# Create logs directory
Write-Host ""
Write-Host "Creating logs directory..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "logs" | Out-Null
Write-Host "√ Logs directory created" -ForegroundColor Green

# Check environment variables
Write-Host ""
Write-Host "Checking environment variables..." -ForegroundColor Yellow
if (-not $env:SUPABASE_URL) {
    Write-Host "⚠ Warning: SUPABASE_URL not set" -ForegroundColor Yellow
    Write-Host "  Please set in .env file or environment"
} else {
    Write-Host "√ SUPABASE_URL is set" -ForegroundColor Green
}

if (-not $env:SUPABASE_SERVICE_KEY) {
    Write-Host "⚠ Warning: SUPABASE_SERVICE_KEY not set" -ForegroundColor Yellow
    Write-Host "  Please set in .env file or environment"
} else {
    Write-Host "√ SUPABASE_SERVICE_KEY is set" -ForegroundColor Green
}

# Verify installation
Write-Host ""
Write-Host "Verifying installation..." -ForegroundColor Yellow
try {
    python -c "import scrapy; import pydantic; import supabase; print('√ All imports successful')"
    Write-Host "√ Installation verified" -ForegroundColor Green
} catch {
    Write-Host "✗ Installation verification failed" -ForegroundColor Red
    Write-Host "  Try running: pip install -r requirements.txt"
    exit 1
}

# List spiders
Write-Host ""
Write-Host "Available spiders:" -ForegroundColor Yellow
try {
    scrapy list
} catch {
    Write-Host "  (Run 'scrapy list' after setup)"
}

Write-Host ""
Write-Host "===========================================" -ForegroundColor Green
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Quick Start:" -ForegroundColor Cyan
Write-Host "  1. Activate venv: .\venv\Scripts\Activate.ps1"
Write-Host "  2. Set environment: `$env:SUPABASE_URL='...' `$env:SUPABASE_SERVICE_KEY='...'"
Write-Host "  3. Run spider: scrapy crawl unilag_spider"
Write-Host "  4. Run tests: pytest tests/ -v"
Write-Host ""
Write-Host "For full documentation, see:" -ForegroundColor Cyan
Write-Host "  - README.md"
Write-Host "  - PHASE6_MVP_IMPLEMENTATION.md"
Write-Host ""
