export { createPages } from "./server/router/create-pages/create-pages.js";
export { defineRouter } from "./server/router/define-router/define-router.js";
export { fsRouter } from "./server/router/fs-router.js";

// Server Root & Router
export { Root } from "./server/root.js";
export { Router } from "./server/router.js";
export type { RootProps } from "./server/root.js";
export type { RouterProps } from "./server/router.js";

// RSC Components (server에서도 사용 가능)
export { Slot } from "./client/rsc/slot.js";
export type { SlotProps } from "./client/rsc/slot.js";

// Types
export type { RouteProps } from "./server/router/utils.js";
