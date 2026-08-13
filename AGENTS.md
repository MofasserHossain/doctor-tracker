# AGENTS.md

This file gives repository-level guidance for agents working on Doctor Tracker.

## Repository Map

- `frontend/`: Next.js App Router admin UI.
- `backend/`: Express REST API with MongoDB/Mongoose.
- `devservice/`: Docker Compose files for local services.
- `.conductor/`: Conductor setup, run, and archive scripts.
- `.context/`: local collaboration notes and attachments; this directory is gitignored.

## Local Instructions

Use the closest app-level instruction file before editing code:

- Frontend work: read `frontend/AGENTS.md`.
- Backend work: read `backend/AGENTS.md`.

`CLAUDE.md` files are symlinks to the sibling `AGENTS.md` files so Claude Code and Codex read the same guidance without duplicated content.

## Root Commands

```bash
npm run lint
npm run format
npm run format:check
npm run deadcode
npm run analyze
```

## App Commands

```bash
npm --prefix frontend run dev
npm --prefix frontend run build
npm --prefix frontend run lint
npm --prefix frontend run format
npm --prefix frontend run deadcode

npm --prefix backend run dev
npm --prefix backend run build
npm --prefix backend run lint
npm --prefix backend run format
npm --prefix backend run deadcode
npm --prefix backend run db:seed
```

## Architecture

The assignment requires two deployable apps:

- Frontend: Next.js client application.
- Backend: standalone Node.js/Express server.
- Database: MongoDB.
- API style: REST endpoints under `/api/v1`.

## Quality Rules

- Use `oxlint`, `oxfmt`, and `knip` in both apps.
- Keep controllers thin and move data access/business rules into services.
- Validate API inputs with Zod.
- Keep UI pages thin and move reusable UI into components.
- Do not commit `.env` files or `.context` files.
