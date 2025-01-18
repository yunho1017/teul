import React from "react";
import Link from "../../../framework/components/link";
async function getBlogPosts() {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return [
    { id: 1, title: "First Post", content: "Hello world!" },
    { id: 2, title: "Second Post", content: "More content here" },
  ];
}

export default async function BlogContent() {
  const posts = await getBlogPosts();

  return (
    <div className="flex flex-col gap-4">
      {posts.map((post) => (
        <Link href={`/post/${post.id}`}>
          <article key={post.id}>
            <h2 className="text-2xl font-bold">{post.title}</h2>
            <p className="text-gray-600">{post.content}</p>
          </article>
        </Link>
      ))}
    </div>
  );
}
