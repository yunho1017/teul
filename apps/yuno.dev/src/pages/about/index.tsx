import { Link } from "teul";

export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto">
      <title>About | Yuno.dev</title>

      <section className="py-8 md:py-12 lg:py-16  ">
        {/* Profile Image */}
        <div className="flex justify-center mb-8 md:mb-10">
          <img
            src="/images/profile.jpg"
            alt="서윤호 프로필"
            className="w-32 h-32 md:w-40 md:h-40 rounded-full object-cover shadow-lg"
          />
        </div>

        {/* Introduction */}
        <div className=" " style={{ animationDelay: "0.2s" }}>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-center text-gray-900 mb-8 md:mb-10">
            안녕하세요, 프론트엔드 개발자 서윤호입니다.
          </h1>

          <div className="space-y-6 text-base md:text-lg text-gray-700 leading-relaxed">
            <p>
              중학교 시절 프로그래밍을 접하며 개발자의 꿈을 키웠고,
              <br />
              대덕소프트웨어마이스터고등학교에 진학해 졸업 후 19살부터 커리어를
              시작했습니다.
            </p>

            <p>
              커뮤니티 커머스 SaaS 스타트업에서 오랜 시간 근무하며 커뮤니티와
              커머스 전반에 걸친 다양한 경험을 쌓았습니다.
              <br />그 과정에서 유연함과 편리함, 속도와 안정성 등 업무에서
              마주하는 트레이드오프에 대해 고민할 수 있었습니다.
            </p>

            <p>
              최근에는 프론트엔드 인프라에도 관심이 생겨, 숙원 사업 중 하나였던
              개인 블로그를 처음부터 직접 만들어보았습니다.{" "}
              <a
                href="https://waku.gg/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 underline font-medium"
              >
                Waku
              </a>
              를 참고해 만든 Teul(틀)이라는 프레임워크를 사용했고, Cloudflare
              Pages/Workers로 배포했습니다.
            </p>

            <p>
              이 블로그는 남들에게 공유하기 위한 공간이라기보다, 스스로를
              정리하고 기록하는 공간으로 가꿔나가려 합니다.
            </p>
          </div>
        </div>

        {/* Buttons */}
        <div
          className="flex flex-col sm:flex-row justify-center gap-4 mt-10 md:mt-12  "
          style={{ animationDelay: "0.4s" }}
        >
          <Link
            to="/posts/list"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors group"
          >
            글 보러가기
            <span className="group-hover:translate-x-1 transition-transform inline-block">
              →
            </span>
          </Link>
          <Link
            to="/about/resume"
            className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-blue-600 text-blue-600 hover:bg-blue-50 font-medium rounded-lg transition-colors group"
          >
            Resume 보러가기
            <span className="group-hover:translate-x-1 transition-transform inline-block">
              →
            </span>
          </Link>
        </div>
      </section>
    </div>
  );
}

export const getConfig = async () => {
  return {
    render: "static",
  } as const;
};
