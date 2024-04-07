import * as Icons from "@assets/Icons";
import { useState } from "react";

import LayoutSettings from "./LayoutSettings";
import LabsWarning from "./LabsWarning";

export default function Footer(params) {
    function handleToggleWormhole() {
        if (params.wormholeMode === -1) {
            params.toggleLabsWarning(true);
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
                        <div className="relative">
                            {params.showSettingsMenu && (
                                <div
                                    className="pointer-events-none absolute -left-5 bottom-10 w-96 flex flex-col-reverse gap-0 p-2 text-lg fan-left"
                                    id="settings-menu"
                                >
                                    <a
                                        onClick={params.toggleLLMSettings}
                                        className="menu-item"
                                    >
                                        <div>{Icons.GenerateIcon}</div>
                                        AI Settings
                                    </a>
                                    <a
                                        onClick={handleToggleWormhole}
                                        className="menu-item"
                                    >
                                        <div>{Icons.LabIcon}</div>
                                        Labs
                                    </a>
                                    {params.edited && (
                                        <a
                                            onClick={(e) =>
                                                (window.location.href = "/")
                                            }
                                            className="menu-item"
                                        >
                                            <div>{Icons.NewIcon}</div>
                                            New
                                        </a>
                                    )}

                                    {params.loaded &&
                                        params.edited &&
                                        params.hyperedges.length > 0 && (
                                            <a
                                                onClick={(e) =>
                                                    params.handleDownload()
                                                }
                                                className="menu-item"
                                            >
                                                <div>{Icons.SaveIcon}</div>
                                                Save
                                            </a>
                                        )}

                                    <a
                                        onClick={() => {
                                            console.log("load");
                                        }}
                                        className="menu-item"
                                    >
                                        <div>{Icons.LoadIcon}</div>
                                        Load
                                    </a>
                                </div>
                            )}
                            {!params.isAnimating && (
                                <a
                                    onClick={params.setShowSettingsMenu}
                                    onMouseEnter={params.setShowSettingsMenu}
                                    title="Settings"
                                    id="settings-icon"
                                    className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto"
                                >
                                    {Icons.SettingsIcon}
                                </a>
                            )}
                        </div>
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
                        {params.graphType === "3d" &&
                            params.edited &&
                            params.wormholeMode > -1 && (
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
            {params.showLabsWarning && (
                <LabsWarning
                    onClose={() => params.toggleLabsWarning(false)}
                    onStart={(e) => params.toggleWormhole()}
                />
            )}
            {params.showLayout && (
                <LayoutSettings
                    graphRef={params.graphRef}
                    toggleShowLayout={params.toggleShowLayout}
                    cooldownTicks={params.cooldownTicks}
                    setCooldownTicks={params.setCooldownTicks}
                />
            )}
        </div>
    );
}
