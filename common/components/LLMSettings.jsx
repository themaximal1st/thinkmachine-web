import * as Icons from "@assets/Icons.jsx";
import LocalSettings from "@lib/LocalSettings.js";
import { useState } from "react";

export default function Settings(params) {
    if (!params.showLLMSettings) return;

    const [isEditingAPIKey, setIsEditingAPIKey] = useState(false);

    function setAPIKey(service, apikey) {
        const apikeys = params.apikeys;
        apikeys[service] = apikey;
        params.updateAPIKeys(apikeys);
        setIsEditingAPIKey(false);
    }

    function getMaskedAPIKey(service) {
        const apikey = LocalSettings.apiKeyForService(service);
        if (!apikey) return;
        return apikey.slice(0, 4) + "..." + apikey.slice(-4);
    }

    function handleCloseModal(e) {
        if (!e) return;
        if (!e.target) return;
        if (!e.target.id) return;
        if (e.target.id !== "settings-modal") return;
        e.stopPropagation();
        params.toggleLLMSettings(false);
    }

    let isElectron = false;
    if (params.loaded) {
        isElectron = window.api.isElectron;
    }

    return (
        <div
            id="settings-modal"
            onClick={handleCloseModal}
            className="bg-black/90 text-white absolute z-40 inset-0 flex flex-col gap-4 justify-center items-center"
        >
            <div className="relative w-full max-w-lg mx-auto">
                <a
                    className="cursor-pointer absolute -top-4 -right-4 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={() => params.toggleLLMSettings(false)}
                >
                    {Icons.CloseIcon(6)}
                </a>
                <div className="relative w-full max-w-lg mx-auto flex flex-col gap-4">
                    <div>
                        <h1 className="text-xl font-bold ">AI Model</h1>
                        <p>
                            Choose one of the models below to use during AI
                            brainstorming.
                        </p>
                    </div>

                    <div className="flex flex-col">
                        <div className="flex flex-col divide-gray-1000 divide-y">
                            {LocalSettings.services.map((service, i) => {
                                const isActive =
                                    params.llm.service === service.service &&
                                    params.llm.model === service.model;
                                return (
                                    <div
                                        key={`service-${i}`}
                                        onClick={(e) => {
                                            const clickedEditAPIKey =
                                                e.target.className.includes(
                                                    "apikey"
                                                );
                                            if (!clickedEditAPIKey) {
                                                params.updateLLM(service);
                                                setIsEditingAPIKey(false);
                                            }
                                        }}
                                        className="text-sm flex w-full justify-between items-center py-3 pointer-events-auto hover:cursor-pointer hover:bg-gray-1000 px-2 gap-4"
                                    >
                                        <div>
                                            <div>{service.name}</div>
                                            <div className="text-gray-300">
                                                {service.description}
                                            </div>
                                        </div>
                                        {isElectron && isActive && (
                                            <div className="grow flex justify-end">
                                                {isEditingAPIKey && (
                                                    <form
                                                        onSubmit={(e) => {
                                                            e.preventDefault();

                                                            setAPIKey(
                                                                service.service,
                                                                e.target.querySelector(
                                                                    "input[type=text]"
                                                                ).value
                                                            );
                                                        }}
                                                        className="text-xs bg-gray-800 font-mono mr-4 apikey rounded-full gap-1 flex items-center w-full max-w-[250px]"
                                                    >
                                                        <input
                                                            type="text"
                                                            defaultValue={
                                                                LocalSettings.apiKeyForService(
                                                                    service.service
                                                                ) || ""
                                                            }
                                                            placeholder="secret api key"
                                                            className="bg-transparent text-white apikey focus:outline-none p-1 w-full px-2"
                                                        />
                                                        <input
                                                            type="submit"
                                                            className="uppercase tracking-widest bg-gray-900 text-gray-100 apikey hover:text-white cursor-pointer p-1 px-2 rounded-r-full"
                                                        />
                                                    </form>
                                                )}
                                                {!isEditingAPIKey && (
                                                    <a
                                                        onClick={() =>
                                                            setIsEditingAPIKey(
                                                                true
                                                            )
                                                        }
                                                        className="text-xs bg-gray-800 font-mono mr-4 apikey p-1 rounded-full px-2"
                                                    >
                                                        {getMaskedAPIKey(
                                                            service.service
                                                        ) || "NEEDS API KEY"}
                                                    </a>
                                                )}
                                            </div>
                                        )}
                                        {isActive && (
                                            <div className="bg-gray-1000 border border-gray-900/50 rounded-full p-1 text-gray-100">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    fill="none"
                                                    viewBox="0 0 24 24"
                                                    strokeWidth={1.5}
                                                    stroke="currentColor"
                                                    className="w-5 h-5"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="m4.5 12.75 6 6 9-13.5"
                                                    />
                                                </svg>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
