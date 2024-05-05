import React from "react";
import toast, { Toaster } from "react-hot-toast";
import slugify from "slugify";
import * as THREE from "three";

import ThinkMachineAPI from "@src/api";
import { saveFile } from "@lib/files";
import { isUUID } from "@lib/uuid";
import * as utils from "@lib/utils";
import * as GraphUtils from "@lib/GraphUtils";
import Animation from "@lib/Animation";
import LocalSettings from "@lib/LocalSettings";
import Recorder from "@lib/Recorder";
import Tutorial from "@lib/Tutorial";
import RecorderShots from "@lib/RecorderShots";
import ChatHandler from "@lib/ChatHandler";

import License from "@components/License";
import Console from "@components/Console";
import Filters from "@components/Filters";
import LLMSettings from "@components/LLMSettings";
import Interwingle from "@components/Interwingle";
import Depth from "@components/Depth";
import Footer from "@components/Footer";
import ForceGraph from "@components/ForceGraph";
import Typer from "@components/Typer";
import Wormhole from "@components/Wormhole.js";
import ChatWindow from "@components/ChatWindow.jsx";
import RecordingUI from "@components/RecordingUI.jsx";

export default class App extends React.Component {
    constructor(props) {
        super(props);
        this.inputRef = React.createRef();
        this.chatInputRef = React.createRef();
        this.consoleRef = React.createRef();
        this.graphRef = React.createRef();
        this.depthRef = React.createRef();
        this.wormhole = new Wormhole();
        this.recorder = null;
        this.animation = new Animation(this.graphRef);
        this.state = {
            loaded: false,
            edited: false,
            error: null,

            showConsole: false,
            showLicense: false,
            showSettingsMenu: false,
            showLLMSettings: false,
            showLayout: false,
            showLabsWarning: false,
            showChat: false,
            showRecordingModal: false,

            licenseKey: "",
            licenseValid: undefined,
            trialExpired: false,
            trialRemaining: Infinity,
            llm: {
                service: "openai",
                model: "gpt-4-turbo-preview",
            },
            apikeys: LocalSettings.apikeys,
            width: window.innerWidth,
            height: window.innerHeight,

            graphType: window.localStorage.getItem("graphType") || "3d",
            controlType: window.localStorage.getItem("controlType") || "orbit",
            videoType: window.localStorage.getItem("videoType") || "webm",

            hideLabelsThreshold: 1000,
            hideLabels: true,
            wormholeMode: parseInt(window.localStorage.getItem("wormholeMode") || -1),
            isAnimating: false,
            isShiftDown: false,
            isGenerating: false,
            isChatting: false,

            isRecording: false,
            isProcessing: false, // hack

            reloads: 0,
            interwingle: 3,
            input: "",
            inputMode: window.localStorage.getItem("inputMode") || "generate",
            hyperedge: [],
            hyperedges: [],
            filters: [],
            depth: 0,
            maxDepth: 0,
            data: { nodes: [], links: [] },
            lastReloadedDate: new Date(),
            cooldownTicks: 5000,
            cameraPosition: null,
            chatMessages: [],
            chatWindow: {
                x: window.innerWidth - 400 - 10,
                y: (window.innerHeight - 400) / 2,
                width: 400,
                height: 300,
            },
        };
    }

    //
    // GET
    //

    get name() {
        if (this.state.hyperedges.length === 0) {
            return `Think Machine`;
        } else {
            return `Think Machine ${this.state.hyperedges[0].join(" ")}`;
        }
    }

    get slug() {
        return slugify(`${this.name.toLowerCase()} ${Date.now()}`);
    }

    get dynamicInputMode() {
        if (this.state.hyperedges.length > 0) {
            return this.state.inputMode;
        }

        // don't allow search mode or chat if there are no hyperedges
        if (this.state.inputMode !== "add" && this.state.inputMode !== "generate") {
            return "generate";
        }

        return this.state.inputMode;
    }

    get inputReference() {
        if (!this.inputRef) return {};
        if (!this.inputRef.current) return {};
        if (!this.inputRef.current.firstChild) return {}; // so hacky...but we grab the parent because downshift takes over reference
        const reference = this.inputRef.current.firstChild;
        return reference;
    }

    get isFocusingTextInput() {
        if (this.isFocusingInput) return true;
        if (this.isFocusingChatInput) return true;
        if (this.isFocusingFeedbackInput) return true;

        if (!document.activeElement) return false;
        if (document.activeElement.tagName === "INPUT") return true;
        if (document.activeElement.tagName === "TEXTAREA") return true;

        return false;
    }

    get isFocusingInput() {
        return document.activeElement == this.inputReference;
    }

    get isFocusingChatInput() {
        return document.activeElement == this.chatInputRef.current;
    }

