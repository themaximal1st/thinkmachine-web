import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import ForceGraph3D from "react-force-graph-3d";

import SpriteText from "three-spritetext";
import * as Three from "three";

export default function ForceGraph(params) {
    if (params.controlType === "fly") {
        console.log("FLY");
        return (
            <ForceGraph3D
                nodeLabel={(node) => ""}
                ref={params.graphRef}
                width={params.width}
                height={params.height}
                controlType="fly"
                backgroundColor="#000000"
                onNodeClick={params.onNodeClick}
                graphData={params.data}
                showNavInfo={false}
                linkColor={(link) => {
                    return link.color || "#333333";
                }}
                nodeThreeObject={(node) => {
                    if (params.hideLabels) {
                        return null;
                    }
                    return nodeThreeObject(node);
                }}
                linkDirectionalArrowLength={(link) => {
                    return 5;
                }}
                linkDirectionalArrowRelPos={1}
                linkWidth={2}
            />
        );
    } else if (params.controlType === "orbit") {
        console.log("ORBIT");
        return (
            <ForceGraph3D
                nodeLabel={(node) => ""}
                ref={params.graphRef}
                width={params.width}
                height={params.height}
                controlType="orbit"
                backgroundColor="#000000"
                onNodeClick={params.onNodeClick}
                graphData={params.data}
                showNavInfo={false}
                linkColor={(link) => {
                    return link.color || "#333333";
                }}
                nodeThreeObject={(node) => {
                    if (params.hideLabels) {
                        return null;
                    }
                    return nodeThreeObject(node);
                }}
                linkDirectionalArrowLength={(link) => {
                    return 5;
                }}
                linkDirectionalArrowRelPos={1}
                linkWidth={2}
            />
        );
    }
    return null;
}

ForceGraph.load = function (graphRef) {
    graphRef.current.d3Force("link").distance((link) => {
        return link.length || 50;
    });

    const bloomPass = new UnrealBloomPass();
    bloomPass.strength = 1;
    bloomPass.radius = 1;
    bloomPass.threshold = 0;
    graphRef.current.postProcessingComposer().addPass(bloomPass);
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

    return sprite;
}
