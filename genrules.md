# Development Rules & Best Practices

A comprehensive guide to software development principles and best practices for maintaining high-quality, scalable codebases.

## Core Principles

### SOLID Principles
1. **Single Responsibility Principle (SRP)**: Each component/function should have one reason to change
2. **Open/Closed Principle (OCP)**: Open for extension, closed for modification
3. **Liskov Substitution Principle (LSP)**: Derived classes must be substitutable for base classes
4. **Interface Segregation Principle (ISP)**: Many client-specific interfaces over one general-purpose interface
5. **Dependency Inversion Principle (DIP)**: Depend on abstractions, not concretions

## Development Workflow

### Before Starting Any Task
1. **Check Existing Codebase**
   - Search for existing components/functions before creating new ones
   - Use `grep`, `find`, or IDE search to identify similar implementations
   - Review folder structure and naming conventions

2. **Avoid Assumptions**
   - Verify requirements with 99% certainty before implementation
   - Ask clarifying questions when specifications are unclear
   - Document assumptions if unavoidable

3. **Ask Questions for Clarity**
   - What is the expected input/output?
   - Are there existing patterns to follow?
   - What are the performance requirements?
   - How will this integrate with existing systems?

### Development Synchronization
1. **Schema Sync**
   - Always check database schema before creating models
   - Ensure data types match between backend and database
   - Validate relationships and constraints

2. **Database Sync**
   - Review existing tables and relationships
   - Check for migrations before modifying schema
   - Ensure proper indexing for performance

3. **UI Sync**
   - Match component props with API responses
   - Ensure consistent styling with design system
   - Validate form inputs match backend validation

## Code Quality Standards

### Component Development
- Check for existing components first
- Follow established naming conventions
- Implement proper error handling
- Add type annotations (TypeScript, PropTypes, etc.)
- Write unit tests for new functionality

### Function Development
- Single purpose per function
- Clear, descriptive naming
- Document complex logic
- Handle edge cases
- Return consistent data types

## Testing Requirements
- Write tests before or alongside code
- Aim for >80% code coverage
- Test edge cases and error scenarios
- Integration tests for API endpoints
- E2E tests for critical user flows

## Documentation
- Document complex business logic
- API endpoint documentation
- Component prop documentation
- Update README when adding features
- Maintain changelog

## Version Control
- Meaningful commit messages
- Feature branches for new work
- PR reviews before merging
- Keep commits atomic

## Performance Considerations
- Lazy load components when possible
- Optimize database queries
- Implement caching strategies
- Monitor bundle sizes
- Profile performance bottlenecks

## Security Best Practices
- Never commit secrets or credentials
- Validate all user inputs
- Use parameterized queries to prevent SQL injection
- Implement proper authentication and authorization
- Follow OWASP guidelines
- Regular security audits and dependency updates

## Common Development Commands

Adjust these commands based on your project's package manager and tooling:

### Linting
```bash
npm run lint          # or yarn lint, pnpm lint
# Alternative: eslint . --ext .ts,.tsx,.js,.jsx
```

### Type Checking
```bash
npm run typecheck     # or tsc --noEmit
# Alternative: flow check (for Flow)
```

### Testing
```bash
npm test              # or yarn test, pnpm test
# Specific test runners:
# jest, vitest, mocha, etc.
```

### Building
```bash
npm run build         # Production build
npm run build:dev     # Development build (if available)
```

### Development Server
```bash
npm run dev           # or npm start
# Alternative: yarn dev, pnpm dev
```

## Customization Notes

When adapting these rules for your project:

1. **Replace generic commands** with your project-specific scripts
2. **Add framework-specific guidelines** (React, Vue, Angular, etc.)
3. **Include your tech stack requirements** (specific libraries, tools)
4. **Define your project's folder structure** and conventions
5. **Specify your code review process** and approval requirements
6. **Add environment-specific configurations** (staging, production)
7. **Include your team's communication protocols**

---

**Remember**: These are guidelines, not rigid rules. Adapt them to fit your team's workflow and project requirements.
