# Doctor Tracker Frontend

Next.js admin dashboard for managing doctors, patients, and Care Guide BD operational metrics. This folder can be deployed as its own frontend repository when the backend API is hosted separately.

## Tech Stack

- Next.js 16 App Router
- React 19
- Tailwind CSS v4
- shadcn UI primitives
- TanStack Query
- Axios
- React Hook Form
- Zod
- Recharts
- lucide-react

## Environment

Create `.env.local` from the example:

```bash
cp .env.example .env.local
```

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
```

For deployment, set `NEXT_PUBLIC_API_URL` to the deployed backend URL plus `/api/v1`.

## Local Development

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Open:

```text
http://localhost:3000
```

The backend API must be running and reachable at `NEXT_PUBLIC_API_URL`.

Seeded demo credentials from the backend:

```text
Email: admin@doctortracker.local
Password: Admin@12345
```

## Available Scripts

```bash
npm run dev
npm run build
npm run start
npm run test
npm run test:watch
npm run lint
npm run format
npm run format:check
npm run deadcode
npm run analyze
```

`npm run analyze` runs linting, formatting checks, and dead-code checks.

## App Structure

```text
src/app/              App Router pages
src/components/       Layout, dashboard, auth, and UI components
src/config/           Environment helpers
src/constants/        Route constants
src/lib/api/          Axios API clients
src/types/            Shared API and domain types
```

## Deployment

### Vercel

1. Import this frontend repository or the `frontend/` directory.
2. Set the framework preset to Next.js.
3. Set `NEXT_PUBLIC_API_URL` in project environment variables.
4. Deploy.

### Netlify

Use these build settings:

```text
Build command: npm run build
Publish directory: .next
```

Set `NEXT_PUBLIC_API_URL` before deploying.
