import { use } from "react";
import { EnhanceContext } from "../contexts/enhance-context.js";

export const useEnhanceFetchInternal = () => use(EnhanceContext);
