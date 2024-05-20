// import ThinkableType from "../src/index.js";
// import Hyperedge from "../src/Hyperedge.js";

import Settings from "@lib/Settings"

import { expect, test, beforeAll } from "vitest";

beforeAll(() => {
    Settings.resetAll();
});

test("settings get set reset", () => {
    expect(Settings.get("test")).toBe(null);
    Settings.set("test", "value");
    expect(Settings.get("test")).toBe("value");
    Settings.remove("test");
    expect(Settings.get("test")).toBe(null);
});

test("settings short hand", () => {
    expect(Settings.graphType).toBe("3d");
    Settings.graphType = "2d";
    expect(Settings.graphType).toBe("2d");
    Settings.remove("graphType");
    expect(Settings.graphType).toBe("3d");
});