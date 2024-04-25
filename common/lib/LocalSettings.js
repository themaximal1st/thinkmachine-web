export default class LocalSettings {
    static get apikeys() {
        try {
            const apikeys = JSON.parse(window.localStorage.getItem("apikeys"));
            if (!apikeys) return {};
            if (typeof apikeys !== "object") return {};
            return apikeys;
        } catch (e) {
            return {};
        }
    }

    static set apikeys(apikeys) {
        window.localStorage.setItem("apikeys", JSON.stringify(apikeys));
    }

    static apiKeyForService(service) {
        try {
            return LocalSettings.apikeys[service];
        } catch (e) {
            return null;
        }
    }

    static get customSettings() {
        let llm;

        try {
            llm = JSON.parse(window.localStorage.getItem("customSettings"));
        } catch (e) {
            llm = {
                service: "ollama",
                model: "llama3",
                options: {
                    temperature: 1,
                },
            };
        }
        llm.name = "Custom";
        llm.custom = true;
        llm.description = "Use a custom, private LLM";
        return llm;
    }

    static set customSettings(customSettings) {
        window.localStorage.setItem("customSettings", JSON.stringify(customSettings));
    }

    static get services() {
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
                name: "Llama 3",
                service: "together",
                model: "meta-llama/Llama-3-8b-chat-hf",
                description: "Best open LLM",
            },
            {
                name: "Groq Mistral",
                service: "groq",
                model: "mixtral-8x7b-32768",
                description: "Fastest open LLM",
            },
        ];

        if (window.api.isElectron) {
            services.push(this.customSettings);
        }

        return services;
    }
}