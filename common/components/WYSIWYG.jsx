import React from "react";
import Cursor from "@lib/Cursor";

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            level: 0,
        };
        this.cursor = new Cursor("wysiwyg");
        this.position = { start: 0, end: 0 };
    }

    componentDidUpdate() {
        this.cursor.set(this.position);
    }

    children() {
        return this.props.schematic.tree.children;
    }

    onChange(e) {
        this.position = this.cursor.get();
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
