import type { FunctionComponent, ReactNode } from "react";
import type { Prettify, ReplaceAll, Split } from "../../../utils/util-types.js";
import type { RouteProps } from "../common.js";

/**
 * 루트 컴포넌트 정의
 *
 * 모든 페이지를 감싸는 최상위 컴포넌트를 정의할 때 사용합니다.
 * HTML 태그와 전역 레이아웃을 설정하는 용도로 사용됩니다.
 *
 * @property render - 렌더링 방식 ("static" | "dynamic")
 * @property component - 루트 컴포넌트 (children을 받음)
 *
 * @example
 * // 기본 루트 컴포넌트 정의
 * const rootItem: RootItem = {
 *   render: "static",
 *   component: ({ children }) => (
 *     <html lang="ko">
 *       <head>
 *         <meta charSet="utf-8" />
 *       </head>
 *       <body>{children}</body>
 *     </html>
 *   )
 * };
 *
 * @example
 * // 전역 Provider를 포함하는 루트
 * const rootItem: RootItem = {
 *   render: "static",
 *   component: ({ children }) => (
 *     <html>
 *       <head />
 *       <body>
 *         <ThemeProvider>{children}</ThemeProvider>
 *       </body>
 *     </html>
 *   )
 * };
 */
export type RootItem = {
  render: "static" | "dynamic";
  component: FunctionComponent<{ children: ReactNode }>;
};

/**
 * 루트 컴포넌트를 생성하는 함수 타입
 *
 * createPages 내부에서 제공되며, 애플리케이션의
 * 최상위 HTML 구조를 정의할 때 사용합니다.
 *
 * @param root - 루트 컴포넌트 설정
 *
 * @example
 * createPages(async ({ createRoot }) => {
 *   createRoot({
 *     render: "static",
 *     component: ({ children }) => (
 *       <html>
 *         <head>
 *           <title>My App</title>
 *         </head>
 *         <body>{children}</body>
 *       </html>
 *     )
 *   });
 * });
 */
export type CreateRoot = (root: RootItem) => void;

/**
 * 경로 아이템의 유효성을 검사하는 타입 헬퍼
 *
 * 슬러그 경로에서 허용되지 않는 패턴을 필터링합니다.
 * - `/${string}`: 중첩된 슬래시 (예: "//", "/foo/")
 * - `[]`: 빈 슬러그
 * - `""`: 빈 문자열
 *
 * @example
 * type Valid = IsValidPathItem<"blog">;     // true
 * type Invalid1 = IsValidPathItem<"/blog">; // false (슬래시 포함)
 * type Invalid2 = IsValidPathItem<"[]">;    // false (빈 슬러그)
 * type Invalid3 = IsValidPathItem<"">;      // false (빈 문자열)
 */
type IsValidPathItem<T> = T extends `/${string}` | "[]" | "" ? false : true;

/**
 * 슬러그 경로가 유효한지 재귀적으로 검사하는 타입 헬퍼
 *
 * 경로의 각 세그먼트를 순회하며 유효성을 검사합니다.
 * 하나라도 유효하지 않으면 false를 반환합니다.
 *
 * @example
 * // 유효한 슬러그 경로
 * type Valid1 = IsValidPathInSlugPath<"/blog/[id]">;           // true
 * type Valid2 = IsValidPathInSlugPath<"/posts/[category]/[id]">; // true
 *
 * @example
 * // 유효하지 않은 슬러그 경로
 * type Invalid1 = IsValidPathInSlugPath<"/blog//posts">;  // false (연속 슬래시)
 * type Invalid2 = IsValidPathInSlugPath<"/blog/[]">;      // false (빈 슬러그)
 * type Invalid3 = IsValidPathInSlugPath<"/blog/">;        // false (끝 슬래시)
 */
export type IsValidPathInSlugPath<T> = T extends `/${infer L}/${infer R}`
  ? IsValidPathItem<L> extends true
    ? IsValidPathInSlugPath<`/${R}`>
    : false
  : T extends `/${infer U}`
    ? IsValidPathItem<U>
    : false;

/**
 * 정적 슬러그가 포함된 유효한 경로 타입
 *
 * 빌드 타임에 미리 생성할 수 있는 슬러그 경로를 나타냅니다.
 * staticPaths를 통해 구체적인 값을 제공해야 합니다.
 *
 * @example
 * type BlogPath = PathWithStaticSlugs<"/blog/[id]">;        // "/blog/[id]"
 * type PostPath = PathWithStaticSlugs<"/posts/[cat]/[id]">; // "/posts/[cat]/[id]"
 * type Root = PathWithStaticSlugs<"/">;                      // "/"
 * type Invalid = PathWithStaticSlugs<"/blog//post">;        // never
 */
