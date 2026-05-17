# frontend.md — Universal Frontend Instructions

> Copy this file into any web project root. Applies to React, Next.js, Vue, Svelte, Astro, or plain HTML/CSS/JS.

---

## 1. Project Philosophy

- **Clarity over cleverness.** Code is read more than written.
- **Component-first.** Every piece of UI is an isolated, reusable unit.
- **Accessibility is not optional.** Every interactive element must be keyboard and screen-reader accessible.
- **Performance is a feature.** Measure before optimizing, but never ignore it.

---

## 2. Folder Structure

```
src/
├── assets/          # Static files: images, fonts, icons, videos
├── components/      # Shared, reusable UI components
│   └── ui/          # Primitive components (Button, Input, Modal…)
├── features/        # Feature-specific components and logic (co-located)
│   └── auth/
│       ├── AuthForm.tsx
│       ├── useAuth.ts
│       └── auth.types.ts
├── hooks/           # Global custom React/Vue hooks
├── layouts/         # Page layout wrappers (AppLayout, AuthLayout…)
├── lib/             # Third-party library setup (axios instance, queryClient…)
├── pages/ (or app/) # Route-level pages / Next.js app router
├── services/        # API call functions (no business logic here)
├── store/           # Global state (Zustand / Pinia / Redux slice)
├── styles/          # Global CSS, Tailwind base, CSS variables
├── types/           # Shared TypeScript types & interfaces
└── utils/           # Pure helper functions (formatDate, cn, truncate…)
```

---

## 3. Naming Conventions

| Thing | Convention | Example |
|---|---|---|
| Component files | PascalCase | `UserCard.tsx` |
| Hook files | camelCase prefixed `use` | `useDebounce.ts` |
| Utility files | camelCase | `formatDate.ts` |
| CSS/style files | Match component name | `UserCard.module.css` |
| Type/interface | PascalCase | `UserProfile`, `ApiResponse<T>` |
| Constants | SCREAMING_SNAKE_CASE | `MAX_FILE_SIZE` |
| Event handlers | `handle` prefix | `handleSubmit`, `handleChange` |
| Boolean props | `is/has/can` prefix | `isLoading`, `hasError` |

---

## 4. Component Rules

```tsx
// ✅ Good component structure
interface UserCardProps {
  user: User;
  onSelect?: (id: string) => void;
  isLoading?: boolean;
}

export function UserCard({ user, onSelect, isLoading = false }: UserCardProps) {
  // 1. Hooks at the top
  const [expanded, setExpanded] = useState(false);

  // 2. Derived values / memos
  const fullName = `${user.firstName} ${user.lastName}`;

  // 3. Event handlers
  function handleClick() {
    onSelect?.(user.id);
  }

  // 4. Early returns (guards)
  if (isLoading) return <Skeleton />;

  // 5. Render
  return (
    <article className="user-card" onClick={handleClick}>
      <h2>{fullName}</h2>
    </article>
  );
}
```

**Rules:**
- One component per file.
- Props interface defined directly above the component, never inline.
- No logic inside JSX/template — extract to variables or handlers above the return.
- Max ~150 lines per component. If longer, split it.
- Never mutate props.

---

## 5. State Management

```
Local UI state      → useState / ref
Shared UI state     → Context API (small) or Zustand/Pinia (larger)
Server/remote state → TanStack Query (React Query) or SWR
Forms               → React Hook Form / VeeValidate
URL state           → useSearchParams / router query
```

**Rules:**
- Lift state only as high as needed — no further.
- Never store derived data in state; compute it.
- Async state (loading, error, data) lives in the data-fetching layer, not manually.

---

## 6. Data Fetching

```ts
// services/user.service.ts — pure API calls, no business logic
export async function getUser(id: string): Promise<User> {
  const res = await apiClient.get(`/users/${id}`);
  return res.data;
}

// hooks/useUser.ts — TanStack Query wrapper
export function useUser(id: string) {
  return useQuery({
    queryKey: ["user", id],
    queryFn: () => getUser(id),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}
```

**Rules:**
- All API calls go through a configured client instance (never raw fetch in components).
- Always handle loading, error, and empty states.
- Use optimistic updates for mutations that affect visible UI.

---

## 7. Styling Rules

- Use **Tailwind CSS** utility classes as default.
- Use **CSS variables** for all design tokens (colors, spacing, radii, shadows).
- Use `cn()` (clsx + tailwind-merge) for conditional classes.
- No inline `style` unless absolutely dynamic (e.g., chart dimensions).
- No magic numbers — use spacing scale.

```ts
// lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

```css
/* styles/globals.css */
:root {
  --color-primary: #2563eb;
  --color-surface: #ffffff;
  --color-text: #111827;
  --radius-md: 0.5rem;
  --shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
}
```

---

## 8. Performance Checklist

- [ ] Images use lazy loading + correct `width`/`height` attributes
- [ ] Code-split at route level (`React.lazy` / Next.js dynamic imports)
- [ ] Heavy components wrapped in `React.memo` only when profiling confirms need
- [ ] Lists with 100+ items use virtualization (TanStack Virtual)
- [ ] Fonts preloaded; no layout shift (use `font-display: swap`)
- [ ] No unused dependencies in the bundle

---

## 9. Accessibility (a11y) Baseline

- All images have meaningful `alt` text (decorative images: `alt=""`).
- Interactive elements are `<button>` or `<a>`, never `<div onClick>`.
- Forms have `<label>` associated with every input.
- Color contrast ratio: minimum 4.5:1 for normal text.
- Focus ring never removed without a visible alternative.
- Modal/dialog traps focus and restores it on close.

---

## 10. Error Boundaries

Wrap every major section with an `ErrorBoundary`. Never let a subtree crash the entire app.

```tsx
<ErrorBoundary fallback={<ErrorFallback />}>
  <UserDashboard />
</ErrorBoundary>
```

---

## 11. Environment Variables

- All public env vars prefixed: `VITE_` / `NEXT_PUBLIC_`
- Never hardcode API URLs, keys, or secrets.
- `.env.example` committed to git; `.env` always in `.gitignore`.

---

## 12. What NOT to Do

- ❌ No `any` in TypeScript unless legacy code forces it (add `// eslint-disable` + comment)
- ❌ No direct DOM manipulation (`document.getElementById`) in React/Vue components
- ❌ No CSS `!important` except in global reset
- ❌ No prop drilling past 2 levels — use context or state manager
- ❌ No `useEffect` for derived state — just compute it
- ❌ No `console.log` committed to main branch
