"use client";

import { useState } from "react";
import { useRouter } from "teul";

export const Counter = () => {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const handleIncrement = () => setCount((c) => c + 1);

  const handleNavigate = () => {
    router.push("/about");
  };

  return (
    <section className="p-6 border rounded-lg bg-blue-50">
      <h3 className="text-lg font-semibold mb-2">Interactive Client Component</h3>
      <p className="text-sm text-gray-600 mb-4">
        This component demonstrates client-side interactivity with state and routing.
      </p>

      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold">
          {count}
        </div>
        <button
          onClick={handleIncrement}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
        >
          Increment
        </button>
        <button
          onClick={handleNavigate}
          className="px-4 py-2 border border-gray-300 rounded-lg font-medium hover:border-gray-400 transition-colors"
        >
          Go to About
        </button>
      </div>
    </section>
  );
};
