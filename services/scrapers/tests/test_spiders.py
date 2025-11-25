"""
Unit tests for spiders.

Tests the scraping logic without making actual HTTP requests.
"""

import pytest
from scrapy.http import HtmlResponse, Request
from datetime import datetime

from spiders.unilag_spider import UnilagSpider, UnilagProgramsSpider
from spiders.oau_spider import OauSpider, OauProgramsSpider
from items.models import InstitutionItem, ProgramItem


# ============================================================================
# Fixtures
# ============================================================================

@pytest.fixture
def mock_html_response():
    """
    Create a mock HTML response for testing.
    """
    html = """
    <html>
        <head><title>Test University</title></head>
        <body>
            <h1>University of Test</h1>
            <div class="about-content">
                <p>This is a test university with excellent programs.</p>
            </div>
            <div class="contact-info">
                <a href="mailto:info@test.edu">info@test.edu</a>
                <span class="phone">+234-1-1234567</span>
            </div>
            <div class="social">
                <a href="https://facebook.com/testuni">Facebook</a>
                <a href="https://twitter.com/testuni">Twitter</a>
            </div>
        </body>
    </html>
    """
    request = Request(url='https://test.edu')
    return HtmlResponse(
        url='https://test.edu',
        request=request,
        body=html.encode('utf-8')
    )


# ============================================================================
# Base Spider Tests
# ============================================================================

def test_unilag_spider_initialization():
    """Test UNILAG spider initializes correctly"""
    spider = UnilagSpider()

    assert spider.name == "unilag_spider"
    assert spider.source_type == "institution"
    assert spider.institution_name == "University of Lagos"
    assert spider.priority == 3
    assert spider.scraped_count == 0
    assert spider.error_count == 0


def test_oau_spider_initialization():
    """Test OAU spider initializes correctly"""
    spider = OauSpider()

    assert spider.name == "oau_spider"
    assert spider.source_type == "institution"
    assert spider.institution_name == "Obafemi Awolowo University"
    assert spider.priority == 3


# ============================================================================
# Data Extraction Tests
# ============================================================================

def test_extract_text(mock_html_response):
    """Test text extraction from HTML"""
    spider = UnilagSpider()

    # Test successful extraction
    text = spider.extract_text(mock_html_response, 'h1::text')
    assert text == "University of Test"

    # Test with non-existent selector (should return None)
    text = spider.extract_text(mock_html_response, '.nonexistent::text')
    assert text is None

    # Test with default value
    text = spider.extract_text(
        mock_html_response,
        '.nonexistent::text',
        default='Default Value'
    )
    assert text == 'Default Value'


def test_extract_first(mock_html_response):
    """Test extracting first matching selector"""
    spider = UnilagSpider()

    # Should return first successful match
    text = spider.extract_first(
        mock_html_response,
        '.nonexistent::text',
        'h1::text',
        'title::text'
    )
    assert text == "University of Test"


def test_extract_social_media(mock_html_response):
    """Test social media extraction"""
    spider = UnilagSpider()

    social = spider.extract_social_media(mock_html_response)

    assert 'facebook' in social
    assert 'facebook.com/testuni' in social['facebook']
    assert 'twitter' in social
    assert 'twitter.com/testuni' in social['twitter']


# ============================================================================
# Hash Generation Tests
# ============================================================================

def test_generate_hash():
    """Test content hash generation"""
    spider = UnilagSpider()

    data = {'name': 'Test', 'value': 123}
    hash1 = spider.generate_hash(data)

    # Hash should be consistent
    hash2 = spider.generate_hash(data)
    assert hash1 == hash2

    # Different data should produce different hash
    data2 = {'name': 'Test2', 'value': 456}
    hash3 = spider.generate_hash(data2)
    assert hash1 != hash3


# ============================================================================
# Text Cleaning Tests
# ============================================================================

def test_clean_text():
    """Test text cleaning"""
    spider = UnilagSpider()

    # Test HTML entity cleaning
    text = spider.clean_text("Hello&nbsp;World&amp;Test")
    assert text == "Hello World&Test"

    # Test whitespace normalization
    text = spider.clean_text("  Multiple   spaces  ")
    assert text == "Multiple spaces"

    # Test None input
    text = spider.clean_text(None)
    assert text is None


def test_parse_year():
    """Test year extraction"""
    spider = UnilagSpider()

    assert spider.parse_year("Founded in 1962") == 1962
    assert spider.parse_year("Established 2005") == 2005
    assert spider.parse_year("No year here") is None


