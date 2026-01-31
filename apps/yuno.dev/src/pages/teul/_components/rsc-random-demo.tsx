import { ComponentA } from "./component-a";
import { ComponentB } from "./component-b";

export async function RSCRandomDemo() {
  // 서버에서 랜덤하게 컴포넌트 선택
  const randomValue = Math.random();
  const selectedComponent = randomValue > 0.5 ? "A" : "B";

  return (
    <div className="space-y-4">
      {/* 랜덤 선택 결과 표시 */}
      <div className="text-center">
        {selectedComponent === "A" ? <ComponentA /> : <ComponentB />}
      </div>

      {/* 서버 로직 표시 */}
      <div className="text-xs text-gray-600 text-center mt-2">
        <code className="bg-gray-100 px-2 py-1 rounded">
          Math.random() = {randomValue.toFixed(4)} → {selectedComponent}
        </code>
      </div>
    </div>
  );
}
