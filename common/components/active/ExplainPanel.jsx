import Component from "./Component";
import Markdown from "react-markdown";

export default class ExplainPanel extends Component {
    code() {
        const explain = this.props.explains.get(this.props.node.uuid) || "";
        const chat = this.props.chats.get(this.props.node.uuid) || [];
        return (
            <div id="explain">
                <div className="max-h-36 overflow-y-scroll flex flex-col-reverse">
                    {chat.length > 0 && (
                        <div className="mt-3 flex flex-col gap-4">
                            {chat.map((msg, i) => (
                                <div key={i} className="flex flex-col">
                                    <div className="text-gray-300 text-xs uppercase tracking-wider">
                                        {msg.role}
                                    </div>
                                    <div className="markdown">
                                        {this.linkContent(
                                            msg.content,
                                            this.props.node.color
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    <div className="markdown">
                        {this.linkContent(explain, this.props.node.color)}
                    </div>
                </div>
                <form id="chat">
                    <input
                        type="text"
                        id="chat-input"
                        placeholder="What do you want to know?"
                    />
                </form>
            </div>
        );
    }

    linkContent(content, color) {
        if (!content || content.length === 0) return "";

        return (
            <Markdown
                components={{
                    a(props) {
                        return (
                            <a
                                href={props.href}
                                className="pointer-events-auto cursor-pointer"
                                style={{ color }}>
                                {props.children}
                            </a>
                        );
                    },
                }}>
                {content}
            </Markdown>
        );
    }

    async load(div) {
        await this.fetchExplain();

        const links = div.querySelectorAll("#explain .markdown a");
        for (const link of links) {
            link.addEventListener("click", (e) => {
                e.preventDefault();
                const href = e.target.getAttribute("href");
                this.handleClickSlug(href);
            });
        }

        const chatForm = div.querySelector("#chat");
        chatForm.addEventListener("submit", (e) => {
            e.preventDefault();
            const input = e.target.querySelector("input");
            this.handleChat(input.value);
            input.value = "";
        });
    }

    async fetchExplain() {
        const node = this.props.node;
        let explain = this.props.explains.get(node.uuid);
        if (explain !== undefined) return;
        if (!node.name) return;

        this.props.setExplain(node.uuid, ""); // prevent stampeded

        const hyperedges = this.props.thinkabletype.symbols;

        const options = { model: Settings.llmModel };

        const stream = await window.api.explain(node.name, hyperedges, options);

        explain = "";
        for await (const message of stream) {
            explain += message;
            this.props.setExplain(node.uuid, explain);
        }
    }

    // TODO: extract this out with ChatModal dupe
    async handleClickSlug(slug) {
        for (const n of this.props.graphData.nodes) {
            if (n.uuid === this.props.node.uuid) continue;
            const node = this.props.thinkabletype.nodeByUUID(n.uuid);
            if (!node) continue;
            if (node.matches(slug)) {
                this.props.setActiveNodeUUID(node.uuid);
                return;
            }
        }

        // node wasn't found in current graph, so we need to expand out until we find it
        for (const node of this.props.thinkabletype.nodes) {
            if (node.matches(slug)) {
                this.props.setActiveNodeUUID(node.uuid);

                const filters = this.props.filters;
                filters.push({ node: node.uuid });
                await this.props.setFilters(filters);

                for (
                    let interwingle = this.props.thinkabletype.interwingle;
                    interwingle <= 3;
                    interwingle++
                ) {
                    this.props.thinkabletype.interwingle = interwingle;

                    for (let i = 0; i < 5; i++) {
                        this.props.thinkabletype.depth = i;
                        await this.props.reloadData();
                    }
                }

                return;
            }
        }

        console.log("NO MATCH", slug);
    }

    async handleChat(content) {
        const messages = this.props.chats.get(this.props.node.uuid) || [];
        messages.push({
            role: "user",
            content,
        });
        this.props.setChat(this.props.node.uuid, messages);

        const hyperedges = this.props.thinkabletype.symbols;

        const options = {
            model: "gpt-4o",
        };

        const activeSymbol = this.props.node.name;
        const stream = await window.api.chat(messages, hyperedges, activeSymbol, options);

        let response = "";
        for await (const message of stream) {
            response += message;

            this.props.setChat(this.props.node.uuid, [
                ...messages,
                { role: "assistant", content: response },
            ]);
        }
    }
}
