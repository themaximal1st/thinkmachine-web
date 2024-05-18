import { renderToString } from "react-dom/server";
import { marked } from "marked";

import { CSS2DRenderer, CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import { useState, useEffect } from "react";

import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import {
    ForceGraph2D,
    ForceGraph3D,
    ForceGraphVR,
    ForceGraphAR,
} from "react-force-graph";

import SpriteText from "three-spritetext";
import * as Three from "three";
import * as Icons from "@assets/Icons";

export default function ForceGraph(params) {
    const props = {
        ref: params.graphRef,
        width: params.width,
        height: params.height,
        controlType: params.controlType,
        backgroundColor: "#000000",
        graphData: params.data,
        showNavInfo: false,
        linkColor: (link) => {
            if (params.activeNodeId) {
                return "rgba(255, 255, 255, 0.04)";
            }

            return link.color || "#333333";
        },
        nodePointerAreaPaint: (node, color, ctx) => {
            return nodePointerAreaPaint(node, color, ctx);
        },
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
            return nodeThreeObject(node, params.activeNodeId, params);
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

function linkContent(content, hexColor) {
    if (!content || content.length === 0) return "";

    let markdown = marked.parse(content);
    markdown = markdown.replace(/[\[\]]*/g, "");
    markdown = markdown.replace(/\([a-zA-Z0-9\_\-]*\)*/g, "");

    // replace all links with javascript call
    markdown = markdown.replace(
        /<a href="([^"]*)">([^<]*)<\/a>/g,
        `<a href="javascript:window.api.node.activateSlug('$1')">$2</a>`
    );

    const randomId = `id-${String(Math.floor(Math.random() * 1000000))}`;
    const color = hexToRGBA(hexColor, 1);
    const css = `#${randomId} a { color: ${color}; } `;
    return `<style>${css}</style><div id="${randomId}">${markdown}</div>`;
}

function nodeThreeObject(node, activeNodeId = null, params) {
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

    if (activeNodeId) {
        if (activeNodeId === node.id) {
            title.backgroundColor = "black";
        } else {
            title.color = "rgba(255, 255, 255, 0.5)";
            title.backgroundColor = "rgba(0, 0, 0, 0.5)";
        }
    }

    if (!activeNodeId || activeNodeId !== node.id) {
        return title;
    }

    group.add(title);

    const titleSize = calculateTextSize(title);

    const contentDiv = document.createElement("div");
    contentDiv.className = "pointer-events-auto mt-8 w-[700px]";

    if (params.isEditing) {
        contentDiv.innerHTML = `
<div class="bg-gray-1000 absolute top-0 w-[700px] rounded-lg text-white gap-3">
    <form class="flex gap-6 items-center transition-all rounded-full p-3 pb-2">
        <form class="w-full">
        <input type="text" class="w-full h-full bg-gray-1000 focus:outline-none py-2 text-sm" placeholder="${name}" value="${name}" autofocus />
        <a class="hover:cursor-pointer flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleEdit()'>
            ${renderToString(Icons.CloseIcon(4))}
            Cancel
        </a>
        <button type="submit" class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleEdit()'>
            ${renderToString(Icons.CheckmarkIcon(4))}
            Save
        </button>
    </form>
</div>
        `;

        const form = contentDiv.querySelector("form");
        const input = form.querySelector("input");
        setTimeout(() => {
            input.focus();
        }, 100);
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            window.api.node.renameNodeAndReload(node.id, input.value);
            input.value = "";
        });
    } else {
        contentDiv.innerHTML = `
<div class="bg-gray-1000 absolute top-0 w-[700px] rounded-lg text-white gap-3">
    <div class="flex gap-6 items-center transition-all rounded-full p-3 pb-2">
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleEdit()'>
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
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleActiveNodeImages()'>
            ${renderToString(Icons.ScreenshotIcon(3))}
            Images
        </button>
        <div class="grow"></div>
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.hypergraph.search("${name}", event.shiftKey)'>
            ${renderToString(Icons.SearchIcon(3))}
            Filter
        </button>
    </div>
    <div class="max-h-44 overflow-y-scroll flex gap-1 flex-col-reverse px-3 p-2">
    ${chatHistory(params, node)}
    ${linkContent(node.content, node.color)}
    </div>
    ${
        params.showActiveNodeImages
            ? `<div class="flex gap-3 px-3 overflow-x-scroll images h-16"></div>`
            : ""
    }

    <form>
    <input type="text" class="w-full h-full bg-gray-1000 focus:bg-gray-800 focus:outline-none p-3 py-2 rounded-b-lg text-sm" placeholder="What do you want to know?" />
    </form>
</div>
    `;

        const closeButton = document.createElement("a");
        closeButton.className =
            "text-white absolute -top-7 -right-7 opacity-50 hover:opacity-100 cursor-pointer";
        closeButton.onclick = () => params.resetActiveNode(false);
        closeButton.innerHTML = renderToString(Icons.CloseIcon(7));
        contentDiv.appendChild(closeButton);

        const form = contentDiv.querySelector("form");
        const input = form.querySelector("input");
        form.addEventListener("submit", (e) => {
            e.preventDefault();
            if (params.handleChatMessage(input.value)) {
                input.value = "";
            }
        });

        if (params.showActiveNodeImages && node.images) {
            for (const img of node.images) {
                const image = params.getCachedImage(img.thumbnail);
                const a = document.createElement("a");
                a.href = img.link;
                a.target = "_blank";
                a.rel = "noopener noreferrer";
                a.title = img.title;
                a.appendChild(image);
                contentDiv.querySelector(".images").appendChild(a);
            }
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

function chatHistory(params, activeNode) {
    if (!params.chatMessages || params.chatMessages.length === 0) return "";

    const sortedMessages = params.chatMessages.sort((a, b) => {
        return b.timestamp - a.timestamp;
    });

    return `<div class="grow nodrag cursor-auto flex flex-col-reverse gap-4 py-4 chat">
            ${sortedMessages
                .map((message, i) => {
                    if (message.role === "system") return;
                    return `<div class="">
                        <div class="flex items-center gap-1 text-gray-400">
                            <div class="text-xs tracking-wider">
                                ${message.role.toUpperCase()}
                            </div>
                        </div>
                        <div class="chat-messages">
                        ${linkContent(message.content, activeNode.color)}
                        </div>
                    </div>`;
                })
                .join("")}
        </div>`;
}
