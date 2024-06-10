import React from "react";
import * as Icons from "@assets/Icons";

export default class Editor extends React.Component {
    constructor(props) {
        super(props);
        this.importRef = React.createRef();
        this.state = {
            show: false,
            activeUUID: null,
            isImporting: false,
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.activeUUID !== this.state.activeUUID) {
            document.getElementById(this.state.activeUUID).focus();
        }
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.state.show) {
            this.setState({ show: false });
        } else if (event.key === "`") {
            this.setState({ show: !this.state.show });
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

    removeAll() {
        if (window.confirm("Are you sure you want to remove everything?")) {
            while (this.props.thinkabletype.hyperedges.length > 0) {
                this.props.thinkabletype.hyperedges[0].remove();
            }
        }
    }

    handleImport(e) {
        const data = this.importRef.current.value;
        this.importRef.current.value = "";
        this.props.thinkabletype.parse(data);
        this.setState({ isImporting: false });
    }

    render() {
        return;

        if (!this.state.show) {
            return (
                <div className="relative group">
                    <button
                        onClick={() => this.setState({ show: true })}
                        id="editor-icon">
                        {Icons.EditorIcon(8)}
                    </button>
                    <div
                        className="tooltip invisible group-hover:visible"
                        id="editor-tooltip">
                        Editor
                    </div>
                </div>
            );
        }

        if (this.state.isImporting) {
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
                            <button
                                onClick={() => this.setState({ isImporting: false })}
                                id="editor-cancel-icon">
                                {Icons.CloseIcon(5)}
                                Cancel
                            </button>
                            <button
                                onClick={this.handleImport.bind(this)}
                                id="editor-import-icon">
                                <div className="rotate-45">{Icons.CloseIcon(4)}</div>
                                Import
                            </button>
                        </div>
                        <textarea
                            ref={this.importRef}
                            placeholder="symbol1,symbol2,symbol3&#10;symbol4,symbol5,symbol6&#10;..."></textarea>
                    </div>
                </div>
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
                        <button onClick={() => this.removeAll()} id="editor-remove-icon">
                            {Icons.CloseIcon(5)}
                            Remove All
                        </button>
                        <button
                            onClick={() => this.setState({ isImporting: true })}
                            id="editor-import-icon">
                            <div className="rotate-45">{Icons.CloseIcon(4)}</div>
                            Import
                        </button>
                        <button
                            onClick={() => this.props.saveFile()}
                            id="editor-save-icon">
                            {Icons.SaveIcon(5)}
                            Save File
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
                                        className="delete-node invisible group-hover/node:visible peer-focus:visible text-gray-700 dark:text-white">
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
