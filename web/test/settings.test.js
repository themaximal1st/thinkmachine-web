import Settings from "@lib/Settings"

import { expect, test, beforeAll } from "vitest";

beforeAll(() => {
    Settings.resetAll();
});

test("global settings get set reset", () => {
    expect(Settings.get("test")).toBe(null);
    Settings.set("test", "value");
    expect(Settings.get("test")).toBe("value");
    Settings.remove("test");
    expect(Settings.get("test")).toBe(null);
});

test("global settings short hand", () => {
    expect(Settings.graphType).toBe("3d");
    Settings.graphType = "2d";
    expect(Settings.graphType).toBe("2d");
    Settings.remove("graphType");
    expect(Settings.graphType).toBe("3d");
});

test("local namespace", () => {
    const settings1 = new Settings("ns");
    const settings2 = new Settings();

    expect(settings1).toBeInstanceOf(Settings);
    expect(settings2).toBeInstanceOf(Settings);

    expect(settings1.ns).toBe("ns");
    expect(settings2.ns).toMatch(/^[0-9a-f-]+$/);
});

test("local settings get set reset", () => {
    const settings1 = new Settings();
    const settings2 = new Settings();

    expect(settings1).toBeInstanceOf(Settings);
    expect(settings2).toBeInstanceOf(Settings);

    expect(settings1.get("test")).toBe(null);
    expect(settings2.get("test")).toBe(null);

    settings1.set("test", "value");

    expect(settings1.get("test")).toBe("value");
    expect(settings2.get("test")).toBe(null);

    settings1.remove("test");
    expect(settings1.get("test")).toBe(null);
});

test("local settings same namespace", () => {
    const settings1 = new Settings("ns");
    const settings2 = new Settings("ns");

    expect(settings1).toBeInstanceOf(Settings);
    expect(settings2).toBeInstanceOf(Settings);

    expect(settings1.get("test")).toBe(null);
    expect(settings2.get("test")).toBe(null);

    settings1.set("test", "value");

    expect(settings1.get("test")).toBe("value");
    expect(settings2.get("test")).toBe("value");

    settings1.remove("test");
    expect(settings1.get("test")).toBe(null);
    expect(settings2.get("test")).toBe(null);
});

test("local reset", () => {
    Settings.set("test", "value");

    const settings = new Settings();
    settings.set("test", "value");

    expect(settings.get("test")).toBe("value");
    expect(Settings.get("test")).toBe("value");

    settings.resetAll();
    expect(settings.get("test")).toBe(null);
    expect(Settings.get("test")).toBe("value");

    settings.set("test", "value");
    expect(settings.get("test")).toBe("value");
    expect(Settings.get("test")).toBe("value");
    Settings.resetAll();

    expect(settings.get("test")).toBe(null);
    expect(Settings.get("test")).toBe(null);
});

test("storing number", () => {
    const settings = new Settings();
    settings.set("number", 42);
    expect(settings.get("number")).toBe(42);
});

test("storing object", () => {
    const settings = new Settings();
    expect(settings.get("graphData", {})).toEqual({});
    settings.set("graphData", { nodes: [{ id: 1, name: "Node 1" }], links: [] });
    expect(settings.get("graphData", {})).toEqual({ nodes: [{ id: 1, name: "Node 1" }], links: [] });
});

test("corrupted object", () => {
    const settings = new Settings();
    localStorage.setItem(settings.namespace("graphData"), { nodes: [{ id: 1, name: "Node 1" }], links: [] });
    expect(settings.get("graphData", {})).toEqual({});
});

test("blob storage", async () => {
    const settings = new Settings();

    let hypergraph;
    hypergraph = await settings.blob.get("hypergraph", "");
    expect(hypergraph).toEqual("");

    await settings.blob.set("hypergraph", "1,2,3");
    hypergraph = await settings.blob.get("hypergraph", "");
    expect(hypergraph).toEqual("1,2,3");

    await settings.blob.remove("hypergraph");
    hypergraph = await settings.blob.get("hypergraph", "");
    expect(hypergraph).toEqual("");
});

test("blob reset", async () => {
    const settings = new Settings();

    let hypergraph;
    hypergraph = await settings.blob.get("hypergraph", "");
    expect(hypergraph).toEqual("");

    await settings.blob.set("hypergraph", "1,2,3");
    hypergraph = await settings.blob.get("hypergraph", "");
    expect(hypergraph).toEqual("1,2,3");

    await settings.blob.resetAll();
    hypergraph = await settings.blob.get("hypergraph", "");
    expect(hypergraph).toEqual("");
});

test("hypergraph blob", async () => {
    const settings = new Settings();

    let hypergraph = await settings.hypergraph();
    expect(hypergraph).toEqual("");

    await settings.hypergraph("1,2,3");

    hypergraph = await settings.hypergraph();
    expect(hypergraph).toEqual("1,2,3");
});