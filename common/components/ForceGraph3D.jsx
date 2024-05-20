import { ForceGraph3D as ForceGraph3DComponent } from "react-force-graph";
import Settings from "@lib/Settings";

// TODO: Way to generate props from defaultProps based on current graph

export default function ForceGraph3D(props) {
    return <ForceGraph3DComponent controlType={Settings.controlType} {...props} />;
}
