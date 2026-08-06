#!/usr/bin/env bash
# waypoint: shared store. One "name<TAB>path" line per saved folder.
# Lives under the plugin config dir (survives plugin updates/relinks).

wp_store() {
  local dir="${HERDR_PLUGIN_CONFIG_DIR:-$HOME/.config/herdr/plugins/config/waypoint}"
  mkdir -p "$dir"
  local f="$dir/waypoints.tsv"
  touch "$f"
  printf '%s' "$f"
}

# wp_add <name> <path> — upsert by path (re-adding a path replaces its name).
wp_add() {
  local name="$1" path="$2" f
  f="$(wp_store)"
  grep -v -F $'\t'"$path" "$f" > "$f.tmp" 2>/dev/null || true
  printf '%s\t%s\n' "$name" "$path" >> "$f.tmp"
  mv "$f.tmp" "$f"
}

# wp_remove <path> — drop the waypoint for that path, if any.
wp_remove() {
  local path="$1" f
  f="$(wp_store)"
  grep -v -F $'\t'"$path" "$f" > "$f.tmp" 2>/dev/null || true
  mv "$f.tmp" "$f"
}
