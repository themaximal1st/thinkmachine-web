import Component from "./Component";
import Markdown from "react-markdown";

export default class ExplainPanel extends Component {
    code() {
        const explain = this.props.explains.get(this.props.node.uuid) || "";
        return (
            <div id="explain">
                <div className="max-h-36 overflow-y-scroll markdown">
                    {this.linkContent(explain, this.props.node.color)}
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
    }

    async fetchExplain() {
        const node = this.props.node;
        let explain = this.props.explains.get(node.uuid);
        if (explain !== undefined) return;
        if (!node.name) return;

        this.props.setExplain(node.uuid, ""); // prevent stampeded
        console.log("FETCH EXPLAIN");

        const hyperedges = this.props.thinkabletype.hyperedges.map(
            (edge) => edge.symbols
        );

        console.log("HYPEREDGES", hyperedges);

        const options = {
            model: "gpt-4o",
        };

        console.log("OPTIONS", node);
        const stream = await window.api.explain(node.name, hyperedges, options);

        explain = "";
        for await (const message of stream) {
            explain += message;
            this.props.setExplain(node.uuid, explain);
        }
    }

    handleClickSlug(slug) {
        console.log("CLICK SLUG", slug);
    }
}
