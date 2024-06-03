import Component from "./Component";
import * as Icons from "@assets/Icons";

export default class EditPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            shiftKey: false,
        };
    }

    code() {
        return (
            <div className="flex items-center gap-1 w-full" id="edit">
                <form className="flex items-center gap-1 w-full group">
                    <input
                        type="text"
                        className="bg-transparent w-full text-gray-700 dark:text-white focus:outline-none px-2 peer"
                        placeholder="Symbol"
                        autoComplete="off"
                        data-1p-ignore
                        onChange={() => ""}
                        autoFocus
                        value={this.props.node.name || ""}
                    />
                    <button
                        type="submit"
                        className="text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                        {Icons.CheckmarkIcon(4)}
                        {this.props.node.name ? "Rename" : "Save"}
                    </button>
                </form>

                <button
                    id="add-node"
                    className="text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.AddNodeIcon(4)}
                    Add
                </button>
                <button
                    id="prepend-node"
                    className="text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.PrependNodeIcon(4)}
                    Insert
                </button>
                <button
                    id="fork-node"
                    className="text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.ForkIcon(4)}
                    Fork
                </button>
                <button
                    id="connect-node"
                    className={`${
                        this.props.connectMode ? "active" : ""
                    } text-gray-400 dark:text-gray-300 hover:text-gray-700 dark:hover:text-white transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs`}>
                    {Icons.ConnectIcon(4)}
                    Connect
                </button>
                <button
                    id="remove-node"
                    className="absolute -bottom-8 right-4 opacity-50 hover:opacity-100 text-red-300 hover:text-red-400 transition-all p-2 outline-none flex items-center gap-1 uppercase tracking-wider text-xs">
                    {Icons.CloseIcon(4)}
                    Remove
                </button>
            </div>
        );
    }

    load(div) {
        const input = div.querySelector("#edit form input");

        input.addEventListener("keydown", (event) => {
            if (event.key === "Shift") {
                this.state.shiftKey = true;
            }
        });

        input.addEventListener("keyup", (event) => {
            if (event.key === "Shift") {
                this.state.shiftKey = false;
            }
        });

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

        div.querySelector("#remove-node").addEventListener("click", () => {
            this.removeNode();
        });

        // auto focus input
        setTimeout(() => {
            div.querySelector("input").focus();
        }, 100);
    }

    async renameNode(name) {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        node.rename(name);
        this.props.save();

        if (this.state.shiftKey) {
            await this.activateAndEditNode(node.add(""));
        }
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

    async removeNode() {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        const nextNode = node.prev() || node.next();

        node.remove();
        await this.props.save();

        if (nextNode) {
            await this.activateAndEditNode(nextNode);
        }
    }
}
