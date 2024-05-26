import Component from "./Component";
import ExplainPanel from "./ExplainPanel";
import EditPanel from "./EditPanel";
import Toolbar from "./Toolbar";
import Context from "./Context";
import * as Icons from "@assets/Icons";
import * as utils from "@lib/utils";

export default class ActiveNode extends Component {
    constructor(props) {
        super(props);

        this.toolbar = new Toolbar(props);
        this.context = new Context(props);

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
                    {this.context.code()}
                </div>
            </div>
        );
    }

    events(div) {
        this.toolbar.events(div);
        if (this.panel) {
            this.panel.events(div);
        }
        this.context.events(div);

        div.querySelector("#active-node-close").addEventListener("click", () => {
            this.props.setActiveNodeUUID(null);
        });
    }
}
