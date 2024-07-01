import React from "react";

const doc = `

General Schematics is an information language.

It lets you build information maps over information territories—to quickly learn, explore and connect ideas.

100 years ago, Vannevar Bush imagined Thinking Machines. He predicted a memory extension device—a Memex—that amplified and augmented human intelligence.

A core idea were Memex trails, high-level concepts connnected together. They work through association, like how the brain works.

Vannevar Bush -> Memex

These trails link together into a trail map. Not exactly mind maps, more like concept maps. Ways through a territory.

These trails are actually hyperedges, and they're more powerful than you might think.

Douglas Hofstadter wrote a book, Gödel, Escher, Bach, on why symbols and connections are so powerful.

Douglas Hofstadter -> strangeloop -> symbols -> connections

Stephen Wolfram is exploring a Universal Theory of Physics based on computation—and the datastructure he's using is the hypergraph—he calls it a "structureless structure"

Stephen Wolfram -> hypergraph -> hyperedges -> symbols -> connections

Ted Nelson explains information is deeply interconnected—interwingled.

And these hypergraphs give a powerful way to visualize, explore and find your way through information.

Ted Nelson -> invented -> Xanadu
Ted Nelson -> invented -> hypertext
Memex -> inspired -> hypertext

General Schematics is a Markdown superset that puts hypertext on a hypergraph—enabling a new way to visualize and explore information.

General Schematics -> hypertext -> hypergraph
`.trim();

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);

        this.highlightRef = React.createRef();

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
            dom: this.props.schematic.dom,
            hash: this.props.schematic.hash,
        });

        // let index = 0;
        // let interval = setInterval(() => {
        //     console.log(doc.slice(0, index));

        //     // this.setState({ input: e.target.value });
        //     // this.state.changed = true;
        //     this.props.schematic.parse(doc.slice(0, index));
        //     index++;

        //     if (index >= doc.length) {
        //         clearInterval(interval);
        //         return;
        //     }
        // }, 50);

        // this.ldt = new TextareaDecorator(this.ref.current, this.parser);
    }

    componentDidUpdate(prevProps, prevState) {
        // console.log("NEW", this.props.schematic.hash);
        // console.log("OLD", this.state.hash);

        // console.log("COMPONENT DID UPDATE", this.props.schematic.hash, this.state.hash);
        if (this.props.schematic.input !== this.state.input) {
            console.log("😇 DID UPDATE DOM INPUT");
            this.setState({
                input: this.props.schematic.input,
                dom: this.props.schematic.dom,
                hash: this.props.schematic.hash,
            });
        } else if (this.props.schematic.hash !== this.state.hash) {
            console.log("😇 DID UPDATE DOM");
            this.setState({
                dom: this.props.schematic.dom,
                hash: this.props.schematic.hash,
            });
        }

        // if (
        //     this.props.schematic.hash !== this.state.hash ||
        //     this.props.schematic.input !== this.state.input
        // ) {
        //     console.log("😇 DID UPDATE");
        //     this.setState({
        //         input: this.props.schematic.input,
        //         dom: this.props.schematic.dom,
        //         hash: this.props.schematic.hash,
        //     });
        // }
    }

    onChange(e) {
        // this.cursor.save();
        // this.state.changed = true;
        // console.log("ON CHANGE");
        this.setState({ input: e.target.value });
        this.props.schematic.parse(e.target.value);
        // this.update();
    }

    onScroll(e) {
        // console.log("ON SCROLL", e.target.scrollTop);
        this.highlightRef.current.scrollTop = this.state.ref.current.scrollTop;
    }

    render() {
        // console.log("RENDER WYSIWYG");
        return (
            <div id="wysiwyg">
                <div
                    id="highlight"
                    ref={this.highlightRef}
                    // dangerouslySetInnerHTML={{ __html: this.state.html }}
                >
                    {this.state.dom}
                </div>
                <textarea
                    ref={this.state.ref}
                    spellCheck="false"
                    value={this.state.input}
                    onScroll={this.onScroll.bind(this)}
                    onChange={this.onChange.bind(this)}
                />
            </div>
        );
    }
}
