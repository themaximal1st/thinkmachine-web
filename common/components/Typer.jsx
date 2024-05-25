import React from "react";

import * as Icons from "@assets/Icons";
import Settings from "@lib/Settings";

export default class Typer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            mode: Settings.typerMode,
        };
    }

    get buttons() {
        return [
            ["Add", Icons.AddIcon(3)],
            ["Generate", Icons.GenerateIcon(3)],
            ["Search", Icons.SearchIcon(3)],
        ];
    }

    isMode(mode) {
        return this.state.mode === mode;
    }

    setMode(mode) {
        this.setState({ mode });
        Settings.typerMode = mode;
    }

    render() {
        if (this.props.activeNodeUUID) {
            return;
        }

        return;

        return (
            <div id="typer">
                <select id="typer-select">
                    {this.buttons.map(([label, icon]) => (
                        <option className={label} key={label} value={label}>
                            {label}
                        </option>
                    ))}
                </select>
                <input type="text" id="typer-input" />
                <button id="typer-submit">Submit</button>
            </div>
        );
    }
}
