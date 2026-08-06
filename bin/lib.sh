#!/usr/bin/env bash
# favorite-spaces: shared favorites store. One "name<TAB>path" line per favorite.
# Lives under the plugin config dir (survives plugin updates/relinks).

fav_store() {
  local dir="${HERDR_PLUGIN_CONFIG_DIR:-$HOME/.config/herdr/plugins/config/favorite-spaces}"
  mkdir -p "$dir"
  local f="$dir/favorites.tsv"
  touch "$f"
  printf '%s' "$f"
}

# fav_add <name> <path> — upsert by path (re-adding a path replaces its name).
fav_add() {
  local name="$1" path="$2" f
  f="$(fav_store)"
  grep -v -F $'\t'"$path" "$f" > "$f.tmp" 2>/dev/null || true
  printf '%s\t%s\n' "$name" "$path" >> "$f.tmp"
  mv "$f.tmp" "$f"
}

# fav_remove <path> — drop the favorite for that path, if any.
fav_remove() {
  local path="$1" f
  f="$(fav_store)"
  grep -v -F $'\t'"$path" "$f" > "$f.tmp" 2>/dev/null || true
  mv "$f.tmp" "$f"
}
