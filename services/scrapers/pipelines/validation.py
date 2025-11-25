"""
Validation pipeline for scraped data.

This pipeline validates all scraped items against their Pydantic models
to ensure data quality before storage.
"""

from scrapy import Spider
from scrapy.exceptions import DropItem
from pydantic import ValidationError
from typing import Any, Dict
import logging

from ..items.models import (
    InstitutionItem,
    ProgramItem,
    ApplicationWindowItem,
    CostItem,
    ContactItem
)


class ValidationPipeline:
    """
    Validates scraped items against Pydantic schemas.

    This pipeline:
    1. Validates items against their Pydantic models
    2. Drops invalid items with clear error messages
    3. Tracks validation errors for monitoring
    4. Applies additional business rule validation
    """

    def __init__(self):
        """Initialize validation pipeline"""
        self.logger = logging.getLogger(self.__class__.__name__)
        self.validation_errors = 0
        self.items_validated = 0

        # Map source types to Pydantic models
        self.model_map = {
            'institution': InstitutionItem,
            'program': ProgramItem,
            'application_window': ApplicationWindowItem,
            'cost': CostItem,
            'contact': ContactItem
        }

    def process_item(self, item: Dict[str, Any], spider: Spider) -> Dict[str, Any]:
        """
        Validate item against its Pydantic model.

        Args:
            item: Scraped item (as dict)
            spider: Spider that scraped the item

        Returns:
            Validated item as dict

        Raises:
            DropItem: If validation fails
        """
        self.items_validated += 1

        try:
            # Get the appropriate Pydantic model
            source_type = getattr(spider, 'source_type', 'institution')
            model_class = self.model_map.get(source_type)

            if not model_class:
                raise ValueError(f"Unknown source type: {source_type}")

            # Validate item with Pydantic
            if isinstance(item, dict):
                validated_item = model_class(**item)
            else:
                # If item is already a Pydantic model, validate by reconstructing
                validated_item = model_class(**dict(item))

            # Apply additional business rules
            if not self._validate_business_rules(validated_item, spider):
                raise ValueError("Business rule validation failed")

            # Log successful validation
            self.logger.debug(
                f"Validated {source_type} item: "
                f"{getattr(validated_item, 'name', 'unknown')}"
            )

            # Convert back to dict for Scrapy pipeline
            return validated_item.model_dump()

        except ValidationError as e:
            # Pydantic validation error
            self.validation_errors += 1
            spider.validation_errors = getattr(spider, 'validation_errors', 0) + 1

            error_details = self._format_validation_errors(e)
            self.logger.error(
                f"Validation error for {source_type} item:\n{error_details}"
            )

            raise DropItem(f"Validation failed: {error_details}")

        except Exception as e:
            # Other errors
            self.validation_errors += 1
            spider.validation_errors = getattr(spider, 'validation_errors', 0) + 1

            self.logger.error(f"Validation error: {str(e)}")
            raise DropItem(f"Validation failed: {str(e)}")

    def _format_validation_errors(self, error: ValidationError) -> str:
        """
        Format Pydantic validation errors for logging.

        Args:
            error: Pydantic ValidationError

        Returns:
            Formatted error string
        """
        errors = []
        for err in error.errors():
            field = '.'.join(str(loc) for loc in err['loc'])
            message = err['msg']
            errors.append(f"  - {field}: {message}")

        return '\n'.join(errors)

    def _validate_business_rules(self, item: Any, spider: Spider) -> bool:
        """
        Apply additional business logic validation.

        These are rules that go beyond basic schema validation.

        Args:
            item: Validated Pydantic item
            spider: Spider that scraped the item

        Returns:
            True if valid, False otherwise
        """
        try:
            # Institution validation rules
            if isinstance(item, InstitutionItem):
                return self._validate_institution(item)

            # Program validation rules
            elif isinstance(item, ProgramItem):
                return self._validate_program(item)

            # Cost validation rules
            elif isinstance(item, CostItem):
                return self._validate_cost(item)

            # Application window validation rules
            elif isinstance(item, ApplicationWindowItem):
                return self._validate_application_window(item)

            # Contact validation rules
            elif isinstance(item, ContactItem):
                return self._validate_contact(item)

            return True

        except Exception as e:
            self.logger.warning(f"Business rule validation error: {e}")
            return False

    def _validate_institution(self, item: InstitutionItem) -> bool:
        """
        Validate institution-specific business rules.

        Args:
            item: InstitutionItem to validate

        Returns:
            True if valid, False otherwise
        """
        # Founded year should be reasonable
        if item.founded_year:
            if item.founded_year < 1900 or item.founded_year > 2030:
                self.logger.warning(
                    f"Suspicious founded year: {item.founded_year} for {item.name}"
                )
                return False

        # Name should not be too short
        if len(item.name) < 5:
            self.logger.warning(f"Institution name too short: {item.name}")
            return False

        # Should have at least some contact information
        if not any([item.website, item.email, item.phone]):
            self.logger.warning(f"No contact info for: {item.name}")
            return False

        return True

    def _validate_program(self, item: ProgramItem) -> bool:
        """
        Validate program-specific business rules.

        Args:
            item: ProgramItem to validate

        Returns:
            True if valid, False otherwise
        """
        # Duration should be reasonable
        if item.duration_years:
            if item.duration_years < 0.5 or item.duration_years > 10:
                self.logger.warning(
                    f"Suspicious program duration: {item.duration_years} years"
                )
                return False

        # UTME score should be reasonable
        if item.min_utme_score:
            if item.min_utme_score < 100 or item.min_utme_score > 400:
                self.logger.warning(
                    f"Invalid UTME score: {item.min_utme_score}"
                )
                return False

        # Annual intake should be positive
        if item.annual_intake is not None and item.annual_intake < 0:
            self.logger.warning(f"Negative annual intake: {item.annual_intake}")
            return False

        return True

    def _validate_cost(self, item: CostItem) -> bool:
        """
        Validate cost-specific business rules.

        Args:
            item: CostItem to validate

        Returns:
            True if valid, False otherwise
        """
        # Amount should be reasonable if calculated
        if item.amount_kobo is not None:
            # Max fee: ₦5,000,000 (5,000,000 * 100 kobo)
            if item.amount_kobo < 0 or item.amount_kobo > 500000000000:
                self.logger.warning(
                    f"Suspicious fee amount: {item.amount_kobo} kobo "
                    f"(₦{item.amount_kobo/100:,.2f})"
                )
                return False

        return True

    def _validate_application_window(self, item: ApplicationWindowItem) -> bool:
        """
        Validate application window business rules.

        Args:
            item: ApplicationWindowItem to validate

        Returns:
            True if valid, False otherwise
        """
        # End date should be after start date
        if item.application_start_date and item.application_end_date:
            if item.application_end_date < item.application_start_date:
                self.logger.warning(
                    "Application end date before start date"
                )
                return False

        # Screening date should be after application deadline
        if item.application_end_date and item.screening_date:
            if item.screening_date < item.application_end_date:
                self.logger.warning(
                    "Screening date before application deadline"
                )
                return False

        return True

    def _validate_contact(self, item: ContactItem) -> bool:
        """
        Validate contact-specific business rules.

        Args:
            item: ContactItem to validate

        Returns:
            True if valid, False otherwise
        """
        # Should have at least email or phone
        if not item.email and not item.phone:
            self.logger.warning(
                f"Contact {item.name} has neither email nor phone"
            )
            return False

        return True

    def close_spider(self, spider: Spider):
        """
        Called when spider closes.

        Logs validation statistics.

        Args:
            spider: Spider being closed
        """
        success_rate = (
            ((self.items_validated - self.validation_errors) / self.items_validated * 100)
            if self.items_validated > 0 else 0
        )

        self.logger.info(
            f"\n{'='*70}\n"
            f"Validation Pipeline Statistics\n"
            f"Items Validated: {self.items_validated}\n"
            f"Validation Errors: {self.validation_errors}\n"
            f"Success Rate: {success_rate:.1f}%\n"
            f"{'='*70}"
        )


