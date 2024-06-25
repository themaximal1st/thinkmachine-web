import React from "react";
import * as Icons from "@assets/Icons";
import Modal from "./Modal";
import Settings from "@lib/Settings";

export default class SettingsModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            show: false,
            isValid: undefined,
        };

        this.handleKeyDown = this.handleKeyDown.bind(this);
    }

    componentDidMount() {
        window.addEventListener("keydown", this.handleKeyDown);
    }

    componentWillUnmount() {
        window.removeEventListener("keydown", this.handleKeyDown);
    }

    componentDidUpdate(prevProps, prevState) {
        if (this.state.show && !prevState.show) {
            this.validateLicense();
        }
    }

    handleKeyDown(event) {
        if (event.key === "Escape" && this.state.show) {
            this.setState({ show: false });
        } else if (event.key === "," && event.metaKey) {
            this.setState({ show: !this.state.show });
            event.preventDefault();
        }
    }

    get models() {
        return [
            { name: "None", model: "none" },
            { name: "Claude 3 Opus", model: "claude-3-opus-20240229" },
            { name: "Claude 3 Sonnet", model: "claude-3-sonnet-20240229" },
            { name: "Claude 3 Haiku", model: "claude-3-haiku-20240307" },
            { name: "GPT-4o", model: "gpt-4o" },
            { name: "GPT-4 Turbo", model: "gpt-4-turbo-preview" },
            { name: "GPT-3.5", model: "gpt-3.5-turbo" },
            { name: "Google Gemini", model: "gemini-pro" },
            { name: "Llama 3", model: "meta-llama/Llama-3-8b-chat-hf" },
            { name: "Groq Mistral", model: "mixtral-8x7b-32768" },
        ];
    }

    async validateLicense() {
        const license = Settings.license;
        const isValid = await window.api.license(license);
        this.setState({ isValid });
    }

    handleLLMChange(event) {
        const wasDisabled = Settings.llmIsDisabled;
        Settings.llmModel = event.target.value;
        const isDisabled = Settings.llmIsDisabled;
        if (wasDisabled !== isDisabled) {
            window.location.reload();
        }
    }

    handleLicenseChange(event) {
        Settings.license = event.target.value;
        this.validateLicense();
    }

    handleChangeLightMode(event) {
        Settings.colorScheme = event.target.checked ? "light" : "dark";
        window.location.reload();
    }

    render() {
        if (!this.state.show) {
            return (
                <div className="relative group" id="settings-icon">
                    <button onClick={() => this.setState({ show: true })}>
                        {Icons.SettingsIcon(8)}
                    </button>
                    <div
                        className="tooltip invisible group-hover:visible"
                        id="settings-tooltip">
                        Settings
                    </div>
                </div>
            );
        }

        return (
            <Modal onClose={() => this.setState({ show: false })}>
                <div id="settings-modal">
                    <h2>Settings</h2>
                    <div className="flex flex-col gap-6">
                        <label>
                            <span>LLM</span>
                            <select
                                onChange={this.handleLLMChange.bind(this)}
                                defaultValue={Settings.llmModel}>
                                {this.models.map((m) => (
                                    <option key={m.model} value={m.model}>
                                        {m.name}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <label>
                            <span>Light Mode</span>
                            <div>
                                <input
                                    type="checkbox"
                                    onChange={this.handleChangeLightMode.bind(this)}
                                    checked={Settings.colorScheme === "light"}
                                    className="sr-only peer"
                                />
                                <div className="relative w-11 h-6 bg-gray-200 outline-none  rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                            </div>
                        </label>

                        <label className="large">
                            <span>License</span>
                            <input
                                type="text"
                                defaultValue={Settings.license}
                                onChange={this.handleLicenseChange.bind(this)}
                            />
                        </label>

                        <label className="text-white -mt-2 min-h-8 uppercase tracking-wider text-xs">
                            <span></span>
                            {this.state.isValid === true && (
                                <div className="text-green-500 flex items-center gap-1">
                                    {Icons.CloseIcon(4)} Valid License
                                </div>
                            )}
                            {this.state.isValid === false && (
                                <a
                                    href="https://thinkmachine.com/purchase"
                                    target="_blank"
                                    className="text-red-500 flex items-center gap-1">
                                    {Icons.CloseIcon(4)} Invalid License
                                </a>
                            )}
                        </label>
                    </div>
                </div>
            </Modal>
        );
    }
}
