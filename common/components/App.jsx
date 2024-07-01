// If you store positions on nodes...when you edit...you should be able to grab the object from the current position, and just modify that. Is that doable?
//  This would let you keep the textarea and only update parts of it
//  Other option—diffing tree? Cache?
// Then use clever LDS trick...BOOM. WYSIWYG!

import React from "react";
import GeneralSchematics from "@lib/generalschematics";
import { Toaster } from "react-hot-toast";
import slugify from "slugify";
import classNames from "classnames";

import Settings from "@lib/Settings";
import * as utils from "@lib/utils";
import Color from "@lib/Color";

import Client from "@lib/Client";
import ForceGraph from "./ForceGraph";
import Interwingle from "./Interwingle";
import Typer from "./Typer";
import OldEditor from "./OldEditor";
import Editor from "./Editor";
import SettingsModal from "./SettingsModal";
import Depth from "./Depth";
import Filters from "./Filters";
import ChatModal from "./ChatModal";
import { fixNodePosition, unfixNodePosition } from "../lib/generalschematics/utils";

// TODO: We have a UUID bug...if there's two nodes with same ID they're going to collide on same UUID
// TODO: Try to minimize updates to the graph...can we avoid updating the graph if we're just updating hypertext?

// TODO: WYSIWYG Editor
// TODO: See if we can keep active node even while editing..sets foundation for node editing...restore uuids?
// TODO: We kinda need a way to have multi-paragraph notes.. we're gonna have to hack around it...or just fix it somehow
//         look for double break? or something?
// TODO: Fix CSS parser bug

