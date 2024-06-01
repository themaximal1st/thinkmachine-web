import { renderToStaticMarkup } from "react-dom/server";
import { CSS2DObject } from "three/addons/renderers/CSS2DRenderer.js";
import * as Three from "three";

export default class Component {
    constructor(props = {}) {
        this.props = props;
    }

    render() {
        const html = this.code();
        const div = Component.createElement(html);
        this.load(div);
        return this.wrap(div);
    }

    code() {
        throw new Error("code() not implemented");
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
