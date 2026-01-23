"use client";

import { useState } from "react";

export const InteractiveDemo = () => {
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(42);

  const handleLike = () => {
    if (liked) {
      setLiked(false);
      setLikeCount(likeCount - 1);
    } else {
      setLiked(true);
      setLikeCount(likeCount + 1);
    }
  };

  return (
    <div className="mt-8 p-6 border rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold mb-1">Interactive Client Component</h3>
          <p className="text-sm text-gray-600">
            This is a client component with interactive state.
          </p>
        </div>
        <button
          onClick={handleLike}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            liked
              ? "bg-red-500 text-white hover:bg-red-600"
              : "bg-white border border-gray-300 hover:border-gray-400"
          }`}
        >
          <span className="text-xl">{liked ? "❤️" : "🤍"}</span>
          <span>{likeCount} likes</span>
        </button>
      </div>
    </div>
  );
};
