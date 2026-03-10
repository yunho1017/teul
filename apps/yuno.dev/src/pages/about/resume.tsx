import { getResume } from "../../lib/resume";
import { Feedback } from "../../components/feedback";

export default async function AboutPage() {
  const resume = await getResume();

  if (!resume) {
    return (
      <>
        <title>About - Yuno.dev</title>
        <Feedback
          icon="😢"
          title="정보를 불러올 수 없습니다"
          description="잠시 후 다시 시도해주세요."
          buttons={[{ label: "홈으로 돌아가기", href: "/" }]}
        />
      </>
    );
  }

  return (
    <>
      <title>About - Yuno.dev</title>
      <p
        className="text-xs text-gray-400 text-right mb-4"
        style={{ maxWidth: "1200px", margin: "0 auto 1rem" }}
      >
        Last updated: 2026.02
      </p>
      <article
        className="prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-8 sm:mb-12   break-words overflow-hidden"
        style={{ animationDelay: "0.1s", maxWidth: "1200px", margin: "0 auto" }}
        dangerouslySetInnerHTML={{ __html: resume.html }}
      />
    </>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
