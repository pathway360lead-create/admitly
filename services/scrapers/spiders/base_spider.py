"""
Base spider class with common functionality for all scrapers.

This base class provides:
- Standardized error handling and logging
- Content hash generation for deduplication
- Rate limiting and politeness
- Metrics tracking
- Configuration loading from sources.yaml
"""

import scrapy
from typing import Dict, Any, Optional, Generator
from scrapy.http import Response
from datetime import datetime
import hashlib
import json
import logging
from pathlib import Path


class BaseSpider(scrapy.Spider):
    """
    Base spider with common functionality for all institution scrapers.

    All institution-specific spiders should inherit from this class.

    Attributes:
        source_type (str): Type of data being scraped ('institution', 'program', etc.)
        priority (int): Spider priority (1-10, higher = more priority)
        institution_name (str): Name of the institution being scraped
    """

    # Override these in subclasses
    name: str = "base_spider"
    source_type: str = "institution"  # 'institution', 'program', 'deadline', 'cost'
    priority: int = 5  # 1-10, higher = more priority
    institution_name: Optional[str] = None  # Set in subclass

    # Scrapy settings (can be overridden in subclasses)
    custom_settings = {
        'DOWNLOAD_DELAY': 2,  # Polite scraping: 2 seconds between requests
        'CONCURRENT_REQUESTS_PER_DOMAIN': 1,  # One request at a time per domain
        'RETRY_TIMES': 3,
        'RETRY_HTTP_CODES': [500, 502, 503, 504, 522, 524, 408, 429],
        'HTTPERROR_ALLOW_ALL': False,
        'ROBOTSTXT_OBEY': True,  # Respect robots.txt
        'USER_AGENT': 'Mozilla/5.0 (compatible; AdmitlyBot/1.0; +https://admitly.com.ng)',
    }

    def __init__(self, *args, **kwargs):
        """Initialize spider with metrics tracking"""
        super().__init__(*args, **kwargs)

        # Metrics
        self.scraped_count = 0
        self.error_count = 0
        self.validation_errors = 0
        self.start_time = datetime.now()

        # Configuration
        self.config = self._load_config()

        self.logger.info(
            f"Initialized {self.name} spider | "
            f"Type: {self.source_type} | "
            f"Priority: {self.priority}"
        )

    def _load_config(self) -> Dict[str, Any]:
        """
        Load spider configuration from config/sources.yaml

        Returns:
            dict: Configuration for this spider's institution
        """
        try:
            config_path = Path(__file__).parent.parent / "config" / "sources.yaml"
            if config_path.exists():
                import yaml
                with open(config_path, 'r', encoding='utf-8') as f:
                    all_config = yaml.safe_load(f)
                    # Find config for this spider's institution
                    if self.institution_name and 'institutions' in all_config:
                        for inst in all_config['institutions']:
                            if inst.get('name') == self.institution_name:
                                return inst
            return {}
        except Exception as e:
            self.logger.warning(f"Could not load config: {e}")
            return {}

    def parse(self, response: Response) -> Generator:
        """
        Main parsing method. Override this in subclasses.

        Args:
            response: Scrapy Response object

        Yields:
            Item objects (InstitutionItem, ProgramItem, etc.)
        """
        raise NotImplementedError(
            f"{self.name} must implement parse() method"
        )

    # ========================================================================
    # Helper Methods for Data Extraction
    # ========================================================================

    def extract_text(
        self,
        response: Response,
        selector: str,
        default: Optional[str] = None
    ) -> Optional[str]:
        """
        Safely extract text from CSS selector.

        Args:
            response: Scrapy Response object
            selector: CSS selector string
            default: Default value if extraction fails

        Returns:
            Extracted text or default value
        """
        try:
            text = response.css(selector).get()
            if text:
                # Clean and normalize text
                text = text.strip()
                # Remove extra whitespace
                text = ' '.join(text.split())
                return text if text else default
            return default
        except Exception as e:
            self.logger.debug(f"Error extracting {selector}: {e}")
            return default

    def extract_text_list(
        self,
        response: Response,
        selector: str
    ) -> list:
        """
        Extract list of text values from CSS selector.

        Args:
            response: Scrapy Response object
            selector: CSS selector string

        Returns:
            List of extracted text values
        """
        try:
            texts = response.css(selector).getall()
            # Clean and filter empty values
            return [t.strip() for t in texts if t.strip()]
        except Exception as e:
            self.logger.debug(f"Error extracting list {selector}: {e}")
            return []

    def extract_first(
        self,
        response: Response,
        *selectors: str,
        default: Optional[str] = None
    ) -> Optional[str]:
        """
        Try multiple selectors and return first successful extraction.

        Args:
            response: Scrapy Response object
            *selectors: Variable number of CSS selector strings
            default: Default value if all extractions fail

        Returns:
            First successful extraction or default value
        """
        for selector in selectors:
            result = self.extract_text(response, selector)
            if result:
                return result
        return default

    def extract_url(
        self,
        response: Response,
        selector: str,
        default: Optional[str] = None
    ) -> Optional[str]:
        """
        Extract and normalize URL from selector.

        Args:
            response: Scrapy Response object
            selector: CSS selector string
            default: Default value if extraction fails

        Returns:
            Absolute URL or default value
        """
        try:
            url = response.css(selector).get()
            if url:
                # Convert to absolute URL
                return response.urljoin(url.strip())
            return default
        except Exception as e:
            self.logger.debug(f"Error extracting URL {selector}: {e}")
            return default

    # ========================================================================
    # Data Processing
    # ========================================================================

    def generate_hash(self, data: Dict[str, Any]) -> str:
        """
        Generate content hash for deduplication.

        This hash is used to detect if scraped content has changed
        since the last scrape.

        Args:
            data: Dictionary of data to hash

        Returns:
            SHA256 hash string
        """
        try:
            # Sort keys for consistent hashing
            sorted_data = dict(sorted(data.items()))
            # Convert to JSON string
            content_str = json.dumps(sorted_data, sort_keys=True, default=str)
            # Generate hash
            return hashlib.sha256(content_str.encode('utf-8')).hexdigest()
        except Exception as e:
            self.logger.error(f"Error generating hash: {e}")
            return ""

    def clean_text(self, text: Optional[str]) -> Optional[str]:
        """
        Clean and normalize text content.

        Args:
            text: Text to clean

        Returns:
            Cleaned text or None
        """
        if not text:
            return None

        # Remove HTML entities
        text = text.replace('&nbsp;', ' ')
        text = text.replace('&amp;', '&')
        text = text.replace('&lt;', '<')
        text = text.replace('&gt;', '>')

        # Remove extra whitespace
        text = ' '.join(text.split())

        return text.strip() if text.strip() else None

    def parse_year(self, text: Optional[str]) -> Optional[int]:
        """
        Extract year from text.

        Args:
            text: Text containing year

        Returns:
            Year as integer or None
        """
        if not text:
            return None

        import re
        # Look for 4-digit year
        match = re.search(r'\b(19|20)\d{2}\b', text)
        if match:
            return int(match.group(0))
        return None

    def parse_duration(self, text: Optional[str]) -> Optional[float]:
        """
        Parse program duration from text.

        Examples:
            "4 years" -> 4.0
            "2.5 years" -> 2.5
            "18 months" -> 1.5

        Args:
            text: Text containing duration

        Returns:
            Duration in years as float or None
        """
        if not text:
            return None

        import re
        text = text.lower()

        # Look for years
        match = re.search(r'(\d+\.?\d*)\s*years?', text)
        if match:
            return float(match.group(1))

        # Look for months
        match = re.search(r'(\d+)\s*months?', text)
        if match:
            return round(int(match.group(1)) / 12, 1)

        return None

    # ========================================================================
    # Error Handling and Logging
    # ========================================================================

    def handle_error(self, failure, item_type: str = "item"):
        """
        Handle spider errors with logging.

        Args:
            failure: Scrapy Failure object
            item_type: Type of item that failed
        """
        self.error_count += 1
        self.logger.error(
            f"Error processing {item_type}: {failure.value} | "
            f"URL: {failure.request.url if hasattr(failure, 'request') else 'unknown'}"
        )

    def log_item(self, item: Any, item_type: str = "item"):
        """
        Log successful item scraping.

        Args:
            item: Scraped item
            item_type: Type of item
        """
        self.scraped_count += 1
        self.logger.debug(
            f"Scraped {item_type} | "
            f"Count: {self.scraped_count} | "
            f"Item: {getattr(item, 'name', 'unknown')}"
        )

    # ========================================================================
    # Spider Lifecycle Methods
    # ========================================================================

    def closed(self, reason):
        """
        Called when spider closes.

        Logs final statistics about the spider run.

        Args:
            reason: Reason for spider closure
        """
        duration = (datetime.now() - self.start_time).total_seconds()

        # Calculate success rate
        total_items = self.scraped_count + self.error_count
        success_rate = (
            (self.scraped_count / total_items * 100)
            if total_items > 0 else 0
        )

        self.logger.info(
            f"\n{'='*70}\n"
            f"Spider Closed: {self.name}\n"
            f"Reason: {reason}\n"
            f"Duration: {duration:.2f}s\n"
            f"Items Scraped: {self.scraped_count}\n"
            f"Errors: {self.error_count}\n"
            f"Validation Errors: {self.validation_errors}\n"
            f"Success Rate: {success_rate:.1f}%\n"
            f"{'='*70}"
        )

        # Log metrics for monitoring
        try:
            self._log_metrics({
                'spider_name': self.name,
                'source_type': self.source_type,
                'duration_seconds': duration,
                'items_scraped': self.scraped_count,
                'errors': self.error_count,
                'validation_errors': self.validation_errors,
                'success_rate': success_rate,
                'closed_reason': reason,
                'timestamp': datetime.now().isoformat()
            })
        except Exception as e:
            self.logger.warning(f"Could not log metrics: {e}")

    def _log_metrics(self, metrics: Dict[str, Any]):
        """
        Log metrics for monitoring (can be sent to external service).

        Args:
            metrics: Dictionary of metrics to log
        """
        # For MVP, just log to file
        # In production, send to monitoring service (Prometheus, Datadog, etc.)
        metrics_file = Path(__file__).parent.parent / "logs" / "spider_metrics.jsonl"
        metrics_file.parent.mkdir(exist_ok=True)

        try:
            with open(metrics_file, 'a', encoding='utf-8') as f:
                f.write(json.dumps(metrics) + '\n')
        except Exception as e:
            self.logger.debug(f"Could not write metrics: {e}")


