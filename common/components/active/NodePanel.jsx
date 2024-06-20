import Component from "./Component";
import ExplainPanel from "./ExplainPanel";
import EditPanel from "./EditPanel";
import MediaPanel from "./MediaPanel";
import NotesPanel from "./NotesPanel";
import Toolbar from "./Toolbar";
import Context from "./Context";
import * as Icons from "@assets/Icons";
import Settings from "@lib/Settings";

export default class NodePanel extends Component {
    constructor(props) {
        super(props);

        this.panels = {};
    }

    updateDistances(distances) {
        // console.log("BOOM TOWN", distances);
        const distance = Math.round(distances[this.props.node.uuid]);
        if (!distance) return;

        const div = document.getElementById(this.props.node.uuid);
        if (!div) return;

        // set tranform
        div.style.transform = `scale(${100 / distance})`;
        // div.innerHTML = distance;
    }

    code() {
        const distance = Math.round(this.props.distances[this.props.node.uuid]);
        const node = this.props.schematic.nodeByUUID(this.props.node.uuid);
        const hypertexts = node.hypertexts.map((h) => h.value).join("\n");
        return (
            <div
                className="node-panel"
                style={{ transform: `scale(0)` }}
                id={this.props.node.uuid}>
                {hypertexts}
            </div>
        );
    }

    load(div) {}

    unload() {}
}