class DuplicateFilterPipeline:
    """
    Filter duplicate items within a single spider run.

    This prevents the same item from being processed multiple times
    in a single scraping session.
    """

    def __init__(self):
        """Initialize duplicate filter"""
        self.logger = logging.getLogger(self.__class__.__name__)
        self.seen_hashes = set()
        self.duplicates_filtered = 0

    def process_item(self, item: Dict[str, Any], spider: Spider) -> Dict[str, Any]:
        """
        Check if item has already been seen.

        Args:
            item: Scraped item
            spider: Spider that scraped the item

        Returns:
            Item if not duplicate

        Raises:
            DropItem: If item is duplicate
        """
        # Generate hash from item content
        content_hash = item.get('content_hash')

        if not content_hash:
            # If no hash, generate one from key fields
            import hashlib
            import json
            key_fields = ['name', 'source_url']
            key_data = {k: item.get(k) for k in key_fields if k in item}
            content_str = json.dumps(key_data, sort_keys=True, default=str)
            content_hash = hashlib.sha256(content_str.encode()).hexdigest()

        # Check if we've seen this hash
        if content_hash in self.seen_hashes:
            self.duplicates_filtered += 1
            self.logger.debug(
                f"Duplicate item filtered: {item.get('name', 'unknown')}"
            )
            raise DropItem(f"Duplicate item: {content_hash[:8]}...")

        # Add to seen set
        self.seen_hashes.add(content_hash)
        return item

    def close_spider(self, spider: Spider):
        """
        Log duplicate filter statistics.

        Args:
            spider: Spider being closed
        """
        self.logger.info(
            f"Duplicate Filter: {self.duplicates_filtered} duplicates filtered"
        )
