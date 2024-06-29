import Line from './Line';

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

    get html() {
        return `<div><br /></div>`;
    }

    static matches(line) {
        return line.trim() === "";
    }
}