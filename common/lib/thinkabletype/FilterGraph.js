import * as utils from "./utils.js";

export default function filterGraphData({ filter, hyperedges, graphData, depth }) {
    const hyperedgeIDs = hyperedgeIDsForFilter(filter, hyperedges);
    const nodeIDs = new Set();

    const nodes = new Map();
    const links = new Map();

    const updateNodesAndLinks = () => {
        for (const node of graphData.nodes.values()) {
            if (Array.from(node.edgeIDs).some(id => hyperedgeIDs.has(id))) {
                nodes.set(node.id, node);
                nodeIDs.add(node.id);
            }
        }

        for (const link of graphData.links.values()) {
            if (nodeIDs.has(link.source) && nodeIDs.has(link.target)) {
                links.set(link.id, link);
            }
        }
    }

    function updateHyperedges() {
        for (const node of nodes.values()) {
            for (const id of node.edgeIDs) {
                hyperedgeIDs.add(id);
            }
        }

        for (const link of links.values()) {
            for (const id of link.edgeIDs) {
                hyperedgeIDs.add(id);
            }
        }
    }

    updateNodesAndLinks();

    let finalNodes = new Map(nodes);
    let finalLinks = new Map(links);
    let maxDepth = 0;

    while (true) {
        const existingNodeSize = nodes.size;
        const existingLinkSize = links.size;

        updateHyperedges();
        updateNodesAndLinks();

        if (maxDepth < depth) {
            finalNodes = new Map(nodes);
            finalLinks = new Map(links);
        }

        if (existingNodeSize === nodes.size && existingLinkSize === links.size) {
            break;
        }

        maxDepth++;
    }

    utils.verifyGraphData(finalNodes, finalLinks);

    if (maxDepth < 0) { maxDepth = 0 }
    if (depth > maxDepth) { depth = maxDepth }

    return {
        nodes: Array.from(finalNodes.values()),
        links: Array.from(finalLinks.values()),
        depth,
        maxDepth,
    };
}

function hyperedgeIDsForFilter(filter, hyperedges) {
    return new Set(hyperedges.filter(hyperedge => {
        for (const f of filter) {
            if (utils.arrayContains(hyperedge.symbols, f)) return true;
        }
        return false;
    }).map(hyperedge => hyperedge.id));
}