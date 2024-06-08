import parseEnvString from "parse-env-string"

export default class Parser {

    static exportSymbol(symbol, meta = null) {
        if (symbol.indexOf(",") !== -1) {
            symbol = `"${symbol}"`;
        }

        if (meta === null) return symbol;
        if (typeof meta === "string") return `${symbol}[${meta}]`;
        if (typeof meta !== "object") return symbol;
        if (Object.keys(meta).length === 0) return symbol;

        let exported = `${symbol}[`;
        for (const key in meta) {
            exported += `${key}=${JSON.stringify(meta[key])} `;
        }

        exported = exported.trim();
        exported += "]";

        return exported;
    }

    static parseSymbol(input) {
        if (!input.includes("[")) return [input, null];
        if (!input.includes("]")) return [input, null];

        const symbol = input.split("[")[0];
        const metastr = input.split("[")[1].split("]")[0];

        // regular string
        if (!metastr.match(/^[a-zA-Z0-9]+=/)) {
            try {
                return [symbol, JSON.parse(metastr)];
            } catch (e) {
                return [symbol, metastr];
            }
        }


        const meta = parseEnvString(metastr);
        for (const key in meta) {
            try {
                // TODO: parse date back to object
                const value = JSON.parse(meta[key]);
                meta[key] = value;
            } catch (e) {
            }
        }

        return [symbol, meta];
    }

    static parseHyperedge(input) {
        const hyperedge = [];

        let openBracket = false;
        let openQuote = false;
        let buffer = "";

        for (const char of input) {
            if (char === "[" && !openBracket) {
                openBracket = true;
            }
            if (char === "]" && openBracket) {
                openBracket = false;
            }
            if (char === '"' && !openQuote && !openBracket) {
                openQuote = true;
                continue;
            }
            if (char === '"' && openQuote && !openBracket) {
                openQuote = false;
                continue;
            }

            if (char === "," && !openBracket && !openQuote) {
                hyperedge.push(buffer);
                buffer = "";
                openBracket = false;
                continue;
            }

            buffer += char;
        }

        if (buffer.length > 0) {
            hyperedge.push(buffer);
        }

        return hyperedge;
    }

    static parseHypergraph(input) {
        return input.trim().split(/\r?\n/).map(Parser.parseHyperedge);
    }
}