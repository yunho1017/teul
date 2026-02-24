# Resume

프론트엔드 개발자 서윤호입니다.

관심사 기반 SNS Vingle에서 커리어를 시작했고, 이후 회사의 사업 전환에 따라 SaaS 노코드 솔루션을 만들었습니다.  
현재는 캐치테이블에서 B2B 프론트엔드를 개발하고 있습니다.

- 말로 하는 커뮤니케이션보다 프로토타입 기반의 효율적인 커뮤니케이션을 선호합니다.
- 오픈소스의 내부 구현을 직접 분석하고 이해하는 과정을 즐기며, 관심 있는 기술이 생기면 직접 라이브러리를 만들거나 구현해보며 학습하고 있습니다.

## Work Experience

### [캐치테이블 (2025.01 ~ 재직 중)](https://catchtable.co.kr/)

> 예약·웨이팅 서비스를 포함한 외식 매장 전용 통합 솔루션

Main Role: 캐치테이블 예약·웨이팅 서비스를 포함한 B2B 프론트엔드 전반의 신규 기능 개발 및 유지보수.  
알림톡 수신 번호 설정, 고객 리뷰 관리, 영업/휴무일 설정, 소식 페이지 등 매장 운영에 필요한 다양한 기능을 담당했습니다.

- JSP 기반 레거시 매장용 관리자 페이지를 React로 점진적 마이그레이션하고, 백엔드와 분리된 독립적인 프론트엔드 레포를 구축했습니다.
  - CloudFront + Lambda@Edge + S3 기반 인프라와 CI/CD 파이프라인을 설계해 독립적인 배포 환경을 마련했습니다.

