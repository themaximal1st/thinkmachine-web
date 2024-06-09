import Component from "./Component";
import Markdown from "react-markdown";

export default class NotesPanel extends Component {
    code() {
        const node = this.props.thinkabletype.nodeByUUID(this.activeUUID);
        const notes = node.meta.notes || "";
        return (
            <div id="notes">
                <div className="max-h-36 overflow-y-scroll flex flex-col-reverse">
                    <div className="markdown">
                        <form>
                            <textarea
                                className="w-full h-24 bg-transparent text-black dark:text-white resize-none outline-none border-none focus:ring-0"
                                defaultValue={notes}
                                placeholder="Add a note..."></textarea>
                            <input type="submit" value="Set Notes" className="" />
                        </form>
                    </div>
                </div>
            </div>
        );
    }

    linkContent(content, color) {
        if (!content || content.length === 0) return "";

        return (
            <Markdown
                components={{
                    a(props) {
                        return (
                            <a
                                href={props.href}
                                className="pointer-events-auto cursor-pointer"
                                style={{ color }}>
                                {props.children}
                            </a>
                        );
                    },
                }}>
                {content}
            </Markdown>
        );
    }

    async load(div) {
        const form = div.querySelector("form");
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            this.updateNotes(div);
        });
    }

    updateNotes(div) {
        const form = div.querySelector("form");
        const textarea = form.querySelector("textarea");
        const notes = textarea.value;

        const node = this.activeNode;
        node.meta.notes = notes;

        textarea.value = "";
        this.props.save();
    }
}
