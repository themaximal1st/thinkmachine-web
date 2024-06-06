import Settings from "@lib/Settings";

import tailwindcss from "@common/tailwind.config";

const colors = tailwindcss.theme.extend.colors;

const LightScheme = {
    backgroundColor: colors.white,
    textColor: "#000000",
    linkColor: colors.blue[500],
    bloom: { // while not technically a color, bloom greatly effects the color scheme
        strength: 0.25,
        radius: 0.25,
        threshold: 1,
    }
};

const DarkScheme = {
    backgroundColor: "#000000", // bloom filters are very sensitive to the background color—so we go absolute here
    textColor: "#ffffff",
    linkColor: colors.blue[500],
    bloom: {
        strength: 1.25,
        radius: 1,
        threshold: 0,
    }
};

export default class Color {
    static get scheme() {
        if (this.isLight) return LightScheme;
        if (this.isDark) return DarkScheme;
        console.log(`Color scheme "${Settings.colorScheme}" not found, defaulting to light scheme`);
        return LightScheme;
    }

    static get isLight() {
        return Settings.colorScheme === "light";
    }

    static get isDark() {
        return Settings.colorScheme === "dark";
    }

    static get backgroundColor() {
        return this.scheme.backgroundColor;
    }

    static get textColor() {
        return this.scheme.textColor;
    }

    static get bloom() {
        return this.scheme.bloom;
    }
}