#!/usr/bin/env bash
# Action `waypoint.pick`: opens the interactive `pick-pane` overlay (needs a
# real TTY for fzf, which this server-side action doesn't have).
set -uo pipefail
herdr_bin="${HERDR_BIN_PATH:-herdr}"

# waypoint.conf: placement="popup" (centered float, default; size via
# popup_width/popup_height) or "overlay" (fullscreen)
placement="popup"
popup_width="60%"
popup_height="50%"
conf="${XDG_CONFIG_HOME:-$HOME/.config}/herdr/plugins/config/waypoint/waypoint.conf"
# shellcheck disable=SC1090
[ -r "$conf" ] && . "$conf"

set -- plugin pane open \
  --plugin waypoint \
  --entrypoint pick-pane \
  --placement "$placement" \
  --focus
if [ "$placement" = "popup" ]; then
  set -- "$@" --width "$popup_width" --height "$popup_height"
fi
exec "$herdr_bin" "$@"
