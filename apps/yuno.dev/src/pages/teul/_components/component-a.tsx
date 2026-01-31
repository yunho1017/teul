// Server Component A - 이 파일은 선택되지 않으면 클라이언트에 전송되지 않습니다

export function ComponentA() {
  // A에만 있는 비밀 데이터
  const SECRET_DATA_A = "ComponentA의 비밀 로직 - 클라이언트에 안 감!";

  return (
    <div className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-300">
      <div className="text-4xl mb-2">🎨</div>
      <h4 className="text-xl font-bold text-blue-900 mb-2">컴포넌트 A</h4>
      <p className="text-blue-700 text-sm">
        서버에서 렌더링 될때 랜덤으로 선택한 컴포넌트입니다
      </p>
      <p className="text-xs text-blue-600 mt-2 font-mono">
        SECRET_DATA_A는 클라이언트 번들에 포함되지 않습니다
      </p>
    </div>
  );
}
