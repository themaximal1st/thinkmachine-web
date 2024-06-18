import { resolve } from "path";
import { defineConfig, externalizeDepsPlugin } from "electron-vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
    main: {
        resolve: {
            preserveSymlinks: true,
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@src": resolve("src/renderer/src"),
                "@common": resolve("src/renderer/src/common"),
                "@components": resolve("src/renderer/src/common/components"),
                "@assets": resolve("src/renderer/src/common/assets"),
                "@lib": resolve("src/renderer/src/common/lib"),
            }
        },
        plugins: [
            externalizeDepsPlugin({
                exclude: ["@themaximalist/generalschematics"],
            }),
        ],
    },
    preload: {
        resolve: {
            preserveSymlinks: true,
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@src": resolve("src/renderer/src"),
                "@common": resolve("src/renderer/src/common"),
                "@components": resolve("src/renderer/src/common/components"),
                "@assets": resolve("src/renderer/src/common/assets"),
                "@lib": resolve("src/renderer/src/common/lib"),
            }
        },
        plugins: [externalizeDepsPlugin()],
    },
    renderer: {
        resolve: {
            preserveSymlinks: true,
            alias: {
                "@renderer": resolve("src/renderer/src"),
                "@src": resolve("src/renderer/src"),
                "@common": resolve("src/renderer/src/common"),
                "@components": resolve("src/renderer/src/common/components"),
                "@assets": resolve("src/renderer/src/common/assets"),
                "@lib": resolve("src/renderer/src/common/lib"),
            }
        },
        plugins: [react()],
    },
});
