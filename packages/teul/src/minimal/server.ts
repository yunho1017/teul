import type { ServerEntry } from "../types.js";

export function defineServer(fns: ServerEntry["default"]) {
  return fns;
}
