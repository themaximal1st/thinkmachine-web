import React from "react";
import ForceGraph3D from "./ForceGraph3D";
import ForceGraph2D from "./ForceGraph2D";
import Settings from "@lib/Settings";
import Camera from "@lib/Camera";
import * as utils from "@lib/utils";

export default class ForceGraph extends React.Component {
    constructor() {
        super(...arguments);
        this.graphRef = React.createRef();
        this.camera = new Camera(this.graphRef);
        this.state = {
            connectMode: false,
            activeMode: "Explain",
            hideLabels: Settings.get("hideLabels", false),
            graphType: Settings.graphType,
            width: window.innerWidth,
            height: window.innerHeight,
        };
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
        window.addEventListener("resize", this.handleResize.bind(this));
        this.setupForces();
    }

    componentWillUnmount() {
        window.removeEventListener("resize", this.handleResize.bind(this));
    }

    componentDidUpdate(prevProps, prevState) {
        let delay = 100;
        if (prevProps.activeNodeUUID !== this.props.activeNodeUUID) {
            this.updateCamera(true, 100, prevProps.graphData);
            delay = 400;
        } else if (this.props.activeNodeUUID) {
            delay = 400;
        }

        if (prevProps.graphData !== this.props.graphData) {
            this.updateCamera(false, delay, prevProps.graphData).then(() => {
                this.emitLinkParticles(prevProps.graphData);
            });
        }
    }

    setActiveMode(activeMode) {
        this.setState({ activeMode });
    }

    toggleConnectMode(connectMode = undefined) {
        connectMode = connectMode === undefined ? !this.state.connectMode : connectMode;
        this.setState({ connectMode });
    }

    render() {
        const props = {
            ...defaultProps,
            ...this.props,
            ...this.state,
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
            </div>
        );
    }

    linkColor(link) {
        if (this.props.activeNodeUUID) {
            return "rgba(255, 255, 255, 0.04)";
        }

        return link.color || "#333333";
    }

    linkDirectionalArrowLength(link) {
        if (this.is3D) {
            return 3;
        }

        return 1;
    }

    handleNodeClick(node, e) {
        // don't allow clicking through active node UI
        if (this.props.activeNodeUUID && e.srcElement.tagName !== "CANVAS") {
            return;
        }

        if (this.state.connectMode) {
            this.setState({ connectMode: false });

            if (this.props.activeNodeUUID === node.uuid) {
                return;
            }

            const fromNode = this.props.thinkabletype.nodeByUUID(
                this.props.activeNodeUUID
            );
            const toNode = this.props.thinkabletype.nodeByUUID(node.uuid);
            fromNode.connect(toNode);
            return;
        }

        this.props.setActiveNodeUUID(node.uuid);
    }

    handleResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
    }

    setupForces() {
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

        if (this.props.activeNodeUUID) {
            await this.camera.zoomToNode(this.props.activeNodeUUID, delay);
        } else {
            await this.camera.stableZoom(shouldZoom, delay, oldData);
        }
    }
}

const defaultProps = {
    backgroundColor: "#000000", // light mode vs dark mode
    showNavInfo: false,
    cooldownTicks: 100,
    linkDirectionalArrowRelPos: 1,
    linkCurvature: 0.05,
    linkCurveRotation: 0.5,
    linkWidth: 2,
    linkDirectionalParticleColor: (link) => link.color || "#ffffff",
    linkDirectionalParticleWidth: 2,
    linkDirectionalParticleSpeed: 0.0125,
    nodeLabel: (node) => "",
};

const defaultForces = {
    link: {
        distance: 65,
    },
    charge: {
        strength: -130,
        distanceMax: 300,
        distanceMin: 10,
    },
    center: {
        strength: 1,
    },
};
