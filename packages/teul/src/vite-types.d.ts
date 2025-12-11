/// <reference types="vite/client" />
/// <reference types="@vitejs/plugin-rsc/types" />

type HonoEnhancer = <Hono>(fn: (app: Hono) => Hono) => (app: Hono) => Hono;

declare module "virtual:vite-rsc-teul/server-entry" {
  const default_: import("./types.ts").ServerEntry["default"];
  export default default_;
}

declare module "virtual:vite-rsc-teul/client-entry" {}

declare module "virtual:vite-rsc-teul/config" {
  export const flags: import("./vite-rsc/plugin.ts").Flags;
  export const config: import("./config/types.ts").ConfigDev;
  export const isBuild: boolean;
}
