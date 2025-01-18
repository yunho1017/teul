import configureBabel from "./babel";
import initRouteManager from "./route";
const register = require("react-server-dom-webpack/node-register");

export default async function loader(): Promise<void> {
  register();
  configureBabel();
  await initRouteManager();
}
