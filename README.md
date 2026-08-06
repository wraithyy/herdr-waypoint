# herdr-waypoint

Save folders you open workspaces from a lot, give each one a name, and jump
back into any of them as a new [herdr](https://herdr.dev) workspace from a
fuzzy picker.

```
waypoint ▸ pla
┌──────────────────────────────────────────────┐
│ enter open · ctrl-x delete · ctrl-r rename     │
│ > placeo   /Users/josef/Development/placeo    │
│   chezmoi  /Users/josef/.local/share/chezmoi   │
└──────────────────────────────────────────────┘
```

## Requirements

- [herdr](https://herdr.dev) ≥ 0.7.0
- [`fzf`](https://github.com/junegunn/fzf) (optional — falls back to a
  pure-bash picker with the same controls when it's not installed)
- [`jq`](https://jqlang.github.io/jq/) (optional — only used to resolve the
  originating folder when the `add` action is bound to a key)
- [`git`](https://git-scm.com/) (optional — the fzf preview shows `git
  status` for a repo, falling back to `ls -la` otherwise)

## Install

```bash
herdr plugin install wraithyy/herdr-waypoint
```

…or, for local development:

```bash
git clone https://github.com/wraithyy/herdr-waypoint
herdr plugin link ./herdr-waypoint
```

## Bind keys

herdr 0.7 does not bind keys declared in a plugin manifest, and there is no
plugin hook into the native "new workspace" dialog or the pane right-click
menu — so bind keys yourself in `~/.config/herdr/config.toml`:

```toml
[[keys.command]]
key = "prefix+y"
type = "plugin_action"
command = "waypoint.pick"
description = "New space from a waypoint"

[[keys.command]]
key = "prefix+shift+v"
type = "plugin_action"
command = "waypoint.add"
description = "Save current folder as a waypoint"
```

```bash
herdr server reload-config
```

## Use it

- **Save**: focus a workspace in the folder you want to remember, hit your
  `add` key. An overlay prompts for a name, defaulting to the folder's own
  name — press Enter to keep it, or type a new one.
- **Jump**: hit your `pick` key anywhere. Fuzzy-search your saved waypoints,
  press Enter, and herdr opens that folder as a new focused workspace. The
  preview pane shows `git status` for the highlighted folder (or `ls -la` if
  it's not a repo).
- **Rename**: highlight a waypoint and press `ctrl-r` (`r` in the fallback
  picker) — prompts for a new name in place, list refreshes immediately.
- **Delete**: highlight a waypoint and press `ctrl-x` (`d` in the fallback
  picker) — removed immediately, list refreshes in place.
- **Script it**: `bin/cli-add [path] [name]` adds a waypoint directly, no
  herdr or overlay involved — useful from a shell alias or another script.
  Run it from wherever the plugin is checked out (`herdr plugin list` prints
  the path as `local:<path>`):
  ```bash
  ~/herdr-waypoint/bin/cli-add . my-name
  ```

## How it works

herdr actions run on the server with **no TTY**, so they can't run `fzf` or
`read` directly. Both keys instead open an **overlay pane** — a temporary
popup over the active pane that *does* get a TTY:

- `waypoint.add` resolves the originating workspace's folder and opens the
  `add-pane` overlay, which prompts for a name and appends `name<TAB>path` to
  the waypoints file.
- `waypoint.pick` opens the `pick-pane` overlay. When `fzf` is installed it
  runs `fzf` over the waypoints file with a preview, `ctrl-x` delete, and
  `ctrl-r` rename bindings (each re-reads the file via fzf's `reload`, so the
  list updates without leaving the picker). Without `fzf`, `bin/pick-fallback`
  provides the same three actions (open/rename/delete) as a plain
  arrow-keys-and-letters menu — no dependency required. Either way, opening a
  waypoint runs `herdr workspace create --cwd <path> --label <name> --focus`.

Waypoints are stored one per line as `name<TAB>path` in
`$(herdr plugin config-dir waypoint)/waypoints.tsv` — plain text, safe to edit
by hand.

Rename and delete are implemented as `wp_add`/`wp_remove` in `bin/lib.sh`,
shared by the `add` action, the fzf bindings (`bin/wp-rename`, `bin/wp-rm`),
the fallback picker, and `bin/cli-add` — one store, one set of mutations.

## License

[MIT](LICENSE) © Josef Kvapil
