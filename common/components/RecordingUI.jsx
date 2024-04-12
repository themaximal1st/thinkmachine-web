import { bouncy } from "ldrs";
bouncy.register();

import { useState } from "react";

import * as Icons from "@assets/Icons";
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

import { Modal } from "@components/Modal";

export default function RecordingUI(props) {
    if (!props.showRecordingModal && !props.isRecording && !props.isProcessing) {
        return;
    }

    const [recordType, setRecordType] = useState("record");

    const onClose = () => props.toggleShowRecordingModal(false);

    return (
        <>
            {props.showRecordingModal && (
                <Modal onClose={onClose}>
                    <div className="flex flex-col gap-4">
                        <div className="flex flex-col gap-2">
                            <h1 className="font-bold font-green-500 flex gap-2 items-center uppercase tracking-widest">
                                <div className="w-6 h-6">{Icons.RecordIcon()}</div>
                                Record Video
                            </h1>
                            <p>
                                Save a video of your Think Machine session—great for use
                                in videos and presentations!
                            </p>
                        </div>
                        <div className="flex gap-4">
                            {videos.map((video) => (
                                <RecordingShot
                                    key={`video-${video.type}`}
                                    video={video}
                                    recordType={recordType}
                                    setRecordType={setRecordType}
                                />
                            ))}
                        </div>
                        {recordType === "record" && (
                            <div>
                                To stop recording, click the red button in the top right
                                corner.
                            </div>
                        )}
                        {recordType !== "record" && (
                            <div>Recording will stop automatically when complete.</div>
                        )}

                        <div className="my-4">
                            <div className="mb-2">Format</div>
                            <div className="flex items-center mb-4">
                                <input
                                    id="default-radio-1"
                                    type="radio"
                                    checked={props.videoType === "webm"}
                                    onChange={() => props.toggleVideoType("webm")}
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
                                    checked={props.videoType === "mp4"}
                                    onChange={() => props.toggleVideoType("mp4")}
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
                                onClose();
                                props.handleStartRecording(recordType);
                            }}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md tracking-widest font-bold">
                            Start Recording
                        </button>
                    </div>
                </Modal>
            )}

            {props.isRecording && (
                <a
                    onClick={props.stopRecord}
                    className="bg-red-600 absolute w-6 h-6 rounded-full top-6 right-6 pointer-events-auto hover:cursor-pointer z-50"></a>
            )}

            {props.isProcessing && (
                <div className="bg-transparent absolute w-6 h-6 rounded-full top-6 right-6 pointer-events-auto hover:cursor-pointer z-50">
                    <l-bouncy size="25" speed="1.75" color="white"></l-bouncy>
                </div>
            )}
        </>
    );
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
