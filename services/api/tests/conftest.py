"""
Test Configuration and Fixtures
Pytest configuration and shared test fixtures
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, MagicMock
import sys
from pathlib import Path

# Add parent directory to path so we can import from api
api_dir = Path(__file__).parent.parent
sys.path.insert(0, str(api_dir))

from main import app


@pytest.fixture
def client():
    """
    FastAPI test client fixture

    Provides a test client for making HTTP requests to the API
    without actually starting a server.
    """
    return TestClient(app)


@pytest.fixture
def mock_supabase():
    """
    Mock Supabase client fixture

    Provides a mocked Supabase client to avoid actual API calls
    during testing. Useful for unit tests that shouldn't depend
    on external services.
    """
    mock = MagicMock()

    # Mock auth methods
    mock.auth.sign_up = MagicMock()
    mock.auth.sign_in_with_password = MagicMock()
    mock.auth.refresh_session = MagicMock()
    mock.auth.get_user = MagicMock()
    mock.auth.sign_out = MagicMock()

    # Mock table methods
    mock.table = MagicMock()

    return mock


@pytest.fixture
def sample_user_data():
    """
    Sample user registration data fixture

    Provides valid user data for testing registration endpoints
    """
    return {
        "email": "test@example.com",
        "password": "SecurePass123!",
        "full_name": "Test User",
        "role": "student"
    }


@pytest.fixture
def sample_login_data():
    """
    Sample login credentials fixture

    Provides valid credentials for testing login endpoints
    """
    return {
        "email": "test@example.com",
        "password": "SecurePass123!"
    }


@pytest.fixture
def sample_token_response():
    """
    Sample token response fixture

    Provides a sample JWT token response as returned by Supabase
    """
    return {
        "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c",
        "token_type": "bearer",
        "expires_in": 3600
    }


@pytest.fixture
def sample_user_profile():
    """
    Sample user profile fixture

    Provides a sample user profile as stored in database
    """
    return {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "email": "test@example.com",
        "full_name": "Test User",
        "role": "student",
        "subscription_status": "free",
        "created_at": "2025-01-19T10:00:00Z",
        "updated_at": "2025-01-19T10:00:00Z",
        "avatar_url": None,
        "phone": None,
        "state": "Lagos"
    }


@pytest.fixture
def auth_headers():
    """
    Authentication headers fixture

    Provides Bearer token headers for authenticated requests
    """
    return {
        "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c"
    }


@pytest.fixture
def invalid_passwords():
    """
    Invalid password test cases fixture

    Provides various invalid passwords for validation testing
    """
    return [
        ("short", "Too short (< 8 characters)"),
        ("nouppercasepassword123!", "No uppercase letter"),
        ("NOLOWERCASEPASSWORD123!", "No lowercase letter"),
        ("NoNumbersPassword!", "No numbers"),
        ("NoSpecialChar123", "No special characters"),
        ("a" * 129, "Too long (> 128 characters)"),
    ]
