import React from "react";

export default function Console(params) {
    if (!params.showConsole) return;

    return (
        <div
            id="console"
            ref={params.consoleRef}
            className="bg-black/80 text-white h-full max-h-[300px] w-full absolute z-30">
            <div className="overflow-y-scroll h-full w-full">
                <div className="grow"></div>
                <div>
                    <div className="font-medium p-1">Knowledge Graph Data</div>
                    <table className="w-auto">
                        <tbody>
                            {params.hyperedges.map((edge, i) => {
                                return (
                                    <tr key={`${edge.join("->")}-${i}}`}>
                                        {edge.map((node, j) => {
                                            return (
                                                <React.Fragment
                                                    key={`${node}-${j}-group`}>
                                                    <td
                                                        key={`${node}-${j}`}
                                                        className="p-1 px-2 text-sm text-gray-200">
                                                        <a
                                                            onClick={(e) =>
                                                                params.removeHyperedge(
                                                                    edge
                                                                )
                                                            }
                                                            className="cursor-pointer">
                                                            {node.substring(0, 15)}
                                                            {node.length > 15
                                                                ? "..."
                                                                : ""}
                                                        </a>
                                                    </td>
                                                    {j < edge.length - 1 && (
                                                        <td
                                                            key={`${node}-${i}-sep`}
                                                            className="px-2">
                                                            →
                                                        </td>
                                                    )}
                                                </React.Fragment>
                                            );
                                        })}
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
