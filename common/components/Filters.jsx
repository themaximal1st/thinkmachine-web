import React from "react";

export default class Filter extends React.Component {
    displayFilter(filter) {
        if (Array.isArray(filter)) {
            return filter.join(" → ");
        } else if (filter.node) {
            const node = this.props.thinkabletype.nodeByUUID(filter.node);
            if (!node) return JSON.stringify(filter);
            return node.symbol;
        } else if (filter.edge) {
            return this.props.thinkabletype.edgeByUUID(filter.edge).symbols.join(" → ");
        } else {
            return JSON.stringify(filter);
        }
    }

    removeFilter(idx) {
        const filters = this.props.filters;
        filters.splice(idx, 1);
        this.props.setFilters(filters);
    }

    render() {
        if (!this.props.filters || this.props.filters.length === 0) return;

        return (
            <div id="filters">
                <div id="filters-content">
                    <div className="text-white shadow-sm text-xs uppercase tracking-wider whitespace-nowrap">
                        {this.props.filters.length > 1 ? "Filters" : "Filter"}
                    </div>
                    {this.props.filters.map((f, i) => {
                        return (
                            <button
                                onClick={() => this.removeFilter(i)}
                                key={i}
                                className="filter">
                                {this.displayFilter(f)}
                            </button>
                        );
                    })}
                </div>
            </div>
        );
    }
}
