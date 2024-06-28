import * as utils from "./utils.js";

export default function filterGraphData({ filter, schematic, data }) {
    // const hyperedgeIDs = hyperedgeIDsForFilter(filter, hyperedges);
    const hyperedges = hyperedgesForFilter(filter, schematic);

    const nodeIDs = new Set();

    const graphData = { nodes: new Map(), links: new Map() };

    const updateNodesAndLinks = () => {
        for (const node of data.nodes.values()) {
            if (!node.hyperedges) {
                console.log(node);
                throw new Error("Node has no hyperedges");
            }
            if (node.hyperedges.some(hyperedge => hyperedges.includes(hyperedge))) {
                graphData.nodes.set(node.id, node);
                nodeIDs.add(node.id);
            }
        }

        for (const link of data.links.values()) {
            if (nodeIDs.has(link.source) && nodeIDs.has(link.target)) {
                graphData.links.set(link.id, link);
            }
        }
    }

    function updateHyperedges() {
        for (const node of graphData.nodes.values()) {
            for (const hyperedge of node.hyperedges) {
                hyperedges.push(hyperedge);
            }
        }

        for (const link of graphData.links.values()) {
            for (const hyperedge of link.hyperedges) {
                hyperedges.push(hyperedge);
            }
        }
    }

    updateNodesAndLinks();

    let final = {
        nodes: new Map(graphData.nodes),
        links: new Map(graphData.links)
    };

    let maxDepth = 0;
    let depth = schematic.depth;

    while (true) {
        const existingNodeSize = graphData.nodes.size;
        const existingLinkSize = graphData.links.size;

        updateHyperedges();
        updateNodesAndLinks();

        if (maxDepth < depth) {
            final = {
                nodes: new Map(graphData.nodes),
                links: new Map(graphData.links)
            };
        }

        if (existingNodeSize === graphData.nodes.size && existingLinkSize === graphData.links.size) {
            break;
        }

        maxDepth++;
    }

    utils.verifyGraphData(final);

    if (maxDepth < 0) { maxDepth = 0 }
    if (depth > maxDepth) { depth = maxDepth }

    return {
        nodes: Array.from(final.nodes.values()),
        links: Array.from(final.links.values()),
        depth,
        maxDepth,
    };
}

function hyperedgesForFilter(filter, schematic) {
    return schematic.hyperedges.filter(hyperedge => {
        for (const f of filter) {
            if (Array.isArray(f)) {
                if (utils.arrayContains(hyperedge.symbols, f)) return true;
            } else if (f.node) {
                for (const node of hyperedge.nodes) {
                    if (node.uuid === f.node) return true;
                }
            } else if (f.edge) {
                if (hyperedge.uuid === f.edge) return true;
            }
        }
        return false;
    });
}