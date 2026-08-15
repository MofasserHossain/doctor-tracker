#!/usr/bin/env bash
set -euo pipefail

conductor_run_mode="${1:-app}"
conductor_base_port="${DOCTOR_TRACKER_CONDUCTOR_PORT:-${CONDUCTOR_PORT:-3000}}"

case "$conductor_run_mode" in
  app | services) ;;
  *)
    printf '%s\n' "Unknown Conductor run mode: ${1:-}" >&2
    printf '%s\n' "Expected: app or services." >&2
    exit 1
    ;;
esac

case "$conductor_base_port" in
  '' | *[!0-9]*)
    printf '%s\n' "Resolved Conductor base port must be numeric. Set DOCTOR_TRACKER_CONDUCTOR_PORT=<port> to override it." >&2
    exit 1
    ;;
esac

workspace_slug="$(printf '%s' "${CONDUCTOR_WORKSPACE_NAME:-workspace}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9_-]/-/g; s/^[^a-z0-9]*//; s/[^a-z0-9]*$//')"
if [ -z "$workspace_slug" ]; then
  workspace_slug="workspace"
fi

compose_project="doctor-tracker-${workspace_slug}"
compose_file="./devservice/docker-compose.conductor.yml"
compose_project_file=".context/conductor-compose-project"
conductor_frontend_port_file=".context/conductor-frontend-port"
conductor_services_file=".context/conductor-services"

source ./.conductor/docker.sh

frontend_port="$conductor_base_port"
backend_port="$((conductor_base_port + 1))"
mongo_port="$((conductor_base_port + 2))"

compose_pid=""
frontend_pid=""
backend_pid=""

update_env_file() {
  local env_file="$1"
  shift

  mkdir -p "$(dirname "$env_file")"

  node - "$env_file" "$@" <<'NODE'
const fs = require('fs');

const [file, ...pairs] = process.argv.slice(2);
const updates = new Map(
  pairs.map((pair) => {
    const separatorIndex = pair.indexOf('=');
    return [pair.slice(0, separatorIndex), pair.slice(separatorIndex + 1)];
  }),
);

const lines = fs.existsSync(file) ? fs.readFileSync(file, 'utf8').split(/\r?\n/) : [];
const seen = new Set();
const output = [];

for (const line of lines) {
  const match = line.match(/^([A-Za-z_][A-Za-z0-9_]*)=/);
  if (!match || !updates.has(match[1])) {
    output.push(line);
    continue;
  }

  seen.add(match[1]);
  output.push(`${match[1]}=${updates.get(match[1])}`);
}

for (const [key, value] of updates) {
  if (!seen.has(key)) {
    output.push(`${key}=${value}`);
  }
}

while (output.length > 0 && output[output.length - 1] === '') {
  output.pop();
}

fs.writeFileSync(file, `${output.join('\n')}\n`);
NODE
}

stop_pid() {
  local pid="$1"

  if [ -n "$pid" ] && kill -0 "$pid" 2>/dev/null; then
    kill "$pid" 2>/dev/null || true
    wait "$pid" 2>/dev/null || true
  fi
}

cleanup() {
  status=$?
  trap - EXIT INT TERM HUP

  stop_pid "$frontend_pid"
  stop_pid "$backend_pid"

  docker compose --project-name "$compose_project" --file "$compose_file" down --remove-orphans || true
  exit "$status"
}

wait_for_port() {
  local service="$1"
  local host_port="$2"
  local attempt=1
  local max_attempts=60

  until node - "$host_port" <<'NODE'
const net = require('net');

const port = Number(process.argv[2]);
const socket = net.createConnection({ host: '127.0.0.1', port });
const timeout = setTimeout(() => {
  socket.destroy();
  process.exit(1);
}, 1000);

socket.once('connect', () => {
  clearTimeout(timeout);
  socket.end();
  process.exit(0);
});

socket.once('error', () => {
  clearTimeout(timeout);
  process.exit(1);
});
NODE
  do
    if [ -n "$compose_pid" ] && ! kill -0 "$compose_pid" 2>/dev/null; then
      wait "$compose_pid"
    fi

    if [ "$attempt" -ge "$max_attempts" ]; then
      printf '%s\n' "Timed out waiting for $service to accept connections on port $host_port." >&2
      exit 1
    fi

    attempt=$((attempt + 1))
    sleep 1
  done
}

