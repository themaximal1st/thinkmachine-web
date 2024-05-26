import React from "react";

export default class Depth extends React.Component {
    constructor(props) {
        super(props);
    }

    get depth() {
        return this.props.graphData.depth || 0;
    }

    get maxDepth() {
        return this.props.graphData.maxDepth || 0;
    }

    handleDepthChange(e) {
        e.preventDefault();
        const depth = parseInt(e.target.value);
        this.props.thinkabletype.depth = depth;
        this.props.reloadData();
    }

    render() {
        if (this.maxDepth <= 0) return;

        console.log("RENDER", this.props.depth);

        return (
            <div className="absolute z-20 right-0 top-0 bottom-0 w-16 flex justify-center items-center">
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
