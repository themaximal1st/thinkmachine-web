import * as Icons from "@assets/Icons";
import Component from "./Component";
import { Tooltip } from "react-tooltip";

export default class Toolbar extends Component {
    isMode(mode) {
        return this.props.activeMode === mode;
    }

    get buttons() {
        return [
            ["Explain", Icons.ChatIcon(5)],
            ["Generate", Icons.GenerateIcon(5)],
            ["Add", Icons.AddIcon(5)],
            ["Edit", Icons.EditIcon(5)],
            ["Images", Icons.ScreenshotIcon(5)],
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
            button.addEventListener("click", (e) => {
                this.props.setActiveMode(e.target.dataset.mode);
            });
        }
    }
}