write_service_summary() {
  {
    printf '%s\n' "Frontend: $public_frontend_url"
    printf '%s\n' "Backend: http://localhost:$backend_port"
    printf '%s\n' "API: http://localhost:$backend_port/api/v1"
    printf '%s\n' "MongoDB: 127.0.0.1:$mongo_port"
    printf '%s\n' "MongoDB URI: $mongodb_uri"
    printf '%s\n' "Compose project: $compose_project"
  } > "$conductor_services_file"

  printf '\n%s\n' "Conductor services ready:"
  sed 's/^/  /' "$conductor_services_file"
  printf '\n'
}

mkdir -p .context
ensure_docker

trap cleanup EXIT INT TERM HUP

if is_conductor_cloud; then
  public_frontend_url="${CONDUCTOR_PUBLIC_APP_URL:-}"
else
  public_frontend_url="http://localhost:$frontend_port"
fi

mongodb_uri="mongodb://doctor_tracker:doctor_tracker_password@127.0.0.1:${mongo_port}/doctor_tracker?authSource=admin"

export DOCTOR_TRACKER_MONGO_PORT="$mongo_port"
export CONDUCTOR_PORT="$frontend_port"
export NODE_ENV="development"
export HOST="0.0.0.0"
export PORT="$backend_port"
export CORS_ORIGIN="$public_frontend_url"
export MONGODB_URI="$mongodb_uri"
export NEXT_PUBLIC_API_URL="http://localhost:$backend_port/api/v1"
export SEED_SECRET="dev-conductor-seed-secret-change-before-production"

update_env_file backend/.env.dev \
  "NODE_ENV=development" \
  "HOST=0.0.0.0" \
  "PORT=$backend_port" \
  "CORS_ORIGIN=$public_frontend_url" \
  "MONGODB_URI=$mongodb_uri" \
  "JWT_SECRET=dev-conductor-secret-change-before-production-32chars" \
  "SEED_SECRET=dev-conductor-seed-secret-change-before-production" \
  "JWT_ACCESS_EXPIRATION_MINUTES=1440" \
  "BCRYPT_SALT_ROUNDS=12" \
  "AUTH_RATE_LIMIT_MAX=500" \
  "AUTH_RATE_LIMIT_WINDOW_MS=900000" \
  "API_RATE_LIMIT_MAX=500" \
  "API_RATE_LIMIT_WINDOW_MS=900000"

update_env_file frontend/.env.local \
  "NEXT_PUBLIC_API_URL=http://localhost:$backend_port/api/v1"

printf '%s\n' "$compose_project" > "$compose_project_file"
printf '%s\n' "$frontend_port" > "$conductor_frontend_port_file"
printf '%s\n' "Using Conductor ports: frontend=$frontend_port backend=$backend_port mongodb=$mongo_port"
printf '%s\n' "Updated env files: backend/.env.dev and frontend/.env.local"

docker compose --project-name "$compose_project" --file "$compose_file" down --remove-orphans || true
docker compose --project-name "$compose_project" --file "$compose_file" up &
compose_pid=$!

wait_for_port mongodb "$mongo_port"

write_service_summary

bash ./.conductor/bootstrap-db.sh

if [ "$conductor_run_mode" = "app" ]; then
  npm --prefix backend run dev &
  backend_pid=$!

  npm --prefix frontend run dev -- --hostname 0.0.0.0 --port "$frontend_port" &
  frontend_pid=$!
fi

wait
