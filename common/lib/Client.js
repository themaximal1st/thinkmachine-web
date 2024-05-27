
export default class Client {

    handler(name, ...args) {
        throw new Error("Not implemented");
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
            media: (query) => {
                return this.handler("media", query);
            }
        }
    }
}
