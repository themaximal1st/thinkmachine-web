import { useState } from "react";

// TODO: Add save as defaults
// TODO: Add reset

export default function LayoutSettings(params) {
    let [linkDistance, setLinkDistance] = useState(40);
    let [chargeStrength, setChargeStrength] = useState(-100);
    let [chargeDistanceMax, setChargeDistanceMax] = useState(300);
    let [chargeDistanceMin, setChargeDistanceMin] = useState(0);
    let [chargeTheta, setChargeTheta] = useState(0.81);
    let [centerStrength, setCenterStrength] = useState(0.5);

    function handleLinkDistance(e) {
        params.graphRef.current.d3Force("link").distance((link) => {
            return e.target.value;
        });

        setLinkDistance(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    function handleChargeStrength(e) {
        params.graphRef.current.d3Force("charge").strength((link) => {
            return e.target.value;
        });

        setChargeStrength(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    function handleChargeDistanceMax(e) {
        params.graphRef.current.d3Force("charge").distanceMax(e.target.value);
        setChargeDistanceMax(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    function handleChargeDistanceMin(e) {
        params.graphRef.current.d3Force("charge").distanceMin(e.target.value);
        setChargeDistanceMin(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    function handleChargeTheta(e) {
        params.graphRef.current.d3Force("charge").theta(e.target.value);
        setChargeTheta(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    function handleCenterStrength(e) {
        params.graphRef.current.d3Force("center").strength(e.target.value);
        setCenterStrength(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    function handleCooldownTicks(e) {
        params.setCooldownTicks(e.target.value);
        params.graphRef.current.d3ReheatSimulation();
    }

    return (
        <div
            className="absolute top-0 right-0 bottom-0 w-3/12 bg-gray-1000/60 z-40 p-6 text-gray-300 flex flex-col gap-4"
            id="layout-settings"
        >
            <div className="uppercase text-sm select-none tracking-widest font-medium text-gray-200">
                Layout Settings
            </div>
            <label className="flex flex-col gap-1">
                <div>Link Distance: {linkDistance}</div>
                <input
                    type="range"
                    min="0"
                    max="150"
                    value={linkDistance}
                    onChange={handleLinkDistance}
                />
            </label>
            <label className="flex flex-col gap-1">
                <div>Charge Strength: {chargeStrength}</div>
                <input
                    type="range"
                    min="-200"
                    max="100"
                    value={chargeStrength}
                    onChange={handleChargeStrength}
                />
            </label>
            <label className="flex flex-col gap-1">
                <div>Charge Distance Min: {chargeDistanceMin}</div>
                <input
                    type="range"
                    min="0"
                    max="200"
                    value={chargeDistanceMin}
                    onChange={handleChargeDistanceMin}
                />
            </label>
            <label className="flex flex-col gap-1">
                <div>Charge Distance Max: {chargeDistanceMax}</div>
                <input
                    type="range"
                    min="0"
                    max="500"
                    value={chargeDistanceMax}
                    onChange={handleChargeDistanceMax}
                />
            </label>
            <label className="flex flex-col gap-1">
                <div>Charge Theta: {chargeTheta}</div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={chargeTheta}
                    onChange={handleChargeTheta}
                />
            </label>
            <label className="flex flex-col gap-1">
                <div>Center Strength: {centerStrength}</div>
                <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={centerStrength}
                    onChange={handleCenterStrength}
                />
            </label>

            <label className="flex flex-col gap-1">
                <div>Cooldown Ticks: {params.cooldownTicks}</div>
                <input
                    type="range"
                    min="0"
                    max="10000"
                    value={params.cooldownTicks}
                    onChange={(e) => handleCooldownTicks(e)}
                />
            </label>
            <div className="grow"></div>
            <div>
                <button
                    onClick={() => params.toggleShowLayout()}
                    className="bg-gray-800 hover:bg-gray-700 text-gray-300 px-4 py-2 rounded-md"
                >
                    Close
                </button>
            </div>
        </div>
    );
}
