import csv from "papaparse"
import LLM from "@themaximalist/llm.js"

const TEMPERATURE = 1;

export default async function* GenerateMany(user_prompt, activeSymbol = null, hyperedge = [], hyperedges = [[]], options = {}) {
    if (typeof options.temperature === "undefined") { options.temperature = TEMPERATURE }

    const prompt = `
You are a knowledge graph AI.
The knowledge graph is based on the hypergraph, which is based on hyperedges, which are made up of symbols.
This application is clever and can understand the relationships between symbols — as long as they are the same symbol.

${hyperedges.length > 0 ? `Here is the entire hypergraph\n\n\`\`\`csv\n${hyperedges.map(edge => edge.join(",")).join("\n")}\n\`\`\`` : "The hypergraph is currently empty."}

${hyperedge.length > 0 ? `Here is the current hyperedge the user is focused on (empty if none):\n\n\`\`\`csv\n${hyperedge.join(",")}\n\`\`\`` : ""}

${activeSymbol ? `Here is the current symbol the user is focused on: "${activeSymbol}"` : ""}

The user has asked for many new hyperedges to be generated based on their query "${user_prompt}" and the current state of the hypergraph.

Your job is to analyze the hypergraph, the user prompt, current hyperedge and the current symbol, and generate a new hyperedge that best fits the current context.

If there is no current hypergraph, please generate many new hyperedges based on the user prompt.

If there is a hypergraph, please generate hyperedges based on the user prompt and the current hypergraph.

Use existing symbols where appropriate, so that they connect.

Be creative—really try to understand the context and generate a new hyperedge that fits the context.

You don't need to return a greeting or any other text.

Just return the hyperedges as symbols separated commas, separated by newlines.

No other text or formatting.

Use proper capitalization and spaces, and avoid special characters.

Use correct spacing between commas (no spaces). Hyperedges should usually be 3 to 5 symbols long.

Hyperedges that are 2 symbols long are treated uniquely as direct connections anywhere they appear—use them sparingly but where a strong connection should exist that doesn't already.

Please return the hyperedges now—use your discrection to generate as many as you see fit.
    `.trim();

    options.stream = true;

    console.log(prompt);

    const response = await LLM(prompt, options);

    let buffer = "";
    for await (const message of response) {
        buffer += message;
        if (buffer.indexOf("\n") !== -1) {
            const lines = buffer.split("\n");
            buffer = lines.pop();
            for (const line of lines) {
                console.log("LINE", line);
                yield csv.parse(line.trim()).data;
            }
        }
    }
}
