import Component from "./Component";
import ExplainPanel from "./ExplainPanel";
import EditPanel from "./EditPanel";
import MediaPanel from "./MediaPanel";
import NotesPanel from "./NotesPanel";
import Toolbar from "./Toolbar";
import Context from "./Context";
import * as Icons from "@assets/Icons";
import Settings from "@lib/Settings";

export default class ActiveNode extends Component {
    constructor(props) {
        super(props);

        this.toolbar = new Toolbar(props);
        this.context = new Context(props);

        this.panels = {
            Media: new MediaPanel(props),
            Edit: new EditPanel(props),
            Notes: new NotesPanel(props),
        };

        if (!Settings.llmIsDisabled) {
            this.panels["Explain"] = new ExplainPanel(props);
        }
    }

    get panel() {
        const panel = this.panels[this.props.activeMode];
        if (panel) return panel;
        return this.panels["Edit"];
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

    load(div) {
        this.toolbar.load(div);
        if (this.panel) {
            this.panel.load(div);
        }
        this.context.load(div);

        div.querySelector("#active-node-close").addEventListener("click", () => {
            this.props.setActiveNodeUUID(null);
        });
    }

    unload() {
        this.toolbar.unload();
        if (this.panel) {
            this.panel.unload();
        }
        this.context.unload();
    }
}
