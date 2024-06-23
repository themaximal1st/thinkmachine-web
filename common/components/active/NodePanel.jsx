import Component from "./Component";
import Cursor from "@lib/Cursor";

export default class NodePanel extends Component {
    constructor(props) {
        console.log("NEW NODE PANEL");

        super(props);

        this.panels = {};
        this.onChange = this.onChange.bind(this);
        this.cursors = [];
    }

    get nodePanel() {
        return document.getElementById(this.props.node.uuid);
    }

    updateDistance(distance) {
        this.props.distance = distance;
        const panel = this.nodePanel;
        if (!panel) return;
        panel.style.transform = `scale(${100 / this.props.distance})`;
    }

    onChange(e) {
        const target = e.target;
        if (target.tagName !== "TEXTAREA") return;

        const cursor = this.cursors.find((c) => c.id === target.id);
        if (cursor) {
            console.log("SAVE CURSOR");
            cursor.save();
        }

        // this.cursor.save();

        const value = target.value;
        const index = target.dataset.index;

        const hypertext = this.node.hypertexts[index];
        hypertext.value = value;

        this.props.schematic.input = this.props.schematic.export();

        // this.props.schematic.debug();
    }

    code() {
        return (
            <div
                className="node-panel"
                key={`panel-${this.node.uuid}`}
                style={{ transform: `scale(${100 / this.props.distance})` }}
                id={this.node.uuid}>
                {this.node.hypertexts.map((h, idx) => (
                    <textarea
                        key={`hypertext-${this.node.uuid}-${idx}`}
                        id={`hypertext-${this.node.uuid}-${idx}`}
                        data-index={idx}
                        onChange={() => ""}
                        value={h.value}></textarea>
                ))}
            </div>
        );
    }

    // TODO: This has to be much more straight forward.
    // TODO: Is there really no way to use react? We're having to re-render this over and over and over and over
    // TODO: At best it creates a bad flickering artifact and takes a lot of performance
    // TODO: At worst...it's really buggy and doesn't work

    load(div) {
        console.log("LOAD");

        // if (this.cursor.element) {
        //     console.log("RESTORE CURSOR");
        //     this.cursor.element.focus();
        //     this.cursor.restore();
        // }

        const cursorIds = this.cursors.map((c) => c.id);

        const textareas = div.querySelectorAll("textarea");
        for (const textarea of textareas) {
            textarea.addEventListener("input", this.onChange);
            // if (cursorIds.includes(textarea.id)) {
            //     const cursor = this.cursors.find((c) => c.id === textarea.id);
            //     console.log("RESTORE CURSOR");
            //     setTimeout(() => {
            //         textarea.focus();
            //         Cursor.set(textarea, cursor.position);
            //     }, 5);
            //     console.log(textarea);
            //     // cursor.restore();
            // } else {
            // const cursor = new Cursor(textarea.id);
            // this.cursors.push(cursor);
            // }
        }
    }

    unload() {
        const textareas = div.querySelectorAll("textarea");
        for (const textarea of textareas) {
            textarea.removeEventListener("input", this.onChange);
        }
    }
}
