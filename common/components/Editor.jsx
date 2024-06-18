import React from "react";
import * as Icons from "@assets/Icons";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.importRef = React.createRef();
        this.state = {
            show: false,
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);

        setTimeout(() => {
            this.setState({ show: true });
        }, 250);
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
        if (event.key === "Escape" && this.state.show) {
            this.setState({ show: false });
        } else if (event.key === "`") {
            this.setState({ show: !this.state.show });
        }
    }

    handleTextareaChange(event) {
        console.log("CHANGED TEXT AREA", event.target.value);
        this.props.schematic.parse(event.target.value);
    }

    render() {
        if (!this.state.show) {
            return (
                <div className="relative group" id="editor-button">
                    <button onClick={() => this.setState({ show: true })}>
                        {Icons.EditorIcon(8)}
                    </button>
                    <div className="tooltip invisible group-hover:visible">Editor</div>
                </div>
            );
        }

        return (
            <div id="editor">
                <div className="relative group" id="editor-button">
                    <button onClick={() => this.setState({ show: false })}>
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
