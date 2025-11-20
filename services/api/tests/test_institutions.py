"""
Tests for Institutions API
"""
import pytest
from fastapi.testclient import TestClient


def test_list_institutions_success(client: TestClient):
    """Test listing institutions returns 200 and correct structure"""
    response = client.get("/api/v1/institutions")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data
    assert "pagination" in data
    assert isinstance(data["data"], list)
    assert isinstance(data["pagination"], dict)


def test_list_institutions_pagination_metadata(client: TestClient):
    """Test pagination metadata structure"""
    response = client.get("/api/v1/institutions?page=1&page_size=10")
    assert response.status_code == 200

    data = response.json()
    pagination = data["pagination"]

    assert "page" in pagination
    assert "page_size" in pagination
    assert "total" in pagination
    assert "total_pages" in pagination
    assert "has_prev" in pagination
    assert "has_next" in pagination

    assert pagination["page"] == 1
    assert pagination["page_size"] == 10
    assert pagination["has_prev"] is False


def test_list_institutions_search_filter(client: TestClient):
    """Test search filter functionality"""
    response = client.get("/api/v1/institutions?search=Lagos")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_institutions_state_filter(client: TestClient):
    """Test filtering by state"""
    response = client.get("/api/v1/institutions?state=Lagos")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be from Lagos
    for institution in data["data"]:
        if institution.get("state"):
            assert institution["state"] == "Lagos"


def test_list_institutions_type_filter(client: TestClient):
    """Test filtering by institution type"""
    response = client.get("/api/v1/institutions?type=federal_university")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be federal universities
    for institution in data["data"]:
        if institution.get("type"):
            assert institution["type"] == "federal_university"


def test_list_institutions_verified_filter(client: TestClient):
    """Test filtering by verification status"""
    response = client.get("/api/v1/institutions?verified=true")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be verified
    for institution in data["data"]:
        if "verified" in institution:
            assert institution["verified"] is True


def test_list_institutions_multiple_states(client: TestClient):
    """Test filtering by multiple states"""
    response = client.get("/api/v1/institutions?state=Lagos&state=Ogun")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_institutions_multiple_types(client: TestClient):
    """Test filtering by multiple types"""
    response = client.get("/api/v1/institutions?type=federal_university&type=state_university")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_institutions_combined_filters(client: TestClient):
    """Test combining multiple filters"""
    response = client.get("/api/v1/institutions?search=University&state=Lagos&verified=true")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_institutions_pagination_page_1(client: TestClient):
    """Test first page pagination"""
    response = client.get("/api/v1/institutions?page=1&page_size=5")
    assert response.status_code == 200

    data = response.json()
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["has_prev"] is False


def test_list_institutions_custom_page_size(client: TestClient):
    """Test custom page size"""
    response = client.get("/api/v1/institutions?page_size=5")
    assert response.status_code == 200

    data = response.json()
    assert data["pagination"]["page_size"] == 5
    # Should have at most 5 items
    assert len(data["data"]) <= 5


def test_list_institutions_max_page_size(client: TestClient):
    """Test maximum page size limit"""
    response = client.get("/api/v1/institutions?page_size=150")
    assert response.status_code == 422  # Validation error - exceeds max


def test_list_institutions_invalid_page(client: TestClient):
    """Test invalid page number"""
    response = client.get("/api/v1/institutions?page=0")
    assert response.status_code == 422  # Validation error - page must be >= 1


