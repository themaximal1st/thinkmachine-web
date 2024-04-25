import * as Icons from "@assets/Icons.jsx";
import LocalSettings from "@lib/LocalSettings.js";
import { useState } from "react";
import toast from "react-hot-toast";

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

    function handleCustomSettings(e) {
        e.preventDefault();

        const service = e.target.querySelector("#custom-llm-service").value;
        const model = e.target.querySelector("#custom-llm-model").value;
        const options = e.target.querySelector("#custom-llm-options").value;
        const llm = {
            service,
            model,
            options: Envtools.toJSON(options),
        };

        LocalSettings.customSettings = llm;

        props.updateLLM(llm);
        // props.toggleLLMSettings(false);

        toast.success("Saved custom settings!");
    }

    return (
        <>
            <div
                onClick={(e) => {
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
                {window.api.isElectron && isActive && !service.custom && (
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
                                        LocalSettings.apiKeyForService(service.service) ||
                                        ""
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

            {window.api.isElectron && isActive && service.custom && (
                <>
                    <form
                        onSubmit={handleCustomSettings}
                        className="text-sm flex flex-col w-full justify-between items-start pointer-events-auto px-2 gap-4 max-w-sm">
                        <div className="flex items-start gap-2 w-full">
                            <div className="w-full text-sm">
                                Everything from{" "}
                                <a
                                    href="https://llmjs.themaximalist.com"
                                    target="_blank"
                                    className="underline">
                                    LLM.js
                                </a>{" "}
                                is supported
                            </div>
                        </div>
                        <label className="flex items-center gap-2 w-full">
                            <div className="w-20">Service</div>
                            <input
                                type="text"
                                defaultValue={service.service}
                                id="custom-llm-service"
                                className="bg-gray-800/50 focus:bg-gray-800/80 transition-all text-white p-1 px-2 w-full outline-none rounded-md text-sm"
                            />
                        </label>
                        <label className="flex items-center gap-2 w-full">
                            <div className="w-20">Model</div>
                            <input
                                type="text"
                                defaultValue={service.model}
                                id="custom-llm-model"
                                className="bg-gray-800/50 focus:bg-gray-800/80 transition-all text-white p-1 px-2 w-full outline-none rounded-md text-sm"
                            />
                        </label>
                        <label className="flex items-start gap-2 w-full">
                            <div className="w-20">Options</div>
                            <textarea
                                type="text"
                                defaultValue={Envtools.toEnv(service.options)}
                                id="custom-llm-options"
                                className="bg-gray-800/50 focus:bg-gray-800/80 transition-all text-white p-1 px-2 w-full outline-none rounded-md text-sm min-h-20"></textarea>
                        </label>
                        <div className="flex items-start gap-2 w-full">
                            <div className="w-20"></div>
                            <div className="w-full text-sm">
                                <input
                                    type="submit"
                                    className="bg-gray-800/50 hover:bg-gray-800/80 transition-all text-white p-2 px-4 rounded-md cursor-pointer"
                                    value="Save"
                                />
                            </div>
                        </div>
                    </form>
                </>
            )}
        </>
    );
}

export default function Settings(props) {
    if (!props.showLLMSettings) return;

    const onClose = () => props.toggleLLMSettings(false);

    return (
        <Modal onClose={onClose}>
            <div>
                <h1 className="text-xl font-bold ">AI Model</h1>
                <p>
                    Choose one of the models below to use during AI brainstorming and
                    chat.
                </p>
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

class Envtools {
    static toJSON(envString) {
        if (!envString) {
            return {};
        }

        const lines = envString.split("\n");
        let result = {};

        lines.forEach(function (line) {
            const parts = line.split("=");
            if (parts.length === 2) {
                const key = parts[0].trim();
                const value = parts[1].trim();
                if (key.length > 0 && value.length > 0) {
                    result[key] = value;
                }
            }
        });

        return result;
    }

    static fromJSON(jsonObject) {
        if (Object.keys(jsonObject).length === 0) {
            return "";
        }

        let envString = "";

        for (const [key, value] of Object.entries(jsonObject)) {
            envString += `${key}=${value}\n`;
        }

        // Remove the last new line character for cleaner output
        envString = envString.trim();

        return envString;
    }

    static toEnv(json) {
        if (!json) {
            return "";
        }
        if (typeof json === "string") {
            return json;
        }
        if (typeof json !== "object") {
            return "";
        }
        return this.fromJSON(json);
    }
}
