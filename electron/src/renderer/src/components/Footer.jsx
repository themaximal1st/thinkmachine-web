import * as Icons from "../Icons";

export default function Footer(params) {
    return (
        <div className="absolute text-white bottom-2 right-6 z-20 flex gap-4">
            <a
                onClick={() => params.toggleAnimation()}
                className="opacity-20 hover:opacity-100 transition-all cursor-pointer"
            >
                {!params.isAnimating && Icons.PauseIcon}
                {params.isAnimating && Icons.RotateIcon}
            </a>
            <a
                onClick={() => params.toggleCamera()}
                className="opacity-20 hover:opacity-100 transition-all cursor-pointer"
            >
                {params.controlType === "orbit" && Icons.CameraIcon}
                {params.controlType === "fly" && Icons.MouseIcon}
            </a>
        </div>
    );
}
