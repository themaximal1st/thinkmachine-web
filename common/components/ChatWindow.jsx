import { Rnd } from "react-rnd";
import * as Icons from "@assets/Icons.jsx";

export default function ChatWindow(params) {
    if (!params.showChat) return;

    const messages = [
        {
            role: "assistant",
            model: "Claude 3 Opus",
            text: "Welcome to Think Machine chat. Enter your message and your chatbot will respond using the knowledge in your graph.",
        },
        { role: "user", text: "Hello, please give me a summary of my data" },
        {
            role: "assistant",
            model: "Claude 3 Opus",
            text: "Welcome to Think Machine chat. Enter your message and your chatbot will respond using the knowledge in your graph.",
        },
        { role: "user", text: "Hello, please give me a summary of my data" },
        {
            role: "assistant",
            model: "Claude 3 Opus",
            text: "Welcome to Think Machine chat. Enter your message and your chatbot will respond using the knowledge in your graph.",
        },
        { role: "user", text: "Hello, please give me a summary of my data" },
        {
            role: "assistant",
            model: "Claude 3 Opus",
            text: "Welcome to Think Machine chat. Enter your message and your chatbot will respond using the knowledge in your graph.",
        },
        { role: "user", text: "Hello, please give me a summary of my data" },
        {
            role: "assistant",
            model: "Claude 3 Opus",
            text: "Welcome to Think Machine chat. Enter your message and your chatbot will respond using the knowledge in your graph.",
        },
        { role: "user", text: "Hello, please give me a summary of my data" },
    ];

    return (
        <div className="absolute inset-0 z-40 pointer-events-none overflow-hidden">
            <Rnd
                size={{
                    width: params.chatWindow.width,
                    height: params.chatWindow.height,
                }}
                cancel=".nodrag"
                position={{ x: params.chatWindow.x, y: params.chatWindow.y }}
                onDragStop={(e, d) => {
                    params.updateChatWindow({ x: d.x, y: d.y });
                }}
                onResizeStop={(e, direction, ref, delta, position) => {
                    console.log("ON RESIZE");
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
                            <div className="uppercase text-sm select-none tracking-widest font-medium text-gray-200">
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
                            {messages.reverse().map((message, i) => {
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
                                        <div>{message.text}</div>
                                    </div>
                                );
                            })}
                        </div>
                        <div>
                            <div className="flex items-center relative mt-2">
                                <input
                                    ref={params.chatInputRef}
                                    placeholder="Type your message here..."
                                    className="w-full p-2 text-gray-50 rounded-b-lg bg-gray-900 focus:bg-gray-600 focus:outline-none nodrag placeholder:text-gray-400"
                                />
                                <input
                                    type="submit"
                                    value="→"
                                    className="absolute text-white right-4 hover:cursor-pointer"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </Rnd>
        </div>
    );
}
