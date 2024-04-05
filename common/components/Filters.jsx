export default function Filters(params) {
    return (
        <div className="flex text-white mt-3 text-sm gap-1 px-2 w-4/12 absolute z-20 flex-col right-0 items-end">
            {params.filters.length > 0 && (
                <div className="uppercase text-sm select-none tracking-widest font-medium text-gray-200">
                    Filters
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
