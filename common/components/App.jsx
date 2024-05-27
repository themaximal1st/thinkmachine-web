import React from "react";
import ThinkableType from "@lib/thinkabletype";

import Settings from "@lib/Settings";

import Client from "@lib/Client";
import ForceGraph from "./ForceGraph";
import Interwingle from "./Interwingle";
import Typer from "./Typer";
import Editor from "./Editor";
import Depth from "./Depth";
import Filters from "./Filters";

// TODO: custom camera position with activeNode..if they zoom out it should keep that zoom

// TODO: typer
//          - add / adder context
//          - generate many
//          - chat

// TODO: toolbar
//          - explain / chat
//          - generate one
//          - filter toggle

// TODO: need new adder interface / generate....
// TODO: start on UI — what is typer, what is overlay, what is new UI?
// TODO: load uuid / new
// TODO: settings? typer where?

// TODO: Thinkable type
// - is dirty / stable save especially during editor
// - generate

// TODO: More control over prompt generation. Unlocks more creativity and use cases

export default class App extends React.Component {
    constructor() {
        super(...arguments);
        const uuid = "current-uuid";
        this.settings = new Settings(uuid);
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
            if (f.node) {
                return {
                    node: ThinkableType.trackUUID(f.node, this.state.graphData),
                };
            } else {
                return f;
            }
        });
    }

    get activeNodeUUID() {
        return ThinkableType.trackUUID(this.state.activeNodeUUID, this.state.graphData);
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
        await this.reset();

        const media = await window.api.media("my query");
        console.log("MEDIA", media);

        setTimeout(async () => {
            await this.asyncSetState({
                activeNodeUUID: this.state.graphData.nodes[2].uuid,
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

        // document.title = this.title;
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

    render() {
        return (
            <div className="">
                {/* <Typer activeNodeUUID={this.trackedActiveNodeUUID} /> */}

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
                    save={this.save.bind(this)}
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
