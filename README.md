# herdr-favorite-spaces

Save folders you open workspaces from a lot, give them a name, and reopen any
of them as a new [herdr](https://herdr.dev) workspace from a fuzzy picker.

```
favorite ▸ pla
┌──────────────────────────────────────────────┐
│ enter open · esc cancel                        │
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
herdr plugin install wraithyy/herdr-favorite-spaces
```

…or, for local development:

```bash
git clone https://github.com/wraithyy/herdr-favorite-spaces
herdr plugin link ./herdr-favorite-spaces
```

## Bind keys

herdr 0.7 does not bind keys declared in a plugin manifest, and there is no
plugin hook into the native "new workspace" dialog or the pane right-click
menu — so bind keys yourself in `~/.config/herdr/config.toml`:

```toml
[[keys.command]]
key = "prefix+f"
type = "plugin_action"
command = "favorite-spaces.pick"
description = "New space from favorite"

[[keys.command]]
key = "prefix+shift+f"
type = "plugin_action"
command = "favorite-spaces.add"
description = "Save current folder as favorite"
```

```bash
herdr server reload-config
```

## How it works

herdr actions run on the server with **no TTY**, so they can't run `fzf` or
`read` directly. Both keys instead open an **overlay pane** — a temporary
popup over the active pane that *does* get a TTY:

- `favorite-spaces.add` resolves the originating workspace's folder and opens
  the `add-pane` overlay, which prompts for a name pre-filled with the
  folder's own name (edit it or just press Enter) and appends `name<TAB>path`
  to the favorites file.
- `favorite-spaces.pick` opens the `pick-pane` overlay, which runs `fzf` over
  the favorites file and, on selection, runs
  `herdr workspace create --cwd <path> --label <name> --focus`.

Favorites are stored one per line as `name<TAB>path` in
`herdr plugin config-dir favorite-spaces`/`favorites.tsv` — plain text, safe
to edit by hand.

## License

[MIT](LICENSE) © Josef Kvapil
