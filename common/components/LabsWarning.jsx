import * as Icons from "@assets/Icons";

export default function LabsWarning(params) {
    function handleCloseModal(e) {
        if (e && e.target && e.target.closest("#labs-modal")) {
            e.preventDefault();
        } else {
            params.onClose();
        }
    }

    return (
        <div
            className="bg-black/60 text-white absolute z-50 inset-0 flex flex-col gap-4 justify-center items-center"
            onClick={handleCloseModal}>
            <div className="relative w-full max-w-lg mx-auto" id="labs-modal">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={params.onClose}>
                    {Icons.CloseIcon()}
                </a>
                <div className="flex flex-col gap-2 max-w-xl w-full bg-black p-8">
                    <h1 className="font-bold font-green-500 flex gap-2 items-center uppercase tracking-widest">
                        <div className="w-6 h-6">{Icons.LabIcon}</div>
                        Experimental Flight Mode
                    </h1>
                    <p>Beware, wormholes detected!</p>
                    <p>Flying too close can cause sudden and unexpected teleportation.</p>
                    <p>
                        Whatever you do, do not fly too close to the information
                        constellations!
                    </p>
                    <button
                        onClick={() => {
                            params.onClose();
                            params.onStart();
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md tracking-widest font-bold">
                        ENGAGE
                    </button>
                </div>
            </div>
        </div>
    );
}
