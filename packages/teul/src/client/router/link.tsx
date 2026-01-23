"use client";

import { useContext } from "react";
import type { ReactNode, AnchorHTMLAttributes, MouseEvent, Ref } from "react";
import { RouterContext } from "./contexts/router-context.js";
import { parseRoute } from "./utils/parse-route.js";
import { isAltClick } from "./utils/helpers.js";
import type { TransitionFunction } from "react";

export interface LinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href"> {
  to: string;
  children: ReactNode;
  scroll?: boolean;
  ref?: Ref<HTMLAnchorElement> | undefined;
}

export function Link({ to, children, scroll, ref: refProp, ...props }: LinkProps) {
  const router = useContext(RouterContext);
  const changeRoute = router
    ? router.changeRoute
    : () => {
        throw new Error("Missing Router");
      };

  const startTransitionFn = (fn: TransitionFunction) => fn();

  const internalOnClick = () => {
    const url = new URL(to, window.location.href);
    if (url.href !== window.location.href) {
      const route = parseRoute(url);
      startTransitionFn(async () => {
        const currentPath = window.location.pathname;
        const newPath = url.pathname !== currentPath;
        try {
          await changeRoute(route, {
            shouldScroll: scroll ?? newPath,
          });
        } finally {
          if (window.location.pathname === currentPath) {
            window.history.pushState(null, "", url);
          }
        }
      });
    }
  };

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (props.onClick) {
      props.onClick(event);
    }
    if (!event.defaultPrevented && !isAltClick(event)) {
      event.preventDefault();
      internalOnClick();
    }
  };

  return (
    <a {...props} href={to} onClick={onClick}>
      {children}
    </a>
  );
}
