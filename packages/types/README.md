# @admitly/types

Shared TypeScript types for the Admitly platform. These types are used across all frontend applications (web, mobile, admin).

## Usage

```typescript
import type { Institution, Program, UserProfile } from '@admitly/types';

const institution: Institution = {
  // ...
};
```

## Contents

- `models.ts` - Data models matching database schema
- `api.ts` - API request/response types
- `enums.ts` - Enums and constants

## Guidelines

- Keep types in sync with backend Pydantic schemas
- Use `interface` for object types
- Use `type` for unions and primitives
- Export all types from `index.ts`
