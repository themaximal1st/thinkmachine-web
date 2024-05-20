import LocalStorage from "./LocalStorage";

export default class Settings extends LocalStorage {
    static defaultValues = {
        interwingle: 0,
        graphType: "3d",
        controlType: "orbit",
    }

    hypergraph(value) {
        if (typeof value === "undefined") {
            return this.blob.get("hypergraph", "");
        } else {
            this.blob.set("hypergraph", value);
        }
    }

    static get interwingle() { return this.get("interwingle", Settings.defaultValues.interwingle) }
    static set interwingle(val) { this.set("interwingle", val) }

    static get graphType() { return Settings.get("graphType", Settings.defaultValues.graphType) }
    static set graphType(val) { Settings.set("graphType", val) }

    static get controlType() { return Settings.get("controlType", Settings.defaultValues.controlType) }
    static set controlType(val) { Settings.set("controlType", val) }
}
