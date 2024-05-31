export default class Client {

    async handler(name, ...args) {
        return await this.send(name, { args });
    }

    async stream_handler(name, ...args) {
        return await this.stream(name, { args });
    }

    get edition() {
        if (typeof process !== 'undefined' && process.versions && process.versions.hasOwnProperty('electron')) {
            return "electron";
        }

        return "web"
    }

    get api() {
        const api = {
            edition: this.edition,
        };

        const methods = ["media", "generateOne"];

        for (const method of methods) {
            api[method] = async (...args) => {
                return await this.handler(method, ...args);
            };
        }

        const stream_methods = ["explain", "chat", "generateMany"];

        for (const method of stream_methods) {
            api[method] = async (...args) => {
                return await this.stream_handler(method, ...args);
            };
        }

        return api;
    }

    async send(path, data = {}, timeout = 5000) {
        const controller = new AbortController()
        setTimeout(() => controller.abort(), timeout)
        const response = await fetch(`/api/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            signal: controller.signal,
            credentials: "include",
            body: JSON.stringify(data),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        try {
            const data = await response.json();
            if (!data.ok) throw new Error(`invalid response`);
            if (data.error) throw new Error(data.error);
            return data.data;
        } catch (e) {
            console.log(e);
            throw new Error(`JSON error! ${e.message}`)
        }
    }

    async *stream(path, data = {}, timeout = 5000) {
        data.stream = true;

        try {
            const response = await fetch(`/api/${path}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const reader = Client.readChunks(response.body.getReader());
            for await (const message of reader) {
                yield message;
            }
        } catch (error) {
            console.error(error);
            throw error;
        }
    }

    static readChunks(reader) {
        const decoder = new TextDecoder("utf-8");
        return {
            async *[Symbol.asyncIterator]() {
                let readResult = await reader.read();
                while (!readResult.done) {
                    const value = decoder.decode(readResult.value);
                    const lines = value.trim().split(/\n+/);
                    for (const line of lines) {
                        const json = JSON.parse(line.split("data: ")[1]);
                        yield json;
                    }
                    readResult = await reader.read();
                }
            },
        };
    }

    static setup() {
        if (window.api) return;
        const client = new Client();
        window.api = client.api;
    }
}
