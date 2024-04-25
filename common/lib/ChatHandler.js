import toast from "react-hot-toast";

export default async function ChatHandler(app, e = null) {
    if (e) {
        e.preventDefault();
    }

    if (app.state.isChatting) return false;

    let chatInput = false;
    let content = app.state.input.trim();
    if (content.length === 0) {
        if (app.isFocusingChatInput) {
            content = app.chatInputRef.current.value.trim();
            app.chatInputRef.current.value = "";
            chatInput = true;
        }
    }

    if (content.length === 0) return false;

    await app.toggleChatWindow(true);

    const chatMessages = [...app.state.chatMessages];

    if (chatMessages.length === 0) {
        const content = ChatPrompt(app);
        chatMessages.push({
            role: "system",
            content,
            timestamp: Date.now(),
        });
    }

    chatMessages.push({
        content,
        role: "user",
        timestamp: Date.now() + 1,
    });

    const assistant = {
        content: "",
        model: app.state.llm.name || app.state.llm.model,
        role: "assistant",
        timestamp: Date.now() + 2,
    };

    await app.asyncSetState({ chatMessages, isChatting: true });

    const sortedChatMessages = [...chatMessages].sort((a, b) => {
        return a.timestamp - b.timestamp;
    });

    chatMessages.push(assistant);
    await app.asyncSetState({ chatMessages });

    if (chatInput) {
        app.chatInputRef.current.value = "";
    } else {
        await app.asyncSetState({ input: "" });
    }

    try {
        const response = await window.api.chat(sortedChatMessages, {
            llm: app.llmSettings,
        });

        for await (const data of response) {
            if (!app.state.isChatting || data.event === "chat.stop") {
                break;
            }

            if (data.event === "chat.message") {
                assistant.content += data.data;
                await app.asyncSetState({ chatMessages });
            }
        }
    } catch (e) {
        const message = e.message || e;
        console.log("ERROR DURING CHAT", message);
        toast.error(`Error during chat: ${message}`);
    } finally {
        await app.asyncSetState({ isChatting: false });
    }

    return false; // we'll handle reset
}


function ChatPrompt(app) {
    const hyperedges = app.state.hyperedges
        .map((hyperedge) => {
            return hyperedge.join(" -> ");
        })
        .join("\n");

    const prompt = `You are a knowledge graph Chat AI assistant.
You are helping me chat with my knowledge graph.

First I will provide you with a knowledge graph, and then in future messages we'll chat about it.
Be concise, and if you need more information, ask for it.
The knowledge graph is based on a hypergraph.
The hypergraph is made up of hyperedges.
Hyperedges are made up of symbols.
Hyperedges are represented with " -> " arrows.
Each new line is a distinct hyperedge.

You don't need to let the user know about the underlying hypergraph structure, they are looking at a visual representation of it.
So you can speak about the knowledge graph by references the names of the symbols and their connections.
If the user asks for more information, you can provide additional details from your knowledge to complete the request.
Always be helpful and informative.
Try to be as accurate as possible, while still completing the users request.

Here is the knowledge graph:
${hyperedges}`;

    return prompt;
}