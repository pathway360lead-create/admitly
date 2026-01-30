"""
Test RLS Policy Enforcement for Admin Operations
Tests that service_role key has been removed and RLS policies are working correctly
"""
import pytest
from fastapi.testclient import TestClient
from unittest.mock import Mock, patch


class TestAdminRLSEnforcement:
    """Test suite for RLS policy enforcement on admin endpoints"""
    
    def test_service_role_key_not_used_in_database_module(self):
        """Verify service_role key is never accessed in database.py"""
        from services.api.core import database
        import inspect
        
        # Check that get_supabase_admin no longer exists
        assert not hasattr(database, 'get_supabase_admin'), \
            "get_supabase_admin() should be removed"
        
        # Check that get_supabase_with_token exists
        assert hasattr(database, 'get_supabase_with_token'), \
            "get_supabase_with_token() should exist"
        
        # Check function source doesn't reference service_role
        source = inspect.getsource(database.get_supabase_with_token)
        assert "SUPABASE_SERVICE_KEY" not in source, \
            "Function should not reference SUPABASE_SERVICE_KEY"
        assert "service_role" not in source.lower(), \
            "Function should not reference service_role"
    
    def test_admin_router_uses_token_based_auth(self):
        """Verify admin router uses token-based authentication"""
        from services.api.routers import admin
        import inspect
        
        # Check that get_admin_institution_service uses credentials
        source = inspect.getsource(admin.get_admin_institution_service)
        assert "credentials" in source, \
            "Should accept credentials parameter"
        assert "get_supabase_with_token" in source, \
            "Should use get_supabase_with_token"
        
        # Check that get_admin_program_service uses credentials
        source = inspect.getsource(admin.get_admin_program_service)
        assert "credentials" in source, \
            "Should accept credentials parameter"
        assert "get_supabase_with_token" in source, \
            "Should use get_supabase_with_token"
    
    @pytest.mark.asyncio
    async def test_admin_can_create_institution_with_valid_token(self, client: TestClient, admin_token: str):
        """Verify admin with internal_admin role can create institutions"""
        response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Test University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert response.status_code == 201, \
            f"Admin should be able to create institution. Got: {response.status_code}, {response.text}"
        
        data = response.json()
        assert data["name"] == "Test University"
        assert data["status"] == "draft"  # Default status
    
    @pytest.mark.asyncio
    async def test_regular_user_cannot_create_institution(self, client: TestClient, user_token: str):
        """Verify regular user (student role) cannot create institutions"""
        response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Test University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos"
            },
            headers={"Authorization": f"Bearer {user_token}"}
        )
        
        assert response.status_code == 403, \
            f"Regular user should not be able to create institution. Got: {response.status_code}"
        
        assert "Admin access denied" in response.text or "Insufficient permissions" in response.text
    
    @pytest.mark.asyncio
    async def test_unauthenticated_user_cannot_access_admin_endpoint(self, client: TestClient):
        """Verify unauthenticated requests are rejected"""
        response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Test University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos"
            }
            # No Authorization header
        )
        
        assert response.status_code == 401, \
            f"Unauthenticated request should be rejected. Got: {response.status_code}"
    
    @pytest.mark.asyncio
    async def test_admin_can_see_draft_institutions(self, client: TestClient, admin_token: str):
        """Verify admin can see draft/archived institutions"""
        # First create a draft institution
        create_response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Draft University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos",
                "status": "draft"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert create_response.status_code == 201
        
        # List institutions with draft filter
        list_response = client.get(
            "/api/v1/admin/institutions?status_filter=draft",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert list_response.status_code == 200
        data = list_response.json()
        
        # Should include draft institutions
        assert any(inst["status"] == "draft" for inst in data["data"]), \
            "Admin should be able to see draft institutions"
    
    @pytest.mark.asyncio
    async def test_public_endpoint_only_shows_published(self, client: TestClient):
        """Verify public endpoint only shows published institutions"""
        response = client.get("/api/v1/institutions")
        
        assert response.status_code == 200
        data = response.json()
        
        # Should NOT include draft institutions
        assert all(inst["status"] == "published" for inst in data["data"]), \
            "Public endpoint should only show published institutions"
    
    @pytest.mark.asyncio
    async def test_admin_can_update_any_institution(self, client: TestClient, admin_token: str):
        """Verify admin can update any institution"""
        # Create institution
        create_response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Update Test University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        institution_id = create_response.json()["id"]
        
        # Update institution
        update_response = client.put(
            f"/api/v1/admin/institutions/{institution_id}",
            json={"description": "Updated description"},
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert update_response.status_code == 200
        assert update_response.json()["description"] == "Updated description"
    
    @pytest.mark.asyncio
    async def test_admin_can_delete_institution(self, client: TestClient, admin_token: str):
        """Verify admin can soft delete institutions"""
        # Create institution
        create_response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Delete Test University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        institution_id = create_response.json()["id"]
        
        # Delete institution
        delete_response = client.delete(
            f"/api/v1/admin/institutions/{institution_id}",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert delete_response.status_code == 200
    
    @pytest.mark.asyncio
    async def test_admin_can_manage_programs(self, client: TestClient, admin_token: str):
        """Verify admin can create, update, and delete programs"""
        # First create an institution
        inst_response = client.post(
            "/api/v1/admin/institutions",
            json={
                "name": "Program Test University",
                "type": "federal_university",
                "state": "Lagos",
                "city": "Lagos"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        institution_id = inst_response.json()["id"]
        
        # Create program
        program_response = client.post(
            "/api/v1/admin/programs",
            json={
                "institution_id": institution_id,
                "name": "Computer Science",
                "degree_type": "undergraduate"
            },
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        
        assert program_response.status_code == 201
        assert program_response.json()["name"] == "Computer Science"


# Fixtures for testing
@pytest.fixture
def client():
    """Create test client"""
    from services.api.main import app
    return TestClient(app)


@pytest.fixture
def admin_token():
    """
    Mock admin JWT token
    
    In real tests, you would:
    1. Create a test admin user in database
    2. Login to get real JWT token
    3. Return the token
    
    For now, this is a placeholder that assumes test setup creates admin user
    """
    # TODO: Implement real admin token generation
    # This would involve:
    # - Creating test user with role='internal_admin'
    # - Calling login endpoint
    # - Returning access_token
    return "mock_admin_token_replace_with_real_implementation"


@pytest.fixture
def user_token():
    """
    Mock regular user JWT token
    
    In real tests, you would:
    1. Create a test regular user in database
    2. Login to get real JWT token
    3. Return the token
    """
    # TODO: Implement real user token generation
    return "mock_user_token_replace_with_real_implementation"


# Instructions for running tests:
"""
To run these tests:

1. Set up test database:
   - Create a test Supabase project or use local Supabase
   - Apply all migrations including 20251225_enhance_admin_rls_policies.sql
   - Create test users:
     - Admin user with role='internal_admin'
     - Regular user with role='student'

2. Configure test environment:
   - Create .env.test file with test database credentials
   - Set SUPABASE_URL and SUPABASE_KEY for test environment

3. Run tests:
   cd services/api
   pytest tests/test_admin_rls_enforcement.py -v

4. Run with coverage:
   pytest tests/test_admin_rls_enforcement.py -v --cov=services --cov=routers --cov=core

Expected results:
- All tests should pass
- No service_role key should be detected in code
- Admin operations should work with proper token
- Regular users should be blocked from admin operations
"""
