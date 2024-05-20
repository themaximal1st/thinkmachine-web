import SpriteText from "three-spritetext";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as Three from "three";

import React from "react";
import ForceGraph3D from "./ForceGraph3D";
import Settings from "@lib/Settings";

const defaultProps = {
    backgroundColor: "#FAFAFA", // light mode vs dark mode
    showNavInfo: false,
    cooldownTicks: 5000,
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

export default class ForceGraph extends React.Component {
    constructor() {
        super(...arguments);
        this.graphRef = React.createRef();
        this.state = {
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

    render() {
        const props = {
            ...defaultProps,
            ...this.props,
            ...this.state,
            graphRef: this.graphRef,
            linkColor: this.linkColor.bind(this),
            linkDirectionalArrowLength: this.linkDirectionalArrowLength.bind(this),
            onNodeClick: this.handleNodeClick.bind(this),
            nodeThreeObject: this.nodeThreeObject.bind(this),
        };

        return <ForceGraph3D {...props} />;
    }

    linkColor(link) {
        if (this.props.activeNode) {
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

    handleNodeClick(node) {
        console.log("CLICK", node);
    }

    handleResize() {
        this.setState({
            width: window.innerWidth,
            height: window.innerHeight,
        });
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
        title.textHeight = node.textHeight || 8;
        title.fontFace = "Helvetica";

        if (this.state.activeNodeUUID) {
            if (this.state.activeNodeUUID === node.uuid) {
                title.backgroundColor = "black";
            } else {
                title.color = "rgba(255, 255, 255, 0.5)";
                title.backgroundColor = "rgba(0, 0, 0, 0.5)";
            }
        }

        return title;
    }

    nodeThreeObject(node) {
        if (this.state.hideLabels) {
            return null;
        }

        if (node.bridge) {
            return this.nodeThreeBridgeObject(node);
        }

        const title = this.nodeThreeTitleObject(node);
        if (!title) return null;

        if (!this.state.activeNodeUUID || this.state.activeNodeUUID !== node.uuid) {
            return title;
        }

        const group = new THREE.Group();
        group.add(title);

        const titleSize = ForceGraph.calculateTextSize(title);

        /*


        const contentDiv = document.createElement("div");
        contentDiv.className = "pointer-events-auto mt-8 w-[700px]";

        if (params.isEditing) {
            contentDiv.innerHTML = `
<div class="bg-gray-1000 absolute top-0 w-[700px] rounded-lg text-white gap-3">
    <form class="flex gap-6 items-center transition-all rounded-full p-3 pb-2">
        <input type="text" class="w-full h-full bg-gray-1000 focus:outline-none py-2 text-base" placeholder="${name}" value="${name}" autofocus />
        <button type="submit" class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleEdit()'>
            ${renderToString(Icons.CheckmarkIcon(4))}
            Save
        </button>
    </form>
    <div onClick='window.api.node.delete()' class="absolute text-sm text-red-400 hover:text-red-500 mt-2 ml-2 hover:cursor-pointer">Delete</div>
</div>
        `;

            const form = contentDiv.querySelector("form");
            const input = form.querySelector("input");
            setTimeout(() => {
                input.focus();
            }, 100);

            form.addEventListener("submit", (e) => {
                e.preventDefault();
                if (node.name === input.value) return;
                window.api.node.renameNodeAndReload(node.id, input.value);
                input.value = "";
            });
        } else if (params.isAdding) {
            const hyperedge = params.activeNodeId.replace(/^\d{1,4}:/, "").split(".");

            contentDiv.innerHTML = `
<div class="bg-gray-1000 absolute top-0 w-[700px] rounded-lg text-white gap-3">
    <form class="flex gap-6 items-center transition-all rounded-full p-3 pb-2">
            <div class="flex flex-row-reverse items-center gap-3 whitespace-nowrap min-w-12 max-w-64 overflow-scroll noscrollbar">
                ${Array.from(hyperedge)
                    .reverse()
                    .map((n) => {
                        return `<a class="hover:cursor-pointer" data-name="${n}">${n} &nbsp;→</a>`;
                    })
                    .join("")}
            </div>
        <div class="flex items-center gap-3 w-full">
            <input type="text" class="w-full h-full bg-gray-1000 focus:outline-none py-2 text-base" placeholder="Symbol" value="" autofocus />
        </div>
        <button type="submit" class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleAdd()'>
            ${renderToString(Icons.CheckmarkIcon(4))}
            Add
        </button>
    </form>
</div>
        `;

            const form = contentDiv.querySelector("form");
            const links = form.querySelectorAll("a");
            links.forEach((link) => {
                link.addEventListener("click", (e) => {
                    e.preventDefault();
                    hyperedge.splice(hyperedge.indexOf(link.dataset.name), 1);
                    link.remove();
                });
            });

            const input = form.querySelector("input");
            setTimeout(() => {
                input.focus();
            }, 100);

            form.addEventListener("submit", async (e) => {
                e.preventDefault();
                if (input.value.trim() === "") return;
                await window.api.node.add(hyperedge, input.value);
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
        <button class="flex gap-[6px] uppercase font-medium tracking-wider text-xs items-center" onClick='window.api.node.toggleAdd()'>
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

        const closeButton = document.createElement("a");
        closeButton.className =
            "text-white absolute -top-7 -right-7 opacity-50 hover:opacity-100 cursor-pointer";
        closeButton.onclick = () => {
            if (params.isEditing) {
                window.api.node.toggleEdit();
            } else if (params.isAdding) {
                window.api.node.toggleAdd();
            } else {
                params.resetActiveNode(false);
            }
        };
        closeButton.innerHTML = renderToString(Icons.CloseIcon(7));
        contentDiv.appendChild(closeButton);

        const contentContainer = new CSS2DObject(contentDiv);
        const contentSize = calculateTextSize(contentContainer);

        const contentY = -titleSize.y - contentSize.y / 2 + 2;

        // Calculate the position of the content text relative to the title text
        const contentPosition = new THREE.Vector3(0, contentY, -1); // Adjust the offset as needed
        contentContainer.position.copy(contentPosition);
        group.add(contentContainer);

        return group;
        */
    }

    static calculateTextSize(obj) {
        const bounds = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bounds.getSize(size);
        return size;
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
        this.graphRef.current.d3Force("center").strength(defaultForces);
    }
}
