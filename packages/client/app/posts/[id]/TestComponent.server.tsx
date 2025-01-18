import React from "react";

export async function ServerMessage() {
  const message: any = await new Promise((resolve) =>
    setTimeout(() => {
      resolve("Hello World");
    }, 10000)
  );
  return <div>{message}</div>;
}
