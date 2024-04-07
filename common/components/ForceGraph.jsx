import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import ForceGraph3D from "react-force-graph-3d";
import ForceGraph2D from "react-force-graph-2d";

import SpriteText from "three-spritetext";
import * as Three from "three";

import { useState } from "react";

export default function ForceGraph(params) {
    const Graph = params.graphType === "3d" ? ForceGraph3D : ForceGraph2D;

    return (
        <Graph
            nodeLabel={(node) => ""}
            ref={params.graphRef}
            width={params.width}
            height={params.height}
            controlType={params.controlType}
            backgroundColor="#000000"
            onNodeClick={params.onNodeClick}
            graphData={params.data}
            showNavInfo={false}
            linkColor={(link) => {
                return link.color || "#333333";
            }}
            nodeCanvasObject={(node, ctx, globalScale) => {
                if (params.hideLabels) {
                    return null;
                }
                return nodeCanvasObject(node, ctx, globalScale);
            }}
            nodeThreeObject={(node) => {
                if (params.hideLabels) {
                    return null;
                }
                return nodeThreeObject(node);
            }}
            nodePointerAreaPaint={(node, color, ctx) => {
                return nodePointerAreaPaint(node, color, ctx);
            }}
            onEngineTick={params.onTick}
            onEngineStop={params.onEngineStop}
            cooldownTicks={params.cooldownTicks}
            linkDirectionalArrowLength={(link) => {
                if (params.graphType === "3d") {
                    return 3;
                }

                return 1;
            }}
            linkDirectionalArrowRelPos={1}
            linkCurvature={0.05}
            linkCurveRotation={0.5}
            linkWidth={2}
            linkDirectionalParticleColor={(link) => link.color || "#ffffff"}
            linkDirectionalParticleWidth={2}
            linkDirectionalParticleSpeed={0.025}
        />
    );
}

ForceGraph.load = function (graphRef, graphType) {
    if (graphType === "3d") {
        graphRef.current.d3Force("link").distance((link) => {
            return link.length || 40;
        });

        graphRef.current.d3Force("charge").strength((link) => {
            return -100;
        });

        graphRef.current.d3Force("charge").distanceMax(100);
        graphRef.current.d3Force("charge").distanceMin(10);

        graphRef.current.d3Force("center").strength(1);

        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 1.25;
        bloomPass.radius = 1;
        bloomPass.threshold = 0;
        graphRef.current.postProcessingComposer().addPass(bloomPass);
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
