import * as Icons from "@assets/Icons";
import { ModalBackground } from "@components/Modal";

export default function SettingsMenu(props) {
    if (!props.showSettingsMenu) return null;

    const isWeb = window.api.isWeb;
    const onClose = () => props.toggleSettingsMenu(false);
    const onSave = () => {
        props.handleDownload();
        onClose();
    };
    const onNew = () => {
        window.location.href = "/";
    };

    const toggleLLMSettings = () => {
        props.toggleLLMSettings();
        onClose();
    };

    const toggleLayout = () => {
        props.toggleShowLayout();
        onClose();
    };

    const toggleRecording = () => {
        props.toggleShowRecordingModal();
        onClose();
    };

    const takeScreenshot = () => {
        props.takeScreenshot();
        onClose();
    };

    const toggleLicenseWindow = () => {
        props.toggleLicenseWindow();
        onClose();
    };

    return (
        <ModalBackground onClose={onClose} opacity={0}>
            <div className="absolute left-4 bottom-14 w-96 flex flex-col-reverse gap-1 lg:gap-4 p-2 lg:text-lg fan-left">
                {isWeb && props.edited && props.hyperedges.length > 0 && (
                    <a onClick={onSave} className="menu-item">
                        <div>{Icons.SaveIcon}</div>
                        Save
                    </a>
                )}
                {isWeb && props.edited && (
                    <a onClick={onNew} className="menu-item">
                        <div>{Icons.NewIcon}</div>
                        New
                    </a>
                )}

                {props.edited && (
                    <a onClick={takeScreenshot} className="menu-item">
                        <div>{Icons.ScreenshotIcon()}</div>
                        Screenshot
                    </a>
                )}

                {isWeb && props.edited && (
                    <a onClick={toggleRecording} className="menu-item">
                        <div>{Icons.RecordIcon()}</div>
                        Record Video
                    </a>
                )}

                <a onClick={toggleLLMSettings} className="menu-item">
                    <div>{Icons.GenerateIcon(6)}</div>
                    AI Settings
                </a>

                <a onClick={toggleLayout} className="menu-item">
                    <div>{Icons.LayoutIcon}</div>
                    Advanced Layout
                </a>

                {!isWeb && (
                    <a onClick={toggleLicenseWindow} className="menu-item">
                        <div>{Icons.LicenseIcon(6)}</div>
                        License
                    </a>
                )}
            </div>
        </ModalBackground>
    );
}
