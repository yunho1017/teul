export function isThenable(promise: any) {
  return (
    promise !== null &&
    typeof promise === "object" &&
    "then" in promise &&
    typeof promise.then === "function"
  );
}
