export default function Settings(params) {
    if (!params.showSettings) return;

    const services = [
        {
            name: "GPT-4 Turbo",
            service: "openai",
            model: "gpt-4-turbo-preview",
        },
        { name: "GPT-3.5", service: "openai", model: "gpt-3.5-turbo" },
        {
            name: "Claude 3 Opus",
            service: "anthropic",
            model: "claude-3-opus-20240229",
        },
        {
            name: "Claude 3 Sonnet",
            service: "anthropic",
            model: "claude-3-sonnet-model",
        },
        {
            name: "Claude 3 Haiku",
            service: "anthropic",
            model: "claude-3-haiku-20240307",
        },
        { name: "Google Gemini", service: "google", model: "gemini-pro" },
        {
            name: "Mistral Large",
            service: "mistral",
            model: "mistral-large-latest",
        },
        { name: "Groq Mistral", service: "groq", model: "mixtral-8x7b-32768" },
    ];

    return (
        <div className="bg-black/90 text-white absolute z-40 inset-0 flex flex-col gap-4 justify-center items-center">
            <div className="relative w-full max-w-lg mx-auto">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={params.closeSettings}
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
                    <h1 className="text-xl font-bold">AI Model</h1>

                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col divide-gray-1000 divide-y">
                            {services.map((service, i) => {
                                return (
                                    <a
                                        key={`service-${i}`}
                                        onClick={(e) =>
                                            params.updateLLM(service)
                                        }
                                        className="text-sm flex w-full justify-between items-center py-2 pointer-events-auto hover:cursor-pointer hover:bg-gray-1000 px-2 -mx-2"
                                    >
                                        <div className="">
                                            <div>{service.name}</div>
                                            <div className="text-gray-300">
                                                {service.model}
                                            </div>
                                        </div>
                                        <div>
                                            {params.llm.service ===
                                                service.service &&
                                                params.llm.model ===
                                                    service.model && (
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        strokeWidth={1.5}
                                                        stroke="currentColor"
                                                        className="w-6 h-6"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            d="m4.5 12.75 6 6 9-13.5"
                                                        />
                                                    </svg>
                                                )}
                                        </div>
                                    </a>
                                );
                            })}
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
