import * as Icons from "@assets/Icons";
import { useState } from "react";

function ShowLabsWarning(params) {
    return (
        <div className="bg-black/60 text-white absolute z-50 inset-0 flex flex-col gap-4 justify-center items-center">
            <div className="relative w-full max-w-lg mx-auto">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={params.onClose}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
                </a>
                <div className="flex flex-col gap-2 max-w-xl w-full bg-black p-8">
                    <h1 className="font-bold font-green-500 flex gap-2 items-center uppercase tracking-widest">
                        <div class="w-5 h-5">{Icons.LabIcon}</div>
                        Experimental Flight Mode
                    </h1>
                    <p>Beware, wormholes detected!</p>
                    <p>
                        Flying too close can cause sudden and unexpected
                        teleportation.
                    </p>
                    <p>
                        Whatever you do, do not fly too close to the information
                        constellations!
                    </p>
                    <button
                        onClick={() => {
                            params.onClose();
                            params.onStart();
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md tracking-widest font-bold"
                    >
                        ENGAGE
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function Footer(params) {
    const [showLabsWarning, setShowLabsWarning] = useState(false);

    function handleToggleWormhole() {
        if (params.wormholeMode === -1) {
            setShowLabsWarning(true);
        } else {
            params.toggleWormhole();
        }
    }

    let isWeb = false;
    if (params.loaded) {
        isWeb = window.api.isWeb;
    }

    return (
        <div>
            <div className="relative pointer-events-none">
                <div className="absolute text-white bottom-2 left-3 right-3 z-20 flex gap-4 pointer-events-none justify-between items-center">
                    <div className="flex gap-4 items-center">
                        {!params.isAnimating && (
                            <a
                                onClick={(e) => params.toggleSettings()}
                                title="Settings"
                                className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto"
                            >
                                {Icons.SettingsIcon}
                            </a>
                        )}
                        {isWeb && !params.isAnimating && params.edited && (
                            <a
                                onClick={(e) => (window.location.href = "/")}
                                title="New File"
                                className="select-none text-white opacity-50 hover:opacity-100 transition-all cursor-pointer mb-1 pointer-events-auto"
                            >
                                {Icons.NewIcon}
                            </a>
                        )}
                        {isWeb &&
                            !params.isAnimating &&
                            params.loaded &&
                            params.edited &&
                            params.hyperedges.length > 0 && (
                                <a
                                    onClick={(e) => params.handleDownload()}
                                    title="Save File"
                                    className="select-none text-white opacity-50 hover:opacity-100 transition-all cursor-pointer mb-1 pointer-events-auto"
                                >
                                    {Icons.SaveIcon}
                                </a>
                            )}
                        {isWeb && !params.isAnimating && (
                            <a
                                className="text-sm lg:text- text-white opacity-50 hover:opacity-100 transition-all cursor-pointer mb-1 pointer-events-auto"
                                href="https://thinkmachine.com/download"
                            >
                                Download{" "}
                                <span className="select-none hidden lg:inline">
                                    Think Machine
                                </span>
                            </a>
                        )}
                    </div>
                    <div className="flex gap-4 items-center">
                        <a
                            onClick={params.toggleShowLayout}
                            title="Layout"
                            className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto text-lg"
                        >
                            Layout
                        </a>
                        <a
                            onClick={() => params.toggleGraphType()}
                            title="Toggle 2D and 3D"
                            className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto text-lg"
                        >
                            {params.graphType === "2d" ? "3D" : "2D"}
                        </a>
                        {params.graphType === "3d" && params.edited && (
                            <a
                                onClick={() => params.toggleAnimation()}
                                title="Toggle Animation"
                                className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto"
                            >
                                {!params.isAnimating && Icons.PauseIcon}
                                {params.isAnimating && Icons.RotateIcon}
                            </a>
                        )}
                        {params.graphType === "3d" && params.edited && (
                            <a
                                onClick={() => params.toggleCamera()}
                                title="Toggle Camera Control"
                                className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto"
                            >
                                {params.controlType === "orbit" &&
                                    Icons.CameraIcon}
                                {params.controlType === "fly" &&
                                    Icons.MouseIcon}
                            </a>
                        )}
                        {params.graphType === "3d" && params.edited && (
                            <a
                                onClick={() => handleToggleWormhole()}
                                title="Wormhole"
                                className={`select-none hover:opacity-100 transition-all cursor-pointer pointer-events-auto ${
                                    params.wormholeMode === -1
                                        ? "text-white opacity-40"
                                        : "text-orange-400 opacity-80"
                                }`}
                            >
                                {Icons.LabIcon}
                            </a>
                        )}
                    </div>
                </div>
            </div>
            {showLabsWarning && (
                <ShowLabsWarning
                    onClose={() => setShowLabsWarning(false)}
                    onStart={(e) => params.toggleWormhole()}
                />
            )}
            {params.showLayout && (
                <div className="absolute top-0 right-0 bottom-0 w-3/12 bg-gray-1000 z-40 p-4">
                    <label className="text-gray-300 flex flex-col gap-1">
                        <div>BOOMO</div>
                        <input type="range" min="0" max="100" />
                    </label>
                </div>
            )}
        </div>
    );
}
