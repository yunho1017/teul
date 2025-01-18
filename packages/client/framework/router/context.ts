import { createContext } from "react";
import { RouterInstance } from "./types";

export const RouterContext = createContext<RouterInstance | null>(null);
