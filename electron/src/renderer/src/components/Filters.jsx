export default function Filters(params) {
    return (
        <div className="text-white absolute z-30 w-6/12 right-1 top-8 h-20 flex flex-col gap-1 p-2 items-end">
            {params.filters.map((filter, i) => {
                return (
                    <div key={`${filter}-${i}`} className="flex gap-2">
                        {filter.map((symbol, j) => {
                            return (
                                <a
                                    key={`${symbol}-${j}`}
                                    className="cursor-pointer text-sm opacity-50 hover:opacity-100 transition-all"
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
