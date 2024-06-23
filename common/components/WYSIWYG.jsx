import React from "react";
import { getTextSelection, setTextSelection } from "@lib/Cursor";
import { getNodeAndOffsetFromIndex } from "@lib/Cursor";

export default class WYSIWYG extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            level: 0,
        };
    }

    componentDidUpdate(prevProps, prevState) {
        console.log("UPDATED");
        this.updateCursor();
    }

    children() {
        return this.props.schematic.tree.children;
    }

    onChange(event) {
        const wysiwyg = document.getElementById("wysiwyg");
        const selection = getTextSelection(wysiwyg);

        // setCurrentCursorPosition(start, wysiwyg);

        const value = event.currentTarget.innerHTML;
        // convert &gt; to >, &lt; to <, etc.
        const html = value.replace(/&gt;/g, ">").replace(/&lt;/g, "<");

        this.props.schematic.parseHTML(html);

        this.selection = selection.end;
        this.updateCursor();
    }

    updateCursor() {
        if (!this.selection) return;

        const wysiwyg = document.getElementById("wysiwyg");
        const offset = getNodeAndOffsetFromIndex(wysiwyg, this.selection);
        if (!offset) return;
        if (!offset.node) return;

        const sel = window.getSelection();

        var range = document.createRange();
        console.log("OFFSET", offset);

        range.setStart(offset.node, offset.offset);
        range.collapse(true);

        sel.removeAllRanges();
        sel.addRange(range);
    }

    render() {
        const html = this.props.schematic.html;
        return (
            <div
                id="wysiwyg"
                contentEditable={true}
                onInput={this.onChange.bind(this)}
                dangerouslySetInnerHTML={{ __html: html }}
            />
        );
    }
}

class Component extends React.Component {
    renderChildren() {
        if (!this.props.component.children) return null;
        return this.props.component.children.map((component, i) => {
            return (
                <Component
                    key={`paragraph-${this.props.component.uuid}-${i}`}
                    component={component}
                    level={this.props.level + 1}
                />
            );
        });
    }

    render() {
        if (this.props.component.type === "paragraph") {
            return <Paragraph component={this.props.component} />;
        } else if (this.props.component.type === "hyperedge") {
            return <Hyperedge component={this.props.component} />;
        } else if (this.props.component.type === "node") {
            return <Node component={this.props.component} />;
        } else {
            console.log("UNKNOWN COMPONENT", this.props.component.type);
        }
    }
}

class Paragraph extends Component {
    render() {
        return <div className="paragraph">{this.renderChildren()}</div>;
    }
}

class Hyperedge extends Component {
    render() {
        return (
            <div className="hyperedge">
                {this.renderChildren().map((child, index) => (
                    <React.Fragment key={index}>
                        {!!index && <div className="arrow">→</div>}
                        <div>{child}</div>
                    </React.Fragment>
                ))}
            </div>
        );
    }
}

class Node extends Component {
    render() {
        return <div className="node">{this.props.component.value}</div>;
    }
}
