import React from "react";
import { Rnd } from "react-rnd";
import * as Icons from "@assets/Icons.jsx";
import Markdown from "react-markdown";
import slugify from "slugify";
import Color from "@lib/Color";

// TODO: refactor these to common components

export default class ChatModal extends React.Component {
    constructor(props) {
        super(props);
        this.ref = React.createRef();
        this.state = {
            messages: [],
            isChatting: false,
            x: window.innerWidth / 2 - 210,
            y: 100,
            width: 420,
            height: 200,
        };
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.isChatModalOpen !== this.props.isChatModalOpen &&
            this.props.isChatModalOpen
        ) {
            const input = this.props.typerRef.current.value;
            if (!input || input.length === 0) return;
            this.props.typerRef.current.value = "";
            this.handleChat(input);
        }
    }

    async handleChatMessage(e) {
        e.preventDefault();
        const input = this.ref.current.value;
        if (!input || input.length === 0) return;
        this.ref.current.value = "";
        await this.handleChat(input);
    }

    async handleChat(input) {
        const messages = this.state.messages;
        messages.push({
            role: "user",
            content: input,
        });

        this.setState({
            isChatting: true,
            messages,
        });

        const hyperedges = this.props.schematic.symbols;

        const options = {
            model: "gpt-4o",
        };

        const activeSymbol = this.props.trackedActiveNodeUUID
            ? this.props.schematic.nodeByUUID(this.props.trackedActiveNodeUUID).symbol
            : null;
        const stream = await window.api.chat(messages, hyperedges, activeSymbol, options);

        let output = "";
        for await (const message of stream) {
            output += message;

            this.setState({
                isChatting: true,
                messages: [...messages, { role: "assistant", content: output }],
            });
        }

        this.setState({ isChatting: false });
    }

    // TODO: extract this out with Explain dupe
    async handleLinkClick(e, symbol) {
        e.preventDefault();

        const slug = slugify(symbol);

        for (const n of this.props.graphData.nodes) {
            if (n.uuid === this.props.trackedActiveNodeUUID) continue;
            const node = this.props.schematic.nodeByUUID(n.uuid);
            if (!node) continue;
            if (node.matches(slug)) {
                this.props.setActiveNodeUUID(node.uuid);
                return;
            }
        }

        // node wasn't found in current graph, so we need to expand out until we find it
        for (const node of this.props.schematic.nodes) {
            if (node.matches(slug)) {
                this.props.setActiveNodeUUID(node.uuid);

                const filters = this.props.filters;
                filters.push({ node: node.uuid });
                await this.props.setFilters(filters);

                for (
                    let interwingle = this.props.schematic.interwingle;
                    interwingle <= 3;
                    interwingle++
                ) {
                    this.props.schematic.interwingle = interwingle;

                    for (let i = 0; i < 5; i++) {
                        this.props.schematic.depth = i;
                        await this.props.reloadData();
                    }
                }

                return;
            }
        }
    }

    linkContent(content) {
        if (!content || content.length === 0) return "";

        return (
            <Markdown
                components={{
                    a: (props) => {
                        return (
                            <a
                                href={props.href}
                                onClick={(e) => this.handleLinkClick(e, props.children)}
                                className="pointer-events-auto cursor-pointer">
                                {props.children}
                            </a>
                        );
                    },
                }}>
                {content}
            </Markdown>
        );
    }

    render() {
        if (!this.props.isChatModalOpen) return null;

        const sortedMessages = Array.from(this.state.messages).reverse();

        return (
            <Rnd
                size={{
                    width: this.state.width,
                    height: this.state.height,
                }}
                minWidth="300"
                minHeight="200"
                cancel=".nodrag"
                className="z-50 shadow-lg"
                position={{ x: this.state.x, y: this.state.y }}
                onDragStop={(e, d) => {
                    this.setState({ x: d.x, y: d.y });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    this.setState({
                        width: ref.style.width,
                        height: ref.style.height,
                        ...position,
                    });
                }}>
                <div className="bg-gray-100 dark:bg-gray-1000 h-full w-full overflow-hidden rounded-lg text-gray-600 dark:text-gray-50">
                    <div className="flex flex-col justify-between h-full">
                        <div className="p-2 bg-gray-100 dark:bg-gray-1000 flex justify-between items-center">
                            <div className="uppercase text-sm select-none tracking-widest font-medium text-gray-600 dark:text-gray-200 flex gap-2 items-center">
                                {Icons.ChatIcon(4)}
                                CHAT
                            </div>
                            <a
                                onClick={() => {
                                    this.props.toggleChatModal(false);
                                    this.setState({ messages: [] });
                                }}
                                className="nodrag hover:cursor-pointer">
                                {Icons.CloseIcon(4)}
                            </a>
                        </div>
                        <div className="grow nodrag cursor-auto flex flex-col-reverse gap-8 p-2 overflow-y-scroll">
                            {sortedMessages.length === 0 && (
                                <div className="flex flex-col gap-4">
                                    <div>Welcome to Think Machine Chat.</div>
                                    <div>
                                        Ask a question about your knowledge graph and
                                        Think Machine will use the current view to answer
                                        it.
                                    </div>
                                </div>
                            )}
                            {sortedMessages.map((message, i) => {
                                if (message.role === "system") return;
                                return (
                                    <div key={`message-${i}`}>
                                        <div className="flex items-center gap-1">
                                            <div className="text-xs tracking-wider">
                                                {message.role.toUpperCase()}
                                            </div>
                                            {message.model && (
                                                <div className="text-xs text-gray-400">
                                                    ({message.model})
                                                </div>
                                            )}
                                        </div>
                                        <div className="whitespace-pre-wrap markdown">
                                            {i === 0 &&
                                                this.state.isChatting &&
                                                message.content.length === 0 && (
                                                    <div className="text-white">
                                                        <l-bouncy
                                                            size="15"
                                                            speed="1.75"
                                                            color="white"></l-bouncy>
                                                    </div>
                                                )}
                                            {i === 0 &&
                                                !this.state.isChatting &&
                                                message.content.length === 0 && (
                                                    <em className="text-sm">
                                                        (no content)
                                                    </em>
                                                )}
                                            {this.linkContent(message.content)}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <form
                                onSubmit={this.handleChatMessage.bind(this)}
                                className="flex items-center relative mt-2">
                                <input
                                    ref={this.ref}
                                    placeholder="Type your message here..."
                                    className="w-full p-2 text-gray-600 dark:text-gray-50 rounded-b-lg bg-gray-50/50 dark:bg-gray-900/30 focus:bg-gray-50/80 dark:focus:bg-gray-700/40 focus:outline-none nodrag placeholder:text-gray-400"
                                />
                                {!this.state.isChatting && (
                                    <input
                                        type="submit"
                                        value="→"
                                        className="absolute text-gray-600 dark:text-white right-4 hover:cursor-pointer"
                                    />
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </Rnd>
        );
    }
}
