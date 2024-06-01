import React from "react";

export default class Depth extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this), true);
    }

    componentWillUnmount() {
        console.log("RESET DEPTH");
        this.props.thinkabletype.depth = 0;
        this.props.thinkabletype.maxDepth = 0;
        window.removeEventListener("keydown", this.handleKeyDown.bind(this), true);
    }

    async handleKeyDown(event) {
        if (event.target.tagName !== "BODY") return;
        if (!this.isShowing) return;

        if (event.metaKey) return;
        if (event.ctrlKey) return;
        if (event.altKey) return;
        if (event.shiftKey) return;

        switch (event.key) {
            case "0":
            case "1":
            case "2":
            case "3":
            case "4":
            case "5":
            case "6":
            case "7":
            case "8":
            case "9":
                this.props.thinkabletype.depth = parseInt(event.key);
                break;
            case "=": // +
                this.props.thinkabletype.depth += 1;
                break;
            case "-": //
                this.props.thinkabletype.depth -= 1;
                break;
            default:
                return;
        }

        if (this.props.thinkabletype.depth > this.props.thinkabletype.maxDepth) {
            this.props.thinkabletype.depth = this.props.thinkabletype.maxDepth;
        }

        if (this.props.thinkabletype.depth < 0) {
            this.props.thinkabletype.depth = 0;
        }

        this.props.reloadData();
    }

    get depth() {
        return this.props.graphData.depth || 0;
    }

    get maxDepth() {
        return this.props.graphData.maxDepth || 0;
    }

    get isShowing() {
        return this.maxDepth > 0;
    }

    handleDepthChange(e) {
        e.preventDefault();
        const depth = parseInt(e.target.value);
        this.props.thinkabletype.depth = depth;
        this.props.reloadData();
    }

    render() {
        if (!this.isShowing) return;

        return (
            <div className="absolute z-20 right-0 top-0 bottom-0 w-16 flex justify-center items-center pointer-events-none">
                <div className="flex items-center justify-center relative group">
                    <div
                        id="depth-label"
                        className="tooltip invisible group-hover:visible">
                        Depth {this.depth}
                    </div>
                    <input
                        type="range"
                        min="0"
                        max={this.maxDepth}
                        step="1"
                        value={this.depth}
                        id="depth-slider"
                        list="depths"
                        onChange={this.handleDepthChange.bind(this)}
                    />
                </div>
            </div>
        );
    }
}
