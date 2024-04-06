import * as Icons from "@assets/Icons";
import { useState } from "react";

import LayoutSettings from "./LayoutSettings";
import LabsWarning from "./LabsWarning";

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
                <LabsWarning
                    onClose={() => setShowLabsWarning(false)}
                    onStart={(e) => params.toggleWormhole()}
                />
            )}
            {params.showLayout && (
                <LayoutSettings
                    graphRef={params.graphRef}
                    cooldownTicks={params.cooldownTicks}
                    setCooldownTicks={params.setCooldownTicks}
                />
            )}
        </div>
    );
}
