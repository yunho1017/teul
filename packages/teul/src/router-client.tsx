"use client";

// Client Root & Router
export { Root } from "./client/root.js";
export { Router } from "./client/router.js";
export type { RootProps } from "./client/root.js";
export type { RouterProps } from "./client/router.js";

// RSC Components
export { Slot } from "./client/rsc/slot.js";
export { Children } from "./client/rsc/children.js";
export type { SlotProps } from "./client/rsc/slot.js";

// RSC Hooks
export { useRefetch } from "./client/rsc/hooks/use-refetch.js";
export { useElementsPromise } from "./client/rsc/hooks/use-elements-promise.js";
export { useEnhanceFetchInternal } from "./client/rsc/hooks/use-enhance-fetch-internal.js";

// Router Components
export { Link } from "./client/router/link.js";
export { ErrorBoundary } from "./client/router/error-boundary.js";
export type { LinkProps } from "./client/router/link.js";

// Router Hooks
export { useRouter } from "./client/router/hooks/use-router.js";

// Types
export type { RouteProps } from "./server/router/utils.js";

// Utils (for server functions)
export { unstableCallServerRsc } from "./client/rsc/utils/call-server-rsc.js";
