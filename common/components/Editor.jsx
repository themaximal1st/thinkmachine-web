import React from "react";
import * as Icons from "@assets/Icons";
import WYSIWYG from "./WYSIWYG";
// import { serialize } from "remark-slate";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.importRef = React.createRef();
        this.state = {
            activeUUID: null,
            value: [],
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.props.panes.editor) {
            this.props.togglePane("editor", false);
        } else if (event.key === "`") {
            this.props.togglePane("editor");
        }
    }

    render() {
        if (!this.props.panes.editor) {
            return (
                <div className="relative group" id="editor-button">
                    <button onClick={() => this.props.togglePane("editor")}>
                        {Icons.EditorIcon(8)}
                    </button>
                    <div className="tooltip invisible group-hover:visible">Editor</div>
                </div>
            );
        }

        return (
            <div id="editor">
                <div className="relative group close-icon">
                    <button onClick={() => this.props.togglePane("editor", false)}>
                        {Icons.CloseIcon(8)}
                    </button>
                </div>
                <div className="relative group content">
                    <WYSIWYG schematic={this.props.schematic} />
                </div>
            </div>
        );
    }
}
