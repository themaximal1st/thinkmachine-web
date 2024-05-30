import Component from "./Component";
import * as Icons from "@assets/Icons";

export default class EditPanel extends Component {
    code() {
        return (
            <div className="flex items-center gap-1 w-full" id="edit">
                <form className="flex items-center gap-1 w-full group">
                    <input
                        type="text"
                        className="bg-transparent w-full text-white focus:outline-none px-2 peer"
                        placeholder="What is the symbol called?"
                        autoComplete="off"
                        data-1p-ignore
                        onChange={() => ""}
                        autoFocus
                        value={this.props.node.name || ""}
                    />
                    <button
                        type="submit"
                        className="text-gray-300 hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                        {Icons.CheckmarkIcon(4)}
                        {this.props.node.name ? "Rename" : "Save"}
                    </button>
                </form>

                <button
                    id="add-node"
                    className="text-gray-300 hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.AddNodeIcon(4)}
                    Add
                </button>
                <button
                    id="prepend-node"
                    className="text-gray-300 hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.PrependNodeIcon(4)}
                    Insert
                </button>
                <button
                    id="fork-node"
                    className="text-gray-300 hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.ForkIcon(4)}
                    Fork
                </button>
                <button
                    id="connect-node"
                    className={`${
                        this.props.connectMode ? "active" : ""
                    } text-gray-300 hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs`}>
                    {Icons.ConnectIcon(4)}
                    Connect
                </button>
            </div>
        );
    }

    load(div) {
        div.querySelector("#edit form").addEventListener("submit", (e) => {
            e.preventDefault();
            const input = e.target.querySelector("input");
            this.renameNode(input.value);
        });

        div.querySelector("#add-node").addEventListener("click", () => {
            this.addNode();
        });

        div.querySelector("#prepend-node").addEventListener("click", () => {
            this.prependNode();
        });

        div.querySelector("#fork-node").addEventListener("click", () => {
            this.forkNode();
        });

        div.querySelector("#connect-node").addEventListener("click", () => {
            this.connectNode();
        });

        // auto focus input
        setTimeout(() => {
            div.querySelector("input").focus();
        }, 100);
    }

    renameNode(name) {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        node.rename(name);
        this.props.save();
    }

    async activateAndEditNode(node) {
        this.props.setActiveMode("Edit");
        await this.props.setActiveNodeUUID(node.uuid);
        await this.props.reloadData();
    }

    async addNode() {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        await this.activateAndEditNode(node.add(""));
    }

    async prependNode() {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        await this.activateAndEditNode(node.insert(""));
    }

    async forkNode() {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        const symbols = node.hyperedge.symbols.slice(0, node.index + 1);
        symbols.push("");
        const edge = this.props.thinkabletype.add(symbols);
        await this.activateAndEditNode(edge.lastNode);
    }

    async connectNode() {
        this.props.toggleConnectMode();
    }
}
