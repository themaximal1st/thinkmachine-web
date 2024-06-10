import React from "react";
import * as Icons from "@assets/Icons";
import classNames from "classnames";

export default class Outliner extends React.Component {
    constructor(props) {
        super(props);
        this.importRef = React.createRef();
        this.state = {
            show: true,
        };
        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    componentDidUpdate(prevProps, prevState) {}

    handleKeyDown(event) {
        console.log("handleKeyDown", event.key);
    }

    handleInputKeyDown(node, e) {
        console.log("handleInputKeyDown", e.key);
    }

    render() {
        let lastEdgeUUID = null;
        let indent = 0;
        return (
            <div id="outliner">
                <div className="inner">
                    {this.props.graphData.nodes.map((node) => {
                        const edgeID = Array.from(node.edgeUUIDs)[0];
                        if (lastEdgeUUID && lastEdgeUUID === edgeID) {
                            indent += 1;
                        } else {
                            indent = 0;
                        }
                        lastEdgeUUID = edgeID;
                        return (
                            <div key={node.uuid} className={`indent-${indent}`}>
                                {node.name}
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    }
}
