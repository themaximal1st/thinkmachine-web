import Line from "./Line";

export default class EmptyLine extends Line {
    constructor() {
        super(...arguments);
    }

    get type() {
        return "empty";
    }

    get str() {
        return `${this.index}:empty`;
    }

    get dom() {
        return (
            <div key={this.index}>
                <br />
            </div>
        );
    }

    static matches(line) {
        return line.trim() === "";
    }
}
