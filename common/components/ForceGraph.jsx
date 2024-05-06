import { renderToString } from "react-dom/server";

import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
    ForceGraph2D,
    ForceGraph3D,
    ForceGraphVR,
    ForceGraphAR,
} from "react-force-graph";

import SpriteText from "three-spritetext";
import * as Three from "three";
import * as utils from "@lib/utils";
import * as Icons from "@assets/Icons";

let mesh = null;

export default function ForceGraph(params) {
    const props = {
        ref: params.graphRef,
        width: params.width,
        height: params.height,
        controlType: params.controlType,
        backgroundColor: "#000000",
        // onBackgroundClick: (e) => {},
        // onBackgroundRightClick: (e) => {},
        graphData: params.data,
        showNavInfo: false,
        linkColor: (link) => {
            if (params.activeNode) {
                return "rgba(255, 255, 255, 0.04)";
            }

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

        props.onNodeClick = params.onNodeClick;
        props.nodeLabel = (node) => "";
        props.nodeCanvasObject = (node, ctx, globalScale) => {
            if (params.hideLabels) {
                return null;
            }
            return nodeCanvasObject(node, ctx, globalScale);
        };
    } else if (params.graphType === "3d") {
        Graph = ForceGraph3D;

        props.onNodeClick = params.onNodeClick;
        props.extraRenderers = [new CSS2DRenderer()];
        // props.nodeThreeObjectExtend = true;

        props._onNodeClick = async (node) => {
            console.log("NODE", node);

            node.name =
                node.name +
                "This is a much longer label where we explain more information";
            return;

            if (mesh) {
                params.graphRef.current.scene().remove(mesh);
                mesh = null;
            }

            params.graphRef.current.cameraPosition(
                {
                    x: node.x,
                    y: node.y,
                    z: node.z - 100,
                },
                {
                    x: node.x,
                    y: node.y,
                    z: node.z,
                },
                1000
            );

            // await utils.delay(100);

            // Create a canvas element
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");

            // Set canvas size
            canvas.width = 512; // Adjust as needed
            canvas.height = 512; // Adjust as needed

            // Set text styles
            ctx.fillStyle = "white"; // Text color
            ctx.font = "Bold 40px Helvetica"; // Bold text and font size
            ctx.textAlign = "center";
            ctx.textBaseline = "middle";

            // Draw text
            ctx.fillText(node.name, canvas.width / 2, canvas.height / 2);

            // Create a texture from the canvas
            const texture = new THREE.Texture(canvas);
            texture.needsUpdate = true; // Update texture

            const planeGeometry = new THREE.PlaneGeometry(50, 50, 1, 1);
            const planeMaterial = new THREE.MeshLambertMaterial({
                map: texture, // Use the canvas texture
                color: 0xffffff,
                side: THREE.DoubleSide,
            });

            mesh = new THREE.Mesh(planeGeometry, planeMaterial);
            mesh.position.set(node.x - 25 - 10, node.y, node.z);
            mesh.rotation.y = Math.PI; // Rotate 180 degrees around the Y-axis

            params.graphRef.current.scene().add(mesh);

            console.log(params.graphRef.current);
        };

        props.nodeLabel = (node) => "";
        props.nodeThreeObject = (node) => {
            if (params.hideLabels) {
                return null;
            }
            return nodeThreeObject(node, params.activeNode, params.graphRef);
        };
    } else if (params.graphType === "vr") {
        Graph = ForceGraphVR;

        props.nodeThreeObject = (node) => {
            if (params.hideLabels) {
                return null;
            }
            return nodeThreeObject(node);
        };
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
            return link.length || 65;
        });

        graphRef.current.d3Force("charge").strength((link) => {
            return -130;
        });

        graphRef.current.d3Force("charge").distanceMax(300);
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

function nodeThreeObject(node, activeNode = null, graphRef = null) {
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
    // if (name.length > 30) {
    //     name = `${name.substring(0, 27)}...`;
    // }
    if (!name) {
        return null;
    }

    const group = new THREE.Group();

    const title = new SpriteText(name);
    title.color = node.color;
    title.textHeight = node.textHeight || 8;
    title.fontFace = "Helvetica";

    if (activeNode) {
        if (activeNode === node.id) {
            title.backgroundColor = "black";
        } else {
            title.color = "rgba(255, 255, 255, 0.5)";
            title.backgroundColor = "rgba(0, 0, 0, 0.5)";
        }
    }

    if (!activeNode || activeNode !== node.id) {
        return title;
    }

    function calculateTextSize(obj) {
        const bounds = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bounds.getSize(size);
        return size;
    }

    group.add(title);

    const content = new SpriteText(utils.wordWrap(node.content, 80));
    content.color = node.color;
    content.backgroundColor = "black";
    content.padding = 1;
    content.fontSize = 100;
    content.borderRadius = 5;
    content.textHeight = 2;
    content.fontFace = "Helvetica";

    const titleSize = calculateTextSize(title);
    const contentSize = calculateTextSize(content);

    console.log(titleSize);
    console.log(contentSize);

    const contentY = -titleSize.y - contentSize.y / 2 + 2;

    // Calculate the position of the content text relative to the title text
    const contentPosition = new THREE.Vector3(0, contentY, -1); // Adjust the offset as needed
    content.position.copy(contentPosition);

    group.add(content);

    const backgroundColor = hexToRGBA(node.color, 0.5);
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "label";
    buttonsDiv.style.pointerEvents = "auto";
    buttonsDiv.style.userSelect = "all";
    buttonsDiv.innerHTML = `<div 
        style="background-color: ${backgroundColor}"
        class="text-white flex gap-4 items-center justify-between transition-all bg-gray-50 px-3 py-2 rounded-full">
            <button class="flex gap-1 uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
                ${renderToString(Icons.AddIcon(3))}
                Add
            </button>
            <button class="flex gap-1 uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
                ${renderToString(Icons.GenerateIcon(3))}
                Generate
            </button>
            <button class="flex gap-1 uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
                ${renderToString(Icons.SearchIcon(3))}
                Search
            </button>
            <button class="flex gap-1 uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
                ${renderToString(Icons.ChatIcon(3))}
                Chat
            </button>
        </div>`;

    const buttonsPosition = new THREE.Vector3(0, titleSize.y - 2, -1);
    const buttonsContainer = new CSS2DObject(buttonsDiv);
    buttonsContainer.position.copy(buttonsPosition);
    group.add(buttonsContainer);

    return group;
}

function hexToRGBA(hex, alpha) {
    // Remove the hash at the beginning if it's there
    hex = hex.replace(/^#/, "");

    // Parse the hex color string
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    // Return the RGBA color string
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
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
