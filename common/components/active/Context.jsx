// TODO: Can we drop contextUUID and just use activeNodeUUID?

import Component from "./Component";
import * as Icons from "@assets/Icons";
import classNames from "classnames";

export default class Context extends Component {
    code() {
        const stack = [...this.props.context.stack];
        if (stack.length > 0 && stack.indexOf(this.node) === -1) {
            stack.push(this.node);
        }

        const hasContextUUID = this.props.contextUUID !== null;
        const activeNode = this.activeNode;
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
                                    stack.length > 0 &&
                                    node.hyperedge.uuid === activeEdge.uuid &&
                                    hasContextUUID,
                            })}>
                            <label
                                className={classNames(
                                    {
                                        invisible:
                                            stack.length === 0 ||
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
                                    stack.length > 0 &&
                                    node.hyperedge.uuid === activeEdge.uuid &&
                                    hasContextUUID,
                            })}>
                            {Icons.ChevronRight(6)}
                            <label
                                className={classNames(
                                    {
                                        invisible:
                                            stack.length === 0 ||
                                            node.hyperedge.uuid !== activeEdge.uuid,
                                    },
                                    "group-hover:visible pointer-events-none"
                                )}>
                                {node.symbol}
                            </label>
                        </button>
                    ))}
                </div>
                {stack.length > 0 && (
                    <div id="context-selector">
                        {Icons.ChevronDown(6)}
                        {stack.map((node) => (
                            <button
                                key={`next-${node.uuid}`}
                                data-uuid={node.uuid}
                                data-context={true}
                                className={classNames({
                                    active: node.hyperedge.uuid === activeEdge.uuid,
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

                if (e.target.dataset.context) {
                    this.props.setContextUUID(node.uuid);
                } else {
                    console.log("Context button clicked", node.symbol, node.uuid);
                    this.props.setActiveNodeUUID(node.uuid);
                }

                e.preventDefault();
            });
        }
    }

    handleClickStackContext() {
        const stack = [null];

        stack.push(this.props.node.uuid);
        stack.push(...this.props.context.stack.map((node) => node.uuid));

        console.log("STACK", stack);
        let index = stack.indexOf(this.props.contextUUID);
        console.log("INDEX", index);
        index += 1;
        if (index >= stack.length) index = 0;

        this.props.setContextUUID(stack[index]);
    }
}
