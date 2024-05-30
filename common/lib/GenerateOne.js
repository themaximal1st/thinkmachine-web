import csv from "papaparse"
import LLM from "@themaximalist/llm.js"

const TEMPERATURE = 1;

// ADD
// INSERT?
// FORK
// CONNECT

// AI generator for ThinkableType
// return await GenerateOne(activeSymbol, hyperedge, hyperedges, options);
export default async function GenerateOne(activeSymbol, hyperedge = [], hyperedges = [[]], options = {}) {
    if (typeof options.temperature === "undefined") { options.temperature = TEMPERATURE }

    const prompt = `
You are a knowledge graph AI.
The knowledge graph is based on the hypergraph, which is based on hyperedges, which are made up of symbols.
This application is clever and can understand the relationships between symbols — as long as they are the same symbol.

Here is the entire hypergraph

\`\`\`csv
${hyperedges.map(edge => edge.join(",")).join("\n")}
\`\`\`

Here is the current hyperedge the user is focused on:

\`\`\`csv
${hyperedge.join(",")}
\`\`\`

Here is the current symbol the user is focused on: "${activeSymbol}"

The user has asked for a new hyperedge to be generated.

Your job is to analyze the hypergraph, the current hyperedge and the current symbol, and generate a new hyperedge that best fits the current context.

At least one term in the new hyperedge should be the same as the current symbol, so that they connect.

Be creative—really try to understand the context and generate a new hyperedge that fits the context.

You don't need to return a greeting or any other text.

Just return the hyperedges as a JSON array of strings, wrapped inside a \`\`\`json\`\`\` code block.

Do not use the CSV format from above—using a JSON array, where each item in the array is a unique symbol.

Please return the new hyperedge now.
    `.trim();

    // options.parser = LLM.parsers.codeBlock("json");
    options.parser = function (text) {
        const array = LLM.parsers.codeBlock("json")(text);
        return LLM.parsers.json(array);
    };

    return await LLM(prompt, options);
}
