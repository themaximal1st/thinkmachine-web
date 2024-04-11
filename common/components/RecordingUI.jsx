import { bouncy } from "ldrs";
bouncy.register();

import { useState } from "react";

import * as Icons from "@assets/Icons";
import OrbitVideo from "@assets/videos/orbit.mp4";
import FlyByVideo from "@assets/videos/flyby.mp4";
import ZoomVideo from "@assets/videos/zoom.mp4";
import RecordVideo from "@assets/videos/record.mp4";

import { Modal } from "@components/Modal";

export default function RecordingUI(params) {
    if (!params.showRecordingModal) {
        return;
    }

    const onClose = () => params.toggleShowRecordingModal(false);

    return (
        <Modal onClose={onClose}>Hey there this is a modal background!</Modal>
    );

    if (
        !params.isRecording &&
        !params.isProcessing &&
        !params.showRecordingModal
    ) {
        return null;
    }

    const [recordType, setRecordType] = useState("record");

    // TODO: abstract out into generic modal with LabsWarning
    function handleCloseModal(e) {
        if (e && e.target && e.target.closest("#recording-modal")) {
            e.preventDefault();
        } else {
            params.toggleVideoRecordingModal(false);
        }
    }

    function onHover(e) {
        e.target.play();
    }

    function onLeave(e) {
        e.target.pause();
        e.target.currentTime = 0;
    }

    const videos = [
        {
            type: "record",
            name: "Record",
            src: RecordVideo,
        },
        {
            type: "orbit",
            name: "Orbit",
            src: OrbitVideo,
        },
        {
            type: "flyby",
            name: "Fly By",
            src: FlyByVideo,
        },
        {
            type: "zoom",
            name: "Zoom",
            src: ZoomVideo,
        },
    ];

    return (
        <>
            {params.showRecordingModal && (
                <div
                    className="bg-black/60 text-white absolute z-50 inset-0 flex flex-col gap-4 justify-center items-center"
                    onClick={handleCloseModal}
                >
                    <div
                        className="relative max-w-3xl mx-auto"
                        id="recording-modal"
                    >
                        <a
                            className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                            onClick={() =>
                                params.toggleVideoRecordingModal(false)
                            }
                        >
                            {Icons.CloseIcon()}
                        </a>
                        <div className="flex flex-col gap-2 w-full bg-black p-8">
                            <h1 className="font-bold font-green-500 flex gap-2 items-center uppercase tracking-widest">
                                <div className="w-6 h-6">
                                    {Icons.RecordIcon()}
                                </div>
                                Record Video
                            </h1>
                            <p>
                                Save a video of your Think Machine session—great
                                for use in videos and presentations!
                            </p>
                            <div className="flex gap-4 my-2 mb-8">
                                {videos.map((video) => (
                                    <a
                                        key={`video-${video.type}`}
                                        onClick={() =>
                                            setRecordType(video.type)
                                        }
                                        className={`w-full p-0 hover:cursor-pointer flex flex-col rounded-xl
                                    ${
                                        recordType === video.type
                                            ? "bg-purple-700"
                                            : "bg-gray-1000"
                                    }
                                    `}
                                    >
                                        <video
                                            src={video.src}
                                            muted
                                            loop
                                            playsInline
                                            onMouseEnter={onHover}
                                            onMouseLeave={onLeave}
                                            className={`w-full aspect-square hover:opacity-100 transition-all ${
                                                recordType === video.type
                                                    ? "opacity-100"
                                                    : "opacity-50"
                                            }`}
                                        ></video>
                                        <span className="font-bold text-center py-2">
                                            {video.name}
                                        </span>
                                    </a>
                                ))}
                            </div>
                            <button
                                onClick={() => {
                                    params.toggleVideoRecordingModal(false);
                                    params.handleStartRecording(recordType);
                                }}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded-md tracking-widest font-bold"
                            >
                                Start Recording
                            </button>
                        </div>
                    </div>
                </div>
            )}
            {params.isRecording && (
                <a
                    onClick={params.stopRecord}
                    className="bg-red-600 absolute w-6 h-6 rounded-full top-6 right-6 pointer-events-auto hover:cursor-pointer z-50"
                ></a>
            )}

            {params.isProcessing && (
                <div className="bg-transparent absolute w-6 h-6 rounded-full top-6 right-6 pointer-events-auto hover:cursor-pointer z-50">
                    <l-bouncy size="25" speed="1.75" color="white"></l-bouncy>
                </div>
            )}
        </>
    );
}
