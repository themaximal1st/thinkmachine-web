import { v4 as uuidv4 } from "uuid";

export function isUUID(uuid) {
    const pattern =
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return !!pattern.test(uuid);
}

export function isEmptyUUID(uuid) {
    return uuid === "00000000-0000-0000-0000-000000000000";
}

export function generate() {
    return uuidv4();
}