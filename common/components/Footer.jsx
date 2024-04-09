import { Tooltip } from "react-tooltip";
import * as Icons from "@assets/Icons";

import LayoutSettings from "./LayoutSettings";
import LabsWarning from "./LabsWarning";

export default function Footer(params) {
    function handleToggleWormhole() {
        if (params.wormholeMode === -1) {
            params.toggleShowLabsWarning(true);
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
                                    className="pointer-events-none absolute -left-5 bottom-10 w-96 flex flex-col-reverse gap-4 p-2 text-lg fan-left"
                                    id="settings-menu"
                                >
                                    {isWeb &&
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
                                    {isWeb && params.edited && (
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

                                    {isWeb && (
                                        <a
                                            onClick={() => {
                                                console.log("load");
                                            }}
                                            className="menu-item"
                                        >
                                            <div>{Icons.LoadIcon}</div>
                                            Load
                                        </a>
                                    )}

                                    <a
                                        onClick={() =>
                                            params.toggleLLMSettings()
                                        }
                                        className="menu-item"
                                    >
                                        <div>{Icons.GenerateIcon(6)}</div>
                                        AI Settings
                                    </a>
                                    <a
                                        onClick={() =>
                                            params.toggleShowLayout()
                                        }
                                        className="menu-item"
                                    >
                                        <div>{Icons.LayoutIcon}</div>
                                        Layout
                                    </a>
                                    {false && (
                                        <a
                                            onClick={handleToggleWormhole}
                                            className="menu-item"
                                        >
                                            <div>{Icons.LabIcon}</div>
                                            Labs
                                        </a>
                                    )}

                                    {!isWeb && (
                                        <a
                                            onClick={params.toggleLicenseWindow}
                                            className="menu-item"
                                        >
                                            <div>{Icons.LicenseIcon(6)}</div>
                                            License
                                        </a>
                                    )}
                                </div>
                            )}
                            {!params.isAnimating && (
                                <a
                                    onClick={() => params.toggleSettingsMenu()}
                                    title="Settings"
                                    id="settings-icon"
                                    className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto"
                                >
                                    {Icons.SettingsIcon(6)}
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
                    <div className="grow"></div>

                    {params.graphType === "3d" &&
                        params.edited &&
                        params.wormholeMode > -1 && (
                            <a
                                onClick={() => handleToggleWormhole()}
                                title="Wormhole"
                                data-tooltip-id="bottom-icons-tooltip"
                                data-tooltip-place="top-end"
                                data-tooltip-content="Toggle Camera Control"
                                className={`select-none hover:opacity-100 transition-all cursor-pointer pointer-events-auto ${
                                    params.wormholeMode === -1
                                        ? "text-white opacity-40"
                                        : "text-orange-400 opacity-80"
                                }`}
                            >
                                {Icons.LabIcon}
                            </a>
                        )}

                    <div className="flex gap-4 items-center">
                        {!params.isAnimating && (
                            <a
                                onClick={() => params.toggleGraphType()}
                                title="Toggle 2D and 3D"
                                data-tooltip-id="bottom-icons-tooltip"
                                data-tooltip-place="top-end"
                                data-tooltip-content={
                                    params.graphType === "2d"
                                        ? "Switch to 3D"
                                        : "Switch to 2D"
                                }
                                className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto text-xl"
                            >
                                {params.graphType === "2d" ? "3D" : "2D"}
                            </a>
                        )}

                        {!params.isAnimating &&
                            params.graphType === "3d" &&
                            params.edited && (
                                <a
                                    onClick={() => params.toggleCamera()}
                                    title="Toggle Camera Control"
                                    data-tooltip-id="bottom-icons-tooltip"
                                    data-tooltip-place="top-end"
                                    data-tooltip-content={
                                        params.controlType === "orbit"
                                            ? "Switch to Fly"
                                            : "Switch to Orbit"
                                    }
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
                                onClick={() => params.toggleAnimation()}
                                title="Toggle Animation"
                                data-tooltip-id="bottom-icons-tooltip"
                                data-tooltip-place="top-end"
                                data-tooltip-content={
                                    params.isAnimating
                                        ? "Stop Animation"
                                        : "Start Animation"
                                }
                                className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto"
                            >
                                {!params.isAnimating && Icons.RotateIcon(6)}
                                {params.isAnimating && Icons.PauseIcon(6)}
                            </a>
                        )}
                    </div>
                </div>
            </div>

            <Tooltip
                id="bottom-icons-tooltip"
                style={{
                    backgroundColor: "#1A1A1A", // gray-1000
                    color: "#f5f6f6", // gray-50
                }}
            />
            {params.showLabsWarning && (
                <LabsWarning
                    onClose={() => params.toggleShowLabsWarning(false)}
                    onStart={(e) => params.toggleWormhole()}
                />
            )}
            {params.showLayout && (
                <LayoutSettings
                    graphRef={params.graphRef}
                    toggleShowLayout={() => params.toggleShowLayout()}
                    cooldownTicks={params.cooldownTicks}
                    setCooldownTicks={params.setCooldownTicks}
                />
            )}
        </div>
    );
}
