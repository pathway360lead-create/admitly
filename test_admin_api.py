import requests
import json

# Test admin endpoint
url = "http://localhost:8000/api/v1/admin/institutions?page=1&page_size=1"
headers = {
    "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJhdXRoZW50aWNhdGVkIiwiZXhwIjoxNzM3NTk1MTQ0LCJpYXQiOjE3Mzc1OTE1NDQsImlzcyI6Imh0dHBzOi8vanZtbWV4amJub2x6dWtoZGh3ZHMuc3VwYWJhc2UuY28vYXV0aC92MSIsInN1YiI6IjUyMDE4YTUxLWI2YzItNDA0Ny1hMmUxLWUwYjkzZjJiNjllMiIsImVtYWlsIjoicGF0aHdheTM2MGxlYWRAZ21haWwuY29tIiwicGhvbmUiOiIiLCJhcHBfbWV0YWRhdGEiOnsicHJvdmlkZXIiOiJlbWFpbCIsInByb3ZpZGVycyI6WyJlbWFpbCJdfSwidXNlcl9tZXRhZGF0YSI6e30sInJvbGUiOiJhdXRoZW50aWNhdGVkIiwiYWFsIjoiYWFsMSIsImFtciI6W3sibWV0aG9kIjoib3RwIiwidGltZXN0YW1wIjoxNzM2OTg2NzQ0fV0sInNlc3Npb25faWQiOiI5YWNhOGEzMS0yNzQ1LTQ3MjEtYjAzOC04ZmRlN2NkNjgxOGMiLCJpc19hbm9ueW1vdXMiOmZhbHNlfQ.invalid"
}

print("Testing admin endpoint...")
try:
    response = requests.get(url, headers=headers)
    print(f"\nStatus Code: {response.status_code}")
    print(f"Response Time: {response.elapsed.total_seconds()}s")
    print(f"\nResponse Body:")
    print(json.dumps(response.json(), indent=2))
except Exception as e:
    print(f"Error: {e}")
    print(f"Response text: {response.text if 'response' in locals() else 'N/A'}")
