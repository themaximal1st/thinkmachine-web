import Component from "./Component";

export default class MediaPanel extends Component {
    code() {
        console.log(this.props.media);
        const media = this.props.media.get(this.props.node.uuid) || [];
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

    events(div) {
        let media = this.props.media.get(this.props.node.uuid);
        if (media === undefined) {
            const node = this.props.thinkabletype.nodeByUUID(this.props.node.uuid);
            console.log("MEDIA FETCH", node.symbol);
            window.api.media(node.symbol).then((m) => {
                this.props.media.set(node.uuid, m);
                this.props.setMedia(this.props.media);
            });
        }
        // if (this.props.media.size === 0) {
        // }
    }
}
