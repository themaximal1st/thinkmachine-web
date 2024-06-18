import API from "../common/lib/API.js"

export default class WebBridge {
    constructor(app) {
        this.app = app;
        this.api = new API();
    }

    static async initialize(app) {
        const bridge = new WebBridge(app);
        await bridge.load();
        return bridge;
    }

    async load() {
        for (const method of this.api.methods) {
            this.post(`/api/${method}`, async ({ req, res }) => {
                return this.api[method](...req.body.args);
            });
        }
    }

    post(route, handler) {
        this.app.post(route, async (req, res) => {
            try {
                if (req.body.stream) {
                    res.setHeader('Content-Type', 'text/html; charset=utf-8');
                    res.setHeader('Transfer-Encoding', 'chunked');
                    res.setHeader('Cache-Control', 'no-cache');
                    res.setHeader('X-Accel-Buffering', 'no');

                    const data = await handler({ req, res });
                    for await (const message of data) {
                        res.write("data: " + JSON.stringify(message) + "\n\n");
                    }

                    res.end();
                } else {
                    const data = await handler({ req, res });

                    if (data && data.send) { return data }
                    return res.json({ ok: true, data });
                }
            } catch (e) {
                return res.json({ ok: false, error: e.message });
            }
        });
    }

}