export default class ThinkMachineAPI {
    constructor(uuid) {
        this.uuid = uuid;
    }

    static async load() {
        const api = new ThinkMachineAPI();
        return api;
    }
}