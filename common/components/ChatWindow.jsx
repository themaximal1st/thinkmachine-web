import { bouncy } from "ldrs";
bouncy.register();

import { Rnd } from "react-rnd";
import * as Icons from "@assets/Icons.jsx";

export default function ChatWindow(params) {
    if (!params.showChat) return;

    const sortedMessages = params.chatMessages.sort((a, b) => {
        return b.timestamp - a.timestamp;
    });

    return (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
            <Rnd
                size={{
                    width: params.chatWindow.width,
                    height: params.chatWindow.height,
                }}
                minWidth="300"
                minHeight="200"
                cancel=".nodrag"
                position={{ x: params.chatWindow.x, y: params.chatWindow.y }}
                onDragStop={(e, d) => {
                    params.updateChatWindow({ x: d.x, y: d.y });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    params.updateChatWindow({
                        width: ref.style.width,
                        height: ref.style.height,
                        ...position,
                    });
                }}
            >
                <div className="bg-gray-1000/70 h-full w-full overflow-hidden rounded-lg text-gray-50">
                    <div className="flex flex-col justify-between h-full">
                        <div className="p-2 bg-gray-1000 flex justify-between items-center">
                            <div className="uppercase text-sm select-none tracking-widest font-medium text-gray-200 flex gap-2 items-center">
                                {Icons.ChatIcon(4)}
                                CHAT
                            </div>
                            <a
                                onClick={() => {
                                    params.toggleChatWindow(false);
                                }}
                                className="nodrag hover:cursor-pointer"
                            >
                                {Icons.CloseIcon(4)}
                            </a>
                        </div>
                        <div className="grow nodrag cursor-auto flex flex-col-reverse gap-8 p-2 overflow-y-scroll">
                            {sortedMessages.length === 0 && (
                                <div className="flex flex-col gap-4">
                                    <div>Welcome to Think Machine Chat.</div>
                                    <div>
                                        Ask a question about your knowledge
                                        graph and Think Machine will use the
                                        current view to answer it.
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
                                        <div className="whitespace-pre-wrap">
                                            {i === 0 &&
                                                params.isChatting &&
                                                message.content.length ===
                                                    0 && (
                                                    <div className="text-white">
                                                        <l-bouncy
                                                            size="15"
                                                            speed="1.75"
                                                            color="white"
                                                        ></l-bouncy>
                                                    </div>
                                                )}
                                            {i === 0 &&
                                                !params.isChatting &&
                                                message.content.length ===
                                                    0 && (
                                                    <em class="text-sm">
                                                        (no content)
                                                    </em>
                                                )}
                                            {message.content}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <form
                                onSubmit={params.handleChatMessage}
                                className="flex items-center relative mt-2"
                            >
                                <input
                                    ref={params.chatInputRef}
                                    placeholder="Type your message here..."
                                    className="w-full p-2 text-gray-50 rounded-b-lg bg-gray-900 focus:bg-gray-600 focus:outline-none nodrag placeholder:text-gray-400"
                                />
                                {!params.isChatting && (
                                    <input
                                        type="submit"
                                        value="→"
                                        className="absolute text-white right-4 hover:cursor-pointer"
                                    />
                                )}
                                {params.isChatting && (
                                    <a
                                        onClick={() =>
                                            params.toggleIsChatting(false)
                                        }
                                        className="absolute text-white right-4 hover:cursor-pointer"
                                    >
                                        {Icons.CloseIcon(4)}
                                    </a>
                                )}
                            </form>
                        </div>
                    </div>
                </div>
            </Rnd>
        </div>
    );
}
