import * as Icons from "@assets/Icons";
import React, { useEffect } from "react";

export function ModalBackground(props) {
    const onClose = props.onClose || (() => {});

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
            className="modal-bg bg-black/80 absolute inset-0 z-50 text-white flex justify-center items-center"
        >
            {props.children}
        </div>
    );
}

export function Modal(props) {
    if (!props.onClose) props.onClose = () => {};

    return (
        <ModalBackground {...props}>
            <div className="modal bg-gray-900 p-8 rounded-xl shadow-2xl relative">
                <a
                    className="cursor-pointer absolute -top-5 -right-3 font-bold opacity-50 hover:opacity-100 transition-all"
                    onClick={props.onClose}
                >
                    {Icons.CloseIcon()}
                </a>
                {props.children}
            </div>
        </ModalBackground>
    );
}