type PathWithStaticSlugs<T extends string> = T extends `/`
  ? T
  : IsValidPathInSlugPath<T> extends true
    ? T
    : never;

/**
 * 정적 슬러그 경로의 staticPaths 배열 타입을 생성합니다.
 *
 * 슬러그 개수에 맞는 readonly string 배열 타입을 재귀적으로 생성합니다.
 * createPage에서 staticPaths의 타입 검증에 사용됩니다.
 *
 * @example
 * // 슬러그가 1개인 경우
 * type Paths1 = StaticSlugRoutePathsTuple<"/blog/[id]">;
 * // readonly [string]
 *
 * @example
 * // 슬러그가 2개인 경우
 * type Paths2 = StaticSlugRoutePathsTuple<"/blog/[category]/[id]">;
 * // readonly [string, string]
 *
 * @example
 * // 슬러그가 없는 경우
 * type Paths0 = StaticSlugRoutePathsTuple<"/about">;
 * // readonly []
 */
export type StaticSlugRoutePathsTuple<
  T extends string,
  Slugs extends unknown[] = GetSlugs<T>,
  Result extends readonly string[] = [],
> = Slugs extends []
  ? Result
  : Slugs extends [infer _, ...infer Rest]
    ? StaticSlugRoutePathsTuple<T, Rest, readonly [...Result, string]>
    : never;

/**
 * 정적 슬러그 경로의 staticPaths 배열 타입
 *
 * 슬러그가 1개면 `readonly string[]`, 여러 개면 튜플의 배열입니다.
 *
 * @example
 * // 슬러그 1개: string 배열
 * type Single = StaticSlugRoutePaths<"/blog/[id]">;
 * // readonly string[] - ["post-1", "post-2", ...]
 *
 * @example
 * // 슬러그 2개: 튜플 배열
 * type Multiple = StaticSlugRoutePaths<"/blog/[category]/[id]">;
 * // readonly [string, string][] - [["tech", "post-1"], ["life", "post-2"], ...]
 */
type StaticSlugRoutePaths<T extends string> =
  StaticSlugRoutePathsTuple<T> extends readonly [string]
    ? readonly string[]
    : StaticSlugRoutePathsTuple<T>[];

/**
 * 슬러그가 없는 경로 타입
 *
 * 동적 파라미터([id] 등)가 포함되지 않은 정적 경로만 허용합니다.
 * createPage에서 render: "static"이고 staticPaths가 없을 때 사용됩니다.
 *
 * @example
 * type Valid1 = PathWithoutSlug<"/">;           // "/"
 * type Valid2 = PathWithoutSlug<"/about">;      // "/about"
 * type Valid3 = PathWithoutSlug<"/blog/posts">; // "/blog/posts"
 *
 * @example
 * type Invalid1 = PathWithoutSlug<"/blog/[id]">;        // never (슬러그 포함)
 * type Invalid2 = PathWithoutSlug<"/posts/[cat]/[id]">; // never (슬러그 포함)
 */
export type PathWithoutSlug<T> = T extends "/"
  ? T
  : IsValidPathInSlugPath<T> extends true
    ? HasSlugInPath<T, string> extends true
      ? never
      : T
    : never;

/**
 * 경로에 슬러그가 포함되어 있는지 검사하는 타입 헬퍼
 *
 * 재귀적으로 경로를 순회하며 `[변수명]` 패턴이 있는지 확인합니다.
 *
 * @example
 * // 슬러그가 있는 경우
 * type Has1 = HasSlugInPath<"/blog/[id]", string>;           // true
 * type Has2 = HasSlugInPath<"/posts/[category]/[id]", string>; // true
 *
 * @example
 * // 슬러그가 없는 경우
 * type Has3 = HasSlugInPath<"/about", string>;      // false
 * type Has4 = HasSlugInPath<"/blog/posts", string>; // false
 *
 * @example
 * // 특정 슬러그 이름 검사
 * type HasId = HasSlugInPath<"/blog/[id]", "id">;         // true
 * type HasName = HasSlugInPath<"/blog/[id]", "name">;     // false
 * type HasCat = HasSlugInPath<"/blog/[category]", "category">; // true
 */
export type HasSlugInPath<T, K extends string> = T extends `/[${K}]/${infer _}`
  ? true
  : T extends `/${infer _}/${infer U}`
    ? HasSlugInPath<`/${U}`, K>
    : T extends `/[${K}]`
      ? true
      : false;

/**
 * 경로에서 슬러그 이름들을 추출하는 내부 타입 헬퍼
 *
 * 경로를 "/"로 분리하여 각 세그먼트를 검사하고,
 * [변수명] 패턴에서 변수명만 추출하여 배열로 만듭니다.
 *
 * @private
 */
type _GetSlugs<
  Route extends string,
  SplitRoute extends string[] = Split<Route, "/">,
  Result extends string[] = [],
