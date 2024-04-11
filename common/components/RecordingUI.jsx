import { bouncy } from "ldrs";
bouncy.register();

export default function RecordingUI(params) {
    if (!params.isRecording && !params.isProcessing) return null;

    return (
        <>
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