def test_parse_duration():
    """Test program duration parsing"""
    spider = UnilagSpider()

    assert spider.parse_duration("4 years") == 4.0
    assert spider.parse_duration("2.5 years") == 2.5
    assert spider.parse_duration("18 months") == 1.5
    assert spider.parse_duration("No duration") is None


# ============================================================================
# Program Spider Tests
# ============================================================================

def test_unilag_programs_spider():
    """Test UNILAG programs spider"""
    spider = UnilagProgramsSpider()

    assert spider.name == "unilag_programs_spider"
    assert spider.source_type == "program"
    assert spider.institution_name == "University of Lagos"


def test_oau_programs_spider():
    """Test OAU programs spider"""
    spider = OauProgramsSpider()

    assert spider.name == "oau_programs_spider"
    assert spider.source_type == "program"
    assert spider.institution_name == "Obafemi Awolowo University"


# ============================================================================
# Integration Tests (with mock responses)
# ============================================================================

def test_unilag_parse_institution():
    """Test UNILAG institution parsing"""
    spider = UnilagSpider()

    # Create mock response
    html = """
    <html>
        <body>
            <h1>University of Lagos</h1>
            <p>Premier university in Nigeria</p>
        </body>
    </html>
    """
    request = Request(url='https://unilag.edu.ng')
    response = HtmlResponse(
        url='https://unilag.edu.ng',
        request=request,
        body=html.encode('utf-8')
    )

    # Parse
    results = list(spider.parse(response))

    # Should yield institution item
    assert len(results) > 0

    # Verify item structure
    item = results[0]
    assert 'name' in item
    assert 'state' in item
    assert 'source_url' in item
    assert item['state'] == 'Lagos'


def test_programs_spider_yields_programs():
    """Test that programs spider yields program items"""
    spider = UnilagProgramsSpider()

    # Mock response
    request = Request(url='https://unilag.edu.ng/programmes')
    response = HtmlResponse(
        url='https://unilag.edu.ng/programmes',
        request=request,
        body=b'<html><body>Programs</body></html>'
    )

    # Parse
    results = list(spider.parse(response))

    # Should yield program items
    assert len(results) > 0

    # Verify program structure
    program = results[0]
    assert 'name' in program
    assert 'institution_name' in program
    assert 'degree_type' in program
    assert program['institution_name'] == 'University of Lagos'


# ============================================================================
# Error Handling Tests
# ============================================================================

def test_spider_handles_errors():
    """Test spider error handling"""
    spider = UnilagSpider()

    initial_errors = spider.error_count

    # Simulate error
    try:
        raise Exception("Test error")
    except Exception as e:
        spider.handle_error(e, "test_item")

    # Error count should increment
    assert spider.error_count == initial_errors + 1


# ============================================================================
# Metrics Tests
# ============================================================================

def test_spider_tracks_metrics():
    """Test spider metrics tracking"""
    spider = UnilagSpider()

    assert spider.scraped_count == 0
    assert spider.error_count == 0

    # Log item
    mock_item = {'name': 'Test'}
    spider.log_item(mock_item)

    assert spider.scraped_count == 1


# ============================================================================
# Pydantic Model Tests
# ============================================================================

def test_institution_item_validation():
    """Test InstitutionItem validation"""
    # Valid data
    valid_data = {
        'name': 'University of Test',
        'type': 'federal_university',
        'state': 'Lagos',
        'source_url': 'https://test.edu',
        'scrape_timestamp': datetime.now(),
    }

    item = InstitutionItem(**valid_data)
    assert item.name == 'University of Test'
    assert item.state == 'Lagos'


def test_program_item_validation():
    """Test ProgramItem validation"""
    valid_data = {
        'institution_name': 'University of Test',
        'name': 'Computer Science',
        'degree_type': 'undergraduate',
        'source_url': 'https://test.edu/programs',
        'scrape_timestamp': datetime.now(),
    }

    item = ProgramItem(**valid_data)
    assert item.name == 'Computer Science'
    assert item.degree_type == 'undergraduate'


def test_invalid_state_rejected():
    """Test that invalid Nigerian state is rejected"""
    invalid_data = {
        'name': 'University of Test',
        'type': 'federal_university',
        'state': 'InvalidState',  # Not a Nigerian state
        'source_url': 'https://test.edu',
    }

    with pytest.raises(Exception):  # Should raise validation error
        InstitutionItem(**invalid_data)


if __name__ == '__main__':
    pytest.main([__file__, '-v'])
