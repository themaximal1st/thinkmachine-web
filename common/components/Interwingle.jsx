import React from "react";

import Interwingle0 from "@assets/interwingle-0.png";
import Interwingle1 from "@assets/interwingle-1.png";
import Interwingle2 from "@assets/interwingle-2.png";
import Interwingle3 from "@assets/interwingle-3.png";

export default class Interwingle extends React.Component {
    get interwingles() {
        return [Interwingle0, Interwingle1, Interwingle2, Interwingle3];
    }

    render() {
        if (this.props.numberOfNodes === 0) return null;

        return (
            <div className="" id="interwingle">
                {this.interwingles.map((interwingle, index) => (
                    <button
                        key={`interwingle-${index}`}
                        className={this.props.interwingle === index ? "active" : ""}
                        onClick={() => this.props.toggleInterwingle(index)}>
                        <img src={interwingle} />
                    </button>
                ))}
            </div>
        );
    }
}
