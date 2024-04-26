import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
    ForceGraph2D,
    ForceGraph3D,
    ForceGraphVR,
    ForceGraphAR,
} from "react-force-graph";

import SpriteText from "three-spritetext";
import * as Three from "three";

export default function ForceGraph(params) {
    const props = {
        ref: params.graphRef,
        width: params.width,
        height: params.height,
        controlType: params.controlType,
        backgroundColor: "#000000",
        onNodeClick: params.onNodeClick,
        onBackgroundClick: (e) => {},
        onBackgroundRightClick: (e) => {},
        graphData: params.data,
        showNavInfo: false,
        linkColor: (link) => {
            return link.color || "#333333";
        },
        nodePointerAreaPaint: (node, color, ctx) => {
            return nodePointerAreaPaint(node, color, ctx);
        },
        onEngineTick: params.onTick,
        onEngineStop: params.onEngineStop,
        cooldownTicks: params.cooldownTicks,
        linkDirectionalArrowLength: (link) => {
            if (params.graphType === "3d") {
                return 3;
            } else if (params.graphType === "2d") {
                return 1;
            }

            return 1;
        },
        linkDirectionalArrowRelPos: 1,
        linkCurvature: 0.05,
        linkCurveRotation: 0.5,
        linkWidth: 2,
        linkDirectionalParticleColor: (link) => link.color || "#ffffff",
        linkDirectionalParticleWidth: 2,
        linkDirectionalParticleSpeed: 0.0125,
    };

    let Graph;
    if (params.graphType === "2d") {
        Graph = ForceGraph2D;

        props.nodeLabel = (node) => "";
        props.nodeCanvasObject = (node, ctx, globalScale) => {
            if (params.hideLabels) {
                return null;
            }
            return nodeCanvasObject(node, ctx, globalScale);
        };
    } else if (params.graphType === "3d") {
        Graph = ForceGraph3D;

        props.nodeLabel = (node) => "";
        props.nodeThreeObject = (node) => {
            if (params.hideLabels) {
                return null;
            }
            return nodeThreeObject(node);
        };
    } else if (params.graphType === "vr") {
        Graph = ForceGraphVR;
    } else if (params.graphType === "ar") {
        Graph = ForceGraphAR; // never tested, let me know if it works!
    } else {
        console.error("Invalid graph type");
        throw new Error("Invalid graph type");
    }

    return <Graph {...props} />;
}

ForceGraph.load = function (graphRef, graphType) {
    if (graphType === "3d") {
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 1.25;
        bloomPass.radius = 1;
        bloomPass.threshold = 0;
        graphRef.current.postProcessingComposer().addPass(bloomPass);

        graphRef.current.d3Force("link").distance((link) => {
            return link.length || 50;
        });

        graphRef.current.d3Force("charge").strength((link) => {
            return -50;
        });

        graphRef.current.d3Force("charge").distanceMax(150);
        graphRef.current.d3Force("charge").distanceMin(10);

        graphRef.current.d3Force("center").strength(1);
    } else if (graphType === "2d") {
        graphRef.current.d3Force("link").distance((link) => {
            return link.length || 100;
        });

        graphRef.current.d3Force("charge").strength((link) => {
            return -150;
        });

        graphRef.current.d3Force("charge").distanceMax(400);
        graphRef.current.d3Force("charge").distanceMin(10);

        graphRef.current.d3Force("center").strength(1);
    }
};

function nodeThreeObject(node) {
    if (node.bridge) {
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

    let name = node.name || "";
    if (name.length > 30) {
        name = `${name.substring(0, 27)}...`;
    }
    if (!name) {
        return null;
    }

    const sprite = new SpriteText(name);
    sprite.color = node.color;
    sprite.textHeight = node.textHeight || 8;
    sprite.fontFace = "sans-serif";

    return sprite;
}

function nodeCanvasObject(node, ctx, globalScale) {
    const label = node.name;
    let baseFontSize = 20;
    let exponent = -0.6; // Adjust this value based on testing to find the right feel.
    let fontSize = baseFontSize * Math.pow(globalScale, exponent);

    ctx.font = `${fontSize}px sans-serif`;
    const textWidth = ctx.measureText(label).width;
    const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2); // some padding

    if (!node.bridge) {
        ctx.fillStyle = "rgba(0, 0, 0, 1)";
        ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
        );

        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        ctx.fillStyle = node.color;
        ctx.fillText(label, node.x, node.y);
    }

    node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
}

function nodePointerAreaPaint(node, color, ctx) {
    ctx.fillStyle = color;
    const bckgDimensions = node.__bckgDimensions;
    bckgDimensions &&
        ctx.fillRect(
            node.x - bckgDimensions[0] / 2,
            node.y - bckgDimensions[1] / 2,
            ...bckgDimensions
        );
}
