import path from "path";

export const PORT = process.env.PORT || 4000;
export const ROOT_PATH = process.env.ROOT_PATH as string;
export const CLIENT_DIST_PATH = path.resolve(ROOT_PATH, "./dist/client");
export const APP_PATH = path.resolve(ROOT_PATH, "packages/client/app");
export const COMMON_PATH = path.resolve(ROOT_PATH, "packages/client/common");
