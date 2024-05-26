import React from "react";
import ThinkableType from "@lib/thinkabletype";

import Settings from "@lib/Settings";

import ForceGraph from "./ForceGraph";
import Interwingle from "./Interwingle";
import Typer from "./Typer";
import Editor from "./Editor";

// TODO: implement next/prev with context
// TODO: depth with activeNode

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
            isLoading: false,
            dataHash: null,
            filter: null,
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
            this.setActiveNode(null);
        } else if (event.key === "Tab") {
            if (event.target.tagName === "INPUT" || event.target.tagName === "button") {
                return;
            }

            this.toggleInterwingle(undefined, event.shiftKey);
            event.preventDefault();
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

        setTimeout(async () => {
            await this.asyncSetState({
                activeNodeUUID: this.state.graphData.nodes[1].uuid,
            });
        }, 1500);
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

        await this.asyncSetState({ graphData });

        console.log("GRAPH DATA", graphData.nodes);

        // document.title = this.title;
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

    async setActiveNode(node = null) {
        const activeNodeUUID = node ? node.uuid : null;
        await this.asyncSetState({ activeNodeUUID });
    }

    async toggleInterwingle(interwingle = undefined, backwards = false) {
        if (typeof interwingle === "undefined") {
            interwingle = this.thinkabletype.interwingle;
            interwingle = backwards ? interwingle - 1 : interwingle + 1;
            if (interwingle > 3) interwingle = 0;
            if (interwingle < 0) interwingle = 3;
        }
        this.thinkabletype.interwingle = interwingle;
        Settings.interwingle = interwingle;
        this.reloadData();
    }

    render() {
        return (
            <div className="">
                <Typer activeNodeUUID={this.state.activeNodeUUID} />

                <Interwingle
                    interwingle={this.thinkabletype.interwingle}
                    toggleInterwingle={this.toggleInterwingle.bind(this)}
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
