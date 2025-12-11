"use client";

import { useState } from "react";
import { useRouter } from "teul";

export const Counter = () => {
  const [count, setCount] = useState(0);
  const router = useRouter();

  const handleIncrement = () => setCount((c) => c + 1);

  const handleNavigate = () => {
    console.log("!!1", router);
    router.push("/about");
  };

  return (
    <section className="border-blue-400 -mx-4 mt-4 rounded-sm border border-dashed p-4">
      <div>Count: {count}</div>
      <button
        onClick={handleIncrement}
        className="rounded-xs bg-black px-2 py-0.5 text-sm text-white mr-2"
      >
        Increment
      </button>
      <button
        onClick={handleNavigate}
        className="rounded-xs bg-blue-600 px-2 py-0.5 text-sm text-white"
      >
        Go to About
      </button>
    </section>
  );
};