class InstitutionSpiderMixin:
    """
    Mixin for spiders that scrape institution data.

    Provides common methods for extracting institution-specific data.
    """

    def infer_institution_type(self, url: str, content: str = "") -> str:
        """
        Infer institution type from URL or content.

        Args:
            url: Institution website URL
            content: Page content

        Returns:
            Institution type string
        """
        url = url.lower()
        content = content.lower()

        # Keywords for institution types
        if any(word in url or word in content for word in ['polytechnic', 'poly']):
            return "polytechnic"
        elif any(word in url or word in content for word in ['college of education', 'coe']):
            return "college_of_education"
        elif 'jupeb' in url or 'jupeb' in content:
            return "jupeb_center"
        elif any(word in url or word in content for word in ['university', 'uni']):
            # Try to determine if federal, state, or private
            if 'federal' in content:
                return "federal_university"
            elif 'state' in content:
                return "state_university"
            else:
                return "private_university"  # Default to private if not specified
        else:
            return "specialized"

    def extract_social_media(self, response: Response) -> Dict[str, str]:
        """
        Extract social media links from page.

        Args:
            response: Scrapy Response object

        Returns:
            Dictionary of social media platform -> URL
        """
        social_media = {}

        # Common social media patterns
        platforms = {
            'facebook': [
                'a[href*="facebook.com"]::attr(href)',
                'a[href*="fb.com"]::attr(href)'
            ],
            'twitter': [
                'a[href*="twitter.com"]::attr(href)',
                'a[href*="x.com"]::attr(href)'
            ],
            'instagram': [
                'a[href*="instagram.com"]::attr(href)'
            ],
            'linkedin': [
                'a[href*="linkedin.com"]::attr(href)'
            ],
            'youtube': [
                'a[href*="youtube.com"]::attr(href)'
            ]
        }

        for platform, selectors in platforms.items():
            for selector in selectors:
                url = response.css(selector).get()
                if url:
                    social_media[platform] = url.strip()
                    break

        return social_media
