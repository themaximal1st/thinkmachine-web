import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import SpriteText from "three-spritetext";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as Three from "three";

import { ForceGraph3D as ForceGraph3DComponent } from "react-force-graph";
import Settings from "@lib/Settings";
import React from "react";
import ActiveNode from "./active/ActiveNode";

export default class ForceGraph3D extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            media: new Map(),
            explains: new Map(),
            chats: new Map(),
        };
    }

    componentDidMount() {
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 1.5;
        bloomPass.radius = 1;
        bloomPass.threshold = 0;
        this.props.graphRef.current.postProcessingComposer().addPass(bloomPass);
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
                color: "#000000",
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
                title.backgroundColor = "black";
            } else {
                title.color = "rgba(255, 255, 255, 0.5)";
                title.backgroundColor = "rgba(0, 0, 0, 0.5)";
            }
        }

        return title;
    }

    nodeThreeObject(node) {
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

        const activeNodeUI = new ActiveNode({
            ...this.state,
            ...this.props,
            node,
            title,
            setMedia: this.setMedia.bind(this),
            setExplain: this.setExplain.bind(this),
            setChat: this.setChat.bind(this),
        });

        return activeNodeUI.render();
    }
}
