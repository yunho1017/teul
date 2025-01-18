import React from "react";
import fs from "fs";
import path from "path";

export async function ServerMessage2() {
  await new Promise((resolve) => setTimeout(resolve, 10000));
  // posts 디렉토리에서 마크다운 파일 읽기
  const postContent: any = await new Promise((resolve) => {
    const filePath = path.join(process.cwd(), "posts", "hello-world.md");
    fs.readFile(filePath, "utf8", (err, data) => {
      if (err) {
        resolve("파일을 읽는데 실패했습니다.");
        return;
      }
      resolve(data);
    });
  });

  return (
    <div>
      <h2>블로그 포스트</h2>
      <pre style={{ whiteSpace: "pre-wrap" }}>{postContent}</pre>
    </div>
  );
}
