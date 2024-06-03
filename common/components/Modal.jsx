import * as Icons from "@assets/Icons";
import React, { useEffect } from "react";

export function ModalBackground(props) {
    const onClose = props.onClose || (() => {});
    const opacity = typeof props.opacity !== "undefined" ? props.opacity : 90;

    useEffect(() => {
        const handleEsc = (event) => {
            if (event.key === "Escape") {
                onClose();
            }
        };

        window.addEventListener("keydown", handleEsc);

        return () => {
            window.removeEventListener("keydown", handleEsc);
        };
    }, []);

    function handleClickOff(e) {
        if (e.target.classList.contains("modal-bg")) {
            onClose();
        }
    }

    return (
        <div
            onClick={handleClickOff}
            className={`modal-bg bg-white/85 dark:bg-black/85 absolute inset-0 z-50 text-white flex justify-center items-center`}>
            {props.children}
        </div>
    );
}

export default function Modal(props) {
    const onClose = props.onClose || (() => {});

    return (
        <ModalBackground {...props} onClose={onClose}>
            <div className="modal bg-white dark:bg-gray-1000 p-8 rounded-xl shadow-2xl relative flex flex-col justify-between max-w-2xl">
                <a
                    className="cursor-pointer text-black dark:text-white absolute -top-5 -right-3 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={onClose}>
                    {Icons.CloseIcon()}
                </a>
                {props.children}
            </div>
        </ModalBackground>
    );
}
