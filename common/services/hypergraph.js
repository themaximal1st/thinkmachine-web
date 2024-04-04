import { isUUID, isEmptyUUID } from "@lib/uuid.js";

export function isValid(uuid) {
    if (!uuid) return false;
    if (!isUUID(uuid)) return false;
    if (isEmptyUUID(uuid)) return false;
    return true;
}