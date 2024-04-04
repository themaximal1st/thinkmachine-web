import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        plugins: [
            externalizeDepsPlugin({
                exclude: ["@themaximalist/thinkabletype"],
            }),
        ],
    },
    preload: {
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            preserveSymlinks: true,
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@common": resolve("src/renderer/src/common"),
                "@components": resolve("src/renderer/src/common/components"),
                "@assets": resolve("src/renderer/src/common/assets"),
                "@lib": resolve("src/renderer/src/common/lib"),
            }
        },
        plugins: [react()],
    },
});
