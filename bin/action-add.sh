#!/usr/bin/env bash
# Action `waypoint.add`: saves the current workspace's folder immediately —
# no prompt, no overlay. The name comes from the workspace's own label
# (herdr's "[3] chezmoi" minus the index), falling back to the folder's
# basename. Rename later from the picker (ctrl-r / r).
set -uo pipefail

ROOT="${HERDR_PLUGIN_ROOT:-$(cd "$(dirname "$0")/.." && pwd)}"
# shellcheck source=lib.sh
. "$ROOT/bin/lib.sh"

ctx="${HERDR_PLUGIN_CONTEXT_JSON:-}"
repo="" label=""
if [ -n "$ctx" ] && command -v jq >/dev/null 2>&1; then
  repo="$(printf '%s' "$ctx" | jq -r '.focused_pane_cwd // .workspace_cwd // empty' 2>/dev/null || true)"
  label="$(printf '%s' "$ctx" | jq -r '.workspace_label // empty' 2>/dev/null || true)"
fi
[ -n "$repo" ] || repo="${HERDR_WORKSPACE_CWD:-$PWD}"
[ -d "$repo" ] || { echo "waypoint: '$repo' is not a directory" >&2; exit 1; }

# strip herdr's leading "[3] " index off the workspace label
name="$(printf '%s' "$label" | sed -E 's/^\[[0-9]+\][[:space:]]*//')"
[ -n "$name" ] || name="$(basename "$repo")"

wp_add "$name" "$repo"
printf 'waypoint saved: %s -> %s\n' "$name" "$repo"
"${HERDR_BIN_PATH:-herdr}" notification show "waypoint" --body "saved: $name" --sound none 2>/dev/null || true
