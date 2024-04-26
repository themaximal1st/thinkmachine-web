import { Tooltip } from "react-tooltip";
import * as Icons from "@assets/Icons";

import LayoutSettings from "./LayoutSettings";
import LabsWarning from "./LabsWarning";
import SettingsMenu from "./SettingsMenu";

export default function Footer(params) {
    function handleToggleWormhole() {
        if (params.wormholeMode === -1) {
            params.toggleShowLabsWarning(true);
        } else {
            params.toggleWormhole();
        }
    }

    const isWeb = window.api.isWeb;

    return (
        <div>
            <SettingsMenu {...params} />
            <div className="relative pointer-events-none">
                <div className="absolute text-white bottom-2 left-3 right-3 z-50 flex gap-4 pointer-events-none justify-between items-center">
                    <div className="flex gap-4 items-center">
                        {!params.shouldHideControls && (
                            <a
                                onClick={() => params.toggleSettingsMenu()}
                                title="Settings"
                                id="settings-icon"
                                className={`select-none hover:opacity-100 transition-all cursor-pointer pointer-events-auto
                                    ${
                                        params.showSettingsMenu
                                            ? "opacity-60"
                                            : "opacity-40"
                                    }
                                    `}>
                                {Icons.SettingsIcon(9, 2)}
                            </a>
                        )}
                        {isWeb && !params.shouldHideControls && (
                            <a
                                className="text-sm lg:text-base text-white opacity-50 hover:opacity-100 transition-all cursor-pointer mb-1 pointer-events-auto"
                                href="https://thinkmachine.com/purchase">
                                Purchase{" "}
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
                                }`}>
                                {Icons.LabIcon}
                            </a>
                        )}

                    <div
                        className={`flex gap-4 items-center ${
                            params.graphType === "vr" || params.graphType === "ar"
                                ? "mr-16"
                                : ""
                        }`}>
                        {!params.shouldHideControls &&
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
                                    className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto">
                                    {params.controlType === "orbit" && Icons.CameraIcon}
                                    {params.controlType === "fly" && Icons.MouseIcon}
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
                                className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto">
                                {!params.isAnimating && Icons.RotateIcon(6)}
                                {params.isAnimating && Icons.PauseIcon(6)}
                            </a>
                        )}

                        <div className="relative w-6 h-8">
                            <div className="flex flex-col-reverse h-8 overflow-hidden hover:h-16 absolute right-0 bottom-[1px]">
                                {!params.shouldHideControls &&
                                    params.graphType !== "3d" && (
                                        <a
                                            onClick={() => params.toggleGraphType("3d")}
                                            title="Switch to 3D"
                                            data-tooltip-id="bottom-icons-tooltip"
                                            data-tooltip-place="top-end"
                                            data-tooltip-content="Switch to 3D"
                                            className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto text-xl">
                                            3D
                                        </a>
                                    )}

                                {!params.shouldHideControls &&
                                    params.graphType !== "2d" && (
                                        <a
                                            onClick={() => params.toggleGraphType("2d")}
                                            title="Switch to 2D"
                                            data-tooltip-id="bottom-icons-tooltip"
                                            data-tooltip-place="top-end"
                                            data-tooltip-content="Switch to 2D"
                                            className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto text-xl">
                                            2D
                                        </a>
                                    )}

                                {!params.shouldHideControls &&
                                    params.graphType !== "vr" && (
                                        <a
                                            onClick={() => params.toggleGraphType("vr")}
                                            title="Switch to VR"
                                            data-tooltip-id="bottom-icons-tooltip"
                                            data-tooltip-place="top-end"
                                            data-tooltip-content="Switch to VR"
                                            className="select-none opacity-40 hover:opacity-100 transition-all cursor-pointer pointer-events-auto text-xl">
                                            VR
                                        </a>
                                    )}
                            </div>
                        </div>
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
