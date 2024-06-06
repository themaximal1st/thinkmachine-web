import * as Icons from "@assets/Icons";
import Component from "./Component";
import * as utils from "@lib/utils";
import toast from "react-hot-toast";
import Settings from "@lib/Settings";

export default class Toolbar extends Component {
    isMode(mode) {
        if (mode === "Filter" && this.isBeingFiltered) {
            return true;
        }
        return this.props.activeMode === mode;
    }

    get isBeingFiltered() {
        const filter = { node: this.props.node.uuid };
        const filters = this.props.filters || [];
        const idx = utils.filterIndex(filter, filters);
        return idx !== -1;
    }

    get buttons() {
        if (Settings.llmIsDisabled) {
            return [
                ["Notes", Icons.EditIcon(5)],
                ["Media", Icons.ScreenshotIcon(5)],
                ["Filter", Icons.SearchIcon(5)],
                ["-"],
                ["Edit", Icons.DotsIcon(5)],
            ];
        }

        return [
            ["Notes", Icons.EditIcon(5)],
            ["Explain", Icons.ChatIcon(5)],
            ["Media", Icons.ScreenshotIcon(5)],
            ["Filter", Icons.SearchIcon(5)],
            ["Generate", Icons.GenerateIcon(5)],
            ["-"],
            ["Edit", Icons.DotsIcon(5)],
        ];
    }

    code() {
        return (
            <div className="toolbar" id="active-node-toolbar">
                {this.buttons.map(([label, icon], idx) => {
                    if (label === "-") {
                        return <div key={`divider-${idx}`} className="grow"></div>;
                    }
                    return (
                        <button
                            key={label}
                            className={this.isMode(label) ? "active group" : "group"}
                            data-mode={label}>
                            {icon}
                            <div className="tooltip invisible group-hover:visible">
                                {label}
                            </div>
                        </button>
                    );
                })}
            </div>
        );
    }

    load(div) {
        const buttons = div.querySelectorAll("#active-node-toolbar button");
        for (let button of buttons) {
            button.addEventListener("click", this.handleButtonClick.bind(this));
        }
    }

    handleButtonClick(e) {
        const mode = e.target.dataset.mode;
        switch (mode) {
            case "Explain":
            case "Edit":
            case "Media":
            case "Notes":
                this.props.setActiveMode(mode);
                break;
            case "Filter":
                return this.handleClickFilter();
            case "Generate":
                return this.handleGenerate();
            default:
                break;
        }

        this.props.toggleConnectMode(false);
    }

    handleClickFilter() {
        const filter = { node: this.props.node.uuid };
        const filters = this.props.filters || [];
        const idx = utils.filterIndex(filter, filters);
        if (idx === -1) {
            filters.push(filter);
        } else {
            filters.splice(idx, 1);
        }

        this.props.setFilters(filters);
    }

    async handleGenerate() {
        try {
            const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
            toast.success(`Generating from ${node.symbol}...`);
            const options = { model: Settings.llmModel };
            const symbols = await window.api.generateOne(
                node.symbol,
                node.hyperedge.symbols,
                node.hypergraph.symbols,
                options
            );

            const edge = this.props.thinkabletype.add(symbols);
            await this.props.setActiveNodeUUID(edge.lastNode.uuid);
        } catch (e) {
            console.log(e);
            toast.error("Error while generating");
        }
    }
}
