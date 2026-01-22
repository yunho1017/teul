"use client";

import { Component } from "react";
import type { ReactNode } from "react";

function renderError(message: string) {
  return (
    <html>
      <body>
        <h1>{message}</h1>
      </body>
    </html>
  );
}

export class ErrorBoundary extends Component<
  { children: ReactNode },
  { error?: unknown }
> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = {};
  }

  static getDerivedStateFromError(error: unknown) {
    return { error };
  }

  render() {
    if ("error" in this.state) {
      if (this.state.error instanceof Error) {
        return renderError(this.state.error.message);
      }
      return renderError(String(this.state.error));
    }
    return this.props.children;
  }
}