    get isFocusingFeedbackInput() {
        if (!document.activeElement) return false;
        if (document.activeElement.tagName !== "TEXTAREA") return false;
        return true;
    }

    get canFocusInput() {
        if (this.isFocusingChatInput) return false;
        if (this.isFocusingFeedbackInput) return false;
        return true;
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

    get shouldHideControls() {
        return this.state.isAnimating || this.state.isRecording;
    }

    //
    // MOUNT / UNMOUNT
    //

    componentDidMount() {
        ForceGraph.load(this.graphRef, this.state.graphType);

        document.addEventListener("keydown", this.handleKeyDown.bind(this));
        document.addEventListener("keyup", this.handleKeyUp.bind(this));
        document.addEventListener("mousedown", this.handleMouseDown.bind(this));
        document.addEventListener("mouseup", this.handleMouseUp.bind(this));
        document.addEventListener("wheel", this.handleZoom.bind(this));
        window.addEventListener("resize", this.handleResize.bind(this));

        ThinkMachineAPI.load().then(async () => {
            this.loadSettings();

            await this.reloadData({ zoom: true });

            window.api.analytics.track("app.load");

            await this.fetchLicenseInfo();

            await this.handleAutoSearch();

            window.takeScreenshot = this.takeScreenshot.bind(this);
            window.recordVideo = this.recordVideo.bind(this);

            this.recorder = new Recorder();
            this.recorder.onstart = this.handleRecorderStart.bind(this);
            this.recorder.onstop = this.handleRecorderStop.bind(this);
            this.recorder.onprocess = this.handleRecorderProcess.bind(this);
            this.recorder.onfile = this.handleRecorderFile.bind(this);
            this.recorder.onerror = this.handleRecorderError.bind(this);
        });
    }

    componentWillUnmount() {
        this.animation.stop();
        document.removeEventListener("keydown", this.handleKeyDown.bind(this));
        document.removeEventListener("keyup", this.handleKeyUp.bind(this));
        document.removeEventListener("mousedown", this.handleMouseDown.bind(this));
        document.removeEventListener("mouseup", this.handleMouseUp.bind(this));
        document.removeEventListener("wheel", this.handleZoom.bind(this));
        window.removeEventListener("resize", this.handleResize.bind(this));
    }

    //
    // RELOAD
    //

    async reloadData({ controlType, zoom = false } = {}) {
        const start = Date.now();

        const oldData = this.state.data;
        const newData = await window.api.hypergraph.graphData(this.state.filters, {
            interwingle: this.state.interwingle,
            depth: this.state.depth,
        });

        const data = GraphUtils.restoreNodePositions(this.state.data, newData);

        let depth = data.depth;
        const maxDepth = data.maxDepth || 0;
        if (depth > maxDepth) depth = maxDepth;

        const hyperedges = await window.api.hyperedges.all();

        let edited = this.state.edited;
        if (hyperedges.length > 0) {
            edited = true;
        }

        const state = {
            data,
            depth,
            maxDepth,
            loaded: true,
            reloads: this.state.reloads + 1,
            hyperedges,
            edited,
            lastReloadedDate: new Date(),
            hideLabels: data.nodes.length >= this.state.hideLabelsThreshold,
        };

        if (controlType) {
            state.controlType = controlType;
        }

        const elapsed = Date.now() - start;
        console.log(`reloaded data in ${elapsed}ms`);

        await this.asyncSetState(state);

        GraphUtils.emitParticlesOnLinkChanges(this, oldData);

        if (this.state.graphType === "2d") {
            // 2d graph needs a little longer to render & zoom for some reason
            await utils.delay(300);
        }

        const cameraPosition = await GraphUtils.smartZoom(this, oldData, zoom);

        if (cameraPosition) {
            this.setState({ cameraPosition });
        }
    }

    maybeReloadData(duration = 1000) {
        const now = new Date();
        const elapsed = now - this.state.lastReloadedDate;
        if (elapsed > duration) {
            this.reloadData();
        }
    }

    //
    // ACTIONS
    //

    async takeScreenshot() {
        await Recorder.takeScreenshot(this.slug);
    }

    async recordVideo() {
        if (this.recorder.recording) {
            console.log("already recording");
            return;
        }

        this.recorder.videoType = this.state.videoType;
        this.recorder.start();
    }

    async stopRecord() {
        if (!this.recorder.recording) {
            console.log("not recording");
            return;
        }

        this.recorder.stop();
    }

    updateInputMode(inputMode) {
        window.api.analytics.track("app.toggleInputMode");
        window.localStorage.setItem("inputMode", inputMode);
        this.setState({ inputMode });
    }

    updateChatWindow(newChatWindow = {}) {
        const chatWindow = Object.assign({}, this.state.chatWindow, newChatWindow);
        this.setState({ chatWindow });
    }

    updateAPIKeys(apikeys) {
        LocalSettings.apikeys = apikeys;
    }

    async asyncSetState(state = {}) {
        return new Promise((resolve, reject) => {
            this.setState(state, () => {
                resolve();
            });
        });
    }

    async loadSettings() {
        try {
            const data = window.localStorage.getItem("llm");
            if (data) {
                const llm = JSON.parse(data);
                this.setState({ llm });
            }
        } catch (e) {
            console.error(e);
        }
    }

    async createNewHypergraph() {
        try {
            const uuid = await window.api.hypergraph.create();

            if (!(await window.api.hypergraph.isValid())) {
                throw new Error("Hypergraph was not initialized properly");
            }

            if (window.api.isWeb) {
                const urlPath = `/${uuid}`;
                window.history.pushState({ urlPath }, document.title, urlPath);
            } else {
                await this.reloadData();
            }

            return uuid;
        } catch (e) {
            console.log("error creating new hypergraph", e);
            return null;
        }
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

        const distance = Math.sqrt(cameraPosition.x ** 2 + cameraPosition.z ** 2);

        const initialAngle = Math.atan2(cameraPosition.x, cameraPosition.z);

        const rotationRadians = angleDegrees * (Math.PI / 180);
        const newAngle = initialAngle + rotationRadians;

        const x = distance * Math.sin(newAngle);
        const z = distance * Math.cos(newAngle);

        this.graphRef.current.cameraPosition({ x, y: cameraPosition.y, z }, null, 100);
    }

    panX(amount) {
        if (this.state.isShiftDown) amount *= 10;
        const position = this.graphRef.current.centerAt();
        this.graphRef.current.centerAt(position.x + amount, undefined, 100);
    }

    panY(amount) {
        if (this.state.isShiftDown) amount *= 10;
        const position = this.graphRef.current.centerAt();
        this.graphRef.current.centerAt(undefined, position.y + amount, 100);
    }

    startWormhole() {
        if (this.state.wormholeMode !== 0) return;

        this.setState({ wormholeMode: 1, controlType: "fly" }, () => {
            this.wormhole.setup();
            this.setState({ wormholeMode: 2, controlType: "fly" }, () => {
                this.resetCameraPosition();
            });
        });
    }

    stopWormhole() {
        if (this.state.wormholeMode === 0) return;
        this.setState({ wormholeMode: 0, controlType: "fly" }, () => {
            this.wormhole.teardown();
        });
    }

    resetCameraPosition() {
        if (!this.graphRef || !this.graphRef.current) return;
        this.graphRef.current.cameraPosition({
            x: -500,
            y: 0,
            z: 100,
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

    async fetchLicenseInfo() {
        if (window.api.isElectron) {
            const license = await window.api.license.info();
            this.setState(license, async () => {
                await this.validateAccess();
            });
        }
    }

    async validateAccess() {
        const state = {
            licenseValid: false,
            trialExpired: this.state.trialRemaining <= 0,
        };

        if (this.state.licenseKey) {
            console.log("validating license");
            state.licenseValid = await window.api.license.validate(this.state.licenseKey);
            if (state.licenseValid) {
                console.log("validated license");
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

        this.setState({ licenseKey: "", licenseValid: false });
    }

    async updateLLM(llm) {
        this.setState({ llm }, async () => {
            await this.updateSettings();
        });
    }

    async updateSettings() {
        const llm = this.state.llm;
        window.localStorage.setItem("llm", JSON.stringify(llm));
    }

    get llmSettings() {
        const llm = {};
        if (this.state.llm.name) llm.name = this.state.llm.name;
        if (this.state.llm.service) llm.service = this.state.llm.service;
        if (this.state.llm.model) llm.model = this.state.llm.model;
        if (this.state.llm.options) llm.options = this.state.llm.options;

        if (window.api.isElectron) {
            const apikey = LocalSettings.apiKeyForService(llm.service);
            if (apikey) llm.apikey = apikey;
        }

        return llm;
    }

    async createThinkMachineTutorial() {
        Tutorial(this);
    }

    // Function to check for collisions between the camera and nodes when wormhole is enabled
    checkForCollisions() {
        if (this.state.wormholeMode === -1) return;
        if (this.state.wormholeMode === 2) return; // generating wormhole already

        const collisionThreshold = 40; // Distance at which we consider a collision to occur

        const camera = this.graphRef.current.camera();
        const cameraPosition = new THREE.Vector3();
        cameraPosition.setFromMatrixPosition(camera.matrixWorld); // Get the camera's position

        for (let node of this.state.data.nodes) {
            const nodePosition = new THREE.Vector3(node.x, node.y, node.z); // Assuming nodes have x, y, z properties
            const distance = cameraPosition.distanceTo(nodePosition); // Calculate distance from camera to node

            if (distance < collisionThreshold) {
                const hyperedges = node._meta.hyperedgeIDs;
                this.generateWormhole(hyperedges);
            }
        }
    }

    // generate a new wormholoe. create a new hypergraph, and generate a wormhole from the collided hyperedges of the old graph
    async generateWormhole(hyperedges) {
        this.startWormhole();

        window.api.analytics.track("app.generateWormhole");

        const from_uuid = await window.api.uuid.get();
        await this.createNewHypergraph();

        try {
            await window.api.hyperedges.wormhole(hyperedges, {
                llm: this.llmSettings,
                from_uuid,
            });
        } catch (e) {
            console.log("ERROR", e);
        } finally {
            await this.reloadData({ zoom: true });
            this.stopWormhole();
        }
    }

    //
    // TOGGLE
    //

    toggleVideoType(val) {
        const videoType =
            val === undefined ? (this.state.videoType === "webm" ? "mp4" : "webm") : val;
        localStorage.setItem("videoType", videoType);
        this.setState({ videoType });
    }

    toggleRecord(val) {
        const isRecording = val === undefined ? !this.state.isRecording : val;

        console.log("TOGGLE RECORD", val);

        this.setState({ isRecording }, () => {
            if (this.state.isRecording) {
                this.recordVideo();
            } else {
                this.stopRecord();
            }
        });
    }
    toggleIsChatting(val) {
        const isChatting = val === undefined ? !this.state.isChatting : val;
        this.setState({ isChatting });
    }

    toggleLicenseWindow(val) {
        const showLicense = val === undefined ? !this.state.showLicense : val;
        this.setState({ showLicense });
    }

    toggleChatWindow(val) {
        const showChat = val === undefined ? !this.state.showChat : val;
        const state = { showChat };
        if (!showChat) {
            state.chatMessages = [];
        }
        this.setState(state, () => {
            if (showChat) {
                this.chatInputRef.current.focus();
            }
        });
    }

    toggleShowLabsWarning(val) {
        const showLabsWarning = val === undefined ? !this.state.showLabsWarning : val;
        this.setState({ showLabsWarning });
    }

    toggleShowRecordingModal(val) {
        const showRecordingModal =
            val === undefined ? !this.state.showRecordingModal : val;
        this.setState({ showRecordingModal });
    }

    toggleShowLayout(val) {
        const showLayout = val === undefined ? !this.state.showLayout : val;
        this.setState({ showLayout });
    }

    toggleSettingsMenu(val) {
        const showSettingsMenu = val === undefined ? !this.state.showSettingsMenu : val;
        this.setState({ showSettingsMenu });
    }

    toggleConsole(val) {
        const showConsole = val === undefined ? !this.state.showConsole : val;
        this.setState({ showConsole });
    }

    toggleCamera() {
        window.api.analytics.track("app.toggleCamera");
        const controlType = this.state.controlType === "orbit" ? "fly" : "orbit";

        window.localStorage.setItem("controlType", controlType);

        window.location.href = window.location.href;
    }

    toggleLLMSettings(val) {
        const showLLMSettings = val === undefined ? !this.state.showLLMSettings : val;
        this.setState({ showLLMSettings });
    }

    toggleGraphType(val) {
        window.api.analytics.track("app.toggleGraphType");
        const graphType =
            val === undefined ? (this.state.graphType === "3d" ? "2d" : "3d") : val;

        window.localStorage.setItem("graphType", graphType);
        window.location.href = window.location.href;
    }

    toggleLabels(val) {
        const hideLabels = val === undefined ? !this.state.hideLabels : val;
        window.api.analytics.track("app.toggleLabels");
        this.setState({ hideLabels }, () => {
            this.graphRef.current.refresh();
        });
    }

    toggleAnimation(val) {
        const isAnimating = val === undefined ? !this.state.isAnimating : val;

        window.api.analytics.track("app.toggleAnimation");
        if (isAnimating) {
            this.animation.start();
        } else {
            this.animation.stop();
        }

        this.setState({ isAnimating });
    }

    toggleInterwingle(interwingle, backwards = false) {
        window.api.analytics.track("app.toggleInterwingle");
        if (typeof interwingle === "undefined") {
            interwingle = this.state.interwingle;
            if (backwards) {
                interwingle--;
            } else {
                interwingle++;
            }
        }

        if (interwingle > 3) interwingle = 0;
        if (interwingle < 0) interwingle = 3;

        this.setState({ interwingle }, () => {
            this.reloadData({ zoom: true });
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

    toggleWormhole() {
        window.api.analytics.track("app.toggleWormhole");

        let wormholeMode;
        let controlType = "fly";

        if (this.state.wormholeMode > -1) {
            wormholeMode = -1;
            controlType = "orbit";
        } else {
            wormholeMode = 0;
        }

        this.setState({ wormholeMode, controlType });
        window.localStorage.setItem("wormholeMode", wormholeMode);
        window.localStorage.setItem("controlType", controlType);

        // reload page, unfortunately 3D Force Graph doesn't allow dynamic control type changes
        window.location.href = window.location.href;
    }

    //
    // HANDLE
    //

    handleRecorderStart() {
        console.log("STARTED RECORDING");
        toast.success("Recording started");
        this.setState({ isRecording: true });
    }

    handleRecorderStop() {
        console.log("STOPPED RECORDING");
        // toast.success("Recording stopped");
        this.setState({ isRecording: false });
    }

    handleRecorderProcess() {
        console.log("PROCESSING");
        toast.success("Processing recording");
        this.setState({ isRecording: false, isProcessing: true });
    }

    async handleRecorderFile(blob) {
        if (!blob) {
            toast.error("Error recording video");
            return;
        }

        let extension;
        let mimeType;

        if (this.recorder.videoType === "webm") {
            extension = "webm";
            mimeType = "video/webm";
        } else {
            extension = "mp4";
            mimeType = "video/mp4";
        }

        await saveFile(blob, `${this.slug}.${extension}`, mimeType);
        toast.success("Saved!");
        this.setState({ isRecording: false, isProcessing: false });

        this.recorder.reset();
    }

    handleRecorderError(e) {
        console.log("RECORDER ERROR", e);
        toast.error("Error recording video");
        this.setState({ isRecording: false, isProcessing: false });

        this.recorder.reset();
    }

    handleTick() {
        this.checkForCollisions();
    }

    handleEngineStop() {
        console.log("ENGINE STOPPED");
    }

    async handleChatMessage(e = null) {
        return await ChatHandler(this, e);
    }

    async handleDownload() {
        const data = await window.api.hypergraph.export();
        await saveFile(data, `${this.slug}.csv`, "text/csv");
    }

    async handleAutoSearch() {
        if (!window.api.isWeb) return;
        if (!this.state.loaded) return;
        if (this.state.hyperedges.length > 0) return;
        if (this.state.input.length > 0) return;
        if (this.state.edited) return;
        if (this.dynamicInputMode !== "generate") return;

        const prompt = decodeURIComponent(window.location.pathname.substring(1));

        if (!prompt) return;
        if (prompt.trim().length === 0) return;
        if (isUUID(prompt)) return;

        console.log("AUTO SEARCH", prompt);

        this.setState({ input: prompt }, async () => {
            this.handleGenerateInput();
            window.history.replaceState({}, document.title, window.location.pathname);
        });
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

        if (e.key === "Escape") {
            if (this.state.showConsole) {
                this.toggleConsole();
            }
        }

        if (e.key === "1" && e.metaKey) {
            this.updateInputMode("add");
            e.preventDefault();
        } else if (e.key === "2" && e.metaKey) {
            this.updateInputMode("generate");
            e.preventDefault();
        } else if (e.key === "3" && e.metaKey) {
            this.updateInputMode("search");
            e.preventDefault();
        } else if (e.key === "4" && e.metaKey) {
            this.updateInputMode("chat");
            e.preventDefault();
        } else if (e.key === "F1") {
            this.takeScreenshot();
        } else if (e.key === "F2") {
            this.toggleRecord();
        } else if (e.key === "F3") {
            RecorderShots.orbit(this);
        } else if (e.key === "F4") {
            RecorderShots.flyby(this);
        } else if (e.key === "F5") {
            RecorderShots.zoom(this);
        } else if (e.key === "Tab") {
            this.toggleInterwingle(undefined, e.shiftKey);
            e.preventDefault();
        } else if (e.key === "`") {
            this.setState({ showConsole: !this.state.showConsole });
        } else if (e.key === "-" && !this.isFocusingTextInput) {
            this.zoom(5);
        } else if (e.key === "=" && !this.isFocusingTextInput) {
            this.zoom(-5);
        } else if (e.key === "+" && !this.isFocusingTextInput) {
            this.zoom(-50);
        } else if (e.key === "_" && !this.isFocusingTextInput) {
            this.zoom(50);
        } else if (e.key === "ArrowLeft") {
            if (this.state.graphType === "3d") {
                if (e.shiftKey) {
                    this.rotate(-10);
                } else {
                    this.rotate(-1);
                }
            } else {
                this.panX(-1);
            }
        } else if (e.key === "ArrowRight") {
            if (this.state.graphType === "3d") {
                if (e.shiftKey) {
                    this.rotate(10);
                } else {
                    this.rotate(1);
                }
            } else {
                this.panX(1);
            }
        } else if (e.key === "ArrowDown") {
            if (this.state.graphType === "2d") {
                this.panY(1);
            }
            // this.toggleDepth(this.state.depth - 1);
        } else if (e.key === "ArrowUp") {
            if (this.state.graphType === "2d") {
                this.panY(-1);
            }
            // this.toggleDepth(this.state.depth + 1);
        } else if (e.key === "Backspace") {
            if (!this.canFocusInput) return;

            if (this.state.input === "") {
                this.setState({
                    hyperedge: this.state.hyperedge.slice(0, -1),
                });
            } else {
                this.inputReference.focus();
            }
        } else if (this.state.controlType === "fly") {
            return;
        } else if (
            (this.state.trialExpired && !this.state.licenseValid) ||
            this.state.showLicense ||
            this.state.showLLMSettings
        ) {
            return;
        } else {
            if (
                e.key !== "Shift" &&
                this.canFocusInput &&
                this.inputReference &&
                this.inputReference.focus
            ) {
                this.inputReference.focus();
            }
        }
    }

    handleKeyUp(e) {
        this.animation.stopInteracting();

        if (e.key === "Shift") {
            this.setState({ isShiftDown: false });
        }
    }

    async handleEmptyHypergraph() {
        if (!(await window.api.hypergraph.isValid())) {
            await this.createNewHypergraph();
        }
    }

    async handleInput(e) {
        e.preventDefault();

        if (this.dynamicInputMode === "add") {
            await this.handleAddInput(e);
        } else if (this.dynamicInputMode === "generate") {
            if (this.state.input.trim().length === 0) {
                toast.error("Please enter a phrase");
                return false;
            }

            await this.handleGenerateInput(e);
        } else if (this.dynamicInputMode === "search") {
            if (this.state.input.trim().length === 0) {
                toast.error("Please enter a search term");
                return false;
            }
            await this.handleSearchInput();
        } else if (this.dynamicInputMode === "chat") {
            if (this.state.isChatting) {
                return false;
            }

            return await this.handleChatMessage();
        } else {
            return false;
        }

        return true;
    }

    async handleGenerateMessage(message) {
        switch (message.event) {
            case "hyperedges.generate.result":
                this.maybeReloadData();
                break;
            case "hyperedges.generate.start":
                this.setState({ isGenerating: true, edited: true });
                toast.success("Generating...");
                break;
            case "hyperedges.generate.stop":
                this.setState({ isGenerating: false });
                this.reloadData();
                break;
            case "hyperedges.success":
            case "success":
                toast.success(message.message || "Successfully generated results");
                break;
            case "hyperedges.error":
            case "error":
                toast.error(message.message || "Error generating results");
                break;
            default:
                console.log("UNKNOWN MESSAGE", message);
                break;
        }
    }

    async handleGenerateInput() {
        const input = this.state.input.trim();
        if (input.length === 0) {
            return;
        }

        await this.handleEmptyHypergraph();

        const llm = this.llmSettings;
        const options = { llm };

        if (
            window.api.isElectron &&
            !llm.apikey &&
            llm.service !== "llamafile" &&
            llm.service !== "ollama"
        ) {
            // hacky but we don't need an API key for llamafile or ollama
            toast.error("API key is required for generating results");
            this.setState({ showLLMSettings: true });
            return;
        }

        await this.asyncSetState({ input: "" });

        try {
            const response = await window.api.hyperedges.generate(input, options);

            for await (const message of response) {
                await this.handleGenerateMessage(message);
            }
        } catch (e) {
            toast.error("Error generating results");
        } finally {
            this.setState({ isGenerating: false });
        }
    }

    async handleSearchInput(e) {
        await this.handleEmptyHypergraph();
        this.searchText(this.state.input, this.state.isShiftDown);
    }

    async handleAddInput(e) {
        await this.handleEmptyHypergraph();

        let hyperedge = this.state.hyperedge;
        let input = this.state.input.trim();

        if (input.length === 0) {
            this.setState({
                input: "",
                edited: true,
                hyperedge: [],
            });

            return;
        }

        await window.api.hyperedges.add(hyperedge, input);

        this.setState(
            {
                input: "",
                edited: true,
                hyperedge: [...hyperedge, input],
            },
            async () => {
                await this.reloadData();
            }
        );
    }

    handleClickNode(node, e) {
        console.log(node);
        const camera = this.graphRef.current.cameraPosition();

        // Define a fixed "up" vector (world up)
        const worldUp = { x: 0, y: 1, z: 0 };

        // Calculate normalized direction from the node to the camera
        let direction = {
            x: camera.x - node.x,
            y: camera.y - node.y,
            z: camera.z - node.z,
        };
        let mag = Math.sqrt(direction.x ** 2 + direction.y ** 2 + direction.z ** 2);
        direction.x /= mag;
        direction.y /= mag;
        direction.z /= mag;

        // Determine the new camera position offset by 100 units away from the node
        let offsetDistance = 75; // Distance to offset from the node
        let newPosition = {
            x: node.x + direction.x * offsetDistance,
            y: node.y + direction.y * offsetDistance,
            z: node.z + direction.z * offsetDistance,
        };

        // Check if the new position is very close to flipping over
        let dotWithUp =
            direction.x * worldUp.x + direction.y * worldUp.y + direction.z * worldUp.z;
        if (Math.abs(dotWithUp) > 0.95) {
            // Threshold to adjust to avoid gimbal lock issues
            newPosition = {
                // Adjust position slightly to avoid direct alignment with up vector
                x: newPosition.x + worldUp.x * 10,
                y: newPosition.y + worldUp.y * 10,
                z: newPosition.z + worldUp.z * 10,
            };
        }

        // Update camera position and target
        this.graphRef.current.cameraPosition(
            newPosition, // new camera position
            { x: node.x, y: node.y, z: node.z }, // camera looks at the node
            1000 // transition duration in milliseconds
        );

        // this.graphRef.current.cameraPosition(
        //     {
        //         x: node.x,
        //         y: node.y,
        //         z: node.z,
        //     },
        //     {
        //         x: node.x,
        //         y: node.y,
        //         z: node.z - 100,
        //     },
        //     1000
        // );

        // const nodes = this.state.data.nodes.map((n) => {
        //     if (n.id === node.id) {
        //         n.name =
        //             n.name +
        //             "\n\nthis is a much longer name with much longer\ntext and i wonder how much we could\ncustomize this";
        //     }
        //     return n;
        // });

        // this.setState({ data: { nodes: nodes, links: this.state.data.links } });

        return;
        window.api.analytics.track("app.clickNode");

        if (this.dynamicInputMode === "add") {
            this.setState({ input: node.name }, async () => {
                await this.handleAddInput(e);
            });
        } else if (this.dynamicInputMode === "generate") {
            this.setState({ input: node.name }, async () => {
                await this.handleGenerateInput();
            });
        } else if (this.dynamicInputMode === "search") {
            this.searchText(node.name, e.shiftKey);
        } else if (this.dynamicInputMode === "chat") {
            this.setState({ input: node.name }, async () => {
                await this.handleChatMessage();
            });
        }
    }

    handleStartRecording(recordType) {
        if (recordType === "record") {
            this.toggleRecord(true);
        } else if (recordType === "orbit") {
            RecorderShots.orbit(this);
        } else if (recordType === "zoom") {
            RecorderShots.zoom(this);
        } else if (recordType === "flyby") {
            RecorderShots.flyby(this);
        } else {
            console.log("UNKNOWN RECORD TYPE", recordType);
        }
    }

    //
    // RENDER
    //

    render() {
        const isElectron = this.state.loaded ? window.api.isElectron : false;

        return (
            <div className={isElectron ? "electron" : "web"}>
                <div className="absolute inset-0 z-[999] pointer-events-none">
                    <Toaster
                        position="bottom-center"
                        containerStyle={{ zIndex: 999 }}
                        toastOptions={{
                            style: {
                                background: "#000",
                                color: "#fff",
                            },
                        }}
                    />
                </div>
                {isElectron && <a id="titlebar"></a>}
                <License
                    licenseKey={this.state.licenseKey}
                    licenseValid={this.state.licenseValid}
                    trialExpired={this.state.trialExpired}
                    trialRemaining={this.state.trialRemaining}
                    showLicense={this.state.showLicense}
                    activateLicense={this.activateLicense.bind(this)}
                    deactivateLicense={this.deactivateLicense.bind(this)}
                    error={this.state.error}
                    updateLicenseKey={(licenseKey) => this.setState({ licenseKey })}
                    closeLicense={() => this.setState({ showLicense: false })}
                />
                <Filters
                    filters={this.state.filters}
                    show={!this.shouldHideControls}
                    removeFilter={this.removeFilterSymbol.bind(this)}
                />
                <Console
                    consoleRef={this.consoleRef}
                    showConsole={this.state.showConsole}
                    hyperedges={this.state.hyperedges}
                    removeHyperedge={this.removeHyperedge.bind(this)}
                />
                <Interwingle
                    interwingle={this.state.interwingle}
                    toggleInterwingle={this.toggleInterwingle.bind(this)}
                    show={!this.shouldHideControls && this.state.edited}
                />
                <Depth
                    depthRef={this.depthRef}
                    depth={this.state.depth}
                    maxDepth={this.state.maxDepth}
                    show={!this.shouldHideControls && this.state.edited}
                    toggleDepth={this.toggleDepth.bind(this)}
                />
                <Typer
                    inputRef={this.inputRef}
                    input={this.state.input}
                    inputMode={this.dynamicInputMode}
                    setInputMode={this.updateInputMode.bind(this)}
                    isGenerating={this.state.isGenerating}
                    isChatting={this.state.isChatting}
                    loaded={this.state.loaded}
                    toggleChatWindow={this.toggleChatWindow.bind(this)}
                    handleCreateTutorial={this.createThinkMachineTutorial.bind(this)}
                    hyperedges={this.state.hyperedges}
                    symbols={this.uniqueSymbols}
                    handleInput={this.handleInput.bind(this)}
                    removeIndex={this.removeIndexFromHyperedge.bind(this)}
                    changeInput={(input) => {
                        this.setState({ input });
                    }}
                    hyperedge={this.state.hyperedge}
                    show={!this.state.showConsole && !this.shouldHideControls}
                    llm={this.state.llm}
                    edited={this.state.edited}
                />
                <ForceGraph
                    graphType={this.state.graphType}
                    graphRef={this.graphRef}
                    onTick={this.handleTick.bind(this)}
                    onEngineStop={this.handleEngineStop.bind(this)}
                    data={this.state.data}
                    width={this.state.width}
                    height={this.state.height}
                    controlType={this.state.controlType}
                    hideLabels={this.state.hideLabels}
                    onNodeClick={this.handleClickNode.bind(this)}
                    showLabels={!this.state.hideLabels}
                    cooldownTicks={this.state.cooldownTicks}
                />
                <LLMSettings
                    llm={this.state.llm}
                    updateLLM={this.updateLLM.bind(this)}
                    apikeys={this.state.apikeys}
                    updateAPIKeys={this.updateAPIKeys.bind(this)}
                    showLLMSettings={this.state.showLLMSettings}
                    toggleLLMSettings={this.toggleLLMSettings.bind(this)}
                    loaded={this.state.loaded}
                />
                <ChatWindow
                    chatWindow={this.state.chatWindow}
                    chatMessages={this.state.chatMessages}
                    handleChatMessage={this.handleChatMessage.bind(this)}
                    chatInputRef={this.chatInputRef}
                    showChat={this.state.showChat}
                    isChatting={this.state.isChatting}
                    toggleIsChatting={this.toggleIsChatting.bind(this)}
                    toggleChatWindow={this.toggleChatWindow.bind(this)}
                    updateChatWindow={this.updateChatWindow.bind(this)}
                />

                <Footer
                    loaded={this.state.loaded}
                    edited={this.state.edited}
                    isAnimating={this.state.isAnimating}
                    shouldHideControls={this.shouldHideControls}
                    controlType={this.state.controlType}
                    graphRef={this.graphRef}
                    graphType={this.state.graphType}
                    hyperedges={this.state.hyperedges}
                    toggleCamera={this.toggleCamera.bind(this)}
                    toggleAnimation={this.toggleAnimation.bind(this)}
                    toggleGraphType={this.toggleGraphType.bind(this)}
                    toggleWormhole={this.toggleWormhole.bind(this)}
                    toggleLLMSettings={this.toggleLLMSettings.bind(this)}
                    toggleSettingsMenu={this.toggleSettingsMenu.bind(this)}
                    toggleShowLayout={this.toggleShowLayout.bind(this)}
                    toggleShowLabsWarning={this.toggleShowLabsWarning.bind(this)}
                    toggleLicenseWindow={this.toggleLicenseWindow.bind(this)}
                    handleDownload={this.handleDownload.bind(this)}
                    wormholeMode={this.state.wormholeMode}
                    showSettingsMenu={this.state.showSettingsMenu}
                    showLayout={this.state.showLayout}
                    showLabsWarning={this.state.showLabsWarning}
                    cooldownTicks={this.state.cooldownTicks}
                    setCooldownTicks={(cooldownTicks) => {
                        this.setState({ cooldownTicks });
                    }}
                    toggleShowRecordingModal={this.toggleShowRecordingModal.bind(this)}
                    takeScreenshot={this.takeScreenshot.bind(this)}
                />
                <RecordingUI
                    showRecordingModal={this.state.showRecordingModal}
                    toggleShowRecordingModal={this.toggleShowRecordingModal.bind(this)}
                    videoType={this.state.videoType}
                    toggleVideoType={this.toggleVideoType.bind(this)}
                    isRecording={this.state.isRecording}
                    isProcessing={this.state.isProcessing}
                    handleStartRecording={this.handleStartRecording.bind(this)}
                    stopRecord={this.stopRecord.bind(this)}
                />
            </div>
        );
    }
}
