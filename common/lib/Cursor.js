export default class Cursor {

    constructor(id) {
        this.id = id;
    }

    get element() {
        return document.getElementById(this.id);
    }

    get() {
        console.log("GETTING CURSOR POSITION")
        if (!this.element) return { start: 0, end: 0 }

        const start = this.element.selectionStart
        const end = this.element.selectionEnd
        return { start, end }
    }

    set(pos) {
        if (!this.element) return
        console.log("!!!! SETTING CURSOR POSITION", this.element.selectionStart)
        this.element.focus();
        this.element.selectionStart = pos.start;
        this.element.selectionEnd = pos.end;
    }
}