#!/usr/bin/env bash
# Action `waypoint.install-keybinds`: append the default bindings
# (prefix+y pick, prefix+shift+v add) to config.toml and reload.
set -uo pipefail

herdr_bin="${HERDR_BIN_PATH:-herdr}"
config="${XDG_CONFIG_HOME:-$HOME/.config}/herdr/config.toml"

toast() { "$herdr_bin" notification show "waypoint" --body "$1" 2>/dev/null; }

added=0
if ! grep -q 'command = "waypoint.pick"' "$config" 2>/dev/null; then
  if grep -q 'key = "prefix+y"' "$config" 2>/dev/null; then
    toast "prefix+y is taken — bind waypoint.pick manually"
  else
    cat >> "$config" <<'EOF'

[[keys.command]]
key = "prefix+y"
type = "plugin_action"
command = "waypoint.pick"
description = "new workspace from waypoint"
EOF
    added=1
  fi
fi

if ! grep -q 'command = "waypoint.add"' "$config" 2>/dev/null; then
  if grep -q 'key = "prefix+shift+v"' "$config" 2>/dev/null; then
    toast "prefix+shift+v is taken — bind waypoint.add manually"
  else
    cat >> "$config" <<'EOF'

[[keys.command]]
key = "prefix+shift+v"
type = "plugin_action"
command = "waypoint.add"
description = "save folder as waypoint"
EOF
    added=1
  fi
fi

if [ "$added" = 0 ]; then
  toast "already bound — nothing to do"
  exit 0
fi

if "$herdr_bin" server reload-config >/dev/null 2>&1; then
  toast "bound: prefix+y pick, prefix+shift+v add"
else
  toast "keybinds written, but reload-config failed — run: herdr server reload-config"
  exit 1
fi
