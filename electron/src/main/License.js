import Keygen from "@themaximalist/keygen.js";
import * as settings from "./settings";

const account_id = "2fba6ee6-267b-481a-aeb3-af3fdfa7b6cd";

const MAX_TRIAL_DURATION = 7 * 86400; // 7 days in seconds
// const MAX_TRIAL_DURATION = 10;
const MAX_VALIDATION_DURATION = 86400 * 30; // 30 days

const keygen = new Keygen({
    base_url: "https://k.cac.app",
    account_id,
});

export default class License {
    static get installDate() {
        return settings.get("d");
    }

    static get license() {
        return settings.get("license");
    }

    static get trialDuration() {
        const date = new Date(License.installDate);
        // time ago
        const now = new Date();
        return (now.getTime() - date.getTime()) / 1000;
    }

    static get trialExpired() {
        return License.trialDuration > MAX_TRIAL_DURATION;
    }

    static get trialDurationRemaining() {
        return MAX_TRIAL_DURATION - License.trialDuration;
    }

    static get lastValidated() {
        return settings.get("lastValidated") || 0;
    }

    static get validationDuration() {
        return (Date.now() - License.lastValidated) / 1000;
    }

    static get validationExpired() {
        console.log(
            `Validation duration, checking if ${License.validationDuration} > ${MAX_VALIDATION_DURATION}`
        );
        return License.validationDuration > MAX_VALIDATION_DURATION;
    }

    static async check(license = null) {
        if (!license && !License.trialExpired) return true;
        console.log("Trial expired. Checking license");

        if (!license || license.length === 0) {
            console.log("No license found");
            return false;
        }

        if (!License.validationExpired) {
            console.log("License was recently validated");
            return true;
        }

        console.log("License has not been validated recently");

        const { valid } = await keygen.validateLicense(license);
        if (valid) {
            console.log("License has been validated!");
            settings.set("lastValidated", Date.now());
            return true;
        } else {
            console.log("License is not valid!");
            return false;
        }
    }
}
