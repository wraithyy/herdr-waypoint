// bun test herdr-app-mod/mods/waypoint/match.test.js
import { expect, test } from "bun:test";
import { score } from "./match.js";

const wp = (name, path) => ({ name, path });

test("name prefix beats name contains beats path", () => {
  expect(score(wp("Storefront", "/Users/x/Development/acme/shop"), "st")).toBe(0);
  expect(score(wp("Storefront", "/Users/x/Development/acme/shop"), "front")).toBe(1);
  expect(score(wp("Storefront", "/Users/x/Development/acme/shop"), "stf")).toBe(2);
  expect(score(wp("Storefront", "/Users/x/Development/acme/shop"), "shop")).toBe(3);
});

test("the shared home prefix no longer matches everything", () => {
  expect(score(wp("chezmoi", "/Users/wraithy/.local/share/chezmoi"), "users")).toBe(null);
  expect(score(wp("chezmoi", "/Users/wraithy/.local/share/chezmoi"), "wraithy")).toBe(null);
});
