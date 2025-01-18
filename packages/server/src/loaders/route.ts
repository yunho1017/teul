import RouteManager from "../utils/routeManager";
import { APP_PATH } from "../constants";

export default async function initRouteManager(): Promise<void> {
  const manager = RouteManager.getInstance();
  await manager.buildRoutes(APP_PATH);
  manager.logRoutes();
}
