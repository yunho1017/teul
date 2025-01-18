import React, { Suspense } from "react";
import { Message } from "./TestComponent";
import { Message2 } from "./TestComponent2";
import { ServerMessage } from "./TestComponent.server";
import { ServerMessage2 } from "./TestComponent2.server";
// 서버 컴포넌트는 데이터를 직접 가져올 수 있습니다
async function getBlogPosts() {
  // 실제 데이터베이스/API 호출을 시뮬레이션
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { id: 1, title: "First Post", content: "Hello world!" },
    { id: 2, title: "Second Post", content: "More content here" },
  ];
}

export default async function BlogContent() {
  const posts = await getBlogPosts();
  const messagePromise = new Promise((resolve) =>
    setTimeout(() => {
      resolve("Hello World");
    }, 10000)
  );

  return (
    <div className="blog-content">
      {posts.map((post) => (
        <article key={post.id}>
          <h2>{post.title}</h2>
          <p>{post.content}</p>
        </article>
      ))}
      <Suspense fallback={<div>Loading...</div>}>
        <Message messagePromise={messagePromise as Promise<string>} />
      </Suspense>
      <Message2 />
      <Suspense fallback={<div>Loading...</div>}>
        <ServerMessage />
      </Suspense>
      <Suspense fallback={<div>Loading...</div>}>
        <ServerMessage2 />
      </Suspense>
    </div>
  );
}
