import * as Icons from "@assets/Icons";
import Component from "./Component";
import * as utils from "@lib/utils";

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
        return [
            ["Explain", Icons.ChatIcon(5)],
            ["Images", Icons.ScreenshotIcon(5)],
            ["Filter", Icons.SearchIcon(5)],
            ["Generate", Icons.GenerateIcon(5)],
            ["-"],
            ["Edit", Icons.EditIcon(5)],
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

    events(div) {
        const buttons = div.querySelectorAll("#active-node-toolbar button");
        for (let button of buttons) {
            button.addEventListener("click", this.handleButtonClick.bind(this));
        }
    }

    handleButtonClick(e) {
        const mode = e.target.dataset.mode;
        switch (mode) {
            case "Explain":
                this.props.setActiveMode(mode);
                break;
            case "Edit":
                this.props.setActiveMode(mode);
                break;
            case "Filter":
                return this.handleClickFilter();
            default:
                break;
        }
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

    // TODO: insert
    // TODO: fork?
}

// General edit mode?
// Rename
// Add
// Fork
// Insert
