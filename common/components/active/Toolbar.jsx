import * as Icons from "@assets/Icons";
import Component from "./Component";

export default class Toolbar extends Component {
    isMode(mode) {
        return this.props.activeMode === mode;
    }

    get buttons() {
        return [
            ["Explain", Icons.ChatIcon(5)],
            ["Edit", Icons.EditIcon(5)],
            ["Add", Icons.AddIcon(5)],
            ["Images", Icons.ScreenshotIcon(5)],
            ["Generate", Icons.GenerateIcon(5)],
            ["Filter", Icons.SearchIcon(5)],
        ];
    }

    code() {
        return (
            <div className="toolbar" id="active-node-toolbar">
                {this.buttons.map(([label, icon]) => (
                    <button
                        key={label}
                        className={this.isMode(label) ? "active group" : "group"}
                        data-mode={label}>
                        {icon}
                        <div className="tooltip invisible group-hover:visible">
                            {label}
                        </div>
                    </button>
                ))}
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
        const f = { node: this.props.node.uuid };

        const filter = this.props.filter || [];

        // cheap and easy avoid duplicates
        for (const fx of filter) {
            if (f.node && fx.node === f.node) {
                return;
            } else if (f.edge && fx.edge === f.edge) {
                return;
            } else if (JSON.stringify(fx) === JSON.stringify(f)) {
                return;
            }
        }

        filter.push(f);
        this.props.setFilter(filter);
    }
}
