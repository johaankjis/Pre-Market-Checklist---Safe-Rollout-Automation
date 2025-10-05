# Contributing Guide

Thank you for your interest in contributing to the Pre-Market Checklist & Safe Rollout Automation platform! This guide will help you get started.

## Table of Contents

1. [Code of Conduct](#code-of-conduct)
2. [Getting Started](#getting-started)
3. [Development Workflow](#development-workflow)
4. [Coding Standards](#coding-standards)
5. [Testing Guidelines](#testing-guidelines)
6. [Pull Request Process](#pull-request-process)
7. [Documentation](#documentation)

---

## Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inclusive environment for all contributors.

### Expected Behavior

- Be respectful and considerate
- Use inclusive language
- Accept constructive criticism gracefully
- Focus on what's best for the project
- Show empathy towards other contributors

### Unacceptable Behavior

- Harassment or discriminatory language
- Personal attacks or insults
- Trolling or inflammatory comments
- Publishing private information without permission
- Any conduct that could be considered inappropriate in a professional setting

---

## Getting Started

### Prerequisites

1. **Install Node.js**: Version 18.x or higher
2. **Install Git**: Latest version
3. **Install a code editor**: VS Code recommended
4. **Install npm or pnpm**: Package manager

### Fork and Clone

1. Fork the repository on GitHub
2. Clone your fork:
```bash
git clone https://github.com/YOUR_USERNAME/Pre-Market-Checklist---Safe-Rollout-Automation.git
cd Pre-Market-Checklist---Safe-Rollout-Automation
```

3. Add upstream remote:
```bash
git remote add upstream https://github.com/johaankjis/Pre-Market-Checklist---Safe-Rollout-Automation.git
```

### Install Dependencies

```bash
npm install --legacy-peer-deps
# or
pnpm install
```

### Run Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to see the app.

---

## Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch (if exists)
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `refactor/*` - Code refactoring

### Creating a Branch

```bash
# Update your fork
git checkout main
git pull upstream main

# Create feature branch
git checkout -b feature/your-feature-name
```

### Making Changes

1. Make your changes in the feature branch
2. Test your changes locally
3. Commit your changes with clear messages
4. Push to your fork
5. Open a pull request

### Commit Messages

Follow conventional commit format:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**
```bash
git commit -m "feat(checklist): add CPU usage monitoring"
git commit -m "fix(canary): resolve stage progression issue"
git commit -m "docs(api): update endpoint documentation"
```

### Keeping Your Fork Updated

```bash
git checkout main
git pull upstream main
git push origin main
```

Rebase your feature branch:
```bash
git checkout feature/your-feature
git rebase main
```

---

## Coding Standards

### TypeScript

All new code should be written in TypeScript.

**Type Safety:**
```typescript
// ✅ Good - Explicit types
interface User {
  id: string
  name: string
  email: string
}

function getUser(id: string): User {
  // Implementation
}

// ❌ Bad - Using 'any'
function getUser(id: any): any {
  // Implementation
}
```

**Naming Conventions:**
```typescript
// Components: PascalCase
export function ChecklistItem() { }

// Functions: camelCase
function validateConfig() { }

// Constants: UPPER_SNAKE_CASE
const MAX_RETRIES = 3

// Interfaces: PascalCase with 'I' prefix (optional)
interface ChecklistItem { }

// Types: PascalCase
type Status = "pending" | "running" | "completed"
```

### React Components

**Functional Components:**
```typescript
// ✅ Good - Named export with typed props
interface ButtonProps {
  label: string
  onClick: () => void
  disabled?: boolean
}

export function Button({ label, onClick, disabled = false }: ButtonProps) {
  return (
    <button onClick={onClick} disabled={disabled}>
      {label}
    </button>
  )
}
```

**Client vs Server Components:**
```typescript
// Client component - uses hooks or browser APIs
"use client"

import { useState } from "react"

export function InteractiveComponent() {
  const [count, setCount] = useState(0)
  // ...
}

// Server component - no "use client" needed
export function StaticComponent({ data }) {
  return <div>{data}</div>
}
```

### File Organization

```
app/
├── (group)/           # Route groups
├── api/              # API routes
├── page.tsx          # Page component
└── layout.tsx        # Layout component

components/
├── ui/               # Base UI components
└── feature.tsx       # Feature components

lib/
├── types/            # Type definitions
├── utils.ts          # Utility functions
└── module/           # Business logic
```

### Import Order

```typescript
// 1. External dependencies
import { useState } from "react"
import { Card } from "@/components/ui/card"

// 2. Internal modules
import { validateConfig } from "@/lib/validation"
import type { Config } from "@/lib/types/config"

// 3. Relative imports
import { helper } from "./utils"
```

### CSS and Styling

Use Tailwind CSS utility classes:

```tsx
// ✅ Good
<div className="flex items-center gap-4 p-4 rounded-lg bg-card">
  Content
</div>

// ❌ Bad - Inline styles
<div style={{ display: "flex", padding: "16px" }}>
  Content
</div>
```

**Conditional Classes:**
```tsx
import { cn } from "@/lib/utils"

<div className={cn(
  "base-class",
  isActive && "active-class",
  variant === "primary" && "primary-variant"
)} />
```

---

## Testing Guidelines

### Current State

The project currently has no test infrastructure. When adding tests:

### Unit Tests

```typescript
// lib/__tests__/validator.test.ts
import { describe, it, expect } from '@jest/globals'
import { ConfigValidator } from '../validation/config-validator'

describe('ConfigValidator', () => {
  it('should validate correct configuration', () => {
    const validator = new ConfigValidator()
    const result = validator.validate(validConfig)
    expect(result.valid).toBe(true)
  })

  it('should reject invalid configuration', () => {
    const validator = new ConfigValidator()
    const result = validator.validate(invalidConfig)
    expect(result.valid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(0)
  })
})
```

### Component Tests

```typescript
// components/__tests__/checklist-item.test.tsx
import { render, screen } from '@testing-library/react'
import { ChecklistItemCard } from '../checklist-item'

describe('ChecklistItemCard', () => {
  it('renders passed status correctly', () => {
    const item = {
      id: 'test',
      name: 'Test Check',
      category: 'config',
      status: 'passed'
    }
    
    render(<ChecklistItemCard item={item} />)
    expect(screen.getByText('Test Check')).toBeInTheDocument()
  })
})
```

### API Tests

```typescript
// app/api/__tests__/checklist.test.ts
import { POST } from '../checklist/route'

describe('Checklist API', () => {
  it('should run checklist successfully', async () => {
    const request = new Request('http://localhost:3000/api/checklist', {
      method: 'POST',
      body: JSON.stringify({ environment: 'production' })
    })
    
    const response = await POST(request)
    const data = await response.json()
    
    expect(response.status).toBe(200)
    expect(data).toHaveProperty('id')
    expect(data).toHaveProperty('items')
  })
})
```

### Running Tests

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run in watch mode
npm run test:watch
```

---

## Pull Request Process

### Before Submitting

1. **Test your changes**: Run the app locally and verify functionality
2. **Run linter**: `npm run lint` (fix any errors)
3. **Build successfully**: `npm run build`
4. **Update documentation**: If you added features or changed APIs
5. **Add tests**: For new features or bug fixes (when test infrastructure exists)

### PR Checklist

- [ ] Code follows the project's coding standards
- [ ] Tests pass (or test plan described if no tests)
- [ ] Documentation updated
- [ ] Commit messages follow conventional format
- [ ] No console.log statements (except intentional logging)
- [ ] TypeScript types are properly defined
- [ ] No eslint warnings or errors
- [ ] Build completes successfully

### Creating a Pull Request

1. Push your branch to your fork
2. Go to the original repository
3. Click "New Pull Request"
4. Select your fork and branch
5. Fill out the PR template

### PR Template

```markdown
## Description
Brief description of the changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
Describe how you tested your changes

## Screenshots (if applicable)
Add screenshots for UI changes

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
```

### Review Process

1. **Automated Checks**: CI/CD runs linting and builds
2. **Code Review**: Maintainers review your code
3. **Feedback**: Address any requested changes
4. **Approval**: Once approved, PR will be merged
5. **Cleanup**: Delete your branch after merge

### Addressing Feedback

```bash
# Make changes based on feedback
git add .
git commit -m "fix: address review feedback"
git push origin feature/your-feature
```

---

## Documentation

### Code Comments

Write clear, concise comments:

```typescript
// ✅ Good - Explains why, not what
// Use exponential backoff to prevent overwhelming the API
await delay(retries * 1000)

// ❌ Bad - States the obvious
// Increment i by 1
i++
```

### JSDoc Comments

For complex functions:

```typescript
/**
 * Validates a trading strategy configuration
 * 
 * @param config - The strategy configuration to validate
 * @returns Validation result with errors and warnings
 * 
 * @example
 * const result = validator.validate(config)
 * if (!result.valid) {
 *   console.error(result.errors)
 * }
 */
export function validateConfig(config: StrategyConfig): ValidationResult {
  // Implementation
}
```

### README Updates

Update README.md for:
- New features
- Changed behavior
- New dependencies
- Configuration changes

### API Documentation

Update `docs/API.md` for:
- New endpoints
- Changed request/response formats
- New parameters
- Deprecations

---

## Development Tools

### Recommended VS Code Extensions

- ESLint
- Prettier
- TypeScript Vue Plugin (Volar)
- Tailwind CSS IntelliSense
- GitLens
- Error Lens

### VS Code Settings

```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Debug Configuration

Create `.vscode/launch.json`:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Next.js: debug server-side",
      "type": "node-terminal",
      "request": "launch",
      "command": "npm run dev"
    }
  ]
}
```

---

## Common Tasks

### Adding a New Page

1. Create `app/new-page/page.tsx`
2. Add route in navigation
3. Update documentation

### Adding a New API Endpoint

1. Create `app/api/new-endpoint/route.ts`
2. Define types in `lib/types/`
3. Implement business logic in `lib/`
4. Update API documentation

### Adding a New Component

1. Create component in `components/`
2. Add TypeScript types
3. Export component
4. Document usage

### Adding Dependencies

```bash
# Add to dependencies
npm install package-name --legacy-peer-deps

# Add to devDependencies
npm install --save-dev package-name --legacy-peer-deps
```

**Before adding dependencies:**
- Check if similar functionality exists
- Verify package is well-maintained
- Consider bundle size impact
- Check for security vulnerabilities

---

## Getting Help

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Features**: Open a GitHub Issue with feature request template
- **Security**: Email security@example.com (do not open public issue)

---

## Recognition

Contributors are recognized in:
- GitHub Contributors page
- Release notes
- Project documentation

Thank you for contributing! 🎉

---

For more information:
- [Architecture Documentation](./ARCHITECTURE.md)
- [API Reference](./API.md)
- [Component Library](./COMPONENTS.md)
- [Deployment Guide](./DEPLOYMENT.md)
