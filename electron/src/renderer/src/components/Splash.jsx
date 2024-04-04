export default function Splash(params) {
    if (!params.loaded) return;
    if (params.hyperedges.length > 0) return;
    if (params.input.length > 0) return;

    return (
        <div className="absolute inset-0 z-40 text-gray-300 flex flex-col justify-center items-center pointer-events-none">
            <div className="max-w-xl mx-auto gap-4 flex flex-col italic text-center">
                <a
                    onClick={params.createTutorial}
                    className="pointer-events-auto cursor-pointer"
                >
                    Think Machine
                </a>
                {params.trialRemaining > 0 && !params.licenseValid && (
                    <div className="text-sm">
                        <a
                            className="pointer-events-auto cursor-pointer"
                            onClick={params.showLicense}
                        >
                            {Math.ceil(params.trialRemaining / 86400)} days left
                            on trial
                        </a>
                    </div>
                )}
            </div>
        </div>
    );
}
