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
        hyperedge.splice(index, 1);
        this.setState({ hyperedge });
    }

    handleDeleteHyperedgeIndex(event, index) {
        event.preventDefault();
        this.deleteHyperedgeIndex(index);
    }

    handleKeyDown(event) {
        if (
            event.key === "Backspace" &&
            this.ref.current.value.length === 0 &&
            this.state.hyperedge.length > 0
        ) {
            this.deleteHyperedgeIndex(this.state.hyperedge.length - 1);
            return;
        }
    }

    handleSubmit(event) {
        event.preventDefault();

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
            this.setState({ hyperedge: [] });
            return;
        }

        const lastHyperedge =
            this.props.thinkabletype.hyperedges[
                this.props.thinkabletype.hyperedges.length - 1
            ];
        let isMatch = false;
        if (lastHyperedge) {
            isMatch =
                JSON.stringify(lastHyperedge.symbols) ==
                JSON.stringify(this.state.hyperedge);
        }

        const hyperedge = this.state.hyperedge;

        hyperedge.push(input);
        const edge = this.props.thinkabletype.add(hyperedge);
        if (isMatch) {
            lastHyperedge.remove();
        }

        this.props.setActiveNodeUUID(edge.lastNode.uuid);

        this.setState({ hyperedge });
        this.ref.current.value = "";
    }

    async generateGraph(input) {
        if (!input || input.trim().length === 0) {
            return;
        }

        this.ref.current.value = "";

        console.log("Generate graph", input);
        let activeSymbol = this.props.activeNodeUUID
            ? this.props.thinkabletype.nodeByUUID(this.props.activeNodeUUID).symbol
            : null;

        const options = { model: Settings.llmModel };

        const hyperedges = await window.api.generateMany(
            input,
            activeSymbol,
            this.state.hyperedge,
            this.props.thinkabletype.symbols,
            options
        );

        for await (const hyperedge of hyperedges) {
            console.log("HYPEREDGE", hyperedge);
            this.props.thinkabletype.add(hyperedge);
        }
    }

    searchGraph(input) {
        if (!input || input.trim().length === 0) {
            return;
        }

        const filters = this.props.filters;
        filters.push([input]);
        this.props.setFilters(filters);

        for (const node of this.props.thinkabletype.nodes) {
            if (node.equals(input)) {
                this.props.setActiveNodeUUID(node.uuid);
                break;
            }
        }

        this.ref.current.value = "";
    }

    chatGraph(input) {
        console.log("Chat graph", input);
    }

    render() {
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
                                type="button"
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
                                        type="button"
                                        onClick={(e) =>
                                            this.handleDeleteHyperedgeIndex(e, index)
                                        }
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
