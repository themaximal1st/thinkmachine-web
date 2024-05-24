import { CSS2DRenderer } from "three/addons/renderers/CSS2DRenderer.js";
import SpriteText from "three-spritetext";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import * as Three from "three";

import { ForceGraph3D as ForceGraph3DComponent } from "react-force-graph";
import Settings from "@lib/Settings";
import React from "react";
import ActiveNodeUI from "./ActiveNodeUI";

export default class ForceGraph3D extends React.Component {
    componentDidMount() {
        const bloomPass = new UnrealBloomPass();
        bloomPass.strength = 1.5;
        bloomPass.radius = 1;
        bloomPass.threshold = 0;
        this.props.graphRef.current.postProcessingComposer().addPass(bloomPass);
    }

    componentDidUpdate(prevProps, prevState) {}

    render() {
        return (
            <ForceGraph3DComponent
                ref={this.props.graphRef} // won't allow in prop?
                controlType={Settings.controlType}
                nodeThreeObject={this.nodeThreeObject.bind(this)}
                extraRenderers={[new CSS2DRenderer()]}
                {...this.props}
            />
        );
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
        title.textHeight = node.textHeight || 10;
        title.fontFace = "Helvetica";

        if (this.props.activeNodeUUID) {
            if (this.props.activeNodeUUID === node.uuid) {
                title.backgroundColor = "black";
            } else {
                title.color = "rgba(255, 255, 255, 0.5)";
                title.backgroundColor = "rgba(0, 0, 0, 0.5)";
            }
        }

        return title;
    }

    nodeThreeObject(node) {
        if (this.props.hideLabels) {
            return null;
        }

        if (node.bridge) {
            return this.nodeThreeBridgeObject(node);
        }

        const title = this.nodeThreeTitleObject(node);
        if (!title) return null;

        if (!this.props.activeNodeUUID || this.props.activeNodeUUID !== node.uuid) {
            return title;
        }

        const ui = new ActiveNodeUI({
            ...this.props,
            node,
            title,
        });

        return ui.render();
    }
}

/*


        const titleSize = ForceGraph.calculateTextSize(title);


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
    }
        */
