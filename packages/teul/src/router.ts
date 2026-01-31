import type {
  PagePath,
  PropsForPages,
} from "./server/router/create-pages/types.js";

export type {
  PathsForPages,
  GetConfigResponse,
} from "./server/router/create-pages/types.js";

export interface RouteConfig {
  // routes to be overridden by users
}

export interface CreatePagesConfig {
  // routes to be overridden by users
}

export type PageProps<
  Path extends PagePath<CreatePagesConfig> | (string & {}),
> = PropsForPages<Path>;
