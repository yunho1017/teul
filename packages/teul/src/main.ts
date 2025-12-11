export { Link, useRouter } from "teul/router/client";

import type { createPages as createPagesType } from "./main.react-server.js";

export const createPages: typeof createPagesType = () => {
  throw new Error(
    "`createPages` is only available in react-server environment",
  );
};
