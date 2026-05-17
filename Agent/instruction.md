# instruction.md — Universal Project Instructions

> The single source of truth for how this project is built, maintained, and shipped.
> Every developer and every AI assistant working on this project must follow these rules.

---

## 0. Quick Reference

```
Package manager : [bun / pnpm / npm — pick one, never mix]
Frontend        : [React + Vite / Next.js / Vue / Astro]
Backend         : [Node.js + Express / Fastify / Python + FastAPI]
Database        : [PostgreSQL via Prisma / Drizzle / SQLAlchemy]
Styling         : [Tailwind CSS + shadcn/ui]
State           : [Zustand / TanStack Query]
Testing         : [Vitest + Testing Library / Pytest]
Deployment      : [Vercel (frontend) + Railway / Fly.io (backend)]
```

> **Replace placeholders in brackets before using this file.**

---

## 1. Golden Rules (Non-Negotiable)

1. **Never break the layer contract.** Route → Controller → Service → Repository. Each layer calls only the layer below it.
2. **Validate all input at the boundary.** Every piece of external data is untrusted until validated with a schema.
3. **One source of truth.** Never duplicate business logic. If you copy code, extract it.
4. **Explicit over implicit.** Name things clearly. Avoid magic.
5. **Ship working code.** No placeholder comments like `// TODO: implement`. Either implement it or open a ticket.
6. **Read existing code before writing new code.** Understand the existing pattern before adding a new one.

---

## 2. Starting a New Feature

Follow this order every time:

```
1. Understand the requirement (re-read the ticket/spec)
2. Identify which layer(s) are affected
3. Write or update the types/interfaces first
4. Write the schema validation (Zod/Pydantic)
5. Write the repository function (DB access)
6. Write the service function (business logic)
7. Write the controller (wire up request/response)
8. Register the route
9. Write the frontend component(s)
10. Connect to API via service function + query hook
11. Handle loading, error, and empty states
12. Write tests for the service layer
13. Manual test the full flow
14. Commit
```

---

## 3. File & Code Conventions

### Package Manager
> This project uses **[bun/pnpm/npm]**. Never use another one.

```bash
# Install dependencies
bun install         # or: pnpm install / npm install

# Add a package
bun add <package>   # or: pnpm add / npm install

# Run scripts
bun run dev         # or: pnpm dev / npm run dev
```

### TypeScript
- Strict mode ON. No exceptions.
- `any` is banned except for legacy interop (add eslint-disable comment + reason).
- All functions have explicit return types.
- Prefer `interface` for object shapes, `type` for unions/intersections.

### Imports
- Absolute imports using path aliases (`@/components/...`, `@/lib/...`).
- Group imports: external packages → internal absolute → relative.
- No barrel files (`index.ts` re-exports) unless the module is a published package.

```ts
// ✅ Correct import order
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/Button";
import { userService } from "@/services/user.service";

import { formatDate } from "./utils";
```

---

## 4. Git Workflow

### Branches
```
main          → production-ready code, deploys automatically
develop       → integration branch, always deployable
feature/xxx   → new features (branch from develop)
fix/xxx       → bug fixes (branch from develop, or main if hotfix)
chore/xxx     → non-functional changes (deps, config, docs)
```

### Commit Messages (Conventional Commits)

```
feat: add user avatar upload
fix: handle null email in login form
chore: upgrade Prisma to 5.x
docs: update API auth section
refactor: extract payment logic to service
test: add unit tests for discount calculation
```

Format: `type(optional scope): short description`
- Present tense, lowercase, no period at end.
- Max 72 characters in the first line.
- Breaking changes: add `!` after type, or `BREAKING CHANGE:` in footer.

### Pull Request Rules
- Every PR targets `develop` (except hotfixes → `main`).
- PR title follows conventional commit format.
- Must include: what changed, why, how to test.
- No PR merged without at least one review (on teams).
- CI must pass before merge.
- Delete branch after merge.

---

## 5. Testing Strategy

```
Unit Tests         → Service layer functions (pure business logic)
Integration Tests  → API endpoints with real DB (test container)
Component Tests    → UI components with user interaction (Testing Library)
E2E Tests          → Critical user journeys (Playwright / Cypress)
```

### Rules
- Test behavior, not implementation. Tests should survive a refactor.
- Arrange → Act → Assert structure.
- Each test is independent (no shared mutable state between tests).
- Test the unhappy path too (validation errors, not found, unauthorized).
- Minimum coverage target: **70% on service layer**.

```ts
// ✅ Good test example
describe("userService.createUser", () => {
  it("throws ConflictError when email already exists", async () => {
    await createTestUser({ email: "a@b.com" });

    await expect(
      userService.createUser({ email: "a@b.com", password: "secret123", name: "Test" })
    ).rejects.toThrow(ConflictError);
  });
});
```

---

## 6. Environment Setup

### Required Files (never commit `.env`)
```
.env.example    ← committed, shows required keys with fake values
.env            ← local only, gitignored
.env.test       ← test environment, can be committed if no secrets
```

