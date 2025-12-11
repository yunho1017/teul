import { defineServer } from "../../minimal/server.js";
import { ConfigManager } from "./config.js";
import { EntriesManager } from "./entries.js";
import { createHandleBuild, createHandleRequest } from "./handlers.js";
import type { DefineRouterFunctions } from "./types.js";

export function defineRouter(fns: DefineRouterFunctions) {
  const configManager = new ConfigManager(fns);
  const entriesManager = new EntriesManager(fns, configManager);

  const handleRequest = createHandleRequest(entriesManager, configManager);
  const handleBuild = createHandleBuild(entriesManager, configManager);

  return defineServer({ handleBuild, handleRequest });
}

export type { DefineRouterFunctions, RouterConfig, SlotId } from "./types.js";
