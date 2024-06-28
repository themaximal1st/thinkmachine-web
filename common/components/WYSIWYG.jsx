import React from "react";
// import Cursor from "@lib/Cursor";

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            level: 0,
            input: "",
            hash: null,
        };
        // this.cursor = new Cursor("wysiwyg");
    }

    componentDidMount() {
        // this.props.schematic.addEventListener((data) => {
        //     this.update();
        // });
        // this.update();

        this.setState({
            input: this.props.schematic.output,
            hash: this.props.schematic.hash,
        });
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.props.schematic.input !== this.state.input) {
            console.log("😇 DID UPDATE");
            this.setState({
                input: this.props.schematic.output,
                // hash: this.props.schematic.hash,
            });
        }
    }

    _update() {
        if (this.state.dataHash === this.props.schematic.hash) return;
        if (this.state.changed) {
            console.log("SKIP UPDATE");
            this.state.changed = false;
            return;
        }
        this.setState({
            input: this.props.schematic.output,
            dataHash: this.props.schematic.hash,
        });
    }

    // componentDidUpdate() {
    //     this.cursor.restore();

    //     if (this.props.schematic.input !== this.state.input) {
    //         this.setState({ input: this.props.schematic.input });
    //     }

    //     // console.log("WYSIWYG DID UPDATE");
    // }

    onChange(e) {
        console.log("CHANGE");
        // this.cursor.save();
        this.setState({ input: e.target.value });
        // this.state.changed = true;
        this.props.schematic.parse(e.target.value);
        // this.update();
    }

    render() {
        return (
            <textarea
                id="wysiwyg"
                value={this.state.input}
                onChange={this.onChange.bind(this)}
            />
        );
    }
}
