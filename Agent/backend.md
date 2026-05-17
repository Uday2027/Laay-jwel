# backend.md — Universal Backend Instructions

> Applies to Node.js (Express, Fastify, Hono), Python (FastAPI, Django), or any REST/GraphQL API backend.

---

## 1. Core Principles

- **Layered architecture.** Route → Controller → Service → Repository → Database. Each layer has one job.
- **Fail loudly in development, fail gracefully in production.**
- **Stateless by default.** No session stored in memory; use Redis/DB for shared state.
- **Security is not a feature to add later.** It is baked in from day one.

---

## 2. Folder Structure

```
src/
├── config/          # Environment config, constants, app setup
│   ├── env.ts       # Validated env vars (zod/joi schema)
│   └── db.ts        # DB client / connection
├── middleware/      # Express/Fastify middleware (auth, logging, rate limit…)
├── modules/         # Feature modules (one folder per domain)
│   └── users/
│       ├── user.router.ts       # Route definitions only
│       ├── user.controller.ts   # Request/response handling only
│       ├── user.service.ts      # Business logic only
│       ├── user.repository.ts   # DB queries only
│       ├── user.schema.ts       # Zod/Joi validation schemas
│       └── user.types.ts        # TypeScript types for this module
├── shared/          # Cross-module utilities
│   ├── errors/      # Custom error classes (AppError, NotFoundError…)
│   ├── guards/      # Auth guards / permission checkers
│   └── utils/       # Pure helpers (paginate, slugify, hashPassword…)
├── jobs/            # Background jobs / cron tasks
├── events/          # Event emitter / message queue handlers
├── app.ts           # App factory (registers middleware, routes)
└── server.ts        # Entry point (binds port, starts server)
```

---

## 3. Layered Architecture — Strict Rules

### Route (router file)
- **Only:** registers HTTP method + path + middleware + controller function.
- **Never:** business logic, DB access.

```ts
// users/user.router.ts
router.post("/users", authenticate, validateBody(createUserSchema), userController.create);
router.get("/users/:id", authenticate, userController.getById);
```

### Controller
- **Only:** extract from `req`, call service, format `res`.
- **Never:** DB queries, business logic, raw SQL.

```ts
// users/user.controller.ts
async function create(req: Request, res: Response) {
  const user = await userService.createUser(req.body);
  res.status(201).json({ data: user });
}
```

### Service
- **Only:** business logic, orchestrating repositories, sending events.
- **Never:** `req`/`res` objects, raw DB queries.

```ts
// users/user.service.ts
async function createUser(dto: CreateUserDto): Promise<User> {
  const exists = await userRepository.findByEmail(dto.email);
  if (exists) throw new ConflictError("Email already registered");

  const hashed = await hashPassword(dto.password);
  return userRepository.create({ ...dto, password: hashed });
}
```

### Repository
- **Only:** database queries. Returns plain objects or domain models.
- **Never:** business logic, HTTP concerns.

```ts
// users/user.repository.ts
async function findByEmail(email: string) {
  return db.user.findUnique({ where: { email } });
}
```

---

## 4. Request Validation

- **All** incoming data (body, query, params, headers) is validated before reaching the controller.
- Use **Zod** (Node.js) or **Pydantic** (Python) for schemas.
- Validation happens in middleware, not inside services.

```ts
// users/user.schema.ts
export const createUserSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(72),
  name: z.string().min(1).max(100),
});

export type CreateUserDto = z.infer<typeof createUserSchema>;
```

---

## 5. Error Handling

### Custom Error Classes

```ts
// shared/errors/AppError.ts
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code: string = "INTERNAL_ERROR"
  ) {
    super(message);
    this.name = "AppError";
  }
}

export class NotFoundError extends AppError {
  constructor(resource = "Resource") {
    super(`${resource} not found`, 404, "NOT_FOUND");
  }
}

export class ConflictError extends AppError {
  constructor(message: string) {
    super(message, 409, "CONFLICT");
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}
```

### Global Error Middleware

```ts
// middleware/errorHandler.ts
export function errorHandler(err, req, res, next) {
  const isDev = process.env.NODE_ENV === "development";

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message },
    });
  }

  // Unknown error
  logger.error(err);
  res.status(500).json({
    error: {
      code: "INTERNAL_ERROR",
      message: isDev ? err.message : "Something went wrong",
    },
  });
}
```

**Rules:**
- Never return stack traces in production.
- Always log unexpected errors with full context (userId, requestId, route).
- Async route handlers must be wrapped or use an async-compatible framework.

---

## 6. Authentication & Authorization

- Use **JWT** (short-lived access token + long-lived refresh token) or **session cookies** (httpOnly, sameSite=strict).
- Store refresh tokens in the DB; allow revocation.
- Hash passwords with **bcrypt** (cost ≥ 12) or **argon2**.
- Auth guard runs in middleware, never inside service logic.

```
Access Token:  15 min expiry, in Authorization header
Refresh Token: 7 day expiry, in httpOnly cookie
```

**Authorization:**
- Role checks happen in middleware (guard functions) or at the service layer.
- Use RBAC or ABAC — never scatter `if (user.role === 'admin')` throughout controllers.

---

## 7. API Response Format

All endpoints return a consistent envelope:

```jsonc
// Success
{
  "data": { /* payload */ },
  "meta": { "page": 1, "total": 42 } // optional pagination
}

// Error
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Email is invalid",
    "details": [{ "field": "email", "message": "Invalid email" }]
  }
}
```

---

## 8. Security Baseline

| Concern | Implementation |
|---|---|
| Rate limiting | `express-rate-limit` or Nginx, per-IP and per-user |
| CORS | Whitelist specific origins; never `*` in production |
| Helmet | `helmet()` middleware — sets secure HTTP headers |
| SQL Injection | ORM parameterized queries only; never raw string interpolation |
| XSS | Sanitize HTML input; validate content-type |
| File uploads | Validate MIME type + extension + size; store outside webroot |
| Secrets | Never in code or git; use env vars + secrets manager |

---

## 9. Environment Configuration

```ts
// config/env.ts — validate all env vars at startup
import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  PORT: z.coerce.number().default(3000),
  DATABASE_URL: z.string().url(),
  JWT_SECRET: z.string().min(32),
  REDIS_URL: z.string().url().optional(),
});

export const env = envSchema.parse(process.env);
// If parsing fails, the app crashes at startup — intentional.
```

---

## 10. Logging

- Use a structured logger: **Pino** (Node.js) or **structlog** (Python).
- Log format: JSON in production, pretty-print in development.
- Every request logs: method, route, statusCode, duration, userId.
- Every error logs: message, stack, requestId, userId, route.
- Never log passwords, tokens, or PII.

---

## 11. Database Rules

- All schema changes via **migrations** (Prisma Migrate / Flyway / Alembic).
- Never `ALTER TABLE` manually in production.
- Every table has: `id` (UUID or CUID), `created_at`, `updated_at`.
- Soft-delete with `deleted_at` where applicable.
- Index foreign keys and any column used in `WHERE` / `ORDER BY`.
- Long queries run in background jobs, not in request handlers.

---

## 12. What NOT to Do

- ❌ No business logic in routes or controllers
- ❌ No raw SQL strings with string interpolation
- ❌ No `console.log` — use the structured logger
- ❌ No returning passwords or secrets in API responses
- ❌ No swallowing errors with empty catch blocks
- ❌ No synchronous blocking operations in async handlers
- ❌ No hardcoded credentials anywhere in the codebase
