#!/usr/bin/env bash
set -euo pipefail

compose_file="./devservice/docker-compose.conductor.yml"
compose_project_file=".context/conductor-compose-project"

remove_labeled_containers() {
  label_filter="$1"

  docker ps -aq --filter "$label_filter" 2>/dev/null | while IFS= read -r container_id; do
    if [ -n "$container_id" ]; then
      docker rm -f "$container_id" >/dev/null || true
    fi
  done || true
}

remove_labeled_volumes() {
  label_filter="$1"

  docker volume ls -q --filter "$label_filter" 2>/dev/null | while IFS= read -r volume_name; do
    if [ -n "$volume_name" ]; then
      docker volume rm -f "$volume_name" >/dev/null || true
    fi
  done || true
}

remove_labeled_networks() {
  label_filter="$1"

  docker network ls -q --filter "$label_filter" 2>/dev/null | while IFS= read -r network_id; do
    if [ -n "$network_id" ]; then
      docker network rm "$network_id" >/dev/null 2>&1 || true
    fi
  done || true
}

if [ ! -f "$compose_project_file" ]; then
  exit 0
fi

read -r compose_project < "$compose_project_file" || compose_project=""

case "$compose_project" in
  doctor-tracker-*) ;;
  *) exit 0 ;;
esac

docker compose --project-name "$compose_project" --file "$compose_file" down --volumes --remove-orphans --timeout 10 || true
remove_labeled_containers "label=com.docker.compose.project=$compose_project"
remove_labeled_volumes "label=com.docker.compose.project=$compose_project"
remove_labeled_networks "label=com.docker.compose.project=$compose_project"