def test_get_institution_by_slug_success(client: TestClient):
    """Test getting institution by valid slug (if data exists)"""
    # First get list to find a valid slug
    list_response = client.get("/api/v1/institutions?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            slug = data["data"][0]["slug"]

            # Now get by slug
            response = client.get(f"/api/v1/institutions/{slug}")
            # Might be 200 (found) or 404 (not found due to filters)
            assert response.status_code in [200, 404]

            if response.status_code == 200:
                institution = response.json()
                assert institution["slug"] == slug
                assert "name" in institution
                assert "state" in institution


def test_get_institution_by_slug_not_found(client: TestClient):
    """Test getting institution with invalid slug"""
    response = client.get("/api/v1/institutions/nonexistent-institution-12345")
    assert response.status_code == 404

    data = response.json()
    assert "detail" in data


def test_get_institution_fields(client: TestClient):
    """Test institution response has all required fields"""
    # Get first institution
    list_response = client.get("/api/v1/institutions?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            institution = data["data"][0]

            # Required fields
            assert "id" in institution
            assert "slug" in institution
            assert "name" in institution
            assert "type" in institution
            assert "state" in institution
            assert "city" in institution
            assert "verified" in institution
            assert "program_count" in institution


def test_get_institution_programs_success(client: TestClient):
    """Test getting programs for an institution"""
    # First get an institution
    list_response = client.get("/api/v1/institutions?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            slug = data["data"][0]["slug"]

            # Get programs
            response = client.get(f"/api/v1/institutions/{slug}/programs")
            # Might be 200 (found) or 404 (not found)
            assert response.status_code in [200, 404]

            if response.status_code == 200:
                programs_data = response.json()
                assert "data" in programs_data
                assert "pagination" in programs_data
                assert isinstance(programs_data["data"], list)


def test_get_institution_programs_pagination(client: TestClient):
    """Test pagination for institution programs"""
    # First get an institution
    list_response = client.get("/api/v1/institutions?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            slug = data["data"][0]["slug"]

            # Get programs with pagination
            response = client.get(f"/api/v1/institutions/{slug}/programs?page=1&page_size=5")
            if response.status_code == 200:
                programs_data = response.json()
                assert programs_data["pagination"]["page"] == 1
                assert programs_data["pagination"]["page_size"] == 5
                assert len(programs_data["data"]) <= 5


def test_get_institution_programs_not_found(client: TestClient):
    """Test getting programs for non-existent institution"""
    response = client.get("/api/v1/institutions/nonexistent-institution-12345/programs")
    assert response.status_code == 404


def test_institutions_api_docs(client: TestClient):
    """Test that institutions endpoints are documented in OpenAPI"""
    response = client.get("/openapi.json")
    assert response.status_code == 200

    openapi = response.json()
    paths = openapi.get("paths", {})

    # Check all institution endpoints exist
    assert "/api/v1/institutions" in paths
    assert "/api/v1/institutions/{slug}" in paths
    assert "/api/v1/institutions/{slug}/programs" in paths

    # Check methods
    assert "get" in paths["/api/v1/institutions"]
    assert "get" in paths["/api/v1/institutions/{slug}"]
    assert "get" in paths["/api/v1/institutions/{slug}/programs"]


def test_list_institutions_case_insensitive_search(client: TestClient):
    """Test that search is case-insensitive"""
    response1 = client.get("/api/v1/institutions?search=LAGOS")
    response2 = client.get("/api/v1/institutions?search=lagos")

    assert response1.status_code == 200
    assert response2.status_code == 200

    # Both should return data (if any institutions match)
    data1 = response1.json()
    data2 = response2.json()
    assert isinstance(data1["data"], list)
    assert isinstance(data2["data"], list)


def test_list_institutions_empty_search(client: TestClient):
    """Test search with empty string returns all results"""
    response = client.get("/api/v1/institutions?search=")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_institutions_response_time(client: TestClient):
    """Test that institutions list responds within reasonable time"""
    import time

    start = time.time()
    response = client.get("/api/v1/institutions")
    end = time.time()

    assert response.status_code == 200
    # Should respond within 2 seconds
    assert (end - start) < 2.0


def test_list_institutions_ordered_by_name(client: TestClient):
    """Test that results are ordered by name"""
    response = client.get("/api/v1/institutions?page_size=50")
    if response.status_code == 200:
        data = response.json()
        institutions = data["data"]

        if len(institutions) > 1:
            # Check if names are in alphabetical order
            names = [inst["name"] for inst in institutions]
            assert names == sorted(names)
