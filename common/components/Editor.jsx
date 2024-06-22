import React from "react";
import * as Icons from "@assets/Icons";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.importRef = React.createRef();
        this.state = {
            activeUUID: null,
        };

        // this.state = {
        //     show: false,
        // };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);

        // setTimeout(() => {
        //     this.setState({ show: true });
        // }, 250);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.activeUUID !== this.state.activeUUID) {
            document.getElementById(this.state.activeUUID).focus();
        }
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.props.panes.editor) {
            this.props.togglePane("editor", false);
        } else if (event.key === "`") {
            this.props.togglePane("editor");
        }
    }

    handleTextareaChange(event) {
        // console.log("CHANGED TEXT AREA", event.target.value);
        this.props.schematic.parse(event.target.value);
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
                    <textarea
                        onChange={this.handleTextareaChange.bind(this)}
                        defaultValue={this.props.schematic.export()}></textarea>
                </div>
            </div>
        );
    }
}
