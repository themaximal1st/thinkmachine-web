import React from "react";
import Settings from "@lib/Settings";

import Interwingle0 from "@assets/interwingle-0.png";
import Interwingle1 from "@assets/interwingle-1.png";
import Interwingle2 from "@assets/interwingle-2.png";
import Interwingle3 from "@assets/interwingle-3.png";

export default class Interwingle extends React.Component {
    constructor(props) {
        super(props);
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    get interwingles() {
        return [Interwingle0, Interwingle1, Interwingle2, Interwingle3];
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(event) {
        if (event.key !== "Tab") return;

        if (event.target.tagName === "INPUT" || event.target.tagName === "button") {
            return;
        }

        event.preventDefault();
        this.toggleInterwingle(undefined, event.shiftKey);
    }

    async toggleInterwingle(interwingle = undefined, backwards = false) {
        if (typeof interwingle === "undefined") {
            interwingle = this.props.schematic.interwingle;
            interwingle = backwards ? interwingle - 1 : interwingle + 1;
            if (interwingle > 3) interwingle = 0;
            if (interwingle < 0) interwingle = 3;
        }
        this.props.schematic.interwingle = interwingle;
        Settings.interwingle = interwingle;
        this.props.reloadData();
    }

    interwingleDescription(idx) {
        switch (idx) {
            case 0:
                return "Don't connect";
            case 1:
                return "Connect start";
            case 2:
                return "Connect start & end";
            case 3:
                return "Connect all";
            default:
                return "Interwingle";
        }
    }

    render() {
        return (
            <div className="" id="interwingle">
                {this.interwingles.map((interwingle, index) => (
                    <div key={`interwingle-${index}`} className="group relative">
                        <div
                            className="tooltip invisible group-hover:visible"
                            id="interwingle-tooltip">
                            {this.interwingleDescription(index)}
                        </div>
                        <button
                            className={
                                this.props.schematic.interwingle === index ? "active" : ""
                            }
                            onClick={() => this.toggleInterwingle(index)}>
                            <img src={interwingle} />
                        </button>
                    </div>
                ))}
            </div>
        );
    }
}
