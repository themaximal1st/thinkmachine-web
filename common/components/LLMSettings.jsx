export default function Settings(params) {
    if (!params.showLLMSettings) return;

    const services = [
        {
            name: "Claude 3 Opus",
            service: "anthropic",
            model: "claude-3-opus-20240229",
            description: "The best LLM",
        },
        {
            name: "Claude 3 Sonnet",
            service: "anthropic",
            model: "claude-3-sonnet-model",
            description: "Mixture of speed and quality",
        },
        {
            name: "Claude 3 Haiku",
            service: "anthropic",
            model: "claude-3-haiku-20240307",
            description: "Fastest smart LLM",
        },
        {
            name: "GPT-4 Turbo",
            service: "openai",
            model: "gpt-4-turbo-preview",
            description: "Traditionally the best LLM",
        },
        {
            name: "GPT-3.5",
            service: "openai",
            model: "gpt-3.5-turbo",
            description: "Fastest model from OpenAI",
        },
        {
            name: "Google Gemini",
            service: "google",
            model: "gemini-pro",
            description: "Good LLM from Google",
        },
        {
            name: "Mistral Large",
            service: "mistral",
            model: "mistral-large-latest",
            description: "Best open LLM",
        },
        {
            name: "Groq Mistral",
            service: "groq",
            model: "mixtral-8x7b-32768",
            description: "Fastest open LLM",
        },
    ];

    function handleCloseModal(e) {
        if (!e) return;
        if (!e.target) return;
        if (!e.target.id) return;
        if (e.target.id !== "settings-modal") return;
        e.stopPropagation();
        params.closeLLMSettings();
    }

    return (
        <div
            id="settings-modal"
            onClick={handleCloseModal}
            className="bg-black/90 text-white absolute z-40 inset-0 flex flex-col gap-4 justify-center items-center"
        >
            <div className="relative w-full max-w-lg mx-auto">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={params.closeLLMSettings}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
                </a>
                <div className="relative w-full max-w-lg mx-auto flex flex-col gap-4">
                    <div>
                        <h1 className="text-xl font-bold ">AI Model</h1>
                        <p>
                            Choose one of the models below to use during AI
                            brainstorming.
                        </p>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-col divide-gray-1000 divide-y">
                            {services.map((service, i) => {
                                return (
                                    <a
                                        key={`service-${i}`}
                                        onClick={(e) =>
                                            params.updateLLM(service)
                                        }
                                        className="text-sm flex w-full justify-between items-center py-3 pointer-events-auto hover:cursor-pointer hover:bg-gray-1000 px-2"
                                    >
                                        <div className="">
                                            <div>{service.name}</div>
                                            <div className="text-gray-300">
                                                {service.description}
                                            </div>
                                        </div>
                                        <div>
                                            {params.llm.service ===
                                                service.service &&
                                                params.llm.model ===
                                                    service.model && (
                                                    <div className="bg-gray-1000 border border-gray-900/50 rounded-full p-1 text-gray-100">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            fill="none"
                                                            viewBox="0 0 24 24"
                                                            strokeWidth={1.5}
                                                            stroke="currentColor"
                                                            className="w-5 h-5"
                                                        >
                                                            <path
                                                                strokeLinecap="round"
                                                                strokeLinejoin="round"
                                                                d="m4.5 12.75 6 6 9-13.5"
                                                            />
                                                        </svg>
                                                    </div>
                                                )}
                                        </div>
                                    </a>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
