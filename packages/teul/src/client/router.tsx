"use client";

import { Root } from "./root.js";
import { InnerRouter } from "./router/inner-router.js";
import { parseRouteFromLocation } from "./router/utils/parse-route.js";
import { encodeRoutePath } from "../server/router/common.js";
import { createRscParams } from "./router/utils/create-rsc-params.js";
import type { RouteProps } from "../server/router/common.js";

export interface RouterProps {
  initialRoute?: RouteProps;
}

export function Router({ initialRoute = parseRouteFromLocation() }: RouterProps) {
  const initialRscPath = encodeRoutePath(initialRoute.path);
  const initialRscParams = createRscParams(initialRoute.query);

  return (
    <Root initialRscPath={initialRscPath} initialRscParams={initialRscParams}>
      <InnerRouter initialRoute={initialRoute} />
    </Root>
  );
}
