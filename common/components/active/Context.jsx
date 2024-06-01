import Component from "./Component";
import * as Icons from "@assets/Icons";

export default class Context extends Component {
    code() {
        return (
            <div id="context" className="group">
                <div id="context-prev">
                    {this.props.context.prev.map((node) => (
                        <button key={`prev-${node.uuid}`} data-uuid={node.uuid}>
                            <label className="invisible group-hover:visible pointer-events-none">
                                {node.symbol}
                            </label>
                            {Icons.ChevronLeft(6)}
                        </button>
                    ))}
                </div>
                <div id="context-next">
                    {this.props.context.next.map((node) => (
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
}
