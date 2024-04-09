import React from "react";
import toast, { Toaster } from "react-hot-toast";

import Animation from "@lib/Animation";

import License from "./components/License";

import Console from "@components/Console";
import Filters from "@components/Filters";
import Typer from "@components/Typer";
import Settings from "@components/Settings";
import Interwingle from "@components/Interwingle";
import Depth from "@components/Depth";
import Footer from "@components/Footer";
import ForceGraph from "@components/ForceGraph";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.consoleRef = React.createRef();
        this.graphRef = React.createRef();
        this.depthRef = React.createRef();
        this.animation = new Animation(this.graphRef);
        this.state = {
            loaded: false,
            error: null,

            showConsole: false,
            showLicense: false,
            showSettings: false,

            licenseKey: "",
            licenseValid: undefined,
            trialExpired: false,
            openaiAPIKey: "",
            llm: "llamafile",
            llms: {},

            width: window.innerWidth,
            height: window.innerHeight,

            controlType: "orbit",

            hideLabelsThreshold: 1000,
            hideLabels: true,
            isAnimating: false,
            isShiftDown: false,
            isGenerating: false,

            interwingle: 0,
            input: "",
            inputMode: "add",
            hyperedge: [],
            hyperedges: [],
            filters: [],
            depth: 0,
            maxDepth: 0,
            data: { nodes: [], links: [] },
            lastReloadedDate: new Date(),
        };
    }

    reloadData(controlType = null, zoom = true) {
        return new Promise(async (resolve, reject) => {
            const start = Date.now();

            const data = await window.api.forceGraph.graphData(
                this.state.filters,
                {
                    interwingle: this.state.interwingle,
                    depth: this.state.depth,
                }
            );

            // console.log("DATA", data);

            let depth = this.state.depth;
            const maxDepth = data.maxDepth || 0;
            if (depth > maxDepth) depth = maxDepth;

            const hyperedges = await window.api.hyperedges.all();

            // data.nodes = data.nodes.map((node) => {
            //     node.name = "";
            //     return node;
            // });

            const state = {
                data,
                depth,
                maxDepth,
                loaded: true,
                hyperedges,
                lastReloadedDate: new Date(),
                hideLabels: data.nodes.length >= this.state.hideLabelsThreshold,
            };

            if (controlType) {
                state.controlType = controlType;
            }

            const elapsed = Date.now() - start;
            console.log(`reloaded data in ${elapsed}ms`);

            this.setState(state, () => {
                if (zoom) {
                    setTimeout(() => {
                        this.graphRef.current.zoomToFit(300, 100);
                        resolve();
                    }, 250);
                } else {
                    resolve();
                }
            });
        });
    }

    componentDidMount() {
        ForceGraph.load(this.graphRef);

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));
        window.api.messages.receive(
            "message-from-main",
            this.handleMessageFromMain.bind(this)
        );

        this.loadSettings();

        this.reloadData();

        window.api.analytics.track("app.load");
    }

    componentWillUnmount() {
        this.animation.stop();
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
        document.removeEventListener("keyup", this.handleKeyUp.bind(this));
        document.removeEventListener(
            "mousedown",
            this.handleMouseDown.bind(this)
        );
        document.removeEventListener("mouseup", this.handleMouseUp.bind(this));
        document.removeEventListener("wheel", this.handleZoom.bind(this));
        window.removeEventListener("resize", this.handleResize.bind(this));
    }

    async loadSettings() {
        const settings = {};

        const llms = await window.api.settings.get("llms");
        if (llms) settings.llms = llms;

        const llm = await window.api.settings.get("llm");
        if (llm) settings.llm = llm;

        this.setState(settings, async () => {
            await this.fetchLicenseInfo();
        });
    }

    async fetchLicenseInfo() {
        const license = await window.api.licenses.info();
        this.setState(license, async () => {
            await this.validateAccess();
        });
    }

    maybeReloadData(duration = 1000) {
        const now = new Date();
        const elapsed = now - this.state.lastReloadedDate;
        if (elapsed > duration) {
            this.reloadData();
        }
    }

    _handleMessageFromMain(event, message) {
        switch (event) {
            case "show-license-info":
                this.setState({ showLicense: true });
                break;
            case "show-settings":
                this.setState({ showSettings: true });
                break;
            case "hyperedges.generate.result":
                // toast.success(`Created ${message}`);
                this.maybeReloadData();
                break;
            case "hyperedges.generate.start":
                this.setState({ isGenerating: true });
                break;
            case "hyperedges.generate.stop":
                this.setState({ isGenerating: false });
                this.reloadData();
                break;
            case "success":
                toast.success(message);
                break;
            case "error":
                toast.error(message);
                break;
            default:
                console.log("UNKNOWN MESSAGE", message);
                break;
        }
    }

    get isFocusingInput() {
        return document.activeElement == this.inputRef.current;
    }

    get uniqueSymbols() {
        const symbols = new Set();
        for (const hyperedge of this.state.hyperedges) {
            for (const symbol of hyperedge) {
                symbols.add(symbol);
            }
        }

        return Array.from(symbols);
    }

    handleResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    handleZoom() {
        this.animation.pause();
        this.animation.resume();
    }

    handleMouseDown(e) {
        this.animation.interact();
    }

    handleMouseUp(e) {
        this.animation.stopInteracting();
    }

    handleKeyDown(e) {
        this.animation.interact();
        if (e.key === "Shift") {
            this.setState({ isShiftDown: true });
        }

        if (e.key === "1" && e.metaKey) {
            this.setState({ inputMode: "add" });
        } else if (e.key === "2" && e.metaKey) {
            this.setState({ inputMode: "generate" });
        } else if (e.key === "3" && e.metaKey) {
            this.setState({ inputMode: "search" });
        } else if (e.key === "Tab") {
            this.toggleInterwingle();
        } else if (e.key === "`") {
            this.setState({ showConsole: !this.state.showConsole });
        } else if (e.key === "-" && !this.isFocusingInput) {
            this.zoom(5);
        } else if (e.key === "=" && !this.isFocusingInput) {
            this.zoom(-5);
        } else if (e.key === "+" && !this.isFocusingInput) {
            this.zoom(-50);
        } else if (e.key === "_" && !this.isFocusingInput) {
            this.zoom(50);
        } else if (e.key === "ArrowLeft") {
            this.rotate(-1);
        } else if (e.key === "ArrowRight") {
            this.rotate(1);
            // } else if (e.key === "ArrowDown") {
            //     this.toggleDepth(this.state.depth - 1);
            // } else if (e.key === "ArrowUp") {
            //     this.toggleDepth(this.state.depth + 1);
        } else if (e.key === "Backspace") {
            if (this.state.input === "") {
                this.setState({ hyperedge: this.state.hyperedge.slice(0, -1) });
            } else {
                this.inputReference.focus();
            }
        } else if (this.state.controlType === "fly") {
            return;
        } else if (
            (this.state.trialExpired && !this.state.licenseValid) ||
            this.state.showLicense ||
            this.state.showSettings
        ) {
            return;
        } else {
            console.log(e.key);
            if (e.key !== "Shift") {
                this.inputReference.focus();
            }
        }
    }

    get inputReference() {
        if (!this.inputRef) return {};
        if (!this.inputRef.current) return {};
        if (!this.inputRef.current.firstChild) return {}; // so hacky...but we grab the parent because downshift takes over reference
        const reference = this.inputRef.current.firstChild;
        return reference;
    }

    handleKeyUp(e) {
        this.animation.stopInteracting();

        if (e.key === "Shift") {
            this.setState({ isShiftDown: false });
        }
    }

    async handleInput(e) {
        e.preventDefault();

        if (this.state.inputMode === "add") {
            await this.handleAddInput(e);
        } else if (this.state.inputMode === "generate") {
            await this.handleGenerateInput(e);
        } else if (this.state.inputMode === "search") {
            await this.handleSearchInput(e);
        }
    }

    async handleGenerateInput(e) {
        const llm = this.state.llms[this.state.llm] || {};
        llm.service = this.state.llm;

        if (!llm.apikey) {
            toast.error("LLM API Key is required for generate");
            this.setState({ showSettings: true });
            return;
        }

        const options = { llm };

        await window.api.hyperedges.generate(this.state.input, options);
    }

    async handleSearchInput(e) {
        console.log("SHIFT", this.state.isShiftDown);
        this.searchText(this.state.input, this.state.isShiftDown);
    }

    async handleAddInput(e) {
        if (this.state.input.trim().length === 0) {
            this.setState({
                input: "",
                hyperedge: [],
            });
            return;
        }
        await window.api.hyperedges.add(this.state.hyperedge, this.state.input);

        this.setState(
            {
                input: "",
                hyperedge: [...this.state.hyperedge, this.state.input],
            },
            async () => {
                await this.reloadData();
            }
        );
    }

    handleClickNode(node, e) {
        window.api.analytics.track("app.clickNode");
        this.searchText(node.name, e.shiftKey);
    }

    searchText(text, append = false) {
        const filters = this.state.filters;
        if (append) {
            if (filters.length === 0) {
                filters.push([]);
            }

            filters[filters.length - 1].push(text);
        } else {
            filters.push([text]);
        }

        this.setState({ filters }, () => {
            this.reloadData();
        });
    }

    // this doesn't really work
    zoom(amount = 0) {
        const cameraPosition = this.graphRef.current.cameraPosition();
        this.graphRef.current.cameraPosition({ z: cameraPosition.z + amount });
    }

    // this doesn't really work
    rotate(angleDegrees) {
        const cameraPosition = this.graphRef.current.cameraPosition();

        const distance = Math.sqrt(
            cameraPosition.x ** 2 + cameraPosition.z ** 2
        );

        const initialAngle = Math.atan2(cameraPosition.x, cameraPosition.z);

        const rotationRadians = angleDegrees * (Math.PI / 180);
        const newAngle = initialAngle + rotationRadians;

        const x = distance * Math.sin(newAngle);
        const z = distance * Math.cos(newAngle);

        this.graphRef.current.cameraPosition(
            { x, y: cameraPosition.y, z },
            null,
            100
        );
    }

    toggleLabels() {
        window.api.analytics.track("app.toggleLabels");
        this.setState({ hideLabels: !this.state.hideLabels }, () => {
            this.graphRef.current.refresh();
        });
    }

    toggleCamera() {
        window.api.analytics.track("app.toggleCamera");
        const controlType =
            this.state.controlType === "orbit" ? "fly" : "orbit";
        this.reloadData(controlType);
    }

    toggleAnimation() {
        window.api.analytics.track("app.toggleAnimation");
        if (this.state.isAnimating) {
            this.animation.stop();
        } else {
            this.animation.start();
        }

        this.setState({ isAnimating: !this.state.isAnimating });
    }

    toggleInterwingle(interwingle) {
        window.api.analytics.track("app.toggleInterwingle");
        if (typeof interwingle === "undefined") {
            interwingle = this.state.interwingle;
            interwingle++;
        }

        if (interwingle > 3) interwingle = 0;

        this.setState({ interwingle }, () => {
            this.reloadData();
        });
    }

    toggleDepth(depth) {
        window.api.analytics.track("app.toggleDepth");
        if (typeof depth === "undefined") {
            depth = this.state.depth;
            depth++;
        }

        if (depth > this.state.maxDepth) depth = this.state.maxDepth;
        if (depth < 0) depth = 0;

        this.setState({ depth }, () => {
            setTimeout(() => {
                if (this.depthRef.current) {
                    this.depthRef.current.blur();
                }
            }, 50);

            this.reloadData();
        });
    }

    removeIndexFromHyperedge(index) {
        const hyperedge = this.state.hyperedge;
        hyperedge.splice(index, 1);
        this.setState({ hyperedge });
    }

    removeFilterSymbol(filter, symbol) {
        window.api.analytics.track("app.removeFilterSymbol");
        const filters = this.state.filters;
        const indexOf = filters.indexOf(filter);
        filter.splice(filter.indexOf(symbol), 1);
        if (filter.length === 0) {
            filters.splice(indexOf, 1);
        } else {
            filters[indexOf] = filter;
        }
        this.setState({ filters }, () => {
            this.reloadData();
        });
    }

    async removeHyperedge(hyperedge) {
        await window.api.hyperedges.remove(hyperedge);
        await this.reloadData();
    }

    async validateAccess() {
        const state = {
            licenseValid: false,
            trialExpired: this.state.trialRemaining <= 0,
        };

        if (this.state.licenseKey) {
            state.licenseValid = await window.api.licenses.validate(
                this.state.licenseKey
            );

            if (state.licenseValid) {
                await window.api.settings.set("license", this.state.licenseKey);
                state.error = null;
            } else {
                state.error = "License is not valid";
            }
        }

        this.setState(state);
    }

    async activateLicense(e) {
        e.preventDefault();
        await this.validateAccess();
    }

    async deactivateLicense() {
        await window.api.settings.set("license", null);
        await window.api.settings.set("lastValidated", null);
        this.setState({ licenseKey: "", licenseValid: false }, async () => {
            await this.fetchLicenseInfo();
        });
    }

    async updateLLMService(llm) {
        this.setState({ llm }, async () => {
            await this.updateSettings();
        });
    }

    async updateLLMKey(apikey, llm) {
        const llms = this.state.llms;
        const obj = llms[llm] || {};
        obj.apikey = apikey;
        llms[llm] = obj;

        this.setState({ llm }, async () => {
            await this.updateSettings();
        });
    }

    async updateLLMModel(model, llm) {
        const llms = this.state.llms;
        const obj = llms[llm] || {};
        obj.model = model;
        llms[llm] = obj;

        this.setState({ llm }, async () => {
            await this.updateSettings();
        });
    }

    async updateSettings() {
        await window.api.settings.set("llm", this.state.llm);
        await window.api.settings.set("llms", this.state.llms);
    }

    async createThinkMachineTutorial() {
        if (this.state.hyperedges.length > 0) return;

        const tutorial = [
            ["Think Machine", "is a", "Mind Mapper"],
            ["Think Machine", "is a", "knowledge graph"],
            ["Think Machine", "connects", "ideas"],
            ["Think Machine", "let's you", "create"],
            ["Think Machine", "let's you", "explore"],
            ["ideas", "press tab"],
            ["create", "type anything and press enter"],
            ["explore", "click any text"],
            ["knowledge graph", "press `"],
        ];

        for (const hyperedge of tutorial) {
            const last = hyperedge.pop();
            await window.api.hyperedges.add(hyperedge, last);
        }
        this.setState({ interwingle: 3, depth: -1 }, async () => {
            await this.reloadData();
        });
    }

    render() {
        return (
            <>
                <div className="absolute inset-0 z-50 pointer-events-none">
                    <Toaster
                        position="bottom-center"
                        containerStyle={{ zIndex: 60 }}
                        toastOptions={{
                            style: {
                                background: "#000",
                                color: "#fff",
                            },
                        }}
                    />
                </div>
                <a id="titlebar">Think Machine</a>
                <License
                    licenseKey={this.state.licenseKey}
                    licenseValid={this.state.licenseValid}
                    trialExpired={this.state.trialExpired}
                    trialRemaining={this.state.trialRemaining}
                    showLicense={this.state.showLicense}
                    activateLicense={this.activateLicense.bind(this)}
                    deactivateLicense={this.deactivateLicense.bind(this)}
                    error={this.state.error}
                    updateLicenseKey={(licenseKey) =>
                        this.setState({ licenseKey })
                    }
                    closeLicense={() => this.setState({ showLicense: false })}
                />
                <Console
                    consoleRef={this.consoleRef}
                    showConsole={this.state.showConsole}
                    hyperedges={this.state.hyperedges}
                    removeHyperedge={this.removeHyperedge.bind(this)}
                />
                <Filters
                    filters={this.state.filters}
                    removeFilter={this.removeFilterSymbol.bind(this)}
                />
                <Interwingle
                    interwingle={this.state.interwingle}
                    toggleInterwingle={this.toggleInterwingle.bind(this)}
                    show={!this.state.isAnimating}
                />
                <Depth
                    depthRef={this.depthRef}
                    depth={this.state.depth}
                    maxDepth={this.state.maxDepth}
                    show={!this.state.isAnimating}
                    toggleDepth={this.toggleDepth.bind(this)}
                />
                <Typer
                    inputRef={this.inputRef}
                    input={this.state.input}
                    inputMode={this.state.inputMode}
                    setInputMode={(inputMode) => this.setState({ inputMode })}
                    isGenerating={this.state.isGenerating}
                    loaded={this.state.loaded}
                    hyperedges={this.state.hyperedges}
                    symbols={this.uniqueSymbols}
                    handleInput={this.handleInput.bind(this)}
                    removeIndex={this.removeIndexFromHyperedge.bind(this)}
                    changeInput={(input) => {
                        this.setState({ input });
                    }}
                    hyperedge={this.state.hyperedge}
                    show={!this.state.showConsole && !this.state.isAnimating}
                />
                <ForceGraph
                    graphRef={this.graphRef}
                    data={this.state.data}
                    width={this.state.width}
                    height={this.state.height}
                    controlType={this.state.controlType}
                    hideLabels={this.state.hideLabels}
                    onNodeClick={this.handleClickNode.bind(this)}
                    showLabels={!this.state.hideLabels}
                />
                <Settings
                    showSettings={this.state.showSettings}
                    llm={this.state.llm}
                    llms={this.state.llms}
                    updateService={this.updateLLMService.bind(this)}
                    updateKey={this.updateLLMKey.bind(this)}
                    updateModel={this.updateLLMModel.bind(this)}
                    closeSettings={() => this.setState({ showSettings: false })}
                />
                <Footer
                    isAnimating={this.state.isAnimating}
                    controlType={this.state.controlType}
                    toggleCamera={this.toggleCamera.bind(this)}
                    toggleAnimation={this.toggleAnimation.bind(this)}
                />
            </>
        );
    }
}
