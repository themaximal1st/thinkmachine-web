import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  resolve: {
    preserveSymlinks: true,
    alias: {
      // "@src": path.resolve(__dirname, "src/client"),
      "@common": path.resolve(__dirname, "src/common"),
      "@components": path.resolve(__dirname, "src/common/components"),
      "@assets": path.resolve(__dirname, "src/common/assets"),
      "@lib": path.resolve(__dirname, "src/common/lib"),
      "@generalschematics": path.resolve(__dirname, "src/common/lib/generalschematics"),
    },
  },
  test: {
    watch: {
      ignored: ['**/node_modules/**', '**/dist/**'],
      include: [
        '../src/**/*.{js,ts,jsx,tsx}',
        'test/**/*.{js,ts,jsx,tsx}'
      ],
    },
  },
  plugins: [react()],
});