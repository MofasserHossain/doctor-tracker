import path from "node:path";

import dotenv from "dotenv";
import { cleanEnv, host, num, port, str, testOnly } from "envalid";

const envFile = process.env.NODE_ENV === "production" ? ".env.production" : ".env.dev";

dotenv.config({ path: path.resolve(process.cwd(), envFile), quiet: true });
dotenv.config({ path: path.resolve(process.cwd(), ".env"), quiet: true });

export const env = cleanEnv(process.env, {
  NODE_ENV: str({
    devDefault: testOnly("test"),
    choices: ["development", "production", "test"],
  }),
  HOST: host({ devDefault: testOnly("localhost") }),
  PORT: port({ devDefault: testOnly(4000) }),
  CORS_ORIGIN: str({ devDefault: testOnly("http://localhost:3000") }),
  MONGODB_URI: str({ devDefault: testOnly("mongodb://127.0.0.1:27017/doctor_tracker") }),
  JWT_SECRET: str({ devDefault: testOnly("dev-only-secret-change-before-production-32chars") }),
  SEED_SECRET: str({ devDefault: testOnly("test-seed-secret") }),
  JWT_ACCESS_EXPIRATION_MINUTES: num({ devDefault: testOnly(1440) }),
  COOKIE_DOMAIN: str({ default: "" }),
  COOKIE_SAME_SITE: str({
    default: "lax",
    choices: ["lax", "strict", "none"],
  }),
  BCRYPT_SALT_ROUNDS: num({ default: 12, devDefault: 4 }),
  AUTH_RATE_LIMIT_MAX: num({ default: 30, devDefault: 500 }),
  AUTH_RATE_LIMIT_WINDOW_MS: num({ default: 900000, devDefault: 900000 }),
  API_RATE_LIMIT_MAX: num({ default: 300, devDefault: 500 }),
  API_RATE_LIMIT_WINDOW_MS: num({ default: 900000, devDefault: 900000 }),
});
