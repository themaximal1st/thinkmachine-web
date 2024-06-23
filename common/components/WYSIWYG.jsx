import React from "react";
import Cursor from "@lib/Cursor";

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            level: 0,
        };
        this.cursor = new Cursor("wysiwyg");
    }

    componentDidUpdate() {
        this.cursor.restore();
        // console.log("WYSIWYG DID UPDATE");
    }

    children() {
        return this.props.schematic.tree.children;
    }

    onChange(e) {
        this.cursor.save();
        this.props.schematic.parse(e.target.value);
    }

    render() {
        return (
            <textarea
                id="wysiwyg"
                value={this.props.schematic.input}
                onChange={this.onChange.bind(this)}
            />
        );
    }
}
