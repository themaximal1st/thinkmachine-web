import * as Icons from "@assets/Icons";

export default function LabsWarning(params) {
    return (
        <div className="bg-black/60 text-white absolute z-50 inset-0 flex flex-col gap-4 justify-center items-center">
            <div className="relative w-full max-w-lg mx-auto">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={params.onClose}
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                        className="w-6 h-6"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M6 18 18 6M6 6l12 12"
                        />
                    </svg>
                </a>
                <div className="flex flex-col gap-2 max-w-xl w-full bg-black p-8">
                    <h1 className="font-bold font-green-500 flex gap-2 items-center uppercase tracking-widest">
                        <div className="w-5 h-5">{Icons.LabIcon}</div>
                        Experimental Flight Mode
                    </h1>
                    <p>Beware, wormholes detected!</p>
                    <p>
                        Flying too close can cause sudden and unexpected
                        teleportation.
                    </p>
                    <p>
                        Whatever you do, do not fly too close to the information
                        constellations!
                    </p>
                    <button
                        onClick={() => {
                            params.onClose();
                            params.onStart();
                        }}
                        className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md tracking-widest font-bold"
                    >
                        ENGAGE
                    </button>
                </div>
            </div>
        </div>
    );
}
