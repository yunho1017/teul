"use client";

import { use } from "react";
import { ChildrenContext } from "./contexts/children-context.js";

export const Children = () => use(ChildrenContext);
