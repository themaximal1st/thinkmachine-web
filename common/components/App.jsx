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
import Editor from "./Editor";
import SettingsModal from "./SettingsModal";
import Depth from "./Depth";
import Filters from "./Filters";
import ChatModal from "./ChatModal";

export default class App extends React.Component {
    constructor() {
        super(...arguments);
        this.typerRef = React.createRef();
        const uuid = "thinkmachine";
        this.settings = new Settings(uuid);
        window.settings = this.settings;
        this.thinkabletype = new GeneralSchematics({
            interwingle: Settings.interwingle,
            onUpdate: this.onDataUpdate.bind(this),
        });

        this.state = {
            isLoading: false,
            isChatModalOpen: false,
            dataHash: null,
            filters: [],
            activeNodeUUID: null,
            graphData: { nodes: [], links: [] },
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        this.load();
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
        if (this.thinkabletype.hyperedges.length === 0) {
            return `Think Machine — Multidimensional Mind Mapping`;
        } else {
            return `${this.thinkabletype.hyperedges[0].symbols.join(
                " "
            )} — Think Machine`;
        }
    }

    get isEmpty() {
        return this.thinkabletype.hyperedges.length === 0;
    }

    async onDataUpdate(event) {
        if (this.state.isLoading) {
            return;
        }

        if (this.thinkabletype.hash !== this.state.dataHash) {
            // console.log("DATA UPDATE", event);
            await this.save();
        }
    }

    async load() {
        Client.setup();
        await this.reset();

        // setTimeout(() => {
        //     this.setActiveNodeUUID(this.thinkabletype.nodes[0].uuid);
        // }, 1000);
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

    async toggleChatModal(val = undefined) {
        await this.asyncSetState({
            isChatModalOpen: val === undefined ? !this.state.isChatModalOpen : val,
        });
    }

    async saveFile() {
        const name = `${this.title} ${new Date().toISOString()}`;
        utils.saveFile(this.thinkabletype.export(), `${slugify(name)}.csv`);
    }

    render() {
        return (
            <div
                className={classNames({
                    empty: this.isEmpty,
                    desktop: utils.isDesktop(),
                    web: utils.isWeb(),
                    dark: Color.isDark,
                })}>
                <Typer
                    isEmpty={this.isEmpty}
                    typerRef={this.typerRef}
                    thinkabletype={this.thinkabletype}
                    trackedActiveNodeUUID={this.trackedActiveNodeUUID}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    filters={this.state.filters}
                    setFilters={this.setFilters.bind(this)}
                    toggleChatModal={this.toggleChatModal.bind(this)}
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

                <SettingsModal />

                <ForceGraph
                    thinkabletype={this.thinkabletype}
                    trackedActiveNodeUUID={this.trackedActiveNodeUUID}
                    activeNodeUUID={this.state.activeNodeUUID}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    filters={this.state.filters}
                    setFilters={this.setFilters.bind(this)}
                    graphData={this.state.graphData}
                    reloadData={this.reloadData.bind(this)}
                    save={this.save.bind(this)}
                />

                <ChatModal
                    typerRef={this.typerRef}
                    isChatModalOpen={this.state.isChatModalOpen}
                    toggleChatModal={this.toggleChatModal.bind(this)}
                    trackedActiveNodeUUID={this.trackedActiveNodeUUID}
                    reloadData={this.reloadData.bind(this)}
                    setActiveNodeUUID={this.setActiveNodeUUID.bind(this)}
                    graphData={this.state.graphData}
                    thinkabletype={this.thinkabletype}
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
