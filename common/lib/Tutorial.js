export default async function Tutorial(app) {
    if (app.state.hyperedges.length > 0) return;

    if (!await window.api.hypergraph.isValid()) {
        await app.createNewHypergraph();
    }

    const tutorial = [
        ["Think Machine", "mind mapping", "3D visualization"],
        ["Think Machine", "brainstorming", "idea exploration"],
        ["Think Machine", "knowledge graph", "information connections"],
        ["mind mapping", "complex information", "visualization"],
        ["mind mapping", "hierarchical structure", "limitations"],
        ["brainstorming", "research", "idea exploration"],
        ["knowledge graph", "hidden connections", "discovery"],
        ["Think Machine", "students", "visual learning"],
        ["Think Machine", "researchers", "complex data analysis"],
        ["Think Machine", "project managers", "project roadmap"],
        ["Think Machine", "writers", "narrative development"],
        ["Think Machine", "entrepreneurs", "strategy planning"],
        ["Think Machine", "teachers", "immersive learning"],
        ["Think Machine", "designers", "information architecture"],
        ["Think Machine", "marketers", "customer journey visualization"],
        ["Think Machine", "healthcare professionals", "medical data visualization"],
        ["Think Machine", "AI integration", "knowledge graph generation"],
        ["knowledge graph", "data addition", "simple process"],
        ["Think Machine", "search functionality", "context-based exploration"],
        ["complex ideas", "visualization", "Think Machine"],
        ["information research", "exploration", "Think Machine"],
        ["idea brainstorming", "connection discovery", "Think Machine"],
        ["Think Machine", "local application", "privacy"],
        ["Think Machine", "cross-platform compatibility", "open-source"],
    ];

    for (const hyperedge of tutorial) {
        const last = hyperedge.pop();
        await window.api.hyperedges.add(hyperedge, last);
    }
    app.setState({ interwingle: 3, depth: Infinity }, async () => {
        await app.reloadData({ zoom: true });
    });

}