- 관리자페이지의 기존 페이지를 리뉴얼하고, 신규기능을 추가했습니다.
  - 월 PV(Page View) 250만건의 예약 목록/상세 화면을 전면 리뉴얼했습니다.
    - 모바일 사용량이 60% 이상인 관리자 페이지 특성에 맞춰 적응형 UI를 도입해, 다양한 디바이스 환경에서 최적의 사용 경험을 제공했습니다.
    - PV가 높은 핵심 기능인 만큼 안정성을 위해 점진적 배포 방식을 택해, 일부 매장에서 전체 매장으로 단계적으로 오픈을 확대했습니다. 현재 신규 화면으로의 트래픽 전환율이 약 40~50%에 도달했습니다.
  - 환불 케이스(예약금, 0원 결제, 와인·위스키·꽃 등)가 다양하고 처리 경로가 분산되어 운영 불편이 컸던 환불 기능을 관리자 페이지로 이전했습니다.
    - 다양한 케이스를 선언적으로 구성할 수 있는 Funnel 컴포넌트를 설계해 유지보수성을 높였습니다.
    - 이후 관리자 페이지 내 환불 처리 비율 상승에 기여했습니다. (최대 28%)
  - Notion API를 활용해 마케팅 팀이 직접 콘텐츠를 등록·관리할 수 있는 [CMS 환경을 구축](https://yun0.dev/posts/2026-02-17-notion-cms)했습니다.

- 관리자 페이지에 NX 기반 모노레포를 도입하고, 장기적인 Micro Frontend 전환을 위한 도메인 분리를 설계했습니다.
  - 도메인을 점진적으로 이관하는 로드맵을 수립했습니다.
  - 쿠폰 도메인 분리를 완료했으며, 공통 컴포넌트와 유틸을 패키지화해 모노레포 기반을 마련했습니다.

- 관리자 페이지에 react-hook-form + zod를 도입해 기존 jotai 기반의 폼 상태 관리 구조를 개선하고, Form 관련 공통 컴포넌트와 유틸을 제작해 개발 생산성을 높였습니다.
- 캐치테이블 웨이팅 서비스의 iOS/Android 배포를 GitHub Actions 기반 CI/CD로 전환하고, Firebase App Distribution 업로드 및 앱 심사 요청을 자동화해 휴먼에러를 방지했습니다.
- 안드로이드 targetSDK 34 → 35 업데이트 및 Capacitor 6 → 7 업그레이드를 진행하고, 사이드 이펙트 분석 및 테스트 케이스를 정리해 안정적인 버전 전환을 완료했습니다.
- 빗썸, 토스페이, 캐치페스타, 흑백요리사 등 다양한 프로모션 페이지를 개발했습니다.
  - 프로모션 미리보기 개발자 도구를 제작해 런칭 전 검증 프로세스를 개선했습니다.

### 캔랩 코리아 (2019.09 ~ 2024.12)

> 프로그래밍 지식 없이 자신만의 커뮤니티 커머스를 만들 수 있는 SaaS 기반 노코드 솔루션

Main Role: 노코드 커뮤니티 커머스 플랫폼 Moim 웹/관리자 서비스 개발, 프론트엔드 아키텍처 설계 및 개발 환경 개선.  
맞춤형 피드/게시판, 실시간 채팅, 커뮤니티 포인트, 설문조사 등 커뮤니티 기능과 상품 상세, 장바구니, 주문서, 결제 등 결제 관련 기능을 담당했습니다.

- 관리자 페이지에서도 B2C와 동일한 서버 드리븐 UI 컴포넌트가 필요해짐에 따라, 이를 패키지로 분리하기 위해 실 서비스 중인 관리자/B2C를 모노레포로 이전했습니다.
  - 팀원들의 피처 개발과 병행하며 점진적 마이그레이션을 설계하고, 사이드 이펙트 없이 배포를 완료했습니다.
  - TurboRepo와 GitHub Actions 캐시를 활용해 빌드/배포 시간을 최적화하고(관리자 서비스 23min → 10min, 웹 서비스 16min → 8min), ESM 적용으로 번들 사이즈를 절감했습니다(1.3MB → 800KB).

- 신규 고객사 온보딩 기간 단축 TF에서 프로젝트 리드를 맡아 문제 정의부터 타팀 인터뷰, 개선 방안 도출, 점진적 배포 전략 수립, 일정/리소스 관리까지 전 과정을 주도했습니다.
  - 기존 150개 이상의 페이지를 Next.js 기반 신규 관리자 페이지로 마이그레이션하여 온보딩 기간을 4주 → 1~2주로 단축했습니다.
  - ant-design 기반의 공통 컴포넌트를 설계하고 사용/확장 매뉴얼 및 신규 페이지 개발 매뉴얼을 작성해 개발 생산성을 향상했습니다.

- 사용자가 UI 구성을 직접 설정할 수 있는 서버 드리븐 UI 시스템을 설계하고, 결과물을 실시간으로 확인하며 페이지를 만들 수 있는 노코드 페이지 빌더를 개발했습니다.
  - 고객사 인터뷰와 피드백을 통해 실시간 미리보기가 불가능한 불편함이 반복적으로 제기되었고, 이를 개선하기 위해 팀원들을 설득해 노코드 페이지 빌더를 과제화했습니다.
    - 노코드 페이지 빌더 TF가 신설되었고, 4주 만에 PoC부터 배포까지 완료하여 사용자가 더 직관적으로 UI를 편집할 수 있는 환경을 구축했습니다.

- 초기 로딩이 느려 사용자 이탈이 발생하던 문제를 개선하기 위해 Performance/React Profiler로 성능을 분석하고, Intersection Observer API 기반 초기 데이터 호출 최적화와 Redux Selector 구독 최적화를 적용했습니다.
  - Moim 웹 서비스 초기 로딩 속도를 40% 개선했습니다. (worst case 기준 2~3초 단축)

- Redux Middleware 기반 토큰 리프레시 기능에서 단일 API 호출 시 토큰 리프레시가 누락되는 문제를 분석하고, Axios interceptor를 활용한 API 요청 전 토큰 리프레시로 개선했습니다.
- Material 컬러 시스템 기반의 자체 컬러 시스템을 도입하고 다크모드를 구현했습니다.
- POEditor와 React-intl을 사용한 다국어 지원 시스템을 구축했습니다.
- Storybook 기반 디자인 시스템을 구축하고 공통 컴포넌트 아키텍처를 설계했습니다.

### [Vingle (2019.01 ~ 2019.09)](https://www.vingle.net/)

> 같은 것을 좋아하는 사람들끼리 이야기할 수 있는 관심사 기반 SNS (서비스 중단)

Main Role: Vingle 서비스 유지보수 및 신규 기능 개발

- 커뮤니티별 투표로 대표자를 선출하고 관심사 커뮤니티를 운영할 수 있는 Governance 시스템을 개발했습니다.
- 개개인의 업적이나 경험을 온라인 뱃지로 공유할 수 있는 크립토 배지 기능을 개발했습니다.

## Open Source Contributions

- [jotaijs/jotai-location](https://github.com/jotaijs/jotai-location): Maintainer
- [wakujs/waku](https://github.com/wakujs/waku): [#1931](https://github.com/wakujs/waku/pull/1931), [#1929](https://github.com/wakujs/waku/pull/1929)
- [ant-design/pro-components](https://github.com/ant-design/pro-components): [#8482](https://github.com/ant-design/pro-components/pull/8482), [#8462](https://github.com/ant-design/pro-components/pull/8462)

## Personal Projects

- [teul](https://github.com/yunho1017/yuno.dev/tree/main/packages/teul): 미니멀 React 프레임워크
- [react-opener](https://github.com/yunho1017/react-opener): 모달/다이얼로그 선언적 관리 라이브러리 ([Demo](https://react-opener.vercel.app/))
- [react-zustand-devtools](https://github.com/yunho1017/react-zustand-devtools): Zustand 디버깅 도구 ([Demo](https://react-zustand-devtools.vercel.app/))
- [minipack](https://github.com/yunho1017/minipack): 간단한 번들러

## Education

- 대덕 소프트웨어 마이스터 고등학교 (2016 ~ 2019.03)

## Military

- 산업기능요원 (2019.11 ~ 2022.09)
