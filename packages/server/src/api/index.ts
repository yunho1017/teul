import { Express, Response } from "express";
import { readFileSync } from "fs";
import path from "path";
import rsc from "./routes/rsc";
import { CLIENT_DIST_PATH } from "../constants";

function sendHtmlResponse(res: Response): void {
  const html = readFileSync(
    path.resolve(CLIENT_DIST_PATH, "./index.html"),
    "utf8"
  ).replace('src="main.js"', 'src="/main.js"');
  res.send(html);
}

export default (app: Express) => {
  rsc(app);

  app.get("*", (_req, res) => sendHtmlResponse(res));
  return app;
};
