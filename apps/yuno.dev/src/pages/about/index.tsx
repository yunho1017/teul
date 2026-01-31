import { Feedback } from "../../components/feedback";

export default async function AboutPage() {
  return (
    <>
      <title>About - Yuno.dev</title>
      <Feedback
        icon="🚧"
        title="페이지 준비 중"
        description="현재 이 페이지는 업데이트 작업 중입니다. 곧 멋진 내용으로 돌아올게요! 🎨"
        buttons={[
          { label: "블로그 보러가기", href: "/posts/list" },
          { label: "홈으로 돌아가기", href: "/", variant: "secondary" },
        ]}
      />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
