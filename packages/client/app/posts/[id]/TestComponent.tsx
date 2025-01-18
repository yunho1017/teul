"use client";

import React, { use } from "react";

export function Message({
  messagePromise,
}: {
  messagePromise: Promise<string>;
}) {
  const message = use(messagePromise);

  return (
    <div>
      {message}
      <button onClick={() => console.log("clicked")}>click</button>
    </div>
  );
}
