import dotenv from "dotenv-extended"
dotenv.load();

import express from "express";
import ViteExpress from "vite-express";
import cookieParser from "cookie-parser";
import WebBridge from "./WebBridge.js";
import Database from "./database.js"
import { getAdminDashboardContent } from "./admin.js";

const app = express();
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser(process.env.COOKIE_SECRET));

app.get("/", (req, res, next) => {
  return express.static(`index`)(req, res, next);
});

app.get("/admin", async (req, res) => {
  const { key } = req.query;
  if (key !== process.env.ADMIN_PASSWORD) { return res.status(401).send("Unauthorized") }

  const content = await getAdminDashboardContent();
  return res.send(content);
});

app.use(ViteExpress.static("index"));

await WebBridge.initialize(app);
await Database.initialize();

ViteExpress.listen(app, process.env.PORT, () =>
  console.log(`Server is listening on port ${process.env.PORT}...`),
);
