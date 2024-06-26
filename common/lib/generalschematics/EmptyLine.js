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

    static matches(line) {
        return line.trim() === "";
    }
}