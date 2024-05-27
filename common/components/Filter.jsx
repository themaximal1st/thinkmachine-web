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
        const filter = this.props.filter;
        filter.splice(idx, 1);
        this.props.setFilter(filter);
    }

    render() {
        if (!this.props.filter || this.props.filter.length === 0) return;

        return (
            <div id="filters">
                <div id="filters-content">
                    <div className="text-white shadow-sm text-xs uppercase tracking-wider whitespace-nowrap">
                        {this.props.filter.length > 1 ? "Filters" : "Filter"}
                    </div>
                    {this.props.filter.map((f, i) => {
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
