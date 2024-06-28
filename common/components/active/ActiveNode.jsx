import Component from "./Component";

export default class ActivePanel extends Component {
    code() {
        console.log("NODE", this.props);
        return (
            <div className="active-panel">
                {this.node.hypertexts.map((h, idx) => (
                    <input
                        key={`hypertext-${this.node.uuid}-${idx}`}
                        id={`hypertext-${this.node.uuid}-${idx}`}
                        data-index={idx}
                        onChange={() => ""}
                        value={h.hypertext}
                    />
                ))}
            </div>
        );
    }
}

/*
class NodePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hypertexts: [],
            hash: null,
        };
    }

    get node() {
        return this.props.schematic.nodeByUUID(this.props.node.uuid);
    }

    componentDidMount() {
        this.props.schematic.addEventListener((data) => {
            this.update();
        });
    }

    componentDidUpdate() {
        // console.log("NODE UPDATE");
        this.update();
    }

    update() {
        if (!this.node) return;

        if (this.state.hash === this.props.schematic.hash) return;
        this.setState({
            hash: this.props.schematic.hash,
            hypertexts: this.node.hypertexts,
        });
    }

    onChange(e, idx) {
        const hypertexts = this.state.hypertexts;
        hypertexts[idx].value = e.target.value;
        this.setState({ hypertexts });
    }

    componentWillUnmount() {
        if (!this.node) return;
        const wrapper = document.getElementById(`node-panel-wrapper-${this.node.uuid}`);
        // console.log("WILL UNMOUNT", this.node.uuid);
        // console.log(wrapper);
    }

    get distance() {
        return this.props.distances[this.node.uuid] || Infinity;
    }

    render() {
        if (!this.node) return null;
        // console.log("NODE", this.node.hypertexts);
        //
        return (
            <div
                id={`node-panel-${this.node.uuid}`}
                className={classNames("node-panel-wrapper", {
                    // hidden: this.distance > 150 || this.node.hypertexts.length === 0,
                })}>
                <div
                    style={{ transform: `scale(${100 / this.distance})` }}
                    className="node-panel">
                    {this.state.hypertexts.map((h, idx) => {
                        return (
                            <textarea
                                onChange={(e) => this.onChange(e, idx)}
                                key={`hypertext-${this.node.uuid}-${idx}`}
                                value={h.hypertext}></textarea>
                        );
                    })}
                </div>
            </div>
        );
    }
}

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

*/
