import Component from "./Component";

export default class MediaPanel extends Component {
    code() {
        const media = this.props.media.get(this.props.node.uuid) || [];
        if (media.length === 0) return;

        return (
            <div>
                <div className="max-h-36 overflow-x-scroll">
                    <div className="grid grid-cols-5 gap-4">
                        {media.map((m, idx) => {
                            return (
                                <a
                                    href={m.link}
                                    target="_blank"
                                    rel="noreferrer"
                                    key={`media-${idx}`}>
                                    <img
                                        src={m.thumbnail}
                                        alt={m.title}
                                        className="w-full aspect-square"
                                    />
                                </a>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    }

    mediaQuery() {
        const words = [];
        for (const edgeUUID of this.props.node.edgeUUIDs) {
            const edge = this.props.thinkabletype.edgeByUUID(edgeUUID);
            for (const symbol of Array.from(edge.symbols)) {
                words.push(symbol);
            }
        }

        return words.join(" or "); // for some reason this works best..need better image search in the future
    }

    load(div) {
        const uuid = this.props.node.uuid;
        let m = this.props.media.get(uuid);

        if (m === undefined) {
            this.props.setMedia(uuid, []); // prevent stampeded
            console.log("FETCH MEDIA", this.mediaQuery());
            window.api.media(this.mediaQuery()).then((m) => {
                this.props.setMedia(uuid, m);
            });
        }
    }
}
