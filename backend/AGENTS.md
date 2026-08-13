# Backend Agent Notes

Follow the root `AGENTS.md` conventions.

## Commands

```bash
npm run dev
npm run build
npm run start
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run deadcode
npm run analyze
npm run db:seed
```

## Structure

- `src/index.ts`: server startup and shutdown.
- `src/server.ts`: Express app and middleware stack.
- `src/baseRouter.ts`: API route mounting.
- `src/api/{domain}`: domain modules.
- `src/common`: shared database, middleware, utility, response, and validation code.

## Domain Module Pattern

```text
src/api/{domain}/
  {domain}.controller.ts
  {domain}.service.ts
  {domain}.router.ts
  {domain}.validation.ts
  {domain}.model.ts
```

## Backend Rules

- Controllers handle request and response only.
- Services own Mongoose queries and business rules.
- Mongoose schemas define indexes for searchable and filterable fields.
- Validate body, query, and params with Zod through `validateRequest`.
- Return responses through `ServiceResponse` and `handleServiceResponse`.
- Throw `ApiError` for expected application errors.
- Mount protected routes after `authMiddleware` in `baseRouter.ts`.
