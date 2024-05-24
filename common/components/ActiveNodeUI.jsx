import { renderToStaticMarkup } from "react-dom/server";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import * as Three from "three";

class Component {
    constructor(props = {}) {
        this.props = props;
    }

    render() {
        const html = this.code();
        const div = Component.createElement(html);
        this.events(div);
        return this.wrap(div);
    }

    code() {
        throw new Error("code() not implemented");
    }

    events() {
        return;
    }

    wrap(div) {
        const obj = new CSS2DObject(div);
        const group = new Three.Group();
        group.add(this.props.title);
        group.add(obj);

        const titleSize = Component.calculateTextSize(this.props.title);
        const objSize = Component.calculateTextSize(obj);

        const contentY = -titleSize.y - objSize.y / 2 + 2;

        obj.position.copy(new THREE.Vector3(0, contentY, -1));
        return group;
    }

    static calculateTextSize(obj) {
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

export default class ActiveNodeUI extends Component {
    code() {
        return (
            <div className="absolute text-white w-full max-w-xl pointer-events-auto">
                <div className="w-[600px] ml-[-300px] bg-gray-1000">
                    <a href="#" className="text-white">
                        CLICKABLE
                    </a>
                    BOOM TOWN
                    <br />
                    BOOM TOWN
                    <br />
                    BOOM TOWN
                    <br />
                    BOOM TOWN
                    <br />
                </div>
            </div>
        );
    }

    events(div) {
        console.log("events", div);
        const a = div.querySelector("a");
        a.addEventListener("click", (e) => {
            console.log("CLICKED A");
        });
    }
}
