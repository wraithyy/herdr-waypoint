#!/usr/bin/env bash
# Action `waypoint.add`: runs on the herdr server (no TTY), so it opens
# the `add-pane` overlay (which gets a real terminal) to prompt for a name.
set -uo pipefail

herdr_bin="${HERDR_BIN_PATH:-herdr}"
ctx="${HERDR_PLUGIN_CONTEXT_JSON:-}"

repo=""
if [ -n "$ctx" ] && command -v jq >/dev/null 2>&1; then
  repo="$(printf '%s' "$ctx" | jq -r '.focused_pane_cwd // .workspace_cwd // empty' 2>/dev/null || true)"
fi
[ -n "$repo" ] || repo="${HERDR_WORKSPACE_CWD:-$PWD}"

set -- plugin pane open \
  --plugin waypoint \
  --entrypoint add-pane \
  --placement overlay \
  --focus \
  --env "WP_CWD=$repo"

[ -d "$repo" ] && set -- "$@" --cwd "$repo"

exec "$herdr_bin" "$@"
