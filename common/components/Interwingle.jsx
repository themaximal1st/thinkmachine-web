import { Tooltip } from "react-tooltip";

import Interwingle0 from "@assets/interwingle-0.png";
import Interwingle1 from "@assets/interwingle-1.png";
import Interwingle2 from "@assets/interwingle-2.png";
import Interwingle3 from "@assets/interwingle-3.png";

export default function Interwingle(params) {
    if (!params.show) return;

    return (
        <div className="absolute top-0 left-1 bottom-0 z-20 flex justify-center items-center w-12  flex-col pointer-events-none">
            <div className="flex flex-col gap-8 w-full justify-center items-center py-4 opacity-50 hover:opacity-70 transition-all pointer-events-auto">
                <Tooltip
                    id="interwingle-tooltip"
                    style={{
                        backgroundColor: "#1A1A1A", // gray-1000
                        color: "#f5f6f6", // gray-50
                    }}
                />

                <a
                    data-tooltip-id="interwingle-tooltip"
                    data-tooltip-content="Connect all"
                    onClick={(e) => params.toggleInterwingle(3)}
                    className={`select-none cursor-pointer ${
                        params.interwingle == 3 ? "opacity-100" : "opacity-50"
                    } hover:opacity-100 transition-all`}
                >
                    <img src={Interwingle3} className="w-8 h-8" />
                </a>
                <a
                    onClick={(e) => params.toggleInterwingle(2)}
                    data-tooltip-id="interwingle-tooltip"
                    data-tooltip-content="Connect start and end"
                    className={`select-none cursor-pointer ${
                        params.interwingle == 2 ? "opacity-100" : "opacity-50"
                    } hover:opacity-100 transition-all`}
                >
                    <img src={Interwingle2} className="w-8 h-8" />
                </a>
                <a
                    onClick={(e) => params.toggleInterwingle(1)}
                    data-tooltip-id="interwingle-tooltip"
                    data-tooltip-content="Connect start"
                    className={`select-none cursor-pointer ${
                        params.interwingle == 1 ? "opacity-100" : "opacity-50"
                    } hover:opacity-100 transition-all`}
                >
                    <img src={Interwingle1} className="w-8 h-8" />
                </a>
                <a
                    onClick={(e) => params.toggleInterwingle(0)}
                    data-tooltip-id="interwingle-tooltip"
                    data-tooltip-content="Don't connect"
                    className={`select-none cursor-pointer ${
                        params.interwingle == 0 ? "opacity-100" : "opacity-50"
                    } hover:opacity-100 transition-all`}
                >
                    <img src={Interwingle0} className="w-8 h-8" />
                </a>
            </div>
        </div>
    );
}
