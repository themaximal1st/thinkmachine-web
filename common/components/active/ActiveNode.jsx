import Component from "./Component";
import ExplainPanel from "./ExplainPanel";
import EditPanel from "./EditPanel";
import Toolbar from "./Toolbar";
import * as Icons from "@assets/Icons";
import * as utils from "@lib/utils";

export default class ActiveNode extends Component {
    constructor(props) {
        super(props);

        this.toolbar = new Toolbar(props);

        this.panels = {
            Explain: new ExplainPanel(props),
            Edit: new EditPanel(props),
        };
    }

    get panel() {
        return this.panels[this.props.activeMode];
    }

    code() {
        return (
            <div id="active-node-wrapper" className="">
                <div className="" id="active-node">
                    <div className="" id="active-node-close">
                        {Icons.CloseIcon(5)}
                    </div>
                    {this.toolbar.code()}
                    {this.panel && (
                        <div id="active-node-panel" className="">
                            {this.panel.code()}
                        </div>
                    )}
                    <button className="" id="active-node-prev">
                        {Icons.ChevronLeft(8)}
                    </button>
                    <button className="" id="active-node-next">
                        {Icons.ChevronRight(8)}
                    </button>
                </div>
            </div>
        );
    }

    events(div) {
        this.toolbar.events(div);
        if (this.panel) {
            this.panel.events(div);
        }

        div.querySelector("#active-node-close").addEventListener("click", () => {
            this.props.setActiveNode(null);
        });

        div.querySelector("#active-node-prev").addEventListener("click", () => {
            this.moveActiveNode(-1);
        });

        div.querySelector("#active-node-next").addEventListener("click", () => {
            this.moveActiveNode(1);
        });
    }

    moveActiveNode(direction = 1) {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        const edge = node.hyperedge;
        const idx = utils.rollingIndex(node.index + direction, edge.nodes.length);
        const nextNode = edge.nodes[idx];
        this.props.setActiveNode(nextNode);
    }
}
