export default class Client {

    async handler(name, ...args) {
        return await this.send(name, { args });
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

        const methods = ["media"];

        for (const method of methods) {
            api[method] = async (...args) => {
                return await this.handler(method, ...args);
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
            console.log(data);
            if (!data.ok) throw new Error(`invalid response`);
            if (data.error) throw new Error(data.error);
            return data.data;
        } catch (e) {
            console.log(e);
            throw new Error(`JSON error! ${e.message}`)
        }
    }

    static setup() {
        if (window.api) return;
        const client = new Client();
        window.api = client.api;
    }
}
