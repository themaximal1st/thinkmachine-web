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
        const uuid = "current-uuid2";
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

    render() {
        return (
            <div className="">
                <button
                    className="absolute top-0 right-0 bg-blue-500 text-white p-2 z-20"
                    onClick={this.reloadData.bind(this)}>
                    UPDATE
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
