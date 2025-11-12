# @admitly/api-client

Auto-generated API client for the Admitly backend.

## Usage

```typescript
import { createClient } from '@admitly/api-client';

const api = createClient('https://api.admitly.com.ng');

// Fetch institutions
const institutions = await api.getInstitutions({ page: 1, page_size: 20 });

// Search
const results = await api.search('computer science', { state: 'Lagos' });
```

## Generating Types

Run the following command to generate TypeScript types from the OpenAPI spec:

```bash
pnpm generate
```

This requires the backend API to be running at http://localhost:8000.

## Authentication

```typescript
// Set token
api.setToken('your-jwt-token');

// Clear token
api.clearToken();
```
