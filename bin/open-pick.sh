#!/usr/bin/env bash
# Action `waypoint.pick`: opens the interactive `pick-pane` overlay (needs a
# real TTY for fzf, which this server-side action doesn't have).
set -uo pipefail
herdr_bin="${HERDR_BIN_PATH:-herdr}"
exec "$herdr_bin" plugin pane open \
  --plugin waypoint \
  --entrypoint pick-pane \
  --placement overlay \
  --focus
