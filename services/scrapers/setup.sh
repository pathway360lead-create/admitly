#!/bin/bash
# Setup script for scrapers

echo "==========================================="
echo "Admitly Scrapers - Phase 6 MVP Setup"
echo "==========================================="
echo ""

# Check Python version
echo "Checking Python version..."
python_version=$(python --version 2>&1 | awk '{print $2}')
echo "Python version: $python_version"

# Create virtual environment
echo ""
echo "Creating virtual environment..."
if [ ! -d "venv" ]; then
    python -m venv venv
    echo "✓ Virtual environment created"
else
    echo "✓ Virtual environment already exists"
fi

# Activate virtual environment
echo ""
echo "Activating virtual environment..."
if [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    source venv/Scripts/activate
else
    source venv/bin/activate
fi
echo "✓ Virtual environment activated"

# Install dependencies
echo ""
echo "Installing dependencies..."
pip install --upgrade pip
pip install -r requirements.txt
echo "✓ Dependencies installed"

# Create logs directory
echo ""
echo "Creating logs directory..."
mkdir -p logs
echo "✓ Logs directory created"

# Check environment variables
echo ""
echo "Checking environment variables..."
if [ -z "$SUPABASE_URL" ]; then
    echo "⚠ Warning: SUPABASE_URL not set"
    echo "  Please set in .env file or environment"
else
    echo "✓ SUPABASE_URL is set"
fi

if [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo "⚠ Warning: SUPABASE_SERVICE_KEY not set"
    echo "  Please set in .env file or environment"
else
    echo "✓ SUPABASE_SERVICE_KEY is set"
fi

# Verify installation
echo ""
echo "Verifying installation..."
if python -c "import scrapy; import pydantic; import supabase; print('✓ All imports successful')" 2>/dev/null; then
    echo "✓ Installation verified"
else
    echo "✗ Installation verification failed"
    echo "  Try running: pip install -r requirements.txt"
    exit 1
fi

# List spiders
echo ""
echo "Available spiders:"
scrapy list 2>/dev/null || echo "  (Run 'scrapy list' after setup)"

echo ""
echo "==========================================="
echo "Setup Complete!"
echo "==========================================="
echo ""
echo "Quick Start:"
echo "  1. Activate venv: source venv/bin/activate"
echo "  2. Set environment: export SUPABASE_URL=... SUPABASE_SERVICE_KEY=..."
echo "  3. Run spider: scrapy crawl unilag_spider"
echo "  4. Run tests: pytest tests/ -v"
echo ""
echo "For full documentation, see:"
echo "  - README.md"
echo "  - PHASE6_MVP_IMPLEMENTATION.md"
echo ""
