import type { MouseEvent } from "react";

export const isAltClick = (event: MouseEvent<HTMLAnchorElement>) =>
  event.button !== 0 ||
  !!(event.metaKey || event.altKey || event.ctrlKey || event.shiftKey);

export const getRouteSlotId = (path: string) => "route:" + decodeURI(path);
