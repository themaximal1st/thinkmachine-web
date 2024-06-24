import React from "react";
import Cursor from "@lib/Cursor";

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            level: 0,
            input: "",
        };
        this.cursor = new Cursor("wysiwyg");
    }

    componentDidMount() {
        this.props.schematic.addEventListener((data) => {
            this.update();
        });

        this.update();
    }

    update() {
        this.setState({ input: this.props.schematic.export() });
    }

    // componentDidUpdate() {
    //     this.cursor.restore();

    //     if (this.props.schematic.input !== this.state.input) {
    //         this.setState({ input: this.props.schematic.input });
    //     }

    //     // console.log("WYSIWYG DID UPDATE");
    // }

    onChange(e) {
        this.cursor.save();
        this.props.schematic.parse(e.target.value);
        this.update();
    }

    render() {
        return (
            <textarea
                id="wysiwyg"
                defaultValue={this.state.input}
                onChange={this.onChange.bind(this)}
            />
        );
    }
}
