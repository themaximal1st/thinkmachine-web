import { renderToStaticMarkup } from "react-dom/server";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import classNames from "classnames";
// import * as Three from "three";

import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import SpriteText from "three-spritetext";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as Three from "three";
import Color from "@lib/Color";
import * as utils from "@lib/utils";

import { ForceGraph3D as ForceGraph3DComponent } from "react-force-graph";
import Settings from "@lib/Settings";
import React from "react";
import { useCallback } from "react";

// import ActiveNode from "./active/ActiveNode";
// import NodePanel from "./active/NodePanel";

export default class ForceGraph3D extends React.Component {
    constructor(props) {
        super(props);
        this.activeNodeUI = null;
        this.activeNodeRef = React.createRef();
        this.nodePanels = new Map();
        this.state = {
            media: new Map(),
            explains: new Map(),
            chats: new Map(),
            distances: {},
            isDragging: false,
            edgehash: null,
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
        this.nodeThreeObject = this.nodeThreeObject.bind(this);
        // this.updateDistances = this.updateDistances.bind(this);
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
        if (!this.props) return;
        if (!this.props.graphRef) return;
        if (!this.props.graphRef.current) return;

        const distances = this.state.distances;

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

        // for (const panel of this.nodePanels.values()) {
        //     panel.updateDistance(distances[panel.props.node.uuid]);
        // }

        this.setState({ distances });
        // this.state.distances = distances;
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    componentDidUpdate(prevProps) {
        if (this.props.schematic.edgehash !== this.state.edgehash) {
            // console.log("🥸 UPDATER", this.props.schematic.hash, this.state.hash);
            this.setState({ edgehash: this.props.schematic.edgehash });

            // this.props.graphRef.current.refresh();
        } else if (this.props.activeNodeUUID !== prevProps.activeNodeUUID) {
            // if (this.activeNodeUI) {
            //     this.activeNodeUI.render();
            // }
            this.props.graphRef.current.refresh();
        }

        // if (
        //     this.props.activeNodeUUID &&
        //     prevProps.activeNodeUUID !== this.props.activeNodeUUID
        // ) {
        //     this.props.graphRef.current.refresh();
        // }
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

        const node = this.props.schematic.nodeByUUID(this.props.activeNodeUUID);
        return node.context(this.props.graphData);
    }

    onChange(e, h) {
        console.log("ON CHANGE");
        h.hypertext = e.target.value;
    }

    render() {
        // console.log("🎄 FORCE GRAPH 3D RENDER");
        let hypertexts = [];
        if (this.props.activeNodeUUID) {
            const node = this.props.schematic.nodeByUUID(this.props.activeNodeUUID);
            if (node) {
                hypertexts = node.hypertexts || [];
            }
        }
        const distance = this.state.distances[this.props.activeNodeUUID] || Infinity;

        return (
            <div>
                <ForceGraph3DComponent
                    ref={this.props.graphRef} // won't allow in prop?
                    controlType={Settings.controlType}
                    nodeThreeObject={this.nodeThreeObject}
                    extraRenderers={[new CSS2DRenderer()]}
                    onEngineTick={this.updateDistances}
                    {...this.props}
                />
                <div id="active-panel-wrapper" ref={this.activeNodeRef}>
                    <div
                        style={{ transform: `scale(${100 / distance})` }}
                        id="active-panel">
                        <div>{Math.random()}</div>
                        <div>{distance}</div>
                        {this.props.activeNodeUUID}
                        {hypertexts.map((h, idx) => (
                            <input
                                key={`hypertext-${h.uuid}-${idx}`}
                                id={`hypertext-${h.uuid}-${idx}`}
                                data-index={idx}
                                onChange={(e) => this.onChange(e, h)}
                                value={h.hypertext}
                            />
                        ))}
                        <button
                            className="pointer-events-auto"
                            onClick={() => alert(`CLICKED ${this.props.activeNodeUUID}`)}>
                            CLICK
                        </button>
                    </div>
                </div>
            </div>
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

    static calculateTextSize(obj = null) {
        if (!obj) return new THREE.Vector3(0, 0, 0);
        const bounds = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bounds.getSize(size);
        return size;
    }

    wrap(div, title) {
        const obj = new CSS2DObject(div);
        const group = new Three.Group();
        if (title) {
            group.add(title);
        }
        group.add(obj);

        const titleSize = ForceGraph3D.calculateTextSize(title);
        const objSize = ForceGraph3D.calculateTextSize(obj);

        const contentY = -titleSize.y - objSize.y / 2 + 2;

        obj.position.copy(new THREE.Vector3(0, contentY, -1));
        return group;
    }

    nodeThreeObject(node) {
        // if (
        //     this.props.activeNodeUUID &&
        //     this.props.activeNodeUUID === node.uuid &&
        //     this.group
        // ) {
        //     return this.group;
        //     // console.log("EXISTING!", this.activeNodeUI.group);
        //     // return this.activeNodeUI.render();
        //     // this.activeNodeUI.unload();
        //     // this.activeNodeUI = null;
        // }

        if (this.props.hideLabels) {
            return null;
        }

        if (node.bridge) {
            return this.nodeThreeBridgeObject(node);
        }

        const title = this.nodeThreeTitleObject(node);

        // console.log("GOOOOOOOOOOOOOOOD", this.props.activeNodeUUID);
        // console.log("GOOOOOOOOOOOOOOOD", this.props.trackedActiveNodeUUID);

        // if (
        //     !this.props.trackedActiveNodeUUID ||
        //     this.props.trackedActiveNodeUUID !== node.uuid
        // ) {
        //     return title;
        // }

        if (!this.props.activeNodeUUID || this.props.activeNodeUUID !== node.uuid) {
            return title;
        }

        console.log(`nodeThreeObject running ${node.id}`);

        // const div = document.getElementById("active-panel");
        // if (!div) return title;

        console.log(this.activeNodeRef.current);

        this.group = this.wrap(this.activeNodeRef.current, title);
        return this.group;
        // return title;
        // return title;

        /*
        // console.log("NODE DISTANCE", this.state.distances[node.uuid]);
        const existingNodePanel = this.nodePanels.get(node.uuid);
        if (existingNodePanel) {
            console.log("RENDERING EXISTING NODE PANEL");
            console.log(existingNodePanel);
            return existingNodePanel.render();
        }
            */

        // let activePanel = this.activePanels.get(node.id);
        // if (activePanel) {
        //     console.log("RENDERING EXISTING ACTIVE PANEL");
        //     activePanel.unload();
        // }

        // leaving react here...
        /*
        this.activeNodeUI = new ActiveNode({
            // ...this.state,
            ...this.props,
            node,
            title,
            // distance: this.state.distances[node.uuid],
            // context: this.nodeContext,
            // setMedia: this.setMedia.bind(this),
            // setExplain: this.setExplain.bind(this),
            // setChat: this.setChat.bind(this),
        });

        // this.nodePanels.set(node.uuid, nodePanel);

        return this.activeNodeUI.render();
        */

        /*
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
        */
    }
}
