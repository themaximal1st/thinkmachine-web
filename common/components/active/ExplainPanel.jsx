import Component from "./Component";

export default class ExplainPanel extends Component {
    code() {
        const explain = this.props.explains.get(this.props.node.uuid) || "";
        return (
            <div>
                <div className="max-h-36 overflow-y-scroll">{explain}</div>
                <form id="chat">
                    <input
                        type="text"
                        id="chat-input"
                        placeholder="What do you want to know?"
                    />
                </form>
            </div>
        );
    }

    async load(div) {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        let explain = this.props.explains.get(node.uuid);

        if (explain === undefined) {
            this.props.setExplain(node.uuid, ""); // prevent stampeded
            console.log("FETCH EXPLAIN");
            const stream = await window.api.explain(node.symbol);
            explain = "";
            for await (const message of stream) {
                explain += message;
                this.props.setExplain(node.uuid, explain);
            }
        }
    }
}
