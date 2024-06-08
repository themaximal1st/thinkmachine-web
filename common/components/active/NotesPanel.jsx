import Component from "./Component";
import Markdown from "react-markdown";

export default class NotesPanel extends Component {
    get activeUUID() {
        if (this.props.contextUUID) return this.props.contextUUID;
        return this.props.node.uuid;
    }

    code() {
        const node = this.props.thinkabletype.nodeByUUID(this.activeUUID);
        const notes = node.meta.notes || "";
        return (
            <div id="notes">
                {this.contextSelector()}
                <div className="max-h-36 overflow-y-scroll flex flex-col-reverse">
                    <div className="markdown">
                        <form>
                            <textarea
                                className="w-full h-24 bg-transparent text-black dark:text-white resize-none outline-none border-none focus:ring-0"
                                defaultValue={notes}
                                placeholder="Add a note..."></textarea>
                            <input type="submit" value="Set Notes" className="" />
                        </form>
                    </div>
                </div>
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

    contextSelector() {
        if (this.props.context.stack.length === 0) return;

        const nodes = this.props.context.stack;
        nodes.unshift(this.props.thinkabletype.nodeByUUID(this.props.node.uuid));

        return (
            <div id="context-selector">
                <button
                    key={`all`}
                    data-uuid="all"
                    className={this.props.contextUUID === null ? "active" : ""}>
                    <label>All</label>
                </button>
                {nodes.map((node) => (
                    <button
                        key={`context-${node.uuid}`}
                        data-uuid={node.uuid}
                        className={this.props.contextUUID === node.uuid ? "active" : ""}>
                        <label className="">
                            <Markdown>
                                {node.hyperedge.symbols
                                    .join(" → ")
                                    .replace(node.symbol, `**${node.symbol}**`)}
                            </Markdown>
                        </label>
                    </button>
                ))}
            </div>
        );
    }

    async load(div) {
        const form = div.querySelector("form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            const textarea = form.querySelector("textarea");
            const notes = textarea.value;

            const node = this.props.thinkabletype.nodeByUUID(this.activeUUID);
            if (!this.props.contextUUID) {
                for (const uuid of this.props.node.nodeUUIDs) {
                    const n = this.props.thinkabletype.nodeByUUID(uuid);
                    n.meta.notes = notes;
                }
            } else {
                node.meta.notes = notes;
                console.log("SETTING NODE", node.meta);
            }

            textarea.value = "";
            this.props.save();
        });

        const contextSelector = div.querySelector("#context-selector");
        const buttons = contextSelector.querySelectorAll("button");
        for (const button of buttons) {
            button.addEventListener("click", async (e) => {
                let uuid = button.dataset.uuid;
                if (uuid === "all") uuid = null;
                this.props.setContextUUID(uuid);
            });
        }
    }
}
