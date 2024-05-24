import Component from "./Component";

export default class ExplainPanel extends Component {
    code() {
        return (
            <div>
                <div className="max-h-36 overflow-y-scroll">
                    Explain goes here and will be a chatbot that will answer questions. It
                    will be able to explain the current node, the current graph, and the
                    current thinkabletype.
                    <br />
                    And it will be able to answer questions about the current node, the
                    current graph, and the current thinkabletype.
                    <br />
                    Then it will be able to answer questions about the current node, the
                    current graph, and the current thinkabletype.
                    <br />
                    So it will be able to answer questions about the current node, the
                    current graph, and the current thinkabletype.
                    <br />
                    Which is why it is called the Explain Panel.
                </div>
                <form id="chat">
                    <input
                        type="text"
                        id="chat-input"
                        placeholder="What do you want to know?"
                    />
                </form>
            </div>
        );
    }

    events(div) {}
}
