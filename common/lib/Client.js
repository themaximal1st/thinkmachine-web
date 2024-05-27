
export default class Client {

    async handler(name, ...args) {
        console.log("HANDLING", name, args);
        return await this.send(name, { args });
    }

    get edition() {
        if (typeof process !== 'undefined' && process.versions && process.versions.hasOwnProperty('electron')) {
            return "electron";
        }
        return "web"
    }

    get api() {
        return {
            edition: this.edition,
            media: async (query) => {
                return await this.handler("media", query);
            }
        }
    }

    async send(path, options = {}) {
        const response = await fetch(`/api/${path}`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            // signal: controller.signal,
            credentials: "include",
            body: JSON.stringify(options),
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

    static setup() {
        if (window.api) return;
        const client = new Client();
        window.api = client.api;
    }
}
