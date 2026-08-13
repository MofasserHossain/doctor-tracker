#!/usr/bin/env bash

is_conductor_cloud() {
  [ "${CONDUCTOR_IS_LOCAL:-1}" = "0" ]
}

install_docker_compose_plugin() {
  if docker compose version >/dev/null 2>&1; then
    return 0
  fi

  if is_conductor_cloud; then
    sudo dnf install -y docker-compose-plugin >/dev/null 2>&1 || true
  fi

  if docker compose version >/dev/null 2>&1; then
    return 0
  fi

  if ! is_conductor_cloud; then
    printf '%s\n' "Docker Compose is not installed or is not on PATH." >&2
    return 1
  fi

  case "$(uname -m)" in
    x86_64 | amd64)
      compose_arch="x86_64"
      ;;
    aarch64 | arm64)
      compose_arch="aarch64"
      ;;
    *)
      printf '%s\n' "Unsupported architecture for Docker Compose: $(uname -m)" >&2
      return 1
      ;;
  esac

  if ! command -v curl >/dev/null 2>&1; then
    sudo dnf install -y curl
  fi

  mkdir -p "$HOME/.docker/cli-plugins"
  curl -fsSL \
    "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-${compose_arch}" \
    -o "$HOME/.docker/cli-plugins/docker-compose"
  chmod +x "$HOME/.docker/cli-plugins/docker-compose"
}

ensure_docker() {
  if ! command -v docker >/dev/null 2>&1; then
    if ! is_conductor_cloud; then
      printf '%s\n' "Docker is not installed or is not on PATH." >&2
      return 1
    fi

    sudo dnf install -y docker
  fi

  install_docker_compose_plugin

  if docker info >/dev/null 2>&1; then
    return 0
  fi

  if ! is_conductor_cloud; then
    printf '%s\n' "Docker is not running." >&2
    return 1
  fi

  mkdir -p .context
  export DOCKER_HOST="${DOCKER_HOST:-unix:///tmp/conductor-docker.sock}"

  if ! pgrep -f "dockerd.*conductor-docker.sock" >/dev/null 2>&1; then
    sudo dockerd --host="$DOCKER_HOST" --group="$(id -gn)" > .context/dockerd.log 2>&1 &
    printf '%s\n' "$!" > .context/dockerd.pid
  fi

  attempt=1
  max_attempts=60
  until docker info >/dev/null 2>&1; do
    if [ "$attempt" -ge "$max_attempts" ]; then
      printf '%s\n' "Timed out waiting for Docker to start. See .context/dockerd.log." >&2
      return 1
    fi

    attempt=$((attempt + 1))
    sleep 1
  done
}
