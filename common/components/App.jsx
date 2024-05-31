import React from "react";
import ThinkableType from "@lib/thinkabletype";
import { Toaster } from "react-hot-toast";
import slugify from "slugify";

import Settings from "@lib/Settings";
import * as utils from "@lib/utils";

import Client from "@lib/Client";
import ForceGraph from "./ForceGraph";
import Interwingle from "./Interwingle";
import Typer from "./Typer";
import Editor from "./Editor";
import Depth from "./Depth";
import Filters from "./Filters";

// TODO: custom camera position with activeNode..if they zoom out it should keep that zoom

// TODO: we could technically highlight links that won't be found, and attempt to generate them..could be cool

// TODO: typer
//          - add / adder context
//          - generate many
//          - chat

// TODO: need new adder interface / generate....
// TODO: start on UI — what is typer, what is overlay, what is new UI?
// TODO: load uuid / new
// TODO: settings? typer where?

// TODO: More control over prompt generation. Unlocks more creativity and use cases

export default class App extends React.Component {
    constructor() {
        super(...arguments);
        const uuid = "current-uuid0";
        this.settings = new Settings(uuid);
        window.settings = this.settings;
        this.thinkabletype = new ThinkableType({
            interwingle: Settings.interwingle,
            onUpdate: this.onDataUpdate.bind(this),
        });

        this.state = {
            isLoading: false,
            dataHash: null,
            filters: [],
            activeNodeUUID: null,
            graphData: { nodes: [], links: [] },
        };
    }

    componentDidMount() {
        this.load();
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.state.activeNodeUUID) {
            this.setActiveNodeUUID(null);
        }
    }

    get filters() {
        return this.state.filters.map((f) => {
            if (!f.node) return f;
            return { node: ThinkableType.trackUUID(f.node, this.state.graphData) };
        });
    }

    get activeNodeUUID() {
        return ThinkableType.trackUUID(this.state.activeNodeUUID, this.state.graphData);
    }

    get title() {
        if (this.thinkabletype.hyperedges.length === 0) {
            return `Think Machine — Multidimensional Mind Mapping`;
        } else {
            return `${this.thinkabletype.hyperedges[0].symbols.join(
                " "
            )} — Think Machine`;
        }
    }

    async onDataUpdate(event) {
        if (this.state.isLoading) {
            return;
        }

        if (this.thinkabletype.hash !== this.state.dataHash) {
            console.log("DATA UPDATE", event);
            await this.save();
        }
    }

    async load() {
        Client.setup();
        await this.reset();

        setTimeout(async () => {
            // await this.asyncSetState({
            //     activeNodeUUID: this.state.graphData.nodes[18].uuid,
            // });

            // await this.setFilters([{ node: this.state.graphData.nodes[18].uuid }]);
            await this.setFilters([["Nanna"]]);
            const nanna = this.thinkabletype.get(["Nanna"]).nodes[1];
            await this.asyncSetState({
                activeNodeUUID: nanna.uuid,
            });
        }, 1000);
    }

    async reset() {
        await this.asyncSetState({ isLoading: true });
        const hypergraph = await this.settings.hypergraph();
        this.thinkabletype.parse(hypergraph);
        await this.asyncSetState({ isLoading: false });

        await this.reloadData();
    }

    async reloadData() {
        const graphData = this.thinkabletype.graphData(
            this.filters,
            this.state.graphData
        );

        await this.asyncSetState({ graphData });

        document.title = this.title;
    }

    async save() {
        await this.settings.hypergraph(this.thinkabletype.export()); // save hypergraph
        await this.asyncSetState({ dataHash: this.thinkabletype.hash });
        await this.reloadData();
    }

    async setActiveNodeUUID(activeNodeUUID = null) {
        await this.asyncSetState({ activeNodeUUID });
    }

    async setFilters(filters = null) {
        await this.asyncSetState({ filters });
        await this.reloadData();
    }

    async saveFile() {
        const name = `thinkmachine ${this.title} ${new Date().toISOString()}`;
        utils.saveFile(this.thinkabletype.export(), `${slugify(name)}.csv`);
    }

    render() {
        return (
            <div className="">
                <Typer
                    thinkabletype={this.thinkabletype}
                    activeNodeUUID={this.activeNodeUUID}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    filters={this.state.filters}
                    setFilters={this.setFilters.bind(this)}
                />

                <Interwingle
                    thinkabletype={this.thinkabletype}
                    graphData={this.state.graphData}
                    reloadData={this.reloadData.bind(this)}
                />

                <Filters
                    thinkabletype={this.thinkabletype}
                    setFilters={this.setFilters.bind(this)}
                    filters={this.state.filters}
                />

                <Depth
                    thinkabletype={this.thinkabletype}
                    graphData={this.state.graphData}
                    reloadData={this.reloadData.bind(this)}
                />

                <Editor
                    thinkabletype={this.thinkabletype}
                    reset={this.reset.bind(this)}
                    reloadData={this.reloadData.bind(this)}
                    saveFile={this.saveFile.bind(this)}
                />

                <ForceGraph
                    thinkabletype={this.thinkabletype}
                    activeNodeUUID={this.activeNodeUUID}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    filters={this.state.filters}
                    setFilters={this.setFilters.bind(this)}
                    graphData={this.state.graphData}
                    reloadData={this.reloadData.bind(this)}
                    save={this.save.bind(this)}
                />

                <div className="absolute inset-0 z-[999] pointer-events-none">
                    <Toaster
                        position="bottom-center"
                        containerStyle={{ zIndex: 999 }}
                        toastOptions={{
                            style: {
                                background: "#000",
                                color: "#fff",
                            },
                        }}
                    />
                </div>
            </div>
        );
    }

    // utils

    async asyncSetState(state = {}) {
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve();
            });
        });
    }
}
