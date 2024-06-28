import { renderToStaticMarkup } from "react-dom/server";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import * as Three from "three";
import Component from "./Component";

import {
    init,
    classModule,
    propsModule,
    styleModule,
    eventListenersModule,
    h,
} from "snabbdom";

const patch = init([
    // Init patch function with chosen modules
    classModule, // makes it easy to toggle classes
    propsModule, // for setting properties on DOM elements
    styleModule, // handles styling on elements with support for animations
    eventListenersModule, // attaches event listeners
]);

export default class ActivePanel {
    constructor(props = {}) {
        this.props = props;
        this.node = this.props.schematic.nodeByUUID(this.props.activeNodeUUID);
        this.div = null;
    }

    render() {
        const html = this.code();
        this.div = Component.createElement(html);

        // this.load(div);

        return this.wrap(this.div);
    }

    update() {
        this.div.innerHTML = renderToStaticMarkup(this.code());
    }

    code() {
        // console.log("NODE", this.props);
        const node = this.props.schematic.nodeByUUID(this.props.activeNodeUUID);
        const hypertexts = node ? node.hypertexts : [];
        return (
            <div className="active-panel">
                {Math.random()}
                {hypertexts.map((h, idx) => (
                    <input
                        key={`hypertext-${node.uuid}-${idx}`}
                        id={`hypertext-${node.uuid}-${idx}`}
                        data-index={idx}
                        onChange={() => ""}
                        value={h.hypertext}
                    />
                ))}
            </div>
        );
    }

    load() {
        return;
    }

    unload() {
        return;
    }

    wrap(div) {
        const obj = new CSS2DObject(div);
        const group = new Three.Group();
        if (this.props.title) {
            group.add(this.props.title);
        }
        group.add(obj);

        const titleSize = Component.calculateTextSize(this.props.title);
        const objSize = Component.calculateTextSize(obj);

        const contentY = -titleSize.y - objSize.y / 2 + 2;

        obj.position.copy(new THREE.Vector3(0, contentY, -1));
        return group;
    }

    static calculateTextSize(obj = null) {
        if (!obj) return new THREE.Vector3(0, 0, 0);
        const bounds = new THREE.Box3().setFromObject(obj);
        const size = new THREE.Vector3();
        bounds.getSize(size);
        return size;
    }

    static createElement(html) {
        const div = document.createElement("div");
        div.innerHTML = renderToStaticMarkup(html);
        return div;
    }
}

/*
export default class ActivePanel extends Component {
    constructor() {
        super(...arguments);
        // this.props.schematic.addEventListener((data) => {
        //     const node = this.props.schematic.nodeByUUID(this.props.node.uuid);
        //     console.log("ACTIVE PANEL", node);
        // });
    }

    // code() {
    //     console.log("ACTIVE NODE CODE");
    //     // console.log("NODE", this.props);
    //     return (
    //         <div className="active-panel">
    //             {Math.random()}
    //             { {this.node.hypertexts.map((h, idx) => (
    //                 <input
    //                     key={`hypertext-${this.node.uuid}-${idx}`}
    //                     id={`hypertext-${this.node.uuid}-${idx}`}
    //                     data-index={idx}
    //                     onChange={() => ""}
    //                     value={h.hypertext}
    //                 />
    //             ))} }
    //         </div>
    //     );
    // }


    unload() {
        throw new Error("UNLOADING");
    }
}

*/

/*
class NodePanel extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            hypertexts: [],
            hash: null,
        };
    }

    get node() {
        return this.props.schematic.nodeByUUID(this.props.node.uuid);
    }

    componentDidMount() {
        this.props.schematic.addEventListener((data) => {
            this.update();
        });
    }

    componentDidUpdate() {
        // console.log("NODE UPDATE");
        this.update();
    }

    update() {
        if (!this.node) return;

        if (this.state.hash === this.props.schematic.hash) return;
        this.setState({
            hash: this.props.schematic.hash,
            hypertexts: this.node.hypertexts,
        });
    }

    onChange(e, idx) {
        const hypertexts = this.state.hypertexts;
        hypertexts[idx].value = e.target.value;
        this.setState({ hypertexts });
    }

    componentWillUnmount() {
        if (!this.node) return;
        const wrapper = document.getElementById(`node-panel-wrapper-${this.node.uuid}`);
        // console.log("WILL UNMOUNT", this.node.uuid);
        // console.log(wrapper);
    }

    get distance() {
        return this.props.distances[this.node.uuid] || Infinity;
    }

    render() {
        if (!this.node) return null;
        // console.log("NODE", this.node.hypertexts);
        //
        return (
            <div
                id={`node-panel-${this.node.uuid}`}
                className={classNames("node-panel-wrapper", {
                    // hidden: this.distance > 150 || this.node.hypertexts.length === 0,
                })}>
                <div
                    style={{ transform: `scale(${100 / this.distance})` }}
                    className="node-panel">
                    {this.state.hypertexts.map((h, idx) => {
                        return (
                            <textarea
                                onChange={(e) => this.onChange(e, idx)}
                                key={`hypertext-${this.node.uuid}-${idx}`}
                                value={h.hypertext}></textarea>
                        );
                    })}
                </div>
            </div>
        );
    }
}

import Component from "./Component";
import ExplainPanel from "./ExplainPanel";
import EditPanel from "./EditPanel";
import MediaPanel from "./MediaPanel";
import NotesPanel from "./NotesPanel";
import Toolbar from "./Toolbar";
import Context from "./Context";
import * as Icons from "@assets/Icons";
import Settings from "@lib/Settings";

export default class ActiveNode extends Component {
    constructor(props) {
        super(props);

        this.toolbar = new Toolbar(props);
        this.context = new Context(props);

        this.panels = {
            Media: new MediaPanel(props),
            Edit: new EditPanel(props),
            Notes: new NotesPanel(props),
        };

        if (!Settings.llmIsDisabled) {
            this.panels["Explain"] = new ExplainPanel(props);
        }
    }

    get panel() {
        const panel = this.panels[this.props.activeMode];
        if (panel) return panel;
        return this.panels["Edit"];
    }

    code() {
        return (
            <div id="active-node-wrapper" className="">
                <div className="" id="active-node">
                    <div className="" id="active-node-close">
                        {Icons.CloseIcon(5)}
                    </div>
                    {this.toolbar.code()}
                    {this.panel && (
                        <div id="active-node-panel" className="">
                            {this.panel.code()}
                        </div>
                    )}
                    {this.context.code()}
                </div>
            </div>
        );
    }

    load(div) {
        this.toolbar.load(div);
        if (this.panel) {
            this.panel.load(div);
        }
        this.context.load(div);

        div.querySelector("#active-node-close").addEventListener("click", () => {
            this.props.setActiveNodeUUID(null);
        });
    }

    unload() {
        this.toolbar.unload();
        if (this.panel) {
            this.panel.unload();
        }
        this.context.unload();
    }
}

*/
