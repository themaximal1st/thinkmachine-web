import Logo from "../assets/logo.png";

export default function License(params) {
    let showLicense = false;

    if (params.trialExpired && params.licenseValid === false) {
        showLicense = true;
    }

    if (params.showLicense) {
        showLicense = true;
    }

    if (!showLicense) return;

    return (
        <div className="bg-black/90 text-white absolute z-50 inset-0 flex flex-col gap-4 justify-center items-center">
            <div className="relative w-full max-w-lg mx-auto">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={params.closeLicense}
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
                <div>
                    <img src={Logo} className="w-full max-w-sm mb-4 mx-auto" />
                </div>
                <div className="flex flex-col gap-2 max-w-xl w-full">
                    {params.trialExpired && !params.licenseValid && (
                        <>
                            <p>Think Machine has expired.</p>
                            <p>
                                Please{" "}
                                <a
                                    target="_blank"
                                    href="https://thinkmachine.com"
                                    className="underline"
                                >
                                    purchase a license
                                </a>{" "}
                                to continue using Think Machine.
                            </p>
                        </>
                    )}
                    {!params.trialExpired && !params.licenseValid && (
                        <>
                            <p>
                                Think Machine has{" "}
                                {Math.ceil(params.trialRemaining / 86400)} days
                                left on the trial.
                            </p>
                            <p>
                                <a
                                    target="_blank"
                                    href="https://thinkmachine.com"
                                    className="underline"
                                >
                                    Purchase a license
                                </a>{" "}
                                now to register Think Machine.
                            </p>
                        </>
                    )}
                    {params.licenseValid && (
                        <>
                            <p>
                                Your Think Machine license is valid. Thank you
                                for your support!
                            </p>
                        </>
                    )}

                    {params.error && (
                        <>
                            <p className="text-red-400 font-bold">
                                {params.error}
                            </p>
                        </>
                    )}
                    {!params.licenseValid && (
                        <form
                            className="flex flex-col gap-2 mt-2 w-full"
                            onSubmit={params.activateLicense}
                        >
                            <input
                                type="text"
                                value={params.licenseKey}
                                onChange={(e) =>
                                    params.updateLicenseKey(e.target.value)
                                }
                                name="license"
                                className="w-full p-2 rounded-md text-lg focus:outline-none text-black"
                                placeholder="47D2E0-0E3BC5-25E4D7-4E3BA7-8B61C0-V3"
                            />
                            <input
                                type="submit"
                                className="w-full p-2 rounded-md text-white cursor-pointer border-2 border-white hover:bg-white hover:text-black transition-all"
                                value="Activate"
                            />
                        </form>
                    )}
                    {params.licenseValid && (
                        <>
                            <div className="font-mono text-lg bg-gray-900 p-2 rounded-md">
                                {params.licenseKey}
                            </div>
                            <a
                                onClick={params.deactivateLicense}
                                className="text-sm underline cursor-pointer"
                            >
                                Deactivate License
                            </a>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
