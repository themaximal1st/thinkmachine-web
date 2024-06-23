export default class Cursor {

    constructor(id) {
        this.id = id;
        this.position = { start: 0, end: 0 };
    }

    get element() {
        return document.getElementById(this.id);
    }

    save() {
        this.position = Cursor.get(this.element);
    }

    restore() {
        Cursor.set(this.element, this.position);
    }

    static get(element) {
        if (!element) return;

        return {
            start: element.selectionStart,
            end: element.selectionEnd,
        };
    }

    static set(element, position = {}) {
        if (!element) return
        if (!position.start) return;
        if (!position.end) return;

        element.focus();
        element.selectionStart = position.start;
        element.selectionEnd = position.end;
    }
}