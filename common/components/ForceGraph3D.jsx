import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import SpriteText from "three-spritetext";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as Three from "three";
import Color from "@lib/Color";
import * as utils from "@lib/utils";

import { ForceGraph3D as ForceGraph3DComponent } from "react-force-graph";
import Settings from "@lib/Settings";
import React from "react";
import ActiveNode from "./active/ActiveNode";
import NodePanel from "./active/NodePanel";

export default class ForceGraph3D extends React.Component {
    constructor(props) {
        super(props);
        this.activeNodeUI = null;
        this.nodePanels = new Map();
        this.state = {
            media: new Map(),
            explains: new Map(),
            chats: new Map(),
            distances: {},
            isDragging: false,
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    // TODO: Check if component is off screen...then bail

    componentDidMount() {
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = Color.bloom.strength;
        bloomPass.radius = Color.bloom.radius;
        bloomPass.threshold = Color.bloom.threshold;
        this.props.graphRef.current.postProcessingComposer().addPass(bloomPass);

        window.addEventListener("keydown", this.handleKeyDown);

        this.props.graphRef.current.controls().addEventListener("start", (e) => {
            this.updateDistances(e);
        });

        // // this.props.graphRef.current.controls().addEventListener("end", (a, b, c) => {
        // //     console.log("END");
        // // });

        this.props.graphRef.current.controls().addEventListener("change", () => {
            this.updateDistances();
        });
    }

    updateDistances(e) {
        if (!this.props.graphRef) return;
        if (!this.props.graphRef.current) return;

        const distances = {};

        for (const node of this.props.graphData.nodes) {
            if (!node.__threeObj) continue;

            const pos = node.__threeObj.position;
            if (!pos) continue;
            if (pos.x === 0 && pos.y === 0 && pos.z === 0) continue;

            const camera = this.props.graphRef.current.camera();
            if (!camera) continue;

            const distance = camera.position.distanceTo(pos);
            distances[node.uuid] = distance;
        }

        for (const panel of this.nodePanels.values()) {
            panel.updateDistance(distances[panel.props.node.uuid]);
        }

        this.state.distances = distances;
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (!this.props.trackedActiveNodeUUID) return;
        if (e.target.tagName !== "BODY") return;
        if (
            e.key !== "ArrowDown" &&
            e.key !== "ArrowUp" &&
            e.key !== "ArrowLeft" &&
            e.key !== "ArrowRight"
        ) {
            return;
        }

        const context = this.nodeContext;
        const node = this.props.schematic.nodeByUUID(this.props.activeNodeUUID);

        if (e.key === "ArrowLeft" && context.prev.length > 0) {
            this.props.setActiveNodeUUID(this.nodePreferenceUUID(context.prev, node));
            return;
        } else if (e.key === "ArrowRight" && context.next.length > 0) {
            this.props.setActiveNodeUUID(this.nodePreferenceUUID(context.next, node));
            return;
        }

        if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
        if (context.stack.length <= 1) return;
        const incr = e.key === "ArrowDown" ? 1 : -1;

        let idx = context.stack.indexOf(node) + incr;
        if (idx >= context.stack.length) idx = 0;
        if (idx < 0) idx = context.stack.length - 1;

        this.props.setActiveNodeUUID(context.stack[idx].uuid);
    }

    nodePreferenceUUID(nodes, node) {
        for (const n of nodes) {
            if (n.hyperedge.uuid === node.hyperedge.uuid && n.uuid !== node.uuid) {
                return n.uuid;
            }
        }

        return nodes[0].uuid;
    }

    setMedia(id, m = []) {
        const media = this.state.media;
        media.set(id, m);
        this.setState({ media });
    }

    setExplain(id, explain = "") {
        const explains = this.state.explains;
        explains.set(id, explain);
        this.setState({ explains });
    }

    setChat(id, chat = "") {
        const chats = this.state.chats;
        chats.set(id, chat);
        this.setState({ chats });
    }

    get clonedGraphData() {
        return JSON.parse(JSON.stringify(this.props.graphData));
    }

    get nodeContext() {
        if (!this.props.activeNodeUUID) {
            return null;
        }

        console.log("UUID", this.props.activeNodeUUID);
        const node = this.props.schematic.nodeByUUID(this.props.activeNodeUUID);
        console.log("NODE", node);
        console.log("GRAPH DATA", this.props.graphData);

        return node.context(this.props.graphData);
    }

    render() {
        return (
            <ForceGraph3DComponent
                ref={this.props.graphRef} // won't allow in prop?
                controlType={Settings.controlType}
                nodeThreeObject={this.nodeThreeObject.bind(this)}
                extraRenderers={[new CSS2DRenderer()]}
                onEngineTick={this.updateDistances.bind(this)}
                {...this.props}
            />
        );
    }

    nodeThreeBridgeObject(node) {
        const mesh = new Three.Mesh(
            new Three.SphereGeometry(1),
            new Three.MeshLambertMaterial({
                color: Color.backgroundColor,
                transparent: true,
                opacity: 0.25,
            })
        );
        return mesh;
    }

    nodeThreeTitleObject(node) {
        if (!node.name || node.name.length === 0) {
            return null;
        }

        let name = node.name;

        if (name.length > 30) {
            name = `${name.substring(0, 27)}...`;
        }

        const title = new SpriteText(name);
        title.color = node.color;
        title.textHeight = node.textHeight || 10;
        title.fontFace = "Helvetica";

        if (this.props.trackedActiveNodeUUID) {
            if (this.props.trackedActiveNodeUUID === node.uuid) {
                title.backgroundColor = Color.backgroundColor;
            } else {
                title.color = utils.hexToRGBA(Color.textColor, 0.5);
                title.backgroundColor = utils.hexToRGBA(Color.backgroundColor, 0.5);
            }
        } else {
            title.backgroundColor = Color.backgroundColor;
        }

        return title;
    }

    nodeThreeObject(node) {
        // if (this.activeNodeUI && this.activeNodeUI.props.node.uuid === node.uuid) {
        //     this.activeNodeUI.unload();
        //     this.activeNodeUI = null;
        // }

        if (this.props.hideLabels) {
            return null;
        }

        if (node.bridge) {
            return this.nodeThreeBridgeObject(node);
        }

        const title = this.nodeThreeTitleObject(node);

        if (
            !this.props.trackedActiveNodeUUID ||
            this.props.trackedActiveNodeUUID !== node.uuid
        ) {
            return title;
        }

        // console.log("NODE DISTANCE", this.state.distances[node.uuid]);
        const existingNodePanel = this.nodePanels.get(node.uuid);
        if (existingNodePanel) {
            console.log("RENDERING EXISTING NODE PANEL");
            console.log(existingNodePanel);
            return existingNodePanel.render();
        }

        // leaving react here...
        const nodePanel = new NodePanel({
            ...this.state,
            ...this.props,
            node,
            title,
            distance: this.state.distances[node.uuid],
            // context: this.nodeContext,
            // setMedia: this.setMedia.bind(this),
            // setExplain: this.setExplain.bind(this),
            // setChat: this.setChat.bind(this),
        });

        this.nodePanels.set(node.uuid, nodePanel);

        return nodePanel.render();

        // this.activeNodeUI = new ActiveNode({
        //     ...this.state,
        //     ...this.props,
        //     node,
        //     title,
        //     context: this.nodeContext,
        //     setMedia: this.setMedia.bind(this),
        //     setExplain: this.setExplain.bind(this),
        //     setChat: this.setChat.bind(this),
        // });

        // return this.activeNodeUI.render();
    }
}