### Local Dev Setup
```bash
# 1. Clone repo
git clone <repo-url> && cd <project>

# 2. Install dependencies
bun install

# 3. Copy environment file
cp .env.example .env
# Edit .env with your local values

# 4. Start local services (Docker)
docker-compose up -d

# 5. Run migrations
bun run db:migrate

# 6. Seed database (optional)
bun run db:seed

# 7. Start development servers
bun run dev
```

### Available Scripts
```bash
bun run dev          # Start dev server with hot reload
bun run build        # Production build
bun run test         # Run all tests
bun run test:watch   # Tests in watch mode
bun run lint         # ESLint check
bun run lint:fix     # ESLint auto-fix
bun run typecheck    # TypeScript type check
bun run db:migrate   # Run pending migrations
bun run db:seed      # Seed database with dev data
bun run db:studio    # Open DB GUI (Prisma Studio / Drizzle Kit)
```

---

## 7. API Conventions

### URL Design
```
GET    /api/v1/users           → list users
POST   /api/v1/users           → create user
GET    /api/v1/users/:id       → get user by id
PATCH  /api/v1/users/:id       → partial update
DELETE /api/v1/users/:id       → delete user

GET    /api/v1/users/:id/posts → nested resource
POST   /api/v1/auth/login      → action-based (not CRUD)
POST   /api/v1/auth/logout
POST   /api/v1/auth/refresh
```

### HTTP Status Codes
| Situation | Code |
|---|---|
| Success (GET, PATCH) | 200 |
| Created (POST) | 201 |
| No content (DELETE) | 204 |
| Validation error | 422 |
| Unauthorized | 401 |
| Forbidden | 403 |
| Not found | 404 |
| Conflict | 409 |
| Server error | 500 |

### Pagination
```
GET /api/v1/posts?page=2&limit=20

Response:
{
  "data": [...],
  "meta": {
    "page": 2,
    "limit": 20,
    "total": 156,
    "totalPages": 8,
    "hasNext": true,
    "hasPrev": true
  }
}
```

---

## 8. Security Checklist (Before Every Deploy)

- [ ] All secrets in environment variables, not in code
- [ ] Input validation on every endpoint
- [ ] Authentication required on all protected routes
- [ ] Rate limiting enabled on auth endpoints
- [ ] CORS whitelist matches production domains
- [ ] Dependencies audited (`bun audit` / `npm audit`)
- [ ] No sensitive data in API responses (passwords, tokens, internal IDs)
- [ ] Error messages don't leak internal details in production
- [ ] File uploads: MIME type + size validated server-side
- [ ] SQL: only ORM parameterized queries (no raw string interpolation)

---

## 9. Deploy Checklist

- [ ] All tests pass locally
- [ ] `bun run typecheck` passes
- [ ] `bun run lint` passes
- [ ] Environment variables set in deployment platform
- [ ] Database migrations run (or scheduled to run on deploy)
- [ ] Feature tested on staging environment
- [ ] No `console.log` or debug code committed
- [ ] `.env` files not in git
- [ ] PR reviewed and approved
- [ ] Deployment time: avoid Friday afternoons

---

## 10. Asking an AI Assistant to Help

When asking an AI (Claude, Copilot, Cursor) to write code for this project:

1. **Always paste the relevant section of this file** into the prompt.
2. Specify which layer you're working in (route / controller / service / repository / component).
3. Mention the package manager: **[bun/pnpm/npm]**.
4. Reference existing code patterns: "Follow the pattern used in `user.service.ts`."
5. Specify the validation library: **Zod** (or Pydantic, Joi, etc.).
6. Ask for TypeScript with strict types.
7. Ask for error handling with the project's custom error classes.

**Example prompt:**
> "Using the project rules from instruction.md, write a `post.service.ts` for creating a blog post. Follow the same pattern as user.service.ts. Use Zod for validation, Prisma for DB access, and throw the appropriate AppError subclasses. The package manager is bun."

---

## 11. Troubleshooting Common Issues

### Port already in use
```bash
lsof -ti:3000 | xargs kill -9
```

### DB connection refused
```bash
docker-compose up -d   # make sure containers are running
docker-compose ps      # check status
```

### Type errors after pulling new code
```bash
bun install            # new packages may have been added
bun run db:generate    # regenerate Prisma/Drizzle types
```

### Migration conflicts
```bash
# Never manually edit migration files
# Reset dev DB if needed:
bun run db:reset       # drops + recreates + migrates + seeds
```

---

## 12. What AI Assistants Must Never Do in This Project

- ❌ Use `npm` or `yarn` — this project uses **[bun/pnpm]**
- ❌ Write business logic in controllers or routes
- ❌ Write raw SQL with string interpolation
- ❌ Use `any` type without a comment explaining why
- ❌ Skip validation schemas
- ❌ Add `console.log` statements
- ❌ Invent a new folder structure different from the established one
- ❌ Import from absolute paths without the `@/` alias
- ❌ Access `req`/`res` inside service functions
- ❌ Return different response shapes than the established envelope
