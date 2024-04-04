export default function Settings(params) {
    if (!params.showSettings) return;

    const services = {
        openai: "OpenAI",
        anthropic: "Anthropic",
        google: "Google",
        mistral: "Mistral",
        llamafile: "Llamafile",
        ollama: "Ollama",
    };

    const models = {
        openai: "gpt-4-turbo-preview",
        anthropic: "claude-3-opus",
        google: "gemini-1.5-pro",
        mistral: "mistral-large",
        llamafile: "",
        ollama: "",
    };

    const llm = params.llms[params.llm] || {};
    const model = llm.model || models[params.llm] || "";
    const apikey = llm.apikey || "";

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
                    <h1 className="text-4xl font-bold">Settings</h1>

                    <h2 className="text-2xl font-bold mt-4">
                        Large Language Models
                    </h2>
                    <div className="flex flex-col gap-6">
                        <label className="flex flex-col gap-2">
                            <div className="text-gray-200">Service</div>
                            <select
                                className="bg-black text-white focus:outline-none"
                                value={params.llm}
                                onChange={(e) => {
                                    params.updateService(e.target.value);
                                }}
                            >
                                {Object.keys(services).map((service) => {
                                    return (
                                        <option key={service} value={service}>
                                            {services[service]}
                                        </option>
                                    );
                                })}
                            </select>
                        </label>

                        <label className="flex flex-col gap-2">
                            <div className="text-gray-200">Model</div>
                            <input
                                type="text"
                                value={model}
                                onChange={(e) => {
                                    params.updateModel(
                                        e.target.value,
                                        params.llm
                                    );
                                }}
                                className="w-full bg-gray-1000 rounded-lg p-2 focus:outline-none"
                            />
                        </label>

                        <label className="flex flex-col gap-2">
                            <div className="text-gray-200">API Key</div>
                            <input
                                type="text"
                                value={apikey}
                                onChange={(e) => {
                                    params.updateKey(
                                        e.target.value,
                                        params.llm
                                    );
                                }}
                                className="w-full bg-gray-1000 rounded-lg p-2 focus:outline-none"
                            />
                        </label>
                    </div>
                </div>
            </div>
        </div>
    );
}