> = SplitRoute extends []
  ? Result
  : SplitRoute extends [`${infer MaybeSlug}`, ...infer Rest extends string[]]
    ? MaybeSlug extends `[${infer Slug}]`
      ? _GetSlugs<Route, Rest, [...Result, Slug]>
      : _GetSlugs<Route, Rest, Result>
    : Result;

/**
 * 개별 슬러그의 타입을 결정합니다.
 *
 * - `...rest` 형태: `string[]` (나머지 파라미터)
 * - 일반 슬러그: `string`
 *
 * @private
 *
 * @example
 * type Normal = IndividualSlugType<"id">;      // string
 * type Rest = IndividualSlugType<"...rest">;   // string[]
 * type Spread = IndividualSlugType<"...args">; // string[]
 */
type IndividualSlugType<Slug extends string> = Slug extends `...${string}`
  ? string[]
  : string;

/**
 * 경로에서 슬러그 이름들을 추출합니다.
 *
 * [변수명] 패턴의 변수명만 추출하여 문자열 배열로 반환합니다.
 *
 * @example
 * // 슬러그가 없는 경우
 * type Slugs0 = GetSlugs<"/about">;
 * // []
 *
 * @example
 * // 슬러그가 1개인 경우
 * type Slugs1 = GetSlugs<"/blog/[id]">;
 * // ["id"]
 *
 * @example
 * // 슬러그가 여러 개인 경우
 * type Slugs2 = GetSlugs<"/blog/[category]/[id]">;
 * // ["category", "id"]
 *
 * @example
 * // 나머지 파라미터 슬러그
 * type Slugs3 = GetSlugs<"/docs/[...rest]">;
 * // ["...rest"]
 */
export type GetSlugs<Route extends string> = _GetSlugs<Route>;

/**
 * 슬러그 이름들을 Props 타입으로 변환합니다.
 *
 * 각 슬러그 이름을 키로, 해당 슬러그의 타입을 값으로 하는 객체 타입을 생성합니다.
 * - 일반 슬러그: `string`
 * - 나머지 파라미터 (`...rest`): `string[]`
 *
 * @example
 * // 슬러그가 1개인 경우
 * type Props1 = SlugTypes<"/blog/[id]">;
 * // { id: string }
 *
 * @example
 * // 슬러그가 여러 개인 경우
 * type Props2 = SlugTypes<"/blog/[category]/[id]">;
 * // { category: string; id: string }
 *
 * @example
 * // 나머지 파라미터 슬러그
 * type Props3 = SlugTypes<"/docs/[...rest]">;
 * // { rest: string[] }
 *
 * @example
 * // 슬러그가 없는 경우
 * type Props0 = SlugTypes<"/about">;
 * // {} (빈 객체)
 */
type SlugTypes<Path extends string> =
  GetSlugs<Path> extends string[]
    ? {
        [Slug in GetSlugs<Path>[number] as Slug]: IndividualSlugType<Slug>;
      }
    : never;

/**
 * 페이지 컴포넌트가 받을 Props 타입을 생성합니다.
 *
 * RouteProps (path, query)와 SlugTypes (동적 파라미터)를 합쳐서
 * 페이지 컴포넌트의 Props 타입을 만듭니다.
 *
 * @example
 * // 정적 경로 (/about)
 * type AboutProps = PropsForPages<"/about">;
 * // { path: string; query?: string }
 *
 * @example
 * // 동적 경로 (/blog/[id])
 * type BlogProps = PropsForPages<"/blog/[id]">;
 * // { path: string; query?: string; id: string }
 *
 * @example
 * // 다중 슬러그 (/blog/[category]/[id])
 * type PostProps = PropsForPages<"/blog/[category]/[id]">;
 * // { path: string; query?: string; category: string; id: string }
 *
 * @example
 * // 실제 컴포넌트에서 사용
 * function BlogPost({ path, query, id }: PropsForPages<"/blog/[id]">) {
 *   return (
 *     <div>
 *       <h1>Post ID: {id}</h1>
 *       <p>Current path: {path}</p>
 *       {query && <p>Query: {query}</p>}
 *     </div>
 *   );
 * }
 */
export type PropsForPages<Path extends string> = Prettify<
  Omit<RouteProps<ReplaceAll<Path, `[${string}]`, string>>, "hash"> &
    SlugTypes<Path>
>;

