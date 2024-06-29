import React from "react";
import TextareaDecorator from "@lib/LDT/TextareaDecorator";
import Parser from "@lib/LDT/Parser";

// import Cursor from "@lib/Cursor";

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            ref: React.createRef(),
            level: 0,
            input: "",
            hash: null,
        };

        this.parser = new Parser({
            whitespace: /\s+/,
            comment: /\/\/[^\r\n]*/,
            other: /\S/,
        });

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

        // this.ldt = new TextareaDecorator(this.ref.current, this.parser);
    }

    componentDidUpdate(prevProps, prevState) {
        if (
            this.props.schematic.hash !== this.state.hash &&
            this.props.schematic.input !== this.state.input
        ) {
            console.log("😇 DID UPDATE");
            this.setState({
                input: this.props.schematic.output,
                hash: this.props.schematic.hash,
            });
        }

        // if (this.ldt) {
        //     this.ldt = null;
        // }
    }

    _update() {
        if (this.state.dataHash === this.props.schematic.hash) return;
        if (this.state.input === this.props.schematic.input) return;

        this.setState({
            input: this.props.schematic.output,
            dataHash: this.props.schematic.hash,
        });
    }

    _componentDidUpdate(prevProps, prevState) {
        // this.cursor.restore();
        // if (this.props.schematic.input !== this.state.input) {
        //     this.setState({ input: this.props.schematic.input });
        // }
        // console.log("WYSIWYG DID UPDATE");
    }

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
            <div id="wysiwyg">
                <textarea
                    ref={this.state.ref}
                    value={this.state.input}
                    onChange={this.onChange.bind(this)}
                />
                <div id="highlight">{this.state.input}</div>
            </div>
        );
    }
}
