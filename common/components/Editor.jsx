import React from "react";
import * as Icons from "@assets/Icons";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            activeUUID: null,
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.activeUUID !== this.state.activeUUID) {
            document.getElementById(this.state.activeUUID).focus();
        }
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.state.show) {
            this.setState({ show: false });
        }
    }

    handleInputKeyDown(node, e) {
        let nextNode;

        if (e.key === "Enter" && e.shiftKey) {
            nextNode = this.props.thinkabletype.add([""]).firstNode;
        } else if (e.key === "Enter" && !e.shiftKey && node.symbol !== "") {
            nextNode = node.isLast ? node.hyperedge.add("") : node.next();
            e.target.blur();
        } else if (e.key === "Backspace" && e.target.value === "") {
            e.preventDefault();
            nextNode = node.prev() || node.hyperedge.prev().lastNode;
            node.remove();
        } else if (e.key === "ArrowRight" && e.shiftKey) {
            nextNode = node.next();
            e.preventDefault();
        } else if (e.key === "ArrowLeft" && e.shiftKey) {
            nextNode = node.prev();
            e.preventDefault();
        } else if (e.key === "ArrowUp" && e.shiftKey) {
            const prevEdge = node.hyperedge.prev();
            if (prevEdge) {
                nextNode = prevEdge.nodes[node.index] || prevEdge.lastNode;
            }
        } else if (e.key === "ArrowDown" && e.shiftKey) {
            const nextEdge = node.hyperedge.next();
            if (nextEdge) {
                nextNode = nextEdge.nodes[node.index] || nextEdge.lastNode;
            }
        }

        if (nextNode) {
            this.setState({ activeUUID: nextNode.uuid });
        }
    }

    render() {
        if (!this.state.show) {
            return (
                <button onClick={() => this.setState({ show: true })} id="editor-icon">
                    {Icons.EditorIcon(8)}
                </button>
            );
        }

        return (
            <div id="editor">
                <button
                    onClick={() => this.setState({ show: false })}
                    id="editor-icon"
                    className="close">
                    {Icons.CloseIcon(8)}
                </button>
                <div id="editor-content">
                    <div id="editor-toolbar">
                        <button onClick={() => this.props.save()} id="editor-reset-icon">
                            {Icons.SaveIcon(5)}
                            Save
                        </button>
                        <button onClick={() => this.props.reset()} id="editor-save-icon">
                            {Icons.CloseIcon(5)}
                            Reset
                        </button>
                        <button
                            onClick={() => this.props.reset()}
                            id="editor-export-icon">
                            {Icons.SaveIcon(5)}
                            Export
                        </button>
                    </div>
                    {this.props.thinkabletype.hyperedges.map((hyperedge, idx) => (
                        <div
                            key={hyperedge.uuid}
                            className="hyperedge text-white group/edge">
                            {hyperedge.nodes.map((node, index) => (
                                <div className="node group/node" key={node.uuid}>
                                    <input
                                        value={node.symbol}
                                        tabIndex={idx * 10 + (index + 1)}
                                        className="peer"
                                        id={node.uuid}
                                        autoFocus={node.uuid === this.state.activeUUID}
                                        onKeyDown={(e) =>
                                            this.handleInputKeyDown(node, e)
                                        }
                                        onChange={(e) => node.rename(e.target.value)}
                                    />
                                    <button
                                        onClick={() => node.remove()}
                                        className="delete-node invisible group-hover/node:visible peer-focus:visible">
                                        {Icons.CloseIcon(5)}
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={() => {
                                    this.setState({ activeUUID: hyperedge.add("").uuid });
                                }}
                                className="invisible group-hover/edge:visible"
                                id="editor-add-symbol">
                                {Icons.AddIcon(4)}
                                Add
                            </button>
                        </div>
                    ))}

                    <button
                        onClick={() => {
                            this.setState({
                                activeUUID: this.props.thinkabletype.add([""]).firstNode
                                    .uuid,
                            });
                        }}
                        id="editor-add-hyperedge">
                        {Icons.AddIcon(4)}
                        Add
                    </button>
                </div>
            </div>
        );
    }
}
