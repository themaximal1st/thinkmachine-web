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

export default class ForceGraph3D extends React.Component {
    constructor(props) {
        super(props);
        this.activeNodeUI = null;
        this.state = {
            media: new Map(),
            explains: new Map(),
            chats: new Map(),
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = Color.bloom.strength;
        bloomPass.radius = Color.bloom.radius;
        bloomPass.threshold = Color.bloom.threshold;
        this.props.graphRef.current.postProcessingComposer().addPass(bloomPass);

        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (!this.props.activeNodeUUID) return;
        if (e.target.tagName !== "BODY") return;

        const context = this.nodeContext;
        if (e.key === "ArrowLeft" && context.prev.length > 0) {
            const node = context.prev[0];
            this.props.setActiveNodeUUID(node.uuid);
        } else if (e.key === "ArrowRight" && context.next.length > 0) {
            const node = context.next[0];
            this.props.setActiveNodeUUID(node.uuid);
        }
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

        const node = this.props.thinkabletype.nodeByUUID(this.props.activeNodeUUID);
        return node.context(this.props.graphData);
    }

    render() {
        return (
            <ForceGraph3DComponent
                ref={this.props.graphRef} // won't allow in prop?
                controlType={Settings.controlType}
                nodeThreeObject={this.nodeThreeObject.bind(this)}
                extraRenderers={[new CSS2DRenderer()]}
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

        if (this.props.activeNodeUUID) {
            if (this.props.activeNodeUUID === node.uuid) {
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
        if (this.activeNodeUI && this.activeNodeUI.props.node.uuid === node.uuid) {
            this.activeNodeUI.unload();
            this.activeNodeUI = null;
        }

        if (this.props.hideLabels) {
            return null;
        }

        if (node.bridge) {
            return this.nodeThreeBridgeObject(node);
        }

        const title = this.nodeThreeTitleObject(node);

        if (!this.props.activeNodeUUID || this.props.activeNodeUUID !== node.uuid) {
            return title;
        }

        // leaving react here...

        this.activeNodeUI = new ActiveNode({
            ...this.state,
            ...this.props,
            node,
            title,
            context: this.nodeContext,
            setMedia: this.setMedia.bind(this),
            setExplain: this.setExplain.bind(this),
            setChat: this.setChat.bind(this),
        });

        return this.activeNodeUI.render();
    }
}
