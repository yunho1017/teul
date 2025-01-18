"use client";
import React, { forwardRef } from "react";
import { useComponentDidMount } from "../../hooks/useComponentDidMount";
import { useForwardRef } from "../../hooks/useForwardRef";
import { type } from "./typical";
import type { TypeAnimationProps } from "./index.types";

const DEFAULT_SPEED = 40;
const DEFAULT_SPLITTER = (text: string): ReadonlyArray<string> => [...text];

export const TypoAnimation = forwardRef<HTMLSpanElement, TypeAnimationProps>(
  ({ sequence }, ref) => {
    const typeRef = useForwardRef<HTMLSpanElement>(ref);

    useComponentDidMount(() => {
      type(
        typeRef.current,
        DEFAULT_SPLITTER,
        DEFAULT_SPEED,
        DEFAULT_SPEED,
        false,
        ...sequence
      );
    });

    return (
      <span
        ref={typeRef}
        className='after:content-["|"] after:ml-[1px] after:animate-cursor'
      />
    );
  }
);
