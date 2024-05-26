import Component from "./Component";
import * as Icons from "@assets/Icons";

export default class Context extends Component {
    code() {
        const node = this.props.thinkabletype.nodeByUUID(this.props.activeNodeUUID);
        const context = node.context(this.props.graphData);

        return (
            <div id="context" className="group">
                <div id="context-prev">
                    {context.prev.map((node) => (
                        <button key={`prev-${node.uuid}`} data-uuid={node.uuid}>
                            <label className="invisible group-hover:visible pointer-events-none">
                                {node.symbol}
                            </label>
                            {Icons.ChevronLeft(6)}
                        </button>
                    ))}
                </div>
                <div id="context-next">
                    {context.next.map((node) => (
                        <button key={`next-${node.uuid}`} data-uuid={node.uuid}>
                            {Icons.ChevronRight(6)}
                            <label className="invisible group-hover:visible pointer-events-none">
                                {node.symbol}
                            </label>
                        </button>
                    ))}
                </div>
            </div>
        );
    }

    events(div) {
        console.log("ActiveNode.events", div);

        const context = div.querySelector("#context");

        const buttons = context.querySelectorAll("button");
        for (const button of buttons) {
            button.addEventListener("click", (e) => {
                const uuid = e.target.dataset.uuid;
                const node = this.props.thinkabletype.nodeByUUID(uuid);
                this.props.setActiveNode(node);
                e.preventDefault();
            });
        }
    }
}
