"use client";
import { useRouter } from "../hooks/useRouter";
import { ReactNode } from "react";

interface LinkProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export default function Link({
  href,
  children,
  className,
  onClick,
}: LinkProps) {
  const router = useRouter();

  return (
    <a
      href={href}
      onClick={(e) => {
        e.preventDefault();
        onClick?.();
        router.push(href);
      }}
      className={className}
    >
      {children}
    </a>
  );
}