/**
 * 페이지를 생성하는 함수 타입
 *
 * createPages 내부에서 제공되며, 라우트에 페이지를 등록할 때 사용합니다.
 * 세 가지 형태의 페이지를 지원합니다:
 * 1. 정적 페이지 (슬러그 없음)
 * 2. 정적 페이지 (슬러그 있음, staticPaths 필요)
 * 3. 동적 페이지 (런타임 렌더링)
 *
 * @example
 * // 1. 정적 페이지 (슬러그 없음) - 빌드 시 HTML 생성
 * createPage({
 *   render: "static",
 *   path: "/about",
 *   component: AboutPage
 * });
 *
 * @example
 * // 2. 정적 페이지 (슬러그 있음) - 빌드 시 모든 경로의 HTML 생성
 * createPage({
 *   render: "static",
 *   path: "/blog/[id]",
 *   component: BlogPost,
 *   staticPaths: ["post-1", "post-2", "post-3"]
 * });
 *
 * @example
 * // 3. 동적 페이지 - 요청 시 렌더링
 * createPage({
 *   render: "dynamic",
 *   path: "/users/[id]",
 *   component: UserProfile
 * });
 *
 * @example
 * // 다중 슬러그가 있는 정적 페이지
 * createPage({
 *   render: "static",
 *   path: "/blog/[category]/[id]",
 *   component: BlogPost,
 *   staticPaths: [
 *     ["tech", "post-1"],
 *     ["tech", "post-2"],
 *     ["life", "article-1"]
 *   ]
 * });
 *
 * @example
 * // 컴포넌트에서 Props 활용
 * function BlogPost({ id, category, query }: PropsForPages<"/blog/[category]/[id]">) {
 *   return (
 *     <article>
 *       <h1>Category: {category}</h1>
 *       <p>Post ID: {id}</p>
 *       {query && <p>Query: {query}</p>}
 *     </article>
 *   );
 * }
 *
 * createPage({
 *   render: "static",
 *   path: "/blog/[category]/[id]",
 *   component: BlogPost,
 *   staticPaths: [["tech", "hello-world"]]
 * });
 */
export type CreatePage = <
  Path extends string,
  Render extends "static" | "dynamic",
  StaticPaths extends StaticSlugRoutePaths<Path>,
  ExactPath extends boolean | undefined = undefined,
>(
  page:
    | {
        render: Extract<Render, "static">;
        path: PathWithoutSlug<Path>;
        component: FunctionComponent<PropsForPages<Path>>;
      }
    | ({
        render: Extract<Render, "static">;
        path: PathWithStaticSlugs<Path>;
        component: FunctionComponent<PropsForPages<Path>>;
      } & (ExactPath extends true ? {} : { staticPaths: StaticPaths }))
    | {
        render: Extract<Render, "dynamic">;
        path: PathWithoutSlug<Path>;
        component: FunctionComponent<PropsForPages<Path>>;
      },
) => void;

/**
 * 레이아웃을 생성하는 함수 타입
 *
 * createPages 내부에서 제공되며, 특정 경로와 그 하위 경로에
 * 공통으로 적용될 레이아웃을 정의할 때 사용합니다.
 *
 * 레이아웃은 항상 정적(static)이며, children을 받아서 렌더링합니다.
 * 중첩된 레이아웃은 바깥쪽부터 안쪽으로 순서대로 적용됩니다.
 *
 * @example
 * // 루트 레이아웃 (모든 페이지에 적용)
 * createLayout({
 *   render: "static",
 *   path: "/",
 *   component: ({ children }) => (
 *     <div>
 *       <Header />
 *       <main>{children}</main>
 *       <Footer />
 *     </div>
 *   )
 * });
 *
 * @example
 * // 블로그 섹션 레이아웃 (/blog 하위에만 적용)
 * createLayout({
 *   render: "static",
 *   path: "/blog",
 *   component: ({ children }) => (
 *     <div className="blog-layout">
 *       <aside>
 *         <BlogSidebar />
 *       </aside>
 *       <article>{children}</article>
 *     </div>
 *   )
 * });
 *
 * @example
 * // 중첩된 레이아웃 예시
 * // 루트 레이아웃
 * createLayout({
 *   render: "static",
 *   path: "/",
 *   component: ({ children }) => (
 *     <div className="app">
 *       <GlobalNav />
 *       {children}
 *     </div>
 *   )
 * });
 *
 * // 대시보드 레이아웃
 * createLayout({
 *   render: "static",
 *   path: "/dashboard",
 *   component: ({ children }) => (
 *     <div className="dashboard">
 *       <DashboardSidebar />
 *       {children}
 *     </div>
 *   )
 * });
 *
 * // 페이지: /dashboard/settings
 * // 렌더링 결과:
 * // <div className="app">       ← 루트 레이아웃
 * //   <GlobalNav />
 * //   <div className="dashboard"> ← 대시보드 레이아웃
 * //     <DashboardSidebar />
 * //     <SettingsPage />          ← 실제 페이지
 * //   </div>
 * // </div>
 */
export type CreateLayout = <Path extends string>(layout: {
  render: "static";
  path: Path;
  component: FunctionComponent<{ children: ReactNode }>;
}) => void;
