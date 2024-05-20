import { ForceGraph3D as ForceGraph3DComponent } from "react-force-graph";
import Settings from "@lib/Settings";
import React from "react";

export default class ForceGraph3D extends React.Component {
    render() {
        console.log(this.props);
        return (
            <ForceGraph3DComponent
                ref={this.props.graphRef} // won't allow in prop?
                controlType={Settings.controlType}
                {...this.props}
            />
        );
    }
}
