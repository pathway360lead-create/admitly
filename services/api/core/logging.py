"""
Logging Configuration
"""
import logging
import sys
from pythonjsonlogger import jsonlogger


def setup_logging():
    """Configure application logging"""

    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Create console handler
    handler = logging.StreamHandler(sys.stdout)
    handler.setLevel(logging.INFO)

    # Create JSON formatter
    formatter = jsonlogger.JsonFormatter(
        "%(asctime)s %(name)s %(levelname)s %(message)s"
    )
    handler.setFormatter(formatter)

    # Add handler to logger
    logger.addHandler(handler)

    return logger
