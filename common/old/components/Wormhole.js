import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { ImprovedNoise } from "three/examples/jsm/math/ImprovedNoise.js"

export default class Wormhole {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.tubes = null;
        this.renderer = null;
        this.cancel = false;
    }

    get w() {
        return window.innerWidth;
    }

    get h() {
        return window.innerHeight;
    }

    animate(t) {
        if (this.cancel) return;

        requestAnimationFrame(this.animate.bind(this));
        this.tubes.forEach((tb) => tb.update());
        this.camera.position.x = Math.cos(t * 0.001) * 1.5;
        this.camera.position.y = Math.sin(t * 0.001) * 1.5;
        this.renderer.render(this.scene, this.camera);
    }

    handleWindowResize() {
        this.camera.aspect = this.w / this.h;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(this.w, this.h);
    }

    setup() {
        this.cancel = false;

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, this.w / this.h, 0.1, 1000);

        this.camera.position.set(0.5, 0.5, 15);
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.domElement.id = "wormhole";

        this.scene.fog = new THREE.FogExp2(0x000000, 0.025);
        this.renderer.setSize(this.w, this.h);

        document.body.appendChild(this.renderer.domElement);

        const controls = new OrbitControls(this.camera, this.renderer.domElement);
        controls.update();
        const radius = 3;
        const tubeLength = 200;
        const tubeGeo = new THREE.CylinderGeometry(radius, radius, tubeLength, 128, 4096, true);
        const tubeVerts = tubeGeo.attributes.position;
        const colors = [];
        const noise = new ImprovedNoise();
        let p = new THREE.Vector3();
        let v3 = new THREE.Vector3();
        const noisefreq = 0.1;
        const noiseAmp = 0.5;
        const color = new THREE.Color();
        const hueNoiseFreq = 0.005;
        for (let i = 0; i < tubeVerts.count; i += 1) {
            p.fromBufferAttribute(tubeVerts, i);
            v3.copy(p);
            let vertexNoise = noise.noise(
                v3.x * noisefreq,
                v3.y * noisefreq,
                v3.z
            );
            v3.addScaledVector(p, vertexNoise * noiseAmp);
            tubeVerts.setXYZ(i, v3.x, p.y, v3.z);

            let colorNoise = noise.noise(v3.x * hueNoiseFreq, v3.y * hueNoiseFreq, i * 0.001 * hueNoiseFreq);
            color.setHSL(0.5 - colorNoise, 1, 0.5);
            colors.push(color.r, color.g, color.b);
        }
        const mat = new THREE.PointsMaterial({ size: 0.03, vertexColors: true });

        function getTube(index) {
            const startPosZ = -tubeLength * index;
            const endPosZ = tubeLength;
            const resetPosZ = -tubeLength;
            const geo = new THREE.BufferGeometry();
            geo.setAttribute("position", tubeVerts);
            geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3));
            const points = new THREE.Points(geo, mat);
            points.rotation.x = Math.PI * 0.5;
            points.position.z = startPosZ;
            const speed = 0.2;
            function update() {
                points.rotation.y += 0.005;
                points.position.z += speed;
                if (points.position.z > endPosZ) {
                    points.position.z = resetPosZ;
                }
            }
            return { points, update };
        }

        const tubeA = getTube(0);
        const tubeB = getTube(1);
        this.tubes = [tubeA, tubeB];
        this.scene.add(tubeA.points, tubeB.points);

        this.animate(0);

        window.addEventListener("resize", this.handleWindowResize.bind(this), false);
    }

    teardown() {
        window.removeEventListener("resize", this.handleWindowResize.bind(this), false);
        document.body.removeChild(this.renderer.domElement);
        this.scene = null;
        this.camera = null;
        this.tubes = null;
        this.renderer = null;
        this.cancel = true;
    }
}
