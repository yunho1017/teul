"use client";

import type { RouteProps } from "./router/common.js";
import { Slot } from "../client/rsc/slot.js";
import { RouterContext } from "../client/router/contexts/router-context.js";
import { getRouteSlotId } from "../client/router/utils/helpers.js";

const notAvailableInServer = (name: string) => () => {
  throw new Error(`${name} is not available in server`);
};

export interface RouterProps {
  route: RouteProps;
  httpstatus: number;
}

// 서버용 라우터 (클라이언트(브라우저) 환경에서 사용금지)
export function Router({ route, httpstatus }: RouterProps) {
  return (
    <RouterContext.Provider
      value={{
        route,
        changeRoute: notAvailableInServer("changeRoute"),
      }}
    >
      <Slot id="root">
        <meta name="httpstatus" content={`${httpstatus}`} />
        <Slot id={getRouteSlotId(route.path)} />
      </Slot>
    </RouterContext.Provider>
  );
}
