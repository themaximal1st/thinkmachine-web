import React from "react";
import ThinkableType from "@lib/thinkabletype";

import Settings from "@lib/Settings";

import ForceGraph from "./ForceGraph";
import Interwingle from "./Interwingle";
import Typer from "./Typer";
import Editor from "./Editor";
import Depth from "./Depth";

// TODO: get filter working
// TODO: depth with activeNode
// TODO:    change filter to accept explicit nodeUUIDs

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
            filter: [["b"]],
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

        // setTimeout(async () => {
        //     await this.asyncSetState({
        //         activeNodeUUID: this.state.graphData.nodes[3].uuid,
        //     });
        // }, 1500);
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
            this.state.filter,
            this.state.graphData
        );

        // console.log("GRAPH DATA", graphData);

        const state = { graphData };
        const activeNodeUUID = this.trackUUID(this.state.activeNodeUUID, graphData);
        if (activeNodeUUID !== this.state.activeNodeUUID) {
            state.activeNodeUUID = activeNodeUUID;
        }

        await this.asyncSetState(state);

        // console.log("GRAPH DATA", graphData.nodes);

        // document.title = this.title;
    }

    trackUUID(uuid, graphData) {
        if (!uuid) {
            return null;
        }

        for (let node of graphData.nodes) {
            if (node.uuid === uuid) {
                return node.uuid;
            }
        }

        const node = ThinkableType.findReferenceUUID(graphData, uuid);

        if (!node) {
            return null;
        }

        return node.uuid;
    }

    async save() {
        await this.settings.hypergraph(this.thinkabletype.export()); // save hypergraph
        await this.asyncSetState({ dataHash: this.thinkabletype.hash });
        await this.reloadData();
    }

    get numberOfNodes() {
        return this.state.graphData.nodes.length;
    }

    get activeNode() {
        if (!this.state.activeNodeUUID) return null;
        return this.thinkabletype.nodeByUUID(this.state.activeNodeUUID);
    }

    async setActiveNodeUUID(activeNodeUUID = null) {
        activeNodeUUID = this.trackUUID(activeNodeUUID, this.state.graphData);
        await this.asyncSetState({ activeNodeUUID });
    }

    render() {
        return (
            <div className="">
                <Typer activeNodeUUID={this.state.activeNodeUUID} />

                <Interwingle
                    thinkabletype={this.thinkabletype}
                    graphData={this.state.graphData}
                    reloadData={this.reloadData.bind(this)}
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
                    activeNodeUUID={this.state.activeNodeUUID}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    graphData={this.state.graphData}
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
