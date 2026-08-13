#!/usr/bin/env bash
set -euo pipefail

source ./.conductor/docker.sh
ensure_docker

npm ci --prefix frontend
npm ci --prefix backend
