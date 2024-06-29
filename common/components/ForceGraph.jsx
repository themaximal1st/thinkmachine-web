import React from "react";

import ForceGraph3D from "./ForceGraph3D";
import ForceGraph2D from "./ForceGraph2D";
import Settings from "@lib/Settings";
import Camera from "@lib/Camera";
import * as utils from "@lib/utils";
import RecorderModal from "@components/RecorderModal";
import Animation from "@lib/Animation";
import Color from "@lib/Color";

export default class ForceGraph extends React.Component {
    constructor() {
        super(...arguments);
        this.graphRef = React.createRef();
        this.camera = new Camera(this.graphRef);
        this.animation = new Animation(this.graphRef);
        this.recorder = null;
        this.state = {
            connectMode: false,
            isAnimating: false,
            activeMode: Settings.activeMode,
            hideLabels: Settings.hideLabels,
            graphType: Settings.graphType,
            width: window.innerWidth,
            height: window.innerHeight,
        };
        this.handleResize = this.handleResize.bind(this);
    }

    get is2D() {
        return this.state.graphType === "2d";
    }

    get is3D() {
        return this.state.graphType === "3d";
    }

    get isVR() {
        return this.state.graphType === "vr";
    }

    get isAR() {
        return this.state.graphType === "ar";
    }

    componentDidMount() {
        window.addEventListener("resize", this.handleResize);
        this.setupForces();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize);
    }

    componentDidUpdate(prevProps, prevState) {
        // difference between prevProps and this.props
        // console.log("😇 ForceGraph componentDidUpdate", this.props);
        if (prevProps.trackedActiveNodeUUID !== this.props.trackedActiveNodeUUID) {
            this.updateCamera(true, 100, prevProps.graphData).then(() => {
                this.emitLinkParticles(prevProps.graphData);
            });
        } else if (this.props.trackedActiveNodeUUID) {
            // this.updateCamera(true, 400, prevProps.graphData).then(() => {
            //     // this.emitLinkParticles(prevProps.graphData);
            // });
        }

        // if (prevProps.graphData !== this.props.graphData) {
        //     this.updateCamera(false, delay, prevProps.graphData).then(() => {
        //         this.emitLinkParticles(prevProps.graphData);
        //     });
        // }
    }

    setActiveMode(activeMode) {
        this.setState({ activeMode });
        Settings.activeMode = activeMode;
    }

    toggleConnectMode(connectMode = undefined) {
        connectMode = connectMode === undefined ? !this.state.connectMode : connectMode;
        this.setState({ connectMode });
    }

    toggleAnimation(val) {
        const isAnimating = val === undefined ? !this.state.isAnimating : val;

        if (isAnimating) {
            this.animation.start();
        } else {
            this.animation.stop();
        }

        this.setState({ isAnimating });
    }

    render() {
        // console.log("😇 ForceGraph render");

        const props = {
            ...defaultProps,
            ...this.props,
            ...this.state,
            width: this.width,
            graphRef: this.graphRef,
            linkColor: this.linkColor.bind(this),
            linkDirectionalArrowLength: this.linkDirectionalArrowLength.bind(this),
            setActiveMode: this.setActiveMode.bind(this),
            toggleConnectMode: this.toggleConnectMode.bind(this),
            onNodeClick: this.handleNodeClick.bind(this),
            onEngineStop: this.handleEngineStop.bind(this),
        };

        return (
            <div
                id="force-graph"
                className={this.state.connectMode ? "cursor-crosshair" : ""}>
                {this.is2D && <ForceGraph2D {...props} />}
                {this.is3D && <ForceGraph3D {...props} />}
                <RecorderModal
                    thinkabletype={this.props.schematic}
                    animation={this.animation}
                    toggleAnimation={this.toggleAnimation.bind(this)}
                    graphRef={this.graphRef}
                    reloadData={this.props.reloadData.bind(this)}
                />
            </div>
        );
    }

    linkColor(link) {
        if (this.props.trackedActiveNodeUUID) {
            return utils.hexToRGBA(Color.textColor, 0.25);
        }

        return link.color || Color.textColor;
    }

    linkDirectionalArrowLength(link) {
        if (this.is3D) {
            return 3;
        }

        return 1;
    }

    handleNodeClick(node, e) {
        // don't allow clicking through active node UI
        if (this.props.trackedActiveNodeUUID && e.srcElement.tagName !== "CANVAS") {
            return;
        }

        if (this.state.connectMode) {
            this.setState({ connectMode: false });

            if (this.props.trackedActiveNodeUUID === node.uuid) {
                return;
            }

            const fromNode = this.props.schematic.nodeByUUID(
                this.props.trackedActiveNodeUUID
            );
            const toNode = this.props.schematic.nodeByUUID(node.uuid);
            fromNode.connect(toNode);
            return;
        }

        console.log("CLICKED NODE", node.uuid);

        this.props.setActiveNodeUUID(node.uuid);
        this.setState({ dirty: true });
    }

    handleResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    get width() {
        if (this.props.panes.editor) {
            return this.state.width - 600;
        }

        return this.state.width;
    }

    setupForces() {
        if (!this.graphRef.current) return;

        this.graphRef.current.d3Force("link").distance((link) => {
            return link.length || defaultForces.link.distance;
        });

        this.graphRef.current.d3Force("charge").strength((link) => {
            return defaultForces.charge.strength;
        });

        this.graphRef.current
            .d3Force("charge")
            .distanceMax(defaultForces.charge.distanceMax);

        this.graphRef.current
            .d3Force("charge")
            .distanceMin(defaultForces.charge.distanceMin);

        this.graphRef.current.d3Force("center").strength(defaultForces.center.strength);
    }

    handleEngineStop() {
        // console.log("STOP");
    }

    emitLinkParticles(oldData) {
        const links = utils.linkChanges(this.props.graphData, oldData);
        for (const link of links) {
            this.graphRef.current.emitParticle(link);
        }
    }

    async updateCamera(shouldZoom = false, delay = 100, oldData) {
        this.camera.props = {
            ...this.props,
            ...this.state,
            graphRef: this.graphRef,
        };

        if (this.props.trackedActiveNodeUUID) {
            await this.camera.zoomToNode(this.props.trackedActiveNodeUUID, delay);
        } else {
            // await this.camera.stableZoom(shouldZoom, delay, oldData);
        }
    }
}

const defaultProps = {
    backgroundColor: Color.backgroundColor,
    showNavInfo: false,
    cooldownTicks: 100,
    linkDirectionalArrowRelPos: 1,
    linkCurvature: 0.05,
    linkCurveRotation: 0.5,
    linkWidth: 2,
    linkDirectionalParticleColor: (link) => link.color || Color.textColor,
    linkDirectionalParticleWidth: 2,
    linkDirectionalParticleSpeed: 0.0125,
    nodeLabel: (node) => "",
};

const defaultForces = {
    link: {
        distance: 100,
    },
    charge: {
        strength: -250,
        distanceMax: 400,
        distanceMin: 100,
    },
    center: {
        strength: 1,
    },
};
