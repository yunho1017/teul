import { useContext } from "react";
import { RouterContext } from "../router/context";
import { RouterInstance } from "../router/types";

export function useRouter(): RouterInstance {
  const router = useContext(RouterContext);
  if (!router) {
    throw new Error("useRouter must be used within a RouterProvider");
  }
  return router;
}
