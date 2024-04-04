/*
import os from "os";
import * as amplitude from "@amplitude/analytics-node";
import { publicIpv4 } from "public-ip";
import { version as app_version } from "../../package.json";

const API_KEY = process.env.AMPLITUDE_API_KEY;

export default class Analytics {
    static track(user_id, event, properties) {
        amplitude.track(event, properties, {
            user_id
        });
    }

    static async load(user_id) {
        amplitude.init(API_KEY);

        const ip_address = await publicIpv4();
        const identity = new amplitude.Identify();
        const config = {
            // user_id,
            ip_address,
            platform: "macOS",
            os_name: os.type(),
            os_version: os.release(),
            app_version
        };

        // amplitude.identify(identity, config);
    }
}

*/