import React from "react";
import * as Icons from "@assets/Icons";
import WYSIWYG from "./WYSIWYG";
import { createEditor } from "slate";
import { Slate, Editable, withReact } from "slate-react";
import { serialize } from "remark-slate";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.importRef = React.createRef();
        this.state = {
            activeUUID: null,
            lastDataHash: null,
            value: [],
        };

        // this.state = {
        //     show: false,
        // };
        this.editor = withReact(createEditor());

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
        // console.log("UPDATE", this.state.value);
        if (this.state.dataHash !== this.props.schematic.hash) {
            console.log("UPDATE SLATE");
            const value = this.props.schematic.slate;
            this.setState({
                value,
                dataHash: this.props.schematic.hash,
            });

            this.editor.children = value;
        }

        // if (this.state.value !== this.props.schematic.slate) {
        //     console.log("CHANGE STATE");
        //     this.setState({ value: this.props.schematic.slate });
        // }

        // console.log("PREV PROPS", prevProps);
        // console.log("CURR PROPS", this.props);

        // if (prevState.activeUUID !== this.state.activeUUID) {
        //     document.getElementById(this.state.activeUUID).focus();
        // }
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

        const handleChange = (value) => {
            // console.log("HANDLE CHANGE");
            this.props.schematic.parseSlate(value);

            // const val = value.map((v) => serialize(v)).join("");

            // // convert &gt; to >, &lt; to <, etc.
            // const html = val.replace(/&gt;/g, ">").replace(/&lt;/g, "<");

            // console.log("HTML", html);

            // this.props.schematic.parse(html);
        };

        // this.props.schematic.debug();
        // const value = this.props.schematic.slate;

        // console.log("RENDER SLATE", JSON.stringify(value, null, 2));

        // const value = [
        //     {
        //         type: "paragraph",
        //         children: [{ text: "A line of text in a paragraph." }],
        //     },
        // ];

        return (
            <div id="editor">
                <div className="relative group close-icon">
                    <button onClick={() => this.props.togglePane("editor", false)}>
                        {Icons.CloseIcon(8)}
                    </button>
                </div>
                <div className="relative group content">
                    <Slate
                        id="editor"
                        editor={this.editor}
                        initialValue={this.state.value}
                        onChange={handleChange}>
                        <Editable id="editable" />
                    </Slate>
                    {/* <WYSIWYG schematic={this.props.schematic} /> */}
                    {/* <textarea
                        onChange={this.handleTextareaChange.bind(this)}
                        defaultValue={this.props.schematic.export()}></textarea> */}
                </div>
            </div>
        );
    }
}
