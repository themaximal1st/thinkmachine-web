import React from "react";
import Recorder from "@lib/Recorder";
import RecorderShots from "@lib/RecorderShots";
import * as Icons from "@assets/Icons";
import Modal from "@components/Modal";
import toast from "react-hot-toast";
import { saveFile } from "@lib/utils";
import slugify from "slugify";

import OrbitVideo from "@assets/videos/orbit.mp4";
import FlyByVideo from "@assets/videos/flyby.mp4";
import ZoomVideo from "@assets/videos/zoom.mp4";
import RecordVideo from "@assets/videos/record.mp4";

const videos = [
    { type: "record", name: "Record", src: RecordVideo },
    { type: "orbit", name: "Orbit", src: OrbitVideo },
    { type: "flyby", name: "Fly By", src: FlyByVideo },
    { type: "zoom", name: "Zoom", src: ZoomVideo },
];

export default class RecorderModal extends React.Component {
    constructor() {
        super(...arguments);
        this.recorder = null;
        this.state = {
            show: false,
            isRecording: false,
            isProcessing: false,
            recordType: "record",
            videoType: "webm",
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    get animation() {
        return this.props.animation;
    }

    get toggleAnimation() {
        return this.props.toggleAnimation;
    }

    get reloadData() {
        return this.props.reloadData;
    }

    get graphRef() {
        return this.props.graphRef;
    }

    componentDidMount() {
        this.recorder = new Recorder();
        this.recorder.onstart = this.handleRecorderStart.bind(this);
        this.recorder.onstop = this.handleRecorderStop.bind(this);
        this.recorder.onprocess = this.handleRecorderProcess.bind(this);
        this.recorder.onfile = this.handleRecorderFile.bind(this);
        this.recorder.onerror = this.handleRecorderError.bind(this);

        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    handleKeyDown(e) {
        if (e.key === "F1") {
            this.takeScreenshot();
        } else if (e.key === "F2") {
            this.toggleRecord();
        } else if (e.key === "F3") {
            RecorderShots.orbit(this);
            // } else if (e.key === "F4") {
            //     RecorderShots.flyby(this);
            // } else if (e.key === "F5") {
            //     RecorderShots.zoom(this);
        }
    }

    async takeScreenshot() {
        await Recorder.takeScreenshot(this.slug);
    }

    async recordVideo() {
        if (this.recorder.recording) {
            console.log("already recording");
            return;
        }

        console.log("RECORD VIDEO");

        this.recorder.videoType = this.state.videoType;
        this.recorder.start();
    }

    async stopRecord() {
        if (!this.recorder.recording) {
            console.log("not recording");
            return;
        }

        this.recorder.stop();
    }

    toggleRecord(val) {
        const isRecording = val === undefined ? !this.state.isRecording : val;

        this.setState({ isRecording }, () => {
            if (this.state.isRecording) {
                this.recordVideo();
            } else {
                this.stopRecord();
            }
        });
    }

    handleRecorderStart() {
        console.log("RECORDER: STARTED");
        toast.success("Recording started");
        this.setState({ isRecording: true });
    }

    handleRecorderStop() {
        console.log("RECORDER: STOPPED");
        // toast.success("Recording stopped");
        this.setState({ isRecording: false });
    }

    handleRecorderProcess() {
        console.log("RECORDER: PROCESSING");
        toast.success("Processing recording");
        this.setState({ isRecording: false, isProcessing: true });
    }

    get title() {
        if (this.props.thinkabletype.hyperedges.length === 0) {
            return `Think Machine — Multidimensional Mind Mapping`;
        } else {
            return `${this.props.thinkabletype.hyperedges[0].symbols.join(
                " "
            )} — Think Machine`;
        }
    }

    async handleRecorderFile(blob) {
        if (!blob) {
            toast.error("Error recording video");
            return;
        }

        const filename = slugify(
            `${this.title} ${this.state.recordType} ${new Date().toISOString()}`
        );

        await saveFile(blob, `${filename}.mp4`, "video/mp4");
        toast.success("Saved!");
        this.setState({ isRecording: false, isProcessing: false });

        this.recorder.reset();
    }

    handleRecorderError(e) {
        console.log("RECORDER ERROR", e);
        toast.error("Error recording video");
        this.setState({ isRecording: false, isProcessing: false });

        this.recorder.reset();
    }

    handleSubmit() {
        console.log("SUBMIT");
    }

    render() {
        if (!this.state.show) {
            return (
                <div id="recorder">
                    <button
                        onClick={() => this.setState({ show: true })}
                        id="recorder-icon"
                        className="group">
                        {Icons.CameraIcon(8)}
                        <div className="tooltip invisible group-hover:visible">
                            Camera
                        </div>
                    </button>
                </div>
            );
        }

        return (
            <div id="recorder">
                <Modal onClose={() => this.setState({ show: false })}>
                    <h2>Camera Recordings</h2>
                    <p>
                        Save a video of your Think Machine session—great for use in videos
                        and presentations!
                    </p>

                    <div className="flex gap-4 my-4">
                        {videos.map((video) => (
                            <RecordingShot
                                key={`video-${video.type}`}
                                video={video}
                                recordType={this.state.recordType}
                                setRecordType={(recordType) =>
                                    this.setState({ recordType })
                                }
                            />
                        ))}
                    </div>

                    {this.state.recordType === "record" && (
                        <div>
                            To stop recording, click the red button in the top right
                            corner.
                        </div>
                    )}
                    {this.state.recordType !== "record" && (
                        <div>Recording will stop automatically when complete.</div>
                    )}

                    <div className="my-4">
                        <div className="mb-2">Format</div>
                        <div className="flex items-center mb-4">
                            <input
                                id="default-radio-1"
                                type="radio"
                                checked={this.state.videoType === "webm"}
                                onChange={() => this.setState({ videoType: "webm" })}
                                name="default-radio"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 hover:cursor-pointer"
                            />
                            <label
                                htmlFor="default-radio-1"
                                className="ms-2 text-sm font-medium text-gray-50 hover:cursor-pointer">
                                webm (fast processing time)
                            </label>
                        </div>
                        <div className="flex items-center">
                            <input
                                id="default-radio-2"
                                type="radio"
                                checked={this.state.videoType === "mp4"}
                                onChange={() => this.setState({ videoType: "mp4" })}
                                name="default-radio"
                                className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 hover:cursor-pointer"
                            />
                            <label
                                htmlFor="default-radio-2"
                                className="ms-2 text-sm font-medium text-gray-50 hover:cursor-pointer">
                                mp4 (slow processing time)
                            </label>
                        </div>
                    </div>
                    <button
                        onClick={() => {
                            this.setState({ show: false });
                            this.handleSubmit();
                        }}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md tracking-widest font-bold">
                        Start Recording
                    </button>
                </Modal>
            </div>
        );
    }
}

function RecordingShot({ video, recordType, setRecordType }) {
    const onHover = (e) => e.target.play();
    const onLeave = (e) => {
        e.target.pause();
        e.target.currentTime = 0;
    };

    return (
        <a
            key={`video-${video.type}`}
            onClick={() => setRecordType(video.type)}
            className={`w-full p-0 hover:cursor-pointer flex flex-col rounded-xl
                                    ${
                                        recordType === video.type
                                            ? "bg-purple-700"
                                            : "bg-gray-1000"
                                    }
                                    `}>
            <video
                src={video.src}
                muted
                loop
                playsInline
                onMouseEnter={onHover}
                onMouseLeave={onLeave}
                className={`w-full rounded-t-xl aspect-square hover:opacity-100 transition-all ${
                    recordType === video.type ? "opacity-100" : "opacity-50"
                }`}></video>
            <span className="font-bold text-center py-2">{video.name}</span>
        </a>
    );
}
