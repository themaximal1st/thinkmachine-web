import * as Icons from "@assets/Icons";
import Component from "./Component";

export default class Toolbar extends Component {
    isMode(mode) {
        return this.props.activeMode === mode;
    }

    get buttons() {
        return [
            ["Explain", Icons.ChatIcon(3)],
            ["Generate", Icons.GenerateIcon(3)],
            ["Add", Icons.AddIcon(3)],
            ["Edit", Icons.EditIcon(3)],
            ["Images", Icons.ScreenshotIcon(3)],
            ["Filter", Icons.SearchIcon(3)],
        ];
    }

    code() {
        return (
            <div className="toolbar" id="active-node-toolbar">
                {this.buttons.map(([label, icon]) => (
                    <button
                        key={label}
                        className={this.isMode(label) ? "active" : ""}
                        data-mode={label}>
                        {icon}
                        {label}
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
