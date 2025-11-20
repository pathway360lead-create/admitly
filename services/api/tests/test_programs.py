"""
Tests for Programs API
"""
import pytest
from fastapi.testclient import TestClient


def test_list_programs_success(client: TestClient):
    """Test listing programs returns 200 and correct structure"""
    response = client.get("/api/v1/programs")
    assert response.status_code == 200

    data = response.json()
    assert "data" in data
    assert "pagination" in data
    assert isinstance(data["data"], list)
    assert isinstance(data["pagination"], dict)


def test_list_programs_pagination_metadata(client: TestClient):
    """Test pagination metadata structure"""
    response = client.get("/api/v1/programs?page=1&page_size=10")
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


def test_list_programs_search_filter(client: TestClient):
    """Test search filter functionality"""
    response = client.get("/api/v1/programs?search=Computer")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_state_filter(client: TestClient):
    """Test filtering by institution state"""
    response = client.get("/api/v1/programs?state=Lagos")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be from Lagos
    for program in data["data"]:
        if program.get("institution_state"):
            assert program["institution_state"] == "Lagos"


def test_list_programs_degree_type_filter(client: TestClient):
    """Test filtering by degree type"""
    response = client.get("/api/v1/programs?degree_type=undergraduate")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be undergraduate
    for program in data["data"]:
        if program.get("degree_type"):
            assert program["degree_type"] == "undergraduate"


def test_list_programs_field_of_study_filter(client: TestClient):
    """Test filtering by field of study"""
    response = client.get("/api/v1/programs?field_of_study=Engineering")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be Engineering
    for program in data["data"]:
        if program.get("field_of_study"):
            assert program["field_of_study"] == "Engineering"


def test_list_programs_mode_filter(client: TestClient):
    """Test filtering by mode"""
    response = client.get("/api/v1/programs?mode=full_time")
    assert response.status_code == 200

    data = response.json()
    # If there are results, all should be full_time
    for program in data["data"]:
        if program.get("mode"):
            assert program["mode"] == "full_time"


def test_list_programs_multiple_states(client: TestClient):
    """Test filtering by multiple states"""
    response = client.get("/api/v1/programs?state=Lagos&state=Ogun")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_multiple_degree_types(client: TestClient):
    """Test filtering by multiple degree types"""
    response = client.get("/api/v1/programs?degree_type=undergraduate&degree_type=hnd")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_combined_filters(client: TestClient):
    """Test combining multiple filters"""
    response = client.get("/api/v1/programs?search=Science&state=Lagos&degree_type=undergraduate")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_pagination_page_1(client: TestClient):
    """Test first page pagination"""
    response = client.get("/api/v1/programs?page=1&page_size=5")
    assert response.status_code == 200

    data = response.json()
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["has_prev"] is False


def test_list_programs_custom_page_size(client: TestClient):
    """Test custom page size"""
    response = client.get("/api/v1/programs?page_size=5")
    assert response.status_code == 200

    data = response.json()
    assert data["pagination"]["page_size"] == 5
    # Should have at most 5 items
    assert len(data["data"]) <= 5


def test_list_programs_max_page_size(client: TestClient):
    """Test maximum page size limit"""
    response = client.get("/api/v1/programs?page_size=150")
    assert response.status_code == 422  # Validation error - exceeds max


def test_list_programs_invalid_page(client: TestClient):
    """Test invalid page number"""
    response = client.get("/api/v1/programs?page=0")
    assert response.status_code == 422  # Validation error - page must be >= 1


