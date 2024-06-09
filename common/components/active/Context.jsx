import Component from "./Component";
import * as Icons from "@assets/Icons";
import classNames from "classnames";

export default class Context extends Component {
    code() {
        const activeNode = this.props.thinkabletype.nodeByUUID(this.props.activeNodeUUID);
        const activeEdge = activeNode.hyperedge;

        return (
            <div id="context" className="group">
                <div id="context-prev">
                    {this.props.context.prev.map((node) => (
                        <button
                            key={`prev-${node.uuid}`}
                            data-uuid={node.uuid}
                            className={classNames({
                                active:
                                    this.props.context.stack.length > 1 &&
                                    node.hyperedge.uuid === activeEdge.uuid,
                            })}>
                            <label
                                className={classNames(
                                    {
                                        invisible:
                                            this.props.context.stack.length === 1 ||
                                            node.hyperedge.uuid !== activeEdge.uuid,
                                    },
                                    "group-hover:visible pointer-events-none"
                                )}>
                                {node.symbol}
                            </label>
                            {Icons.ChevronLeft(6)}
                        </button>
                    ))}
                </div>
                <div id="context-next">
                    {this.props.context.next.map((node) => (
                        <button
                            key={`next-${node.uuid}`}
                            data-uuid={node.uuid}
                            className={classNames({
                                active:
                                    this.props.context.stack.length > 1 &&
                                    node.hyperedge.uuid === activeEdge.uuid,
                            })}>
                            {Icons.ChevronRight(6)}
                            <label
                                className={classNames(
                                    {
                                        invisible:
                                            this.props.context.stack.length === 1 ||
                                            node.hyperedge.uuid !== activeEdge.uuid,
                                    },
                                    "group-hover:visible pointer-events-none"
                                )}>
                                {node.symbol}
                            </label>
                        </button>
                    ))}
                </div>
                {this.props.context.stack.length > 1 && (
                    <div id="context-selector">
                        {Icons.ChevronDown(6)}
                        {this.props.context.stack.map((node) => (
                            <button
                                key={`next-${node.uuid}`}
                                data-uuid={node.uuid}
                                className={classNames({
                                    active: node.uuid === this.props.activeNodeUUID,
                                })}>
                                <label className="invisible group-hover:visible pointer-events-none">
                                    {node.hyperedge.symbols.join(" → ")}
                                </label>
                            </button>
                        ))}
                    </div>
                )}
            </div>
        );
    }

    load(div) {
        const context = div.querySelector("#context");

        const buttons = context.querySelectorAll("button");
        for (const button of buttons) {
            button.addEventListener("click", (e) => {
                const uuid = e.target.dataset.uuid;
                const node = this.props.thinkabletype.nodeByUUID(uuid);
                console.log("Context button clicked", node.symbol, node.uuid);
                this.props.setActiveNodeUUID(node.uuid);
                e.preventDefault();
            });
        }
    }

    handleClickStackContext() {
        const stack = [null];

        stack.push(this.props.node.uuid);
        stack.push(...this.props.context.stack.map((node) => node.uuid));

        let index = stack.indexOf(this.props.trackedActiveNodeUUID);
        index += 1;
        if (index >= stack.length) index = 0;

        this.props.setActiveNodeUUID(stack[index]);
    }
}
