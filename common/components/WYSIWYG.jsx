import React from "react";

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

        // this.cursor = new Cursor("wysiwyg");
    }

    componentDidMount() {
        // this.props.schematic.addEventListener((data) => {
        //     this.update();
        // });
        // this.update();
        this.setState({
            input: this.props.schematic.output,
            html: this.props.schematic.html,
            hash: this.props.schematic.hash,
        });
        // this.ldt = new TextareaDecorator(this.ref.current, this.parser);
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log("NEW", this.props.schematic.hash);
        // console.log("OLD", this.state.hash);

        if (
            this.props.schematic.hash !== this.state.hash ||
            this.props.schematic.input !== this.state.input
        ) {
            // console.log("😇 DID UPDATE");
            this.setState({
                input: this.props.schematic.input,
                html: this.props.schematic.html,
                hash: this.props.schematic.hash,
            });
        }
    }

    onChange(e) {
        // this.cursor.save();
        this.setState({ input: e.target.value });
        // this.state.changed = true;
        this.props.schematic.parse(e.target.value);
        // this.update();
    }

    render() {
        return (
            <div id="wysiwyg">
                <div
                    id="highlight"
                    dangerouslySetInnerHTML={{ __html: this.state.html }}
                />
                <textarea
                    ref={this.state.ref}
                    value={this.state.input}
                    onChange={this.onChange.bind(this)}
                />
            </div>
        );
    }
}