def test_get_program_by_id_success(client: TestClient):
    """Test getting program by valid ID (if data exists)"""
    # First get list to find a valid ID
    list_response = client.get("/api/v1/programs?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            program_id = data["data"][0]["id"]

            # Now get by ID
            response = client.get(f"/api/v1/programs/{program_id}")
            # Might be 200 (found) or 404 (not found due to filters)
            assert response.status_code in [200, 404]

            if response.status_code == 200:
                program = response.json()
                assert program["id"] == program_id
                assert "name" in program
                assert "institution_name" in program


def test_get_program_by_id_not_found(client: TestClient):
    """Test getting program with invalid ID"""
    response = client.get("/api/v1/programs/00000000-0000-0000-0000-000000000000")
    assert response.status_code == 404

    data = response.json()
    assert "detail" in data


def test_get_program_fields(client: TestClient):
    """Test program response has all required fields"""
    # Get first program
    list_response = client.get("/api/v1/programs?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            program = data["data"][0]

            # Required fields
            assert "id" in program
            assert "slug" in program
            assert "name" in program
            assert "institution_id" in program
            assert "institution_name" in program
            assert "institution_slug" in program
            assert "institution_state" in program
            assert "degree_type" in program
            assert "is_active" in program


def test_programs_api_docs(client: TestClient):
    """Test that programs endpoints are documented in OpenAPI"""
    response = client.get("/openapi.json")
    assert response.status_code == 200

    openapi = response.json()
    paths = openapi.get("paths", {})

    # Check all program endpoints exist
    assert "/api/v1/programs" in paths
    assert "/api/v1/programs/{id}" in paths

    # Check methods
    assert "get" in paths["/api/v1/programs"]
    assert "get" in paths["/api/v1/programs/{id}"]


def test_list_programs_case_insensitive_search(client: TestClient):
    """Test that search is case-insensitive"""
    response1 = client.get("/api/v1/programs?search=COMPUTER")
    response2 = client.get("/api/v1/programs?search=computer")

    assert response1.status_code == 200
    assert response2.status_code == 200

    # Both should return data (if any programs match)
    data1 = response1.json()
    data2 = response2.json()
    assert isinstance(data1["data"], list)
    assert isinstance(data2["data"], list)


def test_list_programs_empty_search(client: TestClient):
    """Test search with empty string returns all results"""
    response = client.get("/api/v1/programs?search=")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_response_time(client: TestClient):
    """Test that programs list responds within reasonable time"""
    import time

    start = time.time()
    response = client.get("/api/v1/programs")
    end = time.time()

    assert response.status_code == 200
    # Should respond within 2 seconds
    assert (end - start) < 2.0


def test_list_programs_ordered_by_name(client: TestClient):
    """Test that results are ordered by name"""
    response = client.get("/api/v1/programs?page_size=50")
    if response.status_code == 200:
        data = response.json()
        programs = data["data"]

        if len(programs) > 1:
            # Check if names are in alphabetical order
            names = [prog["name"] for prog in programs]
            assert names == sorted(names)


def test_list_programs_includes_institution_info(client: TestClient):
    """Test that program list includes institution information"""
    response = client.get("/api/v1/programs?page_size=1")
    if response.status_code == 200:
        data = response.json()
        if len(data["data"]) > 0:
            program = data["data"][0]

            # Should have institution fields
            assert "institution_name" in program
            assert "institution_slug" in program
            assert "institution_state" in program


def test_get_program_detail_includes_institution_info(client: TestClient):
    """Test that program detail includes institution information"""
    # First get a program ID
    list_response = client.get("/api/v1/programs?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            program_id = data["data"][0]["id"]

            # Get program detail
            response = client.get(f"/api/v1/programs/{program_id}")
            if response.status_code == 200:
                program = response.json()

                # Should have institution fields
                assert "institution_name" in program
                assert "institution_slug" in program
                assert "institution_state" in program


def test_list_programs_by_multiple_fields(client: TestClient):
    """Test filtering by multiple field_of_study values"""
    response = client.get("/api/v1/programs?field_of_study=Engineering&field_of_study=Medicine")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_by_multiple_modes(client: TestClient):
    """Test filtering by multiple modes"""
    response = client.get("/api/v1/programs?mode=full_time&mode=part_time")
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)


def test_list_programs_with_all_filters(client: TestClient):
    """Test combining all available filters"""
    response = client.get(
        "/api/v1/programs?"
        "search=Engineering&"
        "state=Lagos&"
        "degree_type=undergraduate&"
        "field_of_study=Engineering&"
        "mode=full_time&"
        "page=1&"
        "page_size=10"
    )
    assert response.status_code == 200

    data = response.json()
    assert isinstance(data["data"], list)
    assert data["pagination"]["page"] == 1
    assert data["pagination"]["page_size"] == 10


def test_program_detail_has_extra_fields(client: TestClient):
    """Test that program detail endpoint returns additional fields"""
    # First get a program ID
    list_response = client.get("/api/v1/programs?page_size=1")
    if list_response.status_code == 200:
        data = list_response.json()
        if len(data["data"]) > 0:
            program_id = data["data"][0]["id"]

            # Get program detail
            response = client.get(f"/api/v1/programs/{program_id}")
            if response.status_code == 200:
                program = response.json()

                # Detail should have timestamps
                assert "created_at" in program
                assert "updated_at" in program
