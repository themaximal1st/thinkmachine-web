import React from "react";
import ThinkableType from "@themaximalist/thinkabletype";

import ForceGraph from "./ForceGraph";
import Settings from "@lib/Settings";

// TODO: GraphType ... dedicated component
// TODO: Colors
// TODO: Make sure electron is working

export default class App extends React.Component {
    constructor() {
        super(...arguments);
        const uuid = "current-uuid";
        this.settings = new Settings(uuid);
        this.thinkabletype = new ThinkableType({
            interwingle: Settings.interwingle,
        });

        this.state = {
            filter: null,
            activeNodeUUID: null,
            graphData: { nodes: [], links: [] },
            interwinge: Settings.interwingle,
        };
    }

    componentDidMount() {
        this.load();
    }

    async load() {
        const hypergraph = await this.settings.hypergraph();
        this.thinkabletype.parse(hypergraph);
        // this.thinkabletype.add(["A", "B", "C"]);
        // this.thinkabletype.add(["C", "D", "E"]);

        await this.reloadData();
    }

    async reloadData() {
        const graphData = this.thinkabletype.graphData(
            this.state.filter,
            this.state.graphData
        );
        await this.asyncSetState({ graphData });
    }

    async save() {
        const hypergraph = this.thinkabletype.export();
        await this.settings.hypergraph(hypergraph);
        await this.reloadData();
    }

    // active node

    get activeNode() {
        if (!this.state.activeNodeUUID) return null;
        return this.thinkabletype.nodeByUUID(this.state.activeNodeUUID);
    }

    async setActiveNode(node) {
        await this.asyncSetState({ activeNodeUUID: node.uuid });
    }

    async resetActiveNode() {
        await this.asyncSetState({ activeNodeUUID: null });
    }

    //

    addOne() {
        this.thinkabletype.add([
            String(Math.random()),
            String(Math.random()),
            String(Math.random()),
        ]);
        this.save();
    }

    render() {
        console.log("RENDER");
        return (
            <div className="">
                <button
                    className="bg-blue-500 text-white p-2"
                    onClick={this.addOne.bind(this)}>
                    Add One
                </button>
                <ForceGraph
                    activeNodeUUID={this.state.activeNodeUUID}
                    graphData={this.state.graphData}
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
