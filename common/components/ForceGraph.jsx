import { renderToString } from "react-dom/server";
import { marked } from "marked";

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
        props.nodeLabel = (node) => "";
        props.nodeThreeObject = (node) => {
            if (params.hideLabels) {
                return null;
            }
            return nodeThreeObject(node, params.activeNode, params);
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

function linkContent(node, data) {
    if (!node.content || node.content.length === 0) return "";

    // return node.content;

    let markdown = marked.parse(node.content);
    markdown = markdown.replace(/[\[\]]*/g, "");
    markdown = markdown.replace(/\([a-zA-Z0-9\_\-]*\)*/g, "");

    // replace all links with javascript call
    markdown = markdown.replace(
        /<a href="([^"]*)">([^<]*)<\/a>/g,
        `<a href="javascript:window.api.node.activateSlug('$1')">$2</a>`
    );

    const randomId = `id-${String(Math.floor(Math.random() * 1000000))}`;
    const color = hexToRGBA(node.color, 1);
    const css = `#${randomId} a { color: ${color}; } `;
    return `<style>${css}</style><div id="${randomId}">${markdown}</div>`;
}

function nodeThreeObject(node, activeNode = null, params) {
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

    group.add(title);

    const titleSize = calculateTextSize(title);

    // TODO: These flash...ideas. put them on a canvas? put them on another div? will that still flash?
    // TODO: Image search needs a little more context — include the hyperedges?

    // const contentColor = hexToRGBA("#000000", 0.5);
    // const contentDiv = document.createElement("div");
    // contentDiv.className = "label";
    // contentDiv.style.pointerEvents = "auto";
    // contentDiv.style.userSelect = "all";
    // // if (node.content) {

    // contentDiv.innerHTML = renderToString(<div className="text-white">BOOM TOWN</div>);

    // contentDiv.appendChild(image);

    // const contentContainer = new CSS2DObject(contentDiv);
    // const contentSize = calculateTextSize(contentContainer);

    // const contentY = -titleSize.y - contentSize.y / 2 + 2;

    // // Calculate the position of the content text relative to the title text
    // const contentPosition = new THREE.Vector3(0, contentY, -1); // Adjust the offset as needed
    // contentContainer.position.copy(contentPosition);
    // group.add(contentContainer);

    // return group;

    const contentColor = hexToRGBA("#000000", 0.5);
    const contentDiv = document.createElement("div");
    contentDiv.className = "label";
    contentDiv.style.pointerEvents = "auto";
    contentDiv.style.userSelect = "all";
    // if (node.content) {
    contentDiv.innerHTML = `
<div class="select-text absolute top-0 -ml-[250px] w-[500px] text-white bg-gray-1000 rounded-lg flex flex-col gap-3 pt-1">
    <div class="text-white flex gap-6 items-center transition-all bg-gray-1000 rounded-full p-3 pb-0">
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
            ${renderToString(Icons.ChatIcon(3))}
            Edit
        </button>
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
            ${renderToString(Icons.AddIcon(3))}
            Add
        </button>
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
            ${renderToString(Icons.GenerateIcon(3))}
            Generate
        </button>
        <div class="grow"></div>
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='alert("Clicked ${name}")'>
            ${renderToString(Icons.SearchIcon(3))}
            Search
        </button>
    </div>


    <div class="px-3 overflow-y-hidden">
    ${linkContent(node, params.data)}
    </div>

    <div class="flex gap-3 px-3 overflow-x-scroll images h-16">
    </div>

    <input type="text" class="w-full h-full bg-gray-1000 focus:bg-gray-800 focus:outline-none p-3 py-2 rounded-b-lg text-sm" placeholder="What do you want to know?" />
</div>`;

    if (node.images) {
        for (const { thumbnail } of node.images) {
            const image = params.getCachedImage(thumbnail);
            contentDiv.querySelector(".images").appendChild(image);
        }
    }

    const contentContainer = new CSS2DObject(contentDiv);
    const contentSize = calculateTextSize(contentContainer);

    const contentY = -titleSize.y - contentSize.y / 2 + 2;

    // Calculate the position of the content text relative to the title text
    const contentPosition = new THREE.Vector3(0, contentY, -1); // Adjust the offset as needed
    contentContainer.position.copy(contentPosition);
    group.add(contentContainer);

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

function calculateTextSize(obj) {
    const bounds = new THREE.Box3().setFromObject(obj);
    const size = new THREE.Vector3();
    bounds.getSize(size);
    return size;
}

import React, { useEffect, useRef } from "react";

function ImageCache({ imageUrls }) {
    const imageCacheRef = useRef(null);

    useEffect(() => {
        // Ensure the cache container exists
        if (imageCacheRef.current) {
            // Clear existing images
            imageCacheRef.current.innerHTML = "";

            // Cache new images
            imageUrls.forEach((url) => {
                const img = document.createElement("img");
                img.src = url;
                img.style.display = "none"; // Make sure it's hidden
                imageCacheRef.current.appendChild(img);
            });
        }
    }, [imageUrls]); // Dependency on imageUrls to update cache when URLs change

    // The image elements are stored in a hidden div and can be accessed by their src
    return (
        <div ref={imageCacheRef} style={{ display: "none" }}>
            {/* This div will hold cached images, not visible to users */}
        </div>
    );
}
