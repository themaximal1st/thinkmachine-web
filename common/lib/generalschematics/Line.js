import { v4 as uuidv4 } from 'uuid';

export default class Line {
    constructor(line, index) {
        this.line = line;
        this.index = index;
        this.uuid = uuidv4();
    }

    get output() {
        return this.line;
    }

    static matches(line) {
        return true;
    }
}