import { Express, Request, Response } from "express";
import path from "path";
import { readFileSync } from "fs";
import React from "react";
import RouteManager from "../../utils/routeManager";
import { CLIENT_DIST_PATH } from "../../constants";

const {
  renderToPipeableStream,
} = require("react-server-dom-webpack/server.node");

interface RSCRequest extends Request {
  query: {
    pathname: string;
  };
}

function getClientManifest(): string {
  return readFileSync(
    path.resolve(CLIENT_DIST_PATH, "./react-client-manifest.json"),
    "utf8"
  );
}

async function handleRSC(req: RSCRequest, res: Response): Promise<void> {
  const moduleMap = JSON.parse(getClientManifest());
  const pathname = req.query.pathname;

  const route = RouteManager.getInstance().matchRoute(pathname);

  if (!route) {
    res.status(404).end("Not Found");
    return;
  }

  const { handler, params } = route;
  const pageElement = React.createElement(handler.page, { params });
  let component = pageElement;
  if (handler.layout) {
    component = React.createElement(handler.layout, {
      params,
      children: pageElement,
    });
  }
  const stream = renderToPipeableStream(component, moduleMap);

  res.setHeader("Content-Type", "text/plain");
  res.setHeader("Cache-Control", "no-cache");

  stream.pipe(res).on("error", (err: any) => {
    console.error("Stream error:", err);
    res.status(500).end("Internal Server Error");
  });
}

export default (app: Express): void => {
  app.get("/rsc", handleRSC);
};
