import Logo from "../assets/logo.png";
import { Modal } from "@components/Modal";

export default function License(params) {
    let showLicense = false;

    if (params.trialExpired && params.licenseValid === false) {
        showLicense = true;
    }

    if (params.showLicense) {
        showLicense = true;
    }

    const onClose = () => params.closeLicense();

    if (!showLicense) return;

    return (
        <Modal onClose={onClose}>
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
                                className="underline">
                                purchase a license
                            </a>{" "}
                            to continue using Think Machine.
                        </p>
                    </>
                )}
                {!params.trialExpired && !params.licenseValid && (
                    <>
                        <p>
                            Think Machine has {Math.ceil(params.trialRemaining / 86400)}{" "}
                            days left on the trial.
                        </p>
                        <p>
                            <a
                                target="_blank"
                                href="https://thinkmachine.com"
                                className="underline">
                                Purchase a license
                            </a>{" "}
                            now to register Think Machine.
                        </p>
                    </>
                )}
                {params.licenseValid && (
                    <>
                        <p>
                            Your Think Machine license is valid. Thank you for your
                            support!
                        </p>
                    </>
                )}

                {params.error && (
                    <>
                        <p className="text-red-400 font-bold">{params.error}</p>
                    </>
                )}
                {!params.licenseValid && (
                    <form
                        className="flex flex-col gap-2 mt-2 w-full"
                        onSubmit={params.activateLicense}>
                        <input
                            type="text"
                            value={params.licenseKey}
                            onChange={(e) => params.updateLicenseKey(e.target.value)}
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
                            className="text-sm underline cursor-pointer">
                            Deactivate License
                        </a>
                    </>
                )}
            </div>
        </Modal>
    );
}
