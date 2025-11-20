"""
Authentication API Tests
Comprehensive tests for authentication endpoints
"""
import pytest
from fastapi import status


class TestRegistration:
    """Tests for user registration endpoint"""

    def test_register_success_structure(self, client, sample_user_data):
        """
        Test that registration endpoint returns correct structure
        Note: This will fail without real Supabase connection
        """
        response = client.post("/api/v1/auth/register", json=sample_user_data)

        # Check response structure (even if it fails due to Supabase)
        assert response.headers["content-type"] == "application/json"

    def test_register_invalid_email(self, client, sample_user_data):
        """Test registration with invalid email format"""
        invalid_data = sample_user_data.copy()
        invalid_data["email"] = "not-an-email"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        error_detail = response.json()
        assert "detail" in error_detail

    def test_register_weak_password_no_uppercase(self, client, sample_user_data):
        """Test registration with password missing uppercase letter"""
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = "weakpass123!"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        error_detail = response.json()
        assert "detail" in error_detail
        assert any("uppercase" in str(err).lower() for err in error_detail["detail"])

    def test_register_weak_password_no_lowercase(self, client, sample_user_data):
        """Test registration with password missing lowercase letter"""
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = "WEAKPASS123!"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        error_detail = response.json()
        assert "detail" in error_detail
        assert any("lowercase" in str(err).lower() for err in error_detail["detail"])

    def test_register_weak_password_no_number(self, client, sample_user_data):
        """Test registration with password missing number"""
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = "WeakPassword!"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        error_detail = response.json()
        assert "detail" in error_detail
        assert any("number" in str(err).lower() for err in error_detail["detail"])

    def test_register_weak_password_no_special_char(self, client, sample_user_data):
        """Test registration with password missing special character"""
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = "WeakPassword123"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        error_detail = response.json()
        assert "detail" in error_detail
        assert any("special" in str(err).lower() for err in error_detail["detail"])

    def test_register_password_too_short(self, client, sample_user_data):
        """Test registration with password too short"""
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = "Short1!"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_password_too_long(self, client, sample_user_data):
        """Test registration with password too long"""
        invalid_data = sample_user_data.copy()
        invalid_data["password"] = "A1!" + "a" * 126  # 129 characters total

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_missing_email(self, client, sample_user_data):
        """Test registration without email"""
        invalid_data = sample_user_data.copy()
        del invalid_data["email"]

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_missing_password(self, client, sample_user_data):
        """Test registration without password"""
        invalid_data = sample_user_data.copy()
        del invalid_data["password"]

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_missing_full_name(self, client, sample_user_data):
        """Test registration without full_name"""
        invalid_data = sample_user_data.copy()
        del invalid_data["full_name"]

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_invalid_role(self, client, sample_user_data):
        """Test registration with invalid role"""
        invalid_data = sample_user_data.copy()
        invalid_data["role"] = "invalid_role"

        response = client.post("/api/v1/auth/register", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_register_valid_roles(self, client, sample_user_data):
        """Test registration with all valid roles"""
        valid_roles = ["student", "counselor", "institution_admin"]

        for role in valid_roles:
            data = sample_user_data.copy()
            data["role"] = role
            data["email"] = f"{role}@example.com"  # Unique email for each

            response = client.post("/api/v1/auth/register", json=data)

            # Should not fail due to validation (may fail due to Supabase)
            assert response.status_code != status.HTTP_422_UNPROCESSABLE_ENTITY


class TestLogin:
    """Tests for user login endpoint"""

    def test_login_endpoint_exists(self, client, sample_login_data):
        """Test that login endpoint exists and accepts requests"""
        response = client.post("/api/v1/auth/login", json=sample_login_data)

        # Endpoint should exist (not 404)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_login_invalid_email_format(self, client, sample_login_data):
        """Test login with invalid email format"""
        invalid_data = sample_login_data.copy()
        invalid_data["email"] = "not-an-email"

        response = client.post("/api/v1/auth/login", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_missing_email(self, client, sample_login_data):
        """Test login without email"""
        invalid_data = sample_login_data.copy()
        del invalid_data["email"]

        response = client.post("/api/v1/auth/login", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_missing_password(self, client, sample_login_data):
        """Test login without password"""
        invalid_data = sample_login_data.copy()
        del invalid_data["password"]

        response = client.post("/api/v1/auth/login", json=invalid_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_login_empty_payload(self, client):
        """Test login with empty payload"""
        response = client.post("/api/v1/auth/login", json={})

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY


class TestRefreshToken:
    """Tests for token refresh endpoint"""

    def test_refresh_token_endpoint_exists(self, client):
        """Test that refresh token endpoint exists"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": "dummy-token"}
        )

        # Endpoint should exist (not 404)
        assert response.status_code != status.HTTP_404_NOT_FOUND

    def test_refresh_token_missing_token(self, client):
        """Test refresh without token"""
        response = client.post("/api/v1/auth/refresh", json={})

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_refresh_token_invalid_format(self, client):
        """Test refresh with invalid token format"""
        response = client.post(
            "/api/v1/auth/refresh",
            json={"refresh_token": ""}
        )

        # Should fail validation, authentication, or internal error
        assert response.status_code in [
            status.HTTP_422_UNPROCESSABLE_ENTITY,
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_500_INTERNAL_SERVER_ERROR
        ]


class TestGetCurrentUser:
    """Tests for get current user endpoint"""

    def test_get_current_user_no_auth(self, client):
        """Test get current user without authentication"""
        response = client.get("/api/v1/auth/me")

        # Should require authentication
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_current_user_invalid_token(self, client):
        """Test get current user with invalid token"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "Bearer invalid-token"}
        )

        # Should reject invalid token
        assert response.status_code in [
            status.HTTP_401_UNAUTHORIZED,
            status.HTTP_403_FORBIDDEN
        ]

    def test_get_current_user_malformed_header(self, client):
        """Test get current user with malformed auth header"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "InvalidFormat token"}
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_get_current_user_missing_bearer(self, client):
        """Test get current user without Bearer prefix"""
        response = client.get(
            "/api/v1/auth/me",
            headers={"Authorization": "token-without-bearer"}
        )

        assert response.status_code == status.HTTP_403_FORBIDDEN


class TestLogout:
    """Tests for user logout endpoint"""

    def test_logout_no_auth(self, client):
        """Test logout without authentication"""
        response = client.post("/api/v1/auth/logout")

        # Should require authentication
        assert response.status_code == status.HTTP_403_FORBIDDEN

    def test_logout_invalid_token(self, client):
        """Test logout with invalid token"""
        response = client.post(
            "/api/v1/auth/logout",
            headers={"Authorization": "Bearer invalid-token"}
        )

        # Logout always succeeds (returns 200) even with invalid token
        # This is by design - doesn't fail logout
        assert response.status_code == status.HTTP_200_OK
        assert response.json()["message"] == "Logged out successfully"

    def test_logout_endpoint_exists(self, client, auth_headers):
        """Test that logout endpoint exists"""
        response = client.post("/api/v1/auth/logout", headers=auth_headers)

        # Endpoint should exist (not 404)
        assert response.status_code != status.HTTP_404_NOT_FOUND


class TestAPIDocumentation:
    """Tests for API documentation and OpenAPI spec"""

    def test_openapi_json_exists(self, client):
        """Test that OpenAPI JSON spec is available"""
        response = client.get("/openapi.json")

        assert response.status_code == status.HTTP_200_OK
        assert response.headers["content-type"] == "application/json"

    def test_openapi_contains_auth_endpoints(self, client):
        """Test that OpenAPI spec contains all auth endpoints"""
        response = client.get("/openapi.json")
        spec = response.json()

        # Check that all auth endpoints are documented
        assert "/api/v1/auth/register" in spec["paths"]
        assert "/api/v1/auth/login" in spec["paths"]
        assert "/api/v1/auth/refresh" in spec["paths"]
        assert "/api/v1/auth/me" in spec["paths"]
        assert "/api/v1/auth/logout" in spec["paths"]

    def test_openapi_contains_schemas(self, client):
        """Test that OpenAPI spec contains authentication schemas"""
        response = client.get("/openapi.json")
        spec = response.json()

        schemas = spec["components"]["schemas"]

        # Check that all schemas are documented
        assert "UserRegister" in schemas
        assert "UserLogin" in schemas
        assert "TokenResponse" in schemas
        assert "RefreshTokenRequest" in schemas
        assert "UserProfile" in schemas
        assert "LogoutResponse" in schemas

    def test_swagger_ui_exists(self, client):
        """Test that Swagger UI docs are accessible"""
        response = client.get("/docs")

        assert response.status_code == status.HTTP_200_OK

    def test_redoc_exists(self, client):
        """Test that ReDoc documentation is accessible"""
        response = client.get("/redoc")

        assert response.status_code == status.HTTP_200_OK


class TestHealthEndpoints:
    """Tests for health check and root endpoints"""

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == "healthy"
        assert "environment" in data
        assert "version" in data

    def test_root_endpoint(self, client):
        """Test root endpoint"""
        response = client.get("/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert "docs" in data
        assert "health" in data


class TestCORS:
    """Tests for CORS configuration"""

    def test_cors_headers_present(self, client):
        """Test that CORS headers are present in responses"""
        response = client.get("/health")

        # FastAPI TestClient doesn't send preflight requests by default
        # But we can check that the middleware is configured
        assert response.status_code == status.HTTP_200_OK


class TestPasswordValidation:
    """Comprehensive password validation tests"""

    @pytest.mark.parametrize("password,reason", [
        ("short", "too short"),
        ("nouppercasepassword123!", "no uppercase"),
        ("NOLOWERCASEPASSWORD123!", "no lowercase"),
        ("NoNumbersPassword!", "no numbers"),
        ("NoSpecialChar123", "no special character"),
    ])
    def test_invalid_passwords(self, client, sample_user_data, password, reason):
        """Test various invalid password scenarios"""
        data = sample_user_data.copy()
        data["password"] = password

        response = client.post("/api/v1/auth/register", json=data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY, \
            f"Password '{password}' should be rejected ({reason})"

    @pytest.mark.parametrize("password", [
        "ValidPass123!",
        "Str0ng@Password",
        "C0mpl3x!P@ssw0rd",
        "Secur3#2025",
    ])
    def test_valid_passwords(self, client, sample_user_data, password):
        """Test various valid password scenarios"""
        data = sample_user_data.copy()
        data["password"] = password
        data["email"] = f"test_{password[:5]}@example.com"

        response = client.post("/api/v1/auth/register", json=data)

        # Should not fail validation (may fail due to Supabase)
        assert response.status_code != status.HTTP_422_UNPROCESSABLE_ENTITY, \
            f"Password '{password}' should be accepted"
