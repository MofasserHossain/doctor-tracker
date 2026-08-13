<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Frontend Agent Notes

Follow the root `AGENTS.md` conventions.

## Commands

```bash
npm run dev
npm run build
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run deadcode
npm run analyze
```

## Stack

- Next.js App Router
- TypeScript
- Tailwind CSS v4
- shadcn/ui
- TanStack Query
- React Hook Form + Zod
- Recharts
- Lucide icons

## Structure

- `src/app`: App Router pages, layouts, providers, loading/error boundaries.
- `src/components/ui`: shadcn/ui primitives.
- `src/components/layout`: shared app shell, navigation, headers.
- `src/components/{domain}`: domain-specific UI for doctors, patients, dashboard, and auth.
- `src/config`: environment/runtime config.
- `src/constants`: routes, API paths, option sets.
- `src/lib/api`: Axios client and API helpers.
- `src/types`: shared API and domain types.

## Frontend Rules

- Use shadcn/ui components before creating custom primitives.
- Use lucide icons in icon buttons and navigation.
- Keep route pages thin; move reusable UI into components.
- Use TanStack Query for server state and mutations.
- Use React Hook Form + Zod for forms.
- Keep API response types aligned with backend `ServiceResponse`.
- Keep search/filter/pagination state URL-friendly where practical.
- Avoid large decorative landing pages; the first screen should be the working admin experience.
