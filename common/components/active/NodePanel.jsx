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

    updateDistance(distance) {
        this.props.distance = distance;

        const div = document.getElementById(this.props.node.uuid);
        if (!div) return;

        div.style.transform = `scale(${100 / this.props.distance})`;
    }

    code() {
        const node = this.props.schematic.nodeByUUID(this.props.node.uuid);
        return (
            <div
                className="node-panel"
                key={`panel-${node.uuid}`}
                style={{ transform: `scale(${100 / this.props.distance})` }}
                id={this.props.node.uuid}>
                {node.hypertexts.map((h, idx) => (
                    <div key={`hypertext-${node.uuid}-${idx}`}>{h.value}</div>
                ))}
            </div>
        );
    }

    load(div) {}

    unload() {}
}
