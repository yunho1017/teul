import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "react-error-boundary";
import { Router } from "./router";
import "./globals.css";

const rootElement = document.getElementById("root");
if (rootElement) {
  const root = createRoot(rootElement);
  root.render(<Root />);
}

function Root() {
  return (
    <ErrorBoundary FallbackComponent={Error}>
      <Router />
    </ErrorBoundary>
  );
}

function Error({ error }: { error: Error }) {
  return (
    <div>
      <h1>Application Error</h1>
      <pre style={{ whiteSpace: "pre-wrap" }}>{error.stack}</pre>
    </div>
  );
}
