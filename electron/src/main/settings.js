import { app } from "electron";
import path from "path";
import fs, { write } from "fs";
import debug from "debug";
import { v4 as uuidv4 } from "uuid";
const log = debug("app:settings");

export const DIRECTORY = app.getPath("userData");

export function load() {
    createDirectory();
    const settings = readFile("settings");
    if (!settings.uuid || settings.uuid.length === 0) {
        settings.uuid = uuidv4();
        log(`Generated new UUID: ${settings.uuid}`);
        writeFile("settings", settings);
    }

    if (!settings.d || settings.d.length === 0) {
        settings.d = new Date().toISOString();
        log(`Generated install date: ${settings.d}`);
        writeFile("settings", settings);
    }
}

export function get(key, file = "settings") {
    const settings = readFile(file);
    return settings[key];
}

export function set(key, value, file = "settings") {
    const settings = readFile(file);
    settings[key] = value;
    writeFile(file, settings);
    return settings;
}

function readFile(file) {
    const file_path = path.join(DIRECTORY, file);
    if (!fs.existsSync(file_path)) {
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(file_path, "utf-8"));
    } catch (e) {
        log(`Error reading file: ${file_path}`);
        return {};
    }
}

function writeFile(file, data) {
    fs.writeFileSync(path.join(DIRECTORY, file), JSON.stringify(data), "utf-8");
}

function createDirectory() {
    if (!fs.existsSync(DIRECTORY)) {
        log(`Creating directory: ${DIRECTORY}`);
        fs.mkdirSync(DIRECTORY, { recursive: true });
    }
}

load();
