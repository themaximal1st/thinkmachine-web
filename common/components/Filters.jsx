import { Tooltip } from "react-tooltip";

export default function Filters(params) {
    if (!params.show) return;
    return (
        <div
            className="flex text-white mt-1 text-sm gap-1 px-2 w-4/12 absolute z-20 flex-col right-0 items-end"
            id="filters"
        >
            <Tooltip
                id="filter-tooltip"
                style={{
                    backgroundColor: "#1A1A1A", // gray-1000
                    color: "#f5f6f6", // gray-50
                }}
            />
            {params.filters.length > 0 && (
                <div
                    id="search-context-header"
                    data-tooltip-id="filter-tooltip"
                    data-tooltip-content="Filter graph by symbol or connection"
                    className="uppercase text-sm select-none tracking-widest font-medium text-gray-200"
                >
                    Search
                </div>
            )}
            {params.filters.map((filter, i) => {
                return (
                    <div key={`${filter}-${i}`} className="flex gap-2">
                        {filter.map((symbol, j) => {
                            return (
                                <a
                                    key={`${symbol}-${j}`}
                                    className="cursor-pointer text-sm opacity-50 hover:opacity-100 transition-all pointer-events-auto py-1 select-none"
                                    onClick={(e) =>
                                        params.removeFilter(filter, symbol)
                                    }
                                >
                                    {symbol}
                                </a>
                            );
                        })}
                    </div>
                );
            })}
        </div>
    );
}
