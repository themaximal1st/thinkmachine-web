import { bouncy } from "ldrs";
bouncy.register();

import React, { useState } from "react";
import { useCombobox } from "downshift";
import cx from "classnames";

import Logo from "../assets/logo.png";

export default function Typer(params) {
    if (!params.show) return;

    function getSymbolFilter(inputValue) {
        const lowerCasedInputValue = inputValue.toLowerCase();

        return function symbolFilter(symbol) {
            return (
                !inputValue ||
                symbol.toLowerCase().includes(lowerCasedInputValue)
            );
        };
    }

    const [items, setItems] = useState(params.symbols);
    const {
        isOpen,
        getToggleButtonProps,
        getLabelProps,
        reset,
        getMenuProps,
        getInputProps,
        highlightedIndex,
        getItemProps,
        selectedItem,
    } = useCombobox({
        onInputValueChange({ inputValue }) {
            setItems(params.symbols.filter(getSymbolFilter(inputValue)));
            params.changeInput(inputValue);
        },
        items,
        inputValue: params.input,
    });

    let placeholder = "";
    if (params.loaded) {
        if (params.inputMode === "add" && params.hyperedges.length === 0) {
            placeholder = "Add anything to knowledge graph";
        } else if (params.inputMode === "generate") {
            placeholder = "Generate AI knowledge graph";
        } else if (params.inputMode === "search") {
            placeholder = "Search knowledge graph";
        }
    }

    return (
        <div
            className={params.loaded ? "" : "hidden pointer-events-none"}
            id="typer"
        >
            <div
                className="flex flex-col text-white mt-1 text-sm gap-1 px-2 w-4/12 absolute z-20 flex-wrap"
                id="typerInner"
            >
                {params.hyperedge.length > 0 && (
                    <div className="uppercase text-sm select-none tracking-widest font-medium text-gray-200">
                        CURRENT
                    </div>
                )}
                <div className="flex gap-1 flex-wrap">
                    {params.hyperedge.map((symbol, i) => {
                        return (
                            <div className="flex gap-1 items-center" key={i}>
                                <a
                                    onClick={(e) => params.removeIndex(i)}
                                    className="cursor-pointer text-sm opacity-80 hover:opacity-100 transition-all select-none py-1"
                                >
                                    {symbol}
                                </a>
                                <span className="opacity-80 select-none">
                                    →
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <div
                id="typerInput"
                className={`absolute inset-0 mt-2  flex flex-col gap-2 pointer-events-none z-40 items-center transition-all ${
                    params.edited ? "justify-start" : "justify-center"
                }`}
            >
                {params.edited === false && (
                    <a href="https://thinkmachine.com">
                        <img
                            src={Logo}
                            className="max-w-lg w-full mb-4 pointer-events-auto px-8"
                            title="Think Machine — Multidimensional Mind Mapper"
                        />
                    </a>
                )}
                <div className="flex text-white gap-2">
                    <a
                        className={`select-none text-sm pointer-events-auto flex items-center gap-[6px] py-1 px-2 rounded-lg hover:cursor-pointer transition-all ${
                            params.inputMode === "add"
                                ? "bg-gray-800/80 opacity-100"
                                : "opacity-60 hover:opacity-80"
                        }`}
                        onClick={() => params.setInputMode("add")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14Zm.75-10.25v2.5h2.5a.75.75 0 0 1 0 1.5h-2.5v2.5a.75.75 0 0 1-1.5 0v-2.5h-2.5a.75.75 0 0 1 0-1.5h2.5v-2.5a.75.75 0 0 1 1.5 0Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Add
                    </a>

                    <a
                        className={`select-none text-sm pointer-events-auto flex items-center gap-[6px] py-1 px-2 rounded-lg hover:cursor-pointer transition-all ${
                            params.inputMode === "generate"
                                ? "bg-gray-800/80 opacity-100"
                                : "opacity-60 hover:opacity-80"
                        }`}
                        onClick={() => params.setInputMode("generate")}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path
                                fillRule="evenodd"
                                d="M5 4a.75.75 0 0 1 .738.616l.252 1.388A1.25 1.25 0 0 0 6.996 7.01l1.388.252a.75.75 0 0 1 0 1.476l-1.388.252A1.25 1.25 0 0 0 5.99 9.996l-.252 1.388a.75.75 0 0 1-1.476 0L4.01 9.996A1.25 1.25 0 0 0 3.004 8.99l-1.388-.252a.75.75 0 0 1 0-1.476l1.388-.252A1.25 1.25 0 0 0 4.01 6.004l.252-1.388A.75.75 0 0 1 5 4ZM12 1a.75.75 0 0 1 .721.544l.195.682c.118.415.443.74.858.858l.682.195a.75.75 0 0 1 0 1.442l-.682.195a1.25 1.25 0 0 0-.858.858l-.195.682a.75.75 0 0 1-1.442 0l-.195-.682a1.25 1.25 0 0 0-.858-.858l-.682-.195a.75.75 0 0 1 0-1.442l.682-.195a1.25 1.25 0 0 0 .858-.858l.195-.682A.75.75 0 0 1 12 1ZM10 11a.75.75 0 0 1 .728.568.968.968 0 0 0 .704.704.75.75 0 0 1 0 1.456.968.968 0 0 0-.704.704.75.75 0 0 1-1.456 0 .968.968 0 0 0-.704-.704.75.75 0 0 1 0-1.456.968.968 0 0 0 .704-.704A.75.75 0 0 1 10 11Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Generate
                    </a>

                    <a
                        className={`select-none text-sm pointer-events-auto flex items-center gap-[6px] py-1 px-2 rounded-lg hover:cursor-pointer transition-all ${
                            params.inputMode === "search"
                                ? "bg-gray-800/80 opacity-100"
                                : "opacity-60 hover:opacity-80"
                        } ${!params.edited && "hidden"}`}
                        onClick={() => {
                            if (params.edited) {
                                params.setInputMode("search");
                            }
                        }}
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 16 16"
                            fill="currentColor"
                            className="w-4 h-4"
                        >
                            <path d="M5.94 8.06a1.5 1.5 0 1 1 2.12-2.12 1.5 1.5 0 0 1-2.12 2.12Z" />
                            <path
                                fillRule="evenodd"
                                d="M8 15A7 7 0 1 0 8 1a7 7 0 0 0 0 14ZM4.879 4.879a3 3 0 0 0 3.645 4.706L9.72 10.78a.75.75 0 0 0 1.061-1.06L9.585 8.524A3.001 3.001 0 0 0 4.879 4.88Z"
                                clipRule="evenodd"
                            />
                        </svg>
                        Search
                    </a>
                </div>

                <form
                    onSubmit={async (e) => {
                        await params.handleInput(e);
                        reset();
                    }}
                    className="w-full overflow-y-hidden"
                >
                    <div
                        className="mx-auto w-full max-w-lg flex flex-col"
                        ref={params.inputRef}
                    >
                        <input
                            type="text"
                            tabIndex={-1}
                            autoComplete="off"
                            disabled={params.isGenerating}
                            placeholder={placeholder}
                            className="text-2xl w-full text-center text-white outline-none py-2 pointer-events-auto transition-all rounded-xl bg-gray-1000/50 focus:bg-gray-1000"
                            {...getInputProps({
                                onKeyDown: (event) => {
                                    if (event.key === "Enter") {
                                        if (highlightedIndex === -1) {
                                            event.nativeEvent.preventDownshiftDefault = true;
                                        }
                                    }
                                },
                            })}
                        />
                        {!params.edited && (
                            <a
                                onClick={(e) => params.handleCreateTutorial()}
                                className="text-gray-500 hover:text-gray-200 transition-all underline pointer-events-auto mt-2 text-sm text-center hover:cursor-pointer"
                            >
                                What is Think Machine?
                            </a>
                        )}
                        {params.isGenerating && (
                            <div className="text-center mt-2">
                                <l-bouncy
                                    size="25"
                                    speed="1.75"
                                    color="white"
                                ></l-bouncy>
                            </div>
                        )}
                    </div>

                    <ul
                        className={`pointer-events-auto max-w-md mx-auto h-[calc(100dvh)] overflow-y-scroll ${
                            !(isOpen && items.length) && "hidden"
                        }`}
                        {...getMenuProps()}
                    >
                        {isOpen &&
                            items.map((item, index) => (
                                <li
                                    className={cx(
                                        highlightedIndex === index &&
                                            "bg-gray-1000",
                                        selectedItem === item && "font-bold",
                                        "py-2 px-3 shadow-sm flex flex-col text-white text-center rounded-lg hover:cursor-pointer"
                                    )}
                                    key={index}
                                    {...getItemProps({ item, index })}
                                >
                                    <span>{item}</span>
                                </li>
                            ))}
                    </ul>
                </form>
            </div>
        </div>
    );
}
