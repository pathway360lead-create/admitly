"""
Search API Tests
Comprehensive tests for search functionality
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch, MagicMock
import meilisearch

from main import app


@pytest.fixture
def client():
    """Test client fixture"""
    return TestClient(app)


@pytest.fixture
def mock_meilisearch_client():
    """Mock Meilisearch client"""
    client = MagicMock()
    return client


@pytest.fixture
def override_search_service(mock_meilisearch_client):
    """Override search service dependency with mock"""
    from services.search_service import SearchService
    from core.dependencies import get_search_service

    def _get_mock_search_service():
        return SearchService(mock_meilisearch_client)

    app.dependency_overrides[get_search_service] = _get_mock_search_service
    yield
    app.dependency_overrides.clear()


# ===== Search Endpoint Tests =====

def test_search_institutions_success(client, mock_meilisearch_client, override_search_service):
    """Test successful institution search"""
    # Setup mock response
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [
            {
                "id": "inst-1",
                "slug": "unilag",
                "name": "University of Lagos",
                "short_name": "UNILAG",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos",
                "verified": True,
                "program_count": 150,
                "logo_url": None,
                "website": "https://unilag.edu.ng",
                "accreditation_status": "fully_accredited",
                "description": "Premier university",
                "status": "published",
                "created_at": "2024-01-01T00:00:00",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 5,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request
    response = client.get("/api/v1/search?q=lagos&type=institutions")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["institutions"]) == 1
    assert len(data["data"]["programs"]) == 0
    assert data["data"]["institutions"][0]["name"] == "University of Lagos"
    assert data["query"] == "lagos"
    assert "search_time_ms" in data
    assert data["pagination"]["total"] == 1


def test_search_programs_success(client, mock_meilisearch_client, override_search_service):
    """Test successful program search"""
    # Setup mock response
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [
            {
                "id": "prog-1",
                "slug": "computer-science",
                "name": "Computer Science",
                "degree_type": "undergraduate",
                "field_of_study": "Engineering",
                "specialization": None,
                "qualification": "BSc",
                "duration_years": 4.0,
                "duration_text": "4 years",
                "mode": "full_time",
                "tuition_annual": None,
                "cutoff_score": None,
                "institution_id": "inst-1",
                "institution_name": "University of Lagos",
                "institution_slug": "unilag",
                "institution_state": "Lagos",
                "description": "Computer Science program",
                "status": "published",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 8,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request
    response = client.get("/api/v1/search?q=computer&type=programs")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["institutions"]) == 0
    assert len(data["data"]["programs"]) == 1
    assert data["data"]["programs"][0]["name"] == "Computer Science"
    assert data["query"] == "computer"


def test_search_all_types(client, mock_meilisearch_client, override_search_service):
    """Test search across all types"""
    # Setup mock response
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [
            {
                "id": "inst-1",
                "slug": "unilag",
                "name": "University of Lagos",
                "short_name": "UNILAG",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos",
                "verified": True,
                "program_count": 150,
                "logo_url": None,
                "website": None,
                "accreditation_status": None,
                "description": None,
                "status": "published",
                "created_at": "2024-01-01T00:00:00",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 5,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [
            {
                "id": "prog-1",
                "slug": "computer-science",
                "name": "Computer Science",
                "degree_type": "undergraduate",
                "field_of_study": "Engineering",
                "specialization": None,
                "qualification": None,
                "duration_years": None,
                "duration_text": None,
                "mode": None,
                "tuition_annual": None,
                "cutoff_score": None,
                "institution_id": "inst-1",
                "institution_name": "University of Lagos",
                "institution_slug": "unilag",
                "institution_state": "Lagos",
                "description": None,
                "status": "published",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 8,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request
    response = client.get("/api/v1/search?q=computer&type=all")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["institutions"]) == 1
    assert len(data["data"]["programs"]) == 1
    assert data["data"]["total_results"] == 2


def test_search_with_filters(client, mock_meilisearch_client, override_search_service):
    """Test search with filters"""
    # Setup mock response
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [
            {
                "id": "prog-1",
                "slug": "computer-science",
                "name": "Computer Science",
                "degree_type": "undergraduate",
                "field_of_study": "Engineering",
                "specialization": None,
                "qualification": None,
                "duration_years": None,
                "duration_text": None,
                "mode": "full_time",
                "tuition_annual": None,
                "cutoff_score": None,
                "institution_id": "inst-1",
                "institution_name": "University of Lagos",
                "institution_slug": "unilag",
                "institution_state": "Lagos",
                "description": None,
                "status": "published",
                "is_active": True,
                "created_at": "2024-01-01T00:00:00",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 10,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request with filters
    response = client.get(
        "/api/v1/search?q=computer&type=programs&state=Lagos&degree_type=undergraduate&mode=full_time"
    )

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["programs"]) == 1

    # Verify filter was applied (check the mock was called with filter)
    call_args = programs_index.search.call_args
    assert call_args is not None
    search_params = call_args[0][1]  # Second argument to search()
    assert "filter" in search_params


def test_search_typo_tolerance(client, mock_meilisearch_client, override_search_service):
    """Test typo-tolerant search"""
    # Meilisearch handles typo tolerance internally
    # We just verify the search works with misspelled query
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [
            {
                "id": "inst-1",
                "slug": "unilag",
                "name": "University of Lagos",
                "short_name": "UNILAG",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos",
                "verified": True,
                "program_count": 150,
                "logo_url": None,
                "website": None,
                "accreditation_status": None,
                "description": None,
                "status": "published",
                "created_at": "2024-01-01T00:00:00",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 5,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request with typo (e.g., "Unilaag" instead of "Unilag")
    response = client.get("/api/v1/search?q=Unilaag")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    # Meilisearch would return UNILAG due to typo tolerance
    assert len(data["data"]["institutions"]) == 1


def test_search_pagination(client, mock_meilisearch_client, override_search_service):
    """Test search pagination"""
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [{"id": f"inst-{i}", "slug": f"inst-{i}", "name": f"Institution {i}",
                  "type": "federal_university", "state": "Lagos", "city": "Lagos",
                  "verified": False, "program_count": 0, "status": "published",
                  "created_at": "2024-01-01T00:00:00"} for i in range(10)],
        "estimatedTotalHits": 50,
        "processingTimeMs": 5,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request with pagination
    response = client.get("/api/v1/search?q=institution&page=2&page_size=10")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["pagination"]["page"] == 2
    assert data["pagination"]["page_size"] == 10
    assert data["pagination"]["total"] == 50
    assert data["pagination"]["total_pages"] == 5
    assert data["pagination"]["has_prev"] is True
    assert data["pagination"]["has_next"] is True

    # Verify offset was calculated correctly
    call_args = institutions_index.search.call_args
    search_params = call_args[0][1]
    assert search_params["offset"] == 10  # (page-1) * page_size


def test_search_empty_results(client, mock_meilisearch_client, override_search_service):
    """Test search with no results"""
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [],
        "estimatedTotalHits": 0,
        "processingTimeMs": 2,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request
    response = client.get("/api/v1/search?q=xyznonexistent")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]["institutions"]) == 0
    assert len(data["data"]["programs"]) == 0
    assert data["data"]["total_results"] == 0


def test_search_query_too_short(client):
    """Test search with query less than 2 characters"""
    response = client.get("/api/v1/search?q=a")

    # Assertions
    assert response.status_code == 422  # Validation error


def test_search_invalid_type(client):
    """Test search with invalid type parameter"""
    response = client.get("/api/v1/search?q=computer&type=invalid")

    # Assertions
    assert response.status_code == 400
    assert "Invalid type" in response.json()["detail"]


# ===== Autocomplete Endpoint Tests =====

def test_autocomplete_endpoint(client, mock_meilisearch_client, override_search_service):
    """Test autocomplete endpoint"""
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [
            {
                "id": "inst-1",
                "slug": "unilag",
                "name": "University of Lagos",
                "state": "Lagos",
                "type": "federal_university",
                "short_name": "UNILAG",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 3,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [
            {
                "id": "prog-1",
                "slug": "computer-science",
                "name": "Computer Science",
                "institution_name": "University of Lagos",
                "institution_slug": "unilag",
                "degree_type": "undergraduate",
                "field_of_study": "Engineering",
            }
        ],
        "estimatedTotalHits": 1,
        "processingTimeMs": 4,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request
    response = client.get("/api/v1/search/autocomplete?q=comp&limit=5")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert data["success"] is True
    assert len(data["data"]) <= 5
    assert data["query"] == "comp"

    # Check suggestion structure
    for suggestion in data["data"]:
        assert "type" in suggestion
        assert suggestion["type"] in ("institution", "program")
        assert "id" in suggestion
        assert "name" in suggestion
        assert "slug" in suggestion


def test_autocomplete_query_too_short(client):
    """Test autocomplete with query less than 2 characters"""
    response = client.get("/api/v1/search/autocomplete?q=c")

    # Assertions
    assert response.status_code == 422  # Validation error


def test_autocomplete_limit_enforced(client, mock_meilisearch_client, override_search_service):
    """Test autocomplete respects limit parameter"""
    institutions_index = MagicMock()
    institutions_index.search.return_value = {
        "hits": [{"id": f"inst-{i}", "slug": f"inst-{i}", "name": f"Institution {i}",
                  "state": "Lagos", "type": "federal_university", "short_name": f"INST{i}"}
                 for i in range(10)],
        "estimatedTotalHits": 10,
        "processingTimeMs": 3,
    }
    programs_index = MagicMock()
    programs_index.search.return_value = {
        "hits": [{"id": f"prog-{i}", "slug": f"prog-{i}", "name": f"Program {i}",
                  "institution_name": "Test", "institution_slug": "test",
                  "degree_type": "undergraduate", "field_of_study": "Engineering"}
                 for i in range(10)],
        "estimatedTotalHits": 10,
        "processingTimeMs": 4,
    }

    mock_meilisearch_client.index = lambda name: institutions_index if name == "institutions" else programs_index

    # Execute request with limit
    response = client.get("/api/v1/search/autocomplete?q=test&limit=5")

    # Assertions
    assert response.status_code == 200
    data = response.json()
    assert len(data["data"]) <= 5


# ===== Error Handling Tests =====

def test_search_meilisearch_error(client, mock_meilisearch_client, override_search_service):
    """Test search handles Meilisearch errors gracefully"""
    institutions_index = MagicMock()
    institutions_index.search.side_effect = Exception("Connection error")

    mock_meilisearch_client.index = lambda name: institutions_index

    # Execute request
    response = client.get("/api/v1/search?q=test&type=institutions")

    # Assertions
    assert response.status_code == 500
    assert "Failed to execute search" in response.json()["detail"]


def test_autocomplete_meilisearch_error(client, mock_meilisearch_client, override_search_service):
    """Test autocomplete handles Meilisearch errors gracefully"""
    institutions_index = MagicMock()
    institutions_index.search.side_effect = Exception("Connection error")

    mock_meilisearch_client.index = lambda name: institutions_index

    # Execute request
    response = client.get("/api/v1/search/autocomplete?q=test")

    # Assertions
    assert response.status_code == 500
    assert "Failed to execute autocomplete" in response.json()["detail"]