export default class App extends React.Component {
    constructor() {
        super(...arguments);
        this.typerRef = React.createRef();
        const uuid = "thinkmachine";
        this.settings = new Settings(uuid);
        window.settings = this.settings;
        this.schematic = new GeneralSchematics({
            interwingle: Settings.interwingle,
            listener: this.onSchematicUpdate.bind(this),
        });

        this.state = {
            isLoading: false,
            isChatModalOpen: false,
            hash: null,
            filters: [],
            activeNodeUUID: null,
            graphData: { nodes: [], links: [] },
            dirty: false,
            panes: {
                editor: true,
                graph: true,
            },
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        this.load();
        window.setActiveNodeUUID = this.setActiveNodeUUID.bind(this);
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    async handleKeyDown(event) {
        if (event.key === "Escape" && this.state.activeNodeUUID) {
            await this.setActiveNodeUUID(null);
            await utils.delay(100);
            await this.reloadData();
        }
    }

    get filters() {
        return this.state.filters.map((f) => {
            if (!f.node) return f;
            return { node: GeneralSchematics.trackUUID(f.node, this.state.graphData) };
        });
    }

    get trackedActiveNodeUUID() {
        if (!this.state.activeNodeUUID) return null;
        return GeneralSchematics.trackUUID(
            this.state.activeNodeUUID,
            this.state.graphData
        );
    }

    get title() {
        if (this.schematic.hyperedges.length === 0) {
            return `Think Machine — Multidimensional Mind Mapping`;
        } else {
            return `${this.schematic.hyperedges[0].symbols.join(" ")} — Think Machine`;
        }
    }

    get isEmpty() {
        return this.schematic.hyperedges.length === 0;
    }

    async onSchematicUpdate(event) {
        if (!this.state) return;

        if (this.state.isLoading) {
            return;
        }

        if (this.schematic.hash !== this.state.hash) {
            // console.log("📀 DATA UPDATE HASH CHANGED", this.schematic.hash);
            // await this.asyncSetState({ dirty: true });
            await this.save();
        }
    }

    async load() {
        Client.setup();
        await this.reset();

        window.addEventListener("hashchange", () => {
            const node = this.schematic.nodes.find(
                (n) => n.symbol === window.location.hash.slice(1)
            );
            this.setActiveNodeUUID(node.uuid);
        });

        // setTimeout(() => {
        //     this.setActiveNodeUUID(this.schematic.nodes[3].uuid);
        // }, 1000);
    }

    async reset() {
        console.log("❌ RESET");
        this.state.isLoading = true;
        const hypergraph = await this.settings.hypergraph();
        this.schematic.parse(hypergraph);
        this.state.isLoading = false;

        await this.reloadData();
    }

    async reloadData() {
        console.log("✅ RELOAD DATA");

        this.schematic.debug();

        const graphData = this.schematic.graphData(this.filters, this.state.graphData);
        console.log(graphData);

        await this.asyncSetState({
            graphData,
            hash: this.schematic.hash,
        });

        document.title = this.title;
    }

    async save() {
        await this.settings.hypergraph(this.schematic.output); // save hypergraph
        await this.reloadData();
    }

    async setActiveNodeUUID(activeNodeUUID = null) {
        if (this.state.activeNodeUUID) {
            if (this.state.activeNodeUUID === activeNodeUUID) {
                return;
            }

            unfixNodePosition(this.state.activeNodeUUID, this.state.graphData);
        }

        await this.asyncSetState({ activeNodeUUID });
        fixNodePosition(this.state.activeNodeUUID, this.state.graphData);
    }

    async setFilters(filters = null) {
        await this.asyncSetState({ filters });
        await this.reloadData();
    }

    async toggleChatModal(val = undefined) {
        await this.asyncSetState({
            isChatModalOpen: val === undefined ? !this.state.isChatModalOpen : val,
        });
    }

    async togglePane(pane, val = undefined) {
        const panes = { ...this.state.panes };
        panes[pane] = val === undefined ? !panes[pane] : val;
        await this.asyncSetState({ panes });
    }

    async saveFile() {
        const name = `${this.title} ${new Date().toISOString()}`;
        this.schematic.debug();
        utils.saveFile(this.schematic.output, `${slugify(name)}.md`);
    }

    render() {
        return (
            <div
                className={classNames({
                    empty: this.isEmpty && !this.state.dirty,
                    desktop: utils.isDesktop(),
                    web: utils.isWeb(),
                    dark: Color.isDark,
                })}>
                <Typer
                    isEmpty={this.isEmpty}
                    typerRef={this.typerRef}
                    schematic={this.schematic}
                    trackedActiveNodeUUID={this.trackedActiveNodeUUID}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    filters={this.state.filters}
                    setFilters={this.setFilters.bind(this)}
                    toggleChatModal={this.toggleChatModal.bind(this)}
                />

                <Filters
                    schematic={this.schematic}
                    setFilters={this.setFilters.bind(this)}
                    filters={this.state.filters}
                />

                <Depth
                    schematic={this.schematic}
                    graphData={this.state.graphData}
                    reloadData={this.reloadData.bind(this)}
                />
                <SettingsModal />

                <div id="workspace">
                    <Editor
                        schematic={this.schematic}
                        reset={this.reset.bind(this)}
                        reloadData={this.reloadData.bind(this)}
                        saveFile={this.saveFile.bind(this)}
                        panes={this.state.panes}
                        togglePane={this.togglePane.bind(this)}
                    />

                    <div className="relative">
                        <Interwingle
                            schematic={this.schematic}
                            graphData={this.state.graphData}
                            reloadData={this.reloadData.bind(this)}
                        />

                        <ForceGraph
                            schematic={this.schematic}
                            trackedActiveNodeUUID={this.trackedActiveNodeUUID}
                            activeNodeUUID={this.state.activeNodeUUID}
                            setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                            filters={this.state.filters}
                            setFilters={this.setFilters.bind(this)}
                            graphData={this.state.graphData}
                            reloadData={this.reloadData.bind(this)}
                            save={this.save.bind(this)}
                            panes={this.state.panes}
                            togglePane={this.togglePane.bind(this)}
                        />
                    </div>
                </div>

                <ChatModal
                    typerRef={this.typerRef}
                    isChatModalOpen={this.state.isChatModalOpen}
                    toggleChatModal={this.toggleChatModal.bind(this)}
                    trackedActiveNodeUUID={this.trackedActiveNodeUUID}
                    reloadData={this.reloadData.bind(this)}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    graphData={this.state.graphData}
                    schematic={this.schematic}
                    filters={this.filters}
                    setFilters={this.setFilters.bind(this)}
                />

                <div className="absolute inset-0 z-[999] pointer-events-none">
                    <Toaster
                        position="bottom-center"
                        containerStyle={{ zIndex: 999 }}
                        toastOptions={{
                            style: {
                                background: Color.backgroundColor,
                                color: Color.textColor,
                            },
                        }}
                    />
                </div>

                <button
                    className="absolute top-0 right-0 bg-blue-500 text-white hidden"
                    onClick={this.reloadData.bind(this)}>
                    Reload
                </button>
            </div>
        );
    }

    // utils

    async asyncSetState(state = {}) {
        // console.log("🚀 SET STATE", state);
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve();
            });
        });
    }
}
