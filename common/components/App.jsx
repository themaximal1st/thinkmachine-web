import React from "react";
import ThinkableType from "@lib/thinkabletype";

import ForceGraph from "./ForceGraph";
import Settings from "@lib/Settings";
import Interwingle from "./Interwingle";

// TODO: interwingle
// TODO: start on UI — what is typer, what is overlay, what is new UI?
// TODO: load uuid / new
// TODO: settings? typer where?

// TODO: Thinkable type
// - generate

// TODO: See if you can minimize camera movement during edit. Why is it moving so much? Mess with force settings.
// TODO: Escape
// TODO: More control over prompt generation. Unlocks more creativity and use cases

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
        }, 1500);
    }

    async reloadData() {
        const oldGraphData = this.state.graphData;

        const graphData = this.thinkabletype.graphData(this.state.filter, oldGraphData);

        // delete graphData.nodes[0].vx;
        // delete graphData.nodes[0].vy;
        // delete graphData.nodes[0].vz;

        // console.log(
        //     "ACTIVE NODE",
        //     graphData.nodes[0].vx,
        //     graphData.nodes[0].vy,
        //     graphData.nodes[0].vz
        // );

        // TODO: What's a good way for shorthand access to active node
        // TODO: Move to helper
        for (const node of graphData.nodes) {
            if (node.uuid === this.state.activeNodeUUID) {
                console.log("ACTIVE NODE");
                node.fx = node.x;
                node.fy = node.y;
                node.fz = node.z;
            } else {
                delete node.fx;
                delete node.fy;
                delete node.fz;
            }
        }
        // if (this.state.activeNodeUUID) {
        //     const activeNode = this.thinkabletype.nodeByUUID(this.state.activeNodeUUID);
        //     console.log("ACTIVE NODE", activeNode);
        // }

        console.log("ACTIVE NODE", graphData.nodes[0].uuid);

        await this.asyncSetState({ graphData });

        // document.title = this.title;
    }

    async save() {
        const hypergraph = this.thinkabletype.export();
        await this.settings.hypergraph(hypergraph); // save hypergraph
        await this.reloadData();
    }

    // active node

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
                    thinkabletype={this.thinkabletype}
                    activeNodeUUID={this.state.activeNodeUUID}
                    setActiveNode={this.setActiveNode.bind(this)}
                    graphData={this.state.graphData}
                    save={this.save.bind(this)}
                />
                <Interwingle interwingle={this.state.interwingle} />
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
