#!/usr/bin/env bash
set -euo pipefail

seed_mode="${DOCTOR_TRACKER_CONDUCTOR_SEED:-auto}"

case "$seed_mode" in
  auto | never | force) ;;
  *)
    printf '%s\n' "Invalid DOCTOR_TRACKER_CONDUCTOR_SEED value: $seed_mode" >&2
    printf '%s\n' "Expected: auto, never, or force." >&2
    exit 1
    ;;
esac

run_backend_node() {
  (
    cd backend
    node "$@"
  )
}

check_mongodb_ready() {
  run_backend_node <<'NODE'
require("dotenv").config({ path: ".env.dev", quiet: true });
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 1000 });
  await mongoose.connection.db.admin().ping();
  await mongoose.disconnect();
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
NODE
}

get_user_count() {
  run_backend_node <<'NODE'
require("dotenv").config({ path: ".env.dev", quiet: true });
const mongoose = require("mongoose");

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 1000 });
  const count = await mongoose.connection.db.collection("users").countDocuments();
  await mongoose.disconnect();
  console.log(String(count));
}

main().catch(async (error) => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
  console.error(error.message);
  process.exit(1);
});
NODE
}

printf '%s\n' "Checking MongoDB connection..."
for attempt in $(seq 1 60); do
  if check_mongodb_ready >/dev/null 2>&1; then
    break
  fi

  if [ "$attempt" -eq 60 ]; then
    printf '%s\n' "Timed out waiting for MongoDB to be ready." >&2
    exit 1
  fi

  sleep 1
done

if [ ! -f backend/src/seed.ts ]; then
  printf '%s\n' "Skipping database seed because backend/src/seed.ts does not exist yet."
  exit 0
fi

case "$seed_mode" in
  never)
    printf '%s\n' "Skipping database seed because DOCTOR_TRACKER_CONDUCTOR_SEED=never."
    ;;
  force)
    printf '%s\n' "Running database seed because DOCTOR_TRACKER_CONDUCTOR_SEED=force."
    npm --prefix backend run db:seed
    ;;
  auto)
    user_count="$(get_user_count)"
    if [ "$user_count" = "0" ]; then
      printf '%s\n' "Database has no users; running seed data..."
      npm --prefix backend run db:seed
    else
      printf '%s\n' "Database already has $user_count users; skipping seed."
    fi
    ;;
esac
