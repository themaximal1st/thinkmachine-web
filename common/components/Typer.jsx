import { bouncy } from "ldrs";
bouncy.register();

import { Tooltip } from "react-tooltip";
import React, { useState } from "react";
import { useCombobox } from "downshift";
import cx from "classnames";

import * as Icons from "@assets/Icons";
import Logo from "@assets/logo.png";

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
        <div>
            <div
                className="flex flex-col text-white mt-1 text-sm gap-1 px-2 w-4/12 absolute z-20 flex-wrap"
                id="typerInner"
            >
                <Tooltip
                    id="current-tooltip"
                    style={{
                        opacity: 1,
                        "z-index": 100,
                        backgroundColor: "#1A1A1A", // gray-1000
                        color: "#f5f6f6", // gray-50
                    }}
                />
                {params.hyperedge.length > 0 && (
                    <div>
                        <div
                            data-tooltip-id="current-tooltip"
                            data-tooltip-content="Current context for adding information"
                            className="uppercase text-sm select-none tracking-widest font-medium text-gray-200 inline-block"
                        >
                            CURRENT
                        </div>
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

                <Tooltip
                    id="typer-tooltip"
                    place="top"
                    style={{
                        backgroundColor: "#1A1A1A", // gray-1000
                        color: "#f5f6f6", // gray-50
                    }}
                />

                <div className="flex text-white gap-2">
                    <a
                        data-tooltip-id="typer-tooltip"
                        data-tooltip-content="Add new information to knowledge graph"
                        data-tooltip-place="left"
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
                        data-tooltip-id="typer-tooltip"
                        data-tooltip-place="left"
                        data-tooltip-content={`Generate new information with ${params.llm.name}`}
                        className={`select-none text-sm pointer-events-auto flex items-center gap-[6px] py-1 px-2 rounded-lg hover:cursor-pointer transition-all ${
                            params.inputMode === "generate"
                                ? "bg-gray-800/80 opacity-100"
                                : "opacity-60 hover:opacity-80"
                        }`}
                        onClick={() => params.setInputMode("generate")}
                    >
                        {Icons.GenerateIcon(4)}
                        Generate
                    </a>

                    <a
                        data-tooltip-id="typer-tooltip"
                        data-tooltip-place="right"
                        data-tooltip-content="Search existing knowledge graph"
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
