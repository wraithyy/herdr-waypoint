# herdr-waypoint

Save folders you open workspaces from a lot, give each one a name, and jump
back into any of them as a new [herdr](https://herdr.dev) workspace from a
fuzzy picker.

```
waypoint ▸ pla
┌──────────────────────────────────────────────┐
│ enter open · ctrl-x delete · esc cancel        │
│ > placeo   /Users/josef/Development/placeo    │
│   chezmoi  /Users/josef/.local/share/chezmoi   │
└──────────────────────────────────────────────┘
```

## Requirements

- [herdr](https://herdr.dev) ≥ 0.7.0
- [`fzf`](https://github.com/junegunn/fzf)
- [`jq`](https://jqlang.github.io/jq/) (optional — only used to resolve the
  originating folder when the `add` action is bound to a key)

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
  `add` key. An overlay prompts for a name, pre-filled with the folder's own
  name — edit it or just press Enter.
- **Jump**: hit your `pick` key anywhere. Fuzzy-search your saved waypoints,
  press Enter, and herdr opens that folder as a new focused workspace.
- **Delete**: highlight a waypoint in the picker and press `ctrl-x` — it's
  removed immediately and the list refreshes in place.

## How it works

herdr actions run on the server with **no TTY**, so they can't run `fzf` or
`read` directly. Both keys instead open an **overlay pane** — a temporary
popup over the active pane that *does* get a TTY:

- `waypoint.add` resolves the originating workspace's folder and opens the
  `add-pane` overlay, which prompts for a name and appends `name<TAB>path` to
  the waypoints file.
- `waypoint.pick` opens the `pick-pane` overlay, which runs `fzf` over the
  waypoints file. Enter runs
  `herdr workspace create --cwd <path> --label <name> --focus`; `ctrl-x`
  removes the highlighted line and reloads fzf's list from disk.

Waypoints are stored one per line as `name<TAB>path` in
`$(herdr plugin config-dir waypoint)/waypoints.tsv` — plain text, safe to edit
by hand.

## License

[MIT](LICENSE) © Josef Kvapil
