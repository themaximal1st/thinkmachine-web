import React from "react";
import toast from "react-hot-toast";
import { matchSorter } from "match-sorter";

import * as Icons from "@assets/Icons";
import Settings from "@lib/Settings";

export default class Typer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: Settings.typerMode,
            showAutocomplete: false,
            hyperedge: [],
        };
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown.bind(this));
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown.bind(this));
    }

    async handleKeyDown(event) {
        if (!event.metaKey) return;

        switch (event.key) {
            case "1":
            case "2":
            case "3":
            case "4":
                this.setMode(this.buttons[event.key - 1][0]);
                event.preventDefault();
                break;
            default:
                break;
        }
    }

    get buttons() {
        return [
            ["Add", Icons.AddIcon(4)],
            ["Generate", Icons.GenerateIcon(4)],
            ["Search", Icons.SearchIcon(4)],
            ["Chat", Icons.ChatIcon(4)],
        ];
    }

    get ref() {
        return this.props.typerRef;
    }

    isMode(mode) {
        return this.state.mode === mode;
    }

    setMode(mode) {
        this.setState({ mode });
        Settings.typerMode = mode;
        this.ref.current.value = "";
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

    handleInputKeyDown(event) {
        if (
            this.state.mode === "Add" &&
            event.key === "Backspace" &&
            this.ref.current.value.length === 0 &&
            this.state.hyperedge.length > 0
        ) {
            this.deleteHyperedgeIndex(this.state.hyperedge.length - 1);
            return;
        }
    }

    handleInputChange(event) {
        if (this.state.mode === "Search") {
            if (event.target.value.length === 0) {
                this.setState({ showAutocomplete: false });
            } else {
                this.setState({ showAutocomplete: true });
            }
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

        toast.success(`Generating ${input}`);

        this.ref.current.value = "";

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
        this.props.toggleChatModal(true);
    }

    handleAutoComplete(symbol, adder = false) {
        this.ref.current.value = "";
        this.searchGraph(symbol);
    }

    get autocomplete() {
        if (!this.showAutoComplete) return [];

        const haystack = Array.from(this.props.thinkabletype.uniqueSymbols);
        const needle = this.ref.current.value;
        if (!needle) return haystack; // limit?

        return matchSorter(haystack, needle);
    }

    get showAutoComplete() {
        return this.state.mode === "Search" && this.state.showAutocomplete;
    }

    render() {
        const autocomplete = this.autocomplete;

        return (
            <>
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
                            onKeyDown={this.handleInputKeyDown.bind(this)}
                            onChange={this.handleInputChange.bind(this)}
                            onFocus={() => this.setState({ showAutocomplete: true })}
                            onBlur={() => {
                                // hack because blurring steals click event from button
                                setTimeout(() => {
                                    this.setState({ showAutocomplete: false });
                                }, 200);
                            }}
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

                <div
                    id="autocomplete"
                    className={this.showAutoComplete ? "" : "invisible"}>
                    <div className="scroll">
                        {autocomplete.map((symbol, index) => (
                            <button
                                onClick={(e) =>
                                    this.handleAutoComplete(symbol, e.shiftKey)
                                }
                                key={index}>
                                {symbol}
                            </button>
                        ))}
                    </div>
                </div>
            </>
        );
    }
}
