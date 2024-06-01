import dotenv from "dotenv-extended"
dotenv.load();

import express from "express";
import ViteExpress from "vite-express";
import cookieParser from "cookie-parser";
import WebBridge from "./WebBridge.js";

const app = express();
app.use(express.json({ limit: "100mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/", (req, res, next) => {
  return express.static(`index`)(req, res, next);
});

app.use(ViteExpress.static("index"));

await WebBridge.initialize(app);

ViteExpress.listen(app, process.env.PORT, () =>
  console.log(`Server is listening on port ${process.env.PORT}...`),
);
