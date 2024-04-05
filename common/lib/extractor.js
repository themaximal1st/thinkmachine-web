import dotenv from "dotenv-extended" // why does this need to be included here instead of in the server.js file?
dotenv.load();

import fetch from "node-fetch";
import { JSDOM } from "jsdom";
import { Readability } from "@mozilla/readability";

const API_KEY = process.env.PROXIES_API_KEY;

export default async function extractor(url) {
    const response = await fetch(`http://api.proxiesapi.com/?auth_key=${API_KEY}&url=${url}`);
    if (!response) throw new Error("Invalid response");
    if (!response.ok) throw new Error("Invalid response status");

    const html = await response.text();
    if (!html) throw new Error("Invalid html");
    if (html.length < 50) throw new Error("Html too short");

    const dom = new JSDOM(html);
    if (!dom) throw new Error("Invalid dom");

    const article = new Readability(dom.window.document).parse();
    if (!article) throw new Error("Invalid article");

    const content = article.textContent;
    if (!content) throw new Error("Invalid content");
    if (content.length < 100) throw new Error("Content too short");

    return content;
}