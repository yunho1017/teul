import { use } from "react";
import { RefetchContext } from "../contexts/refetch-context.js";

export const useRefetch = () => use(RefetchContext);
