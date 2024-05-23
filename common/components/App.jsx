import React from "react";
import ThinkableType from "@themaximalist/thinkabletype";

import ForceGraph from "./ForceGraph";
import Settings from "@lib/Settings";

// TODO: interwingle
// TODO: start on UI — what is typer, what is overlay, what is new UI?
// TODO: Possible to do UI in react and not innerHTML?
// TODO: uuid
// TODO: activeNode

export default class App extends React.Component {
    constructor() {
        super(...arguments);
        const uuid = "current-uuid1";
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

        setTimeout(async () => {
            await this.asyncSetState({
                activeNodeUUID: this.state.graphData.nodes[0].uuid,
            });
        }, 1000);
    }

    async reloadData() {
        const oldGraphData = this.state.graphData;

        const graphData = this.thinkabletype.graphData(this.state.filter, oldGraphData);
        await this.asyncSetState({ graphData });

        // document.title = this.title;
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

    async addOne() {
        this.thinkabletype.add([
            String(Math.random()),
            String(Math.random()),
            String(Math.random()),
        ]);
        this.save();
    }

    render() {
        return (
            <div className="">
                <button
                    className="absolute top-0 right-0 bg-blue-500 text-white p-2 z-20"
                    onClick={this.reloadData.bind(this)}>
                    UPDATE
                </button>
                <button
                    className="absolute top-10 right-0 bg-purple-500 text-white p-2 z-20"
                    onClick={this.addOne.bind(this)}>
                    ADD
                </button>
                <ForceGraph
                    activeNodeUUID={this.state.activeNodeUUID}
                    setActiveNode={this.setActiveNode.bind(this)}
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
