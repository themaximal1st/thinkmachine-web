import Keygen from "@themaximalist/keygen.js";

const account_id = "2fba6ee6-267b-481a-aeb3-af3fdfa7b6cd";

const keygen = new Keygen({
    base_url: "https://k.cac.app",
    account_id,
});

export default class License {
    static async check(license = null) {
        if (!license) {
            console.log("No license provided!");
            return false;
        }

        const { valid } = await keygen.validateLicense(license);
        return valid;
    }
}
