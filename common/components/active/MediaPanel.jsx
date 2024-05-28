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

    load(div) {
        const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
        let m = this.props.media.get(node.uuid);

        if (m === undefined) {
            this.props.setMedia(node.uuid, []); // prevent stampeded
            console.log("FETCH MEDIA");
            window.api.media(node.symbol).then((m) => {
                this.props.setMedia(node.uuid, m);
            });
        }
    }
}
