import Component from "./Component";
import * as Icons from "@assets/Icons";

export default class EditPanel extends Component {
    code() {
        return (
            <form className="flex items-center gap-1 w-full" id="edit">
                <input
                    type="text"
                    className="bg-transparent w-full text-white focus:outline-none"
                    placeholder="What is the symbol called?"
                    autoComplete="off"
                    data-1p-ignore
                    onChange={() => ""}
                    autoFocus
                    value={this.props.node.name || ""}
                />
                <button
                    type="submit"
                    className="text-gray-300 hover:text-white transition-all p-2 outline-none">
                    {Icons.CheckmarkIcon(4)}
                </button>
            </form>
        );
    }

    events(div) {
        div.querySelector("form#edit").addEventListener("submit", (e) => {
            e.preventDefault();
            const input = e.target.querySelector("input");
            this.renameNode(input.value);
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
}
