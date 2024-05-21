import { ForceGraph2D as ForceGraph2DComponent } from "react-force-graph";
import React from "react";

import * as utils from "@lib/utils";

export default class ForceGraph2D extends React.Component {
    render() {
        return (
            <ForceGraph2DComponent
                ref={this.props.graphRef} // won't allow in prop?
                nodeCanvasObject={this.nodeCanvasObject.bind(this)}
                nodePointerAreaPaint={this.nodePointerAreaPaint.bind(this)}
                {...this.props}
            />
        );
    }

    nodeCanvasObject(node, ctx, globalScale) {
        if (this.props.hideLabels) {
            return null;
        }

        const label = node.name;
        let baseFontSize = 20;
        let exponent = -0.6; // Adjust this value based on testing to find the right feel.
        let fontSize = baseFontSize * Math.pow(globalScale, exponent);

        ctx.font = `${fontSize}px sans-serif`;
        const textWidth = ctx.measureText(label).width;
        const bckgDimensions = [textWidth, fontSize].map((n) => n + fontSize * 0.2); // some padding

        if (!node.bridge) {
            ctx.fillStyle = utils.hexToRGBA("#FAFAFA", 1);
            ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                ...bckgDimensions
            );

            ctx.textAlign = "center";
            ctx.textBaseline = "middle";
            ctx.fillStyle = node.color;
            ctx.fillText(label, node.x, node.y);
        }

        node.__bckgDimensions = bckgDimensions; // to re-use in nodePointerAreaPaint
    }

    nodePointerAreaPaint(node, color, ctx) {
        ctx.fillStyle = color;
        const bckgDimensions = node.__bckgDimensions;
        bckgDimensions &&
            ctx.fillRect(
                node.x - bckgDimensions[0] / 2,
                node.y - bckgDimensions[1] / 2,
                ...bckgDimensions
            );
    }
}
