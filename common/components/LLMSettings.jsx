import * as Icons from "@assets/Icons.jsx";
import LocalSettings from "@lib/LocalSettings.js";
import { useState } from "react";

import { Modal } from "@components/Modal";

function LLMSetting({ llm, service, ...props }) {
    const isActive = llm.service === service.service && llm.model === service.model;

    const [isEditingAPIKey, setIsEditingAPIKey] = useState(false);

    function setAPIKey(service, apikey) {
        const apikeys = props.apikeys;
        apikeys[service] = apikey;
        props.updateAPIKeys(apikeys);
        setIsEditingAPIKey(false);
    }

    function getMaskedAPIKey(service) {
        const apikey = LocalSettings.apiKeyForService(service);
        if (!apikey) return;
        if (apikey.length < 8) return apikey;
        return apikey.slice(0, 4) + "..." + apikey.slice(-4);
    }

    return (
        <div
            onClick={(e) => {
                if (!e || !e.target || e.target.tagName !== "INPUT") return;
                const clickedEditAPIKey = e.target.className.includes("apikey");
                if (!clickedEditAPIKey) {
                    props.updateLLM(service);
                    setIsEditingAPIKey(false);
                }
            }}
            className="text-sm flex w-full justify-between items-center py-3 pointer-events-auto hover:cursor-pointer hover:bg-gray-1000 px-2 gap-4">
            <div>
                <div className="text-lg">{service.name}</div>
                <div className="text-gray-300 text-base">{service.description}</div>
            </div>
            {window.api.isElectron && isActive && (
                <div className="grow flex justify-end">
                    {isEditingAPIKey && (
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();

                                setAPIKey(
                                    service.service,
                                    e.target.querySelector("input[type=text]").value
                                );
                            }}
                            className="text-xs bg-gray-800 font-mono mr-4 apikey rounded-full gap-1 flex items-center w-full max-w-[250px]">
                            <input
                                type="text"
                                defaultValue={
                                    LocalSettings.apiKeyForService(service.service) || ""
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
                            onClick={() => setIsEditingAPIKey(true)}
                            className="text-xs bg-gray-800 font-mono mr-4 apikey p-1 rounded-full px-2">
                            {getMaskedAPIKey(service.service) || "NEEDS API KEY"}
                        </a>
                    )}
                </div>
            )}
            {isActive && (
                <div className="bg-purple-500 border border-purple-800 rounded-full p-1 text-white">
                    {Icons.CheckmarkIcon(5)}
                </div>
            )}
        </div>
    );
}

export default function Settings(props) {
    if (!props.showLLMSettings) return;

    const onClose = () => props.toggleLLMSettings(false);

    return (
        <Modal onClose={onClose}>
            <div>
                <h1 className="text-xl font-bold ">AI Model</h1>
                <p>Choose one of the models below to use during AI brainstorming.</p>
            </div>

            <div className="flex flex-col">
                <div className="flex flex-col divide-gray-1000 divide-y my-2">
                    {LocalSettings.services.map((service, i) => {
                        return (
                            <LLMSetting
                                key={`service-${i}`}
                                service={service}
                                {...props}
                            />
                        );
                    })}
                </div>
            </div>
        </Modal>
    );
}
