// Waypoint for herdr-app: saved folders, fuzzy-picked, opened as a new space.
// Same TSV store format as the TUI plugin ("name<TAB>path" per line).
// Enter open · ctrl+s save the focused terminal's folder · ctrl+r rename · ctrl+x delete · Esc close.

import { View, div } from "gpui-kit";
import { v_flex, h_flex, InputState, Input } from "gpui-base";
import { appHome, exec, readTextFile, writeTextFile, run, theme, props, closeOverlay, focused, spaces, notify } from "herdr";
import { score } from "./match.js";

const STORE = `${appHome()}/data/waypoint/waypoints.tsv`;
const VISIBLE = 12;

function parse(text) {
  return (text ?? "")
    .split("\n")
    .map((l) => l.split("\t"))
    .filter((f) => f.length >= 2 && f[1])
    .map(([name, path]) => ({ name, path }));
}

export default class Waypoint extends View {
  init(_props, cx) {
    this.items = [];
    this.raw = null;
    this.filter = "";
    this.at = 0;
    this.renaming = null; // the waypoint being renamed; the input then edits its name
    // Captured before the popup takes focus: the folder "save" refers to.
    const f = focused();
    this.here = f?.cwd ?? null;
    this.spaceName = spaces().find((s) => s.id === f?.space)?.name ?? null;
    this.input = InputState.new({ placeholder: "Open a waypoint as a new space…" });
    this.input.on("change", (_e, cx) => {
      if (this.renaming) return;
      this.filter = this.input.value().toLowerCase();
      this.at = 0;
      cx.notify();
    });
    this.input.on("submit", (_e, cx) => (this.renaming ? this.finishRename(cx) : this.open(this.rows()[this.at])));
    this.input.focus();
    cx.timer.after(600, () => this.input.focus());
    this.handle = cx.focus_handle();
    cx.spawn(async (cx) => {
      await this.load();
      cx.notify();
    });
  }

  async load() {
    this.raw = await readTextFile(STORE);
    this.items = parse(this.raw);
  }

  async save(items, cx) {
    await exec("mkdir", ["-p", STORE.replace(/\/[^/]*$/, "")]);
    const text = items.map((w) => `${w.name}\t${w.path}\n`).join("");
    await writeTextFile(STORE, text, this.raw);
    await this.load();
    cx.notify();
  }

  rows() {
    if (!this.filter) return this.items;
    return this.items
      .map((w, i) => ({ w, i, s: score(w, this.filter) }))
      .filter((x) => x.s !== null)
      .sort((a, b) => a.s - b.s || a.i - b.i)
      .map((x) => x.w);
  }

  close() {
    closeOverlay(props().overlay);
  }

  open(w) {
    if (!w) return;
    this.close();
    run("space.new", { name: w.name, folder: w.path });
  }

  // Upsert by path, as the TUI's wp_add: re-saving a folder replaces its name.
  add(cx) {
    if (!this.here) return notify({ title: "waypoint", body: "no folder for the focused pane", level: "warning" });
    const name = this.spaceName || this.here.split("/").pop();
    const items = this.items.filter((w) => w.path !== this.here).concat({ name, path: this.here });
    cx.spawn(async (cx) => {
      await this.save(items, cx);
      notify({ title: "waypoint", body: `saved: ${name}`, level: "success", timeout: 3000 });
    });
  }

  startRename(w) {
    if (!w) return;
    this.renaming = w;
    this.input.set_value(w.name);
  }

  cancelRename() {
    this.renaming = null;
    this.input.set_value(this.filter);
  }

  finishRename(cx) {
    const w = this.renaming;
    const name = this.input.value().replace(/\t/g, " ").trim();
    this.renaming = null;
    this.input.set_value(this.filter);
    if (!w || !name || name === w.name) return cx.notify();
    const items = this.items.map((x) => (x.path === w.path ? { ...x, name } : x));
    cx.spawn(async (cx) => this.save(items, cx));
  }

  remove(w, cx) {
    if (!w) return;
    cx.spawn(async (cx) => this.save(this.items.filter((x) => x.path !== w.path), cx));
  }

  render() {
    const t = theme();
    const rows = this.rows();
    this.at = Math.max(0, Math.min(this.at, rows.length - 1));
    const start = Math.max(0, this.at - VISIBLE + 1);
    const shown = rows.slice(start, start + VISIBLE);

    const row = (w, i) =>
      h_flex()
        .id(`wp-${start + i}`)
        .mx(4)
        .px(10)
        .h(32)
        .rounded(7)
        .gap(10)
        .items_center()
        .cursor_pointer()
        .when(start + i === this.at, (el) => el.bg(t.hover))
        .hover((s) => s.bg(t.hover))
        .on_click(() => this.open(w))
        .child(div().w(160).flex_none().truncate().text_color(t.foreground).child(w.name))
        .child(div().flex_1().truncate().text_size(11.5).text_color(t.dim).child(w.path.replace(/^\/Users\/[^/]+/, "~")));

    const empty = div().px(14).py(10).text_color(t.dim).child(this.items.length ? "No match" : "No waypoints yet: ctrl+s saves the focused folder");

    return v_flex()
      .id("waypoint")
      .track_focus(this.handle)
      .w_full()
      .min_h(0)
      .p(18)
      .gap(10)
      .bg(t.popover)
      .text_size(13)
      .on_key_down((e, cx) => {
        const k = e.key;
        const ctrl = e.modifiers.control;
        if (k === "escape") return this.renaming ? (this.cancelRename(), cx.notify()) : this.close();
        if (k === "down" || (ctrl && k === "n")) this.at = Math.min(this.at + 1, rows.length - 1);
        else if (k === "up" || (ctrl && k === "p")) this.at = Math.max(this.at - 1, 0);
        else if (ctrl && k === "s") this.add(cx);
        else if (ctrl && k === "x") this.remove(rows[this.at], cx);
        else if (ctrl && k === "r") this.startRename(rows[this.at]);
        else return;
        cx.stop_propagation();
        cx.notify();
      })
      .child(
        h_flex()
          .items_center()
          .child(div().flex_1().text_size(15).font_semibold().text_color(t.foreground)
            .child(this.renaming ? `Rename ${this.renaming.name}` : "Waypoints"))
          .child(div().text_size(11).text_color(t.dim).child(this.renaming
            ? "enter save name · esc cancel"
            : "enter open · ctrl+s save here · ctrl+r rename · ctrl+x delete · esc")),
      )
      .child(
        h_flex().h(36).flex_none().px(10).items_center().rounded(9).border_1().border_color(t.accent).bg(t.background)
          .child(Input.new(this.input).flex_1().h_full().text_size(12.8).text_color(t.foreground)),
      )
      .child(v_flex().min_h(0).mb(6).children(shown.length ? shown.map(row) : [empty]));
  }
}
