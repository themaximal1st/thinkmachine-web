import LocalStorage from "./LocalStorage";

export default class Settings extends LocalStorage {
    static defaultValues = {
        interwingle: 0,
        graphType: "3d",
        controlType: "orbit",
        typerMode: "Add",
        llmModel: "gpt-4o",
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

    static get typerMode() { return Settings.get("typerMode", Settings.defaultValues.typerMode) }
    static set typerMode(val) { Settings.set("typerMode", val) }

    static get llmModel() { return Settings.get("llmModel", Settings.defaultValues.llmModel) }
    static set llmModel(val) { Settings.set("llmModel", val) }

    static get license() { return Settings.get("license", "") }
    static set license(val) { Settings.set("license", val) }

    static get colorScheme() { return Settings.get("colorScheme", "dark") }
    static set colorScheme(val) { Settings.set("colorScheme", val) }
}

window.Settings = Settings;