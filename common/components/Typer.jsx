import React from "react";

import * as Icons from "@assets/Icons";
import Settings from "@lib/Settings";

export default class Typer extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.state = {
            mode: Settings.typerMode,
            hyperedge: [],
            nodes: [],
        };
    }

    get buttons() {
        return [
            ["Add", Icons.AddIcon(4)],
            ["Generate", Icons.GenerateIcon(4)],
            ["Search", Icons.SearchIcon(4)],
            ["Chat", Icons.ChatIcon(4)],
        ];
    }

    isMode(mode) {
        return this.state.mode === mode;
    }

    setMode(mode) {
        this.setState({ mode });
        Settings.typerMode = mode;
    }

    get placeholder() {
        switch (this.state.mode) {
            case "Add":
                return "Add a new symbol";
            case "Generate":
                return "Generate knowledge graph";
            case "Search":
                return "Search knowledge graph";
            case "Chat":
                return "Chat with knowledge graph";
        }
    }

    deleteHyperedgeIndex(index) {
        const hyperedge = this.state.hyperedge;
        const nodes = this.state.nodes;
        hyperedge.splice(index, 1);
        nodes.splice(index, 1);
        this.setState({ hyperedge, nodes });
    }

    handleKeyDown(event) {
        if (event.key === "Backspace" && this.state.hyperedge.length > 0) {
            this.deleteHyperedgeIndex(this.state.hyperedge.length - 1);
            return;
        }
    }

    handleSubmit(event) {
        event.preventDefault();
        console.log("SUBMIT", event);

        const input = this.ref.current.value;

        switch (this.state.mode) {
            case "Add":
                this.addSymbol(input);
                break;
            case "Generate":
                this.generateGraph(input);
                break;
            case "Search":
                this.searchGraph(input);
                break;
            case "Chat":
                this.chatGraph(input);
                break;
        }
    }

    addSymbol(input) {
        if (input.trim().length === 0) {
            this.ref.current.value = "";
            this.setState({ hyperedge: [], nodes: [] });
            return;
        }

        const hyperedge = this.state.hyperedge;
        const nodes = this.state.nodes;
        hyperedge.push(input);

        const lastNode = nodes[nodes.length - 1];
        let node = null;
        if (lastNode) {
            node = lastNode.add(input);
        } else {
            node = this.props.thinkabletype.add([input]).firstNode;
        }

        nodes.push(node);
        this.setState({ hyperedge, nodes });
        this.ref.current.value = "";
    }

    generateGraph(input) {
        console.log("Generate graph", input);
    }

    searchGraph(input) {
        console.log("Search graph", input);
    }

    chatGraph(input) {
        console.log("Chat graph", input);
    }

    render() {
        if (this.props.activeNodeUUID) {
            return;
        }

        return (
            <div id="typer">
                <form
                    onSubmit={this.handleSubmit.bind(this)}
                    className="flex flex-col gap-2">
                    <div id="typer-toolbar">
                        {this.buttons.map(([label, icon], idx) => (
                            <button
                                className={this.state.mode === label ? "active" : ""}
                                onClick={() => this.setMode(label)}
                                key={`${idx}-${label}`}
                                value={label}>
                                {icon}
                                {label}
                            </button>
                        ))}
                    </div>
                    <input
                        ref={this.ref}
                        onKeyDown={this.handleKeyDown.bind(this)}
                        placeholder={this.placeholder}
                        type="text"
                        id="typer-input"
                    />
                    {this.state.hyperedge.length > 0 && (
                        <div id="typer-hyperedge">
                            {this.state.hyperedge
                                .map((symbol, index) => (
                                    <button
                                        onClick={() => this.deleteHyperedgeIndex(index)}
                                        key={index}>
                                        {symbol}
                                    </button>
                                ))
                                .reduce((prev, curr) => [
                                    prev,
                                    <div key={`${Math.random()}-sep`}>→</div>,
                                    curr,
                                ])}
                            <div key={`${Math.random()}-sep`}>→</div>
                        </div>
                    )}
                    <button type="submit" className="hidden" id="typer-submit">
                        Submit
                    </button>
                </form>
            </div>
        );
    }
}
