# Doctor Tracker Backend

Standalone Express REST API for the Doctor Tracker admin application. This folder can be deployed as its own backend repository and connected to the frontend through `NEXT_PUBLIC_API_URL`.

## Tech Stack

- Node.js
- Express 5
- TypeScript
- MongoDB
- Mongoose
- JWT authentication
- bcryptjs password hashing
- Zod request validation
- pino logging
- helmet, CORS, and rate limiting

## Environment

Create `.env.dev` from the example:

```bash
cp .env.example .env.dev
```

```env
NODE_ENV=development
HOST=localhost
PORT=4000
CORS_ORIGIN=http://localhost:3000
MONGODB_URI=mongodb://doctor_tracker:doctor_tracker_password@127.0.0.1:27017/doctor_tracker?authSource=admin
JWT_SECRET=replace-with-a-long-random-secret-at-least-32-characters
JWT_ACCESS_EXPIRATION_MINUTES=1440
COOKIE_DOMAIN=
COOKIE_SAME_SITE=lax
BCRYPT_SALT_ROUNDS=12
AUTH_RATE_LIMIT_MAX=30
AUTH_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
API_RATE_LIMIT_WINDOW_MS=900000
```

For production, create `.env.production` or set equivalent hosting environment variables.

## Local MongoDB

From the monorepo root:

```bash
docker compose -f devservice/docker-compose.local.yml up -d
```

If this backend is moved into a separate repository, start MongoDB directly:

```bash
docker run --name doctor-tracker-mongodb \
  -p 27017:27017 \
  -e MONGO_INITDB_ROOT_USERNAME=doctor_tracker \
  -e MONGO_INITDB_ROOT_PASSWORD=doctor_tracker_password \
  -e MONGO_INITDB_DATABASE=doctor_tracker \
  -d mongo:8.0
```

## Local Development

Install dependencies:

```bash
npm install
```

Seed the admin user and demo records:

```bash
npm run db:seed
```

Seeded admin credentials:

```text
Email: admin@doctortracker.local
Password: Admin@12345
```

Run the API:

```bash
npm run dev
```

API base URL:

```text
http://localhost:4000/api/v1
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
npm run db:seed
```

`npm run analyze` runs linting, formatting checks, and dead-code checks.

## API Routes

Public routes:

```text
GET  /api/v1/health-check
POST /api/v1/auth/login
```

Authenticated admin routes:

```text
POST   /api/v1/auth/logout
GET    /api/v1/auth/me
GET    /api/v1/dashboard/summary
GET    /api/v1/doctors
POST   /api/v1/doctors
GET    /api/v1/doctors/:id
PATCH  /api/v1/doctors/:id
DELETE /api/v1/doctors/:id
GET    /api/v1/doctors/:id/patients
POST   /api/v1/doctors/:id/patients
DELETE /api/v1/doctors/:doctorId/patients/:patientId
GET    /api/v1/patients
POST   /api/v1/patients
GET    /api/v1/patients/:id
PATCH  /api/v1/patients/:id
DELETE /api/v1/patients/:id
```

## Query Parameters

Doctor list supports:

```text
search, specialization, hospital, from, to, cursor, limit
```

Patient list supports:

```text
search, doctorId, condition, status, from, to, cursor, limit
```

## Response Shape

Successful responses use a consistent service response wrapper:

```json
{
  "success": true,
  "message": "Request completed",
  "data": {},
  "statusCode": 200
}
```

List responses include cursor pagination metadata in `data.meta`: `limit`, `nextCursor`, and `hasNextPage`.

## Deployment

### Render

Use these settings:

```text
Build command: npm install && npm run build
Start command: npm run start
```

Set production environment variables:

```text
NODE_ENV=production
HOST=0.0.0.0
PORT=<provided by host or 4000>
CORS_ORIGIN=<deployed frontend URL>
MONGODB_URI=<MongoDB Atlas or hosted MongoDB URI>
JWT_SECRET=<long random secret>
JWT_ACCESS_EXPIRATION_MINUTES=1440
COOKIE_DOMAIN=<optional parent domain for same-site subdomains>
COOKIE_SAME_SITE=<lax for same-site subdomains, none for different root domains over HTTPS>
BCRYPT_SALT_ROUNDS=12
AUTH_RATE_LIMIT_MAX=30
AUTH_RATE_LIMIT_WINDOW_MS=900000
API_RATE_LIMIT_MAX=300
API_RATE_LIMIT_WINDOW_MS=900000
```

After deployment, run the seed script once with the production environment connected, or create an equivalent admin user manually.

## Source Structure

```text
src/api/              Feature modules for auth, dashboard, doctors, patients
src/common/db/        MongoDB connection
src/common/middleware Request validation, security, logging, error handling
src/common/models/    Shared response models
src/common/utils/     Env, query, HTTP, and error helpers
src/server.ts         Express application setup
src/index.ts          Database connection and server bootstrap
src/seed.ts           Demo seed data
```
