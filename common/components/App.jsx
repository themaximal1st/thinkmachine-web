import React from "react";
import ThinkableType from "@lib/thinkabletype";

import Settings from "@lib/Settings";

import ForceGraph from "./ForceGraph";
import Interwingle from "./Interwingle";
import Typer from "./Typer";
import Editor from "./Editor";

// TODO: Figure out if reloading data here is a good idea, or if it's too heavy...some actions get hammered by events
//        ...and we don't want to reloadData every single time...that'd be wasteful

// TODO: next prev should work with other hyperedges....keep going! this probably means they need to jump into (and out of?) graphData
// TODO: need new adder interface / generate....

// TODO: start on UI — what is typer, what is overlay, what is new UI?
// TODO: load uuid / new
// TODO: settings? typer where?

// TODO: Thinkable type
// - update event -> simplifies a lot
// - is dirty
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
            filter: null,
            activeNodeUUID: null,
            graphData: { nodes: [], links: [] },
            interwingle: Settings.interwingle,
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
            this.setActiveNode(null);
        }
    }
    onDataUpdate(event) {
        console.log("DATA UPDATE", event);
    }

    async load() {
        await this.reset();
        // setTimeout(async () => {
        //     await this.asyncSetState({
        //         activeNodeUUID: this.state.graphData.nodes[0].uuid,
        //     });
        // }, 1500);
    }

    async reset() {
        const hypergraph = await this.settings.hypergraph();
        this.thinkabletype.parse(hypergraph);

        await this.reloadData();
    }

    async reloadData() {
        const graphData = this.thinkabletype.graphData(
            this.state.filter,
            this.state.graphData
        );
        await this.asyncSetState({ graphData });

        // document.title = this.title;
    }

    async save() {
        const hypergraph = this.thinkabletype.export();
        await this.settings.hypergraph(hypergraph); // save hypergraph
        await this.reloadData();
    }

    get numberOfNodes() {
        return this.state.graphData.nodes.length;
    }

    get activeNode() {
        if (!this.state.activeNodeUUID) return null;
        return this.thinkabletype.nodeByUUID(this.state.activeNodeUUID);
    }

    async setActiveNode(node = null) {
        const activeNodeUUID = node ? node.uuid : null;
        await this.asyncSetState({ activeNodeUUID });
    }

    async setInterwingle(interwingle) {
        await this.asyncSetState({ interwingle });
        this.thinkabletype.interwingle = interwingle;
        this.save();
    }

    render() {
        return (
            <div className="">
                <Typer activeNodeUUID={this.state.activeNodeUUID} />

                <Interwingle
                    interwingle={this.state.interwingle}
                    setInterwingle={this.setInterwingle.bind(this)}
                    numberOfNodes={this.numberOfNodes}
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
                    setActiveNode={this.setActiveNode.bind(this)}
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
