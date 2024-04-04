import os from "os";
import user_id from "./uuid.js";
import * as amplitude from "@amplitude/analytics-node";
import { publicIpv4 } from "public-ip";
import { version as app_version } from "../../package.json";

const API_KEY = "2b6653ff2461c57095623aa3e5530cc9"; // don't usually hardcode api keys, but analytics is ok

export default class Analytics {
    static track(event, properties) {
        amplitude.track(event, properties, {
            user_id
        });
    }

    static async load() {
        amplitude.init(API_KEY);

        const ip_address = await publicIpv4();
        const identity = new amplitude.Identify();
        const config = {
            user_id,
            ip_address,
            platform: "macOS",
            os_name: os.type(),
            os_version: os.release(),
            app_version
        };

        amplitude.identify(identity, config);
    }
}
