import type { FunctionComponent, ReactNode } from "react";
import type {
  Join,
  Prettify,
  ReplaceAll,
  Split,
} from "../../../utils/util-types.js";
import type { RouteProps } from "../utils.js";

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

/**
 * readonly 문자열 튜플 배열 타입
 *
 * staticPaths에 다중 슬러그 값을 전달할 때 사용하는 타입입니다.
 *
 * @example
 * const paths: ReadOnlyStringTupleList = [
 *   ["tech", "post-1"],
 *   ["life", "article-1"]
 * ];
 */
type ReadOnlyStringTupleList = readonly (readonly string[])[];

/**
 * 정적 슬러그 페이지 타입
 *
 * staticPaths가 제공된 정적 페이지를 나타냅니다.
 */
type StaticSlugPage = {
  path: string;
  render: "static";
  staticPaths: readonly string[] | ReadOnlyStringTupleList;
};

/**
 * 동적 페이지 타입
 *
 * 런타임에 렌더링되는 동적 페이지를 나타냅니다.
 */
type DynamicPage = {
  path: string;
  render: "dynamic";
};

/**
 * 페이지에 슬러그가 포함되어 있는지 검사하는 타입 헬퍼
 *
 * PathWithoutSlug를 사용하여 슬러그 유무를 판단합니다.
 */
type IsPageWithSlug<Page extends AnyPage> = Page extends {
  path: infer P;
}
  ? P extends PathWithoutSlug<P>
    ? false
    : true
  : never;

/**
 * 단일 슬러그를 가능한 값들의 유니온으로 치환합니다.
 *
 * staticPaths가 단순 문자열 배열일 때 사용됩니다.
 *
 * @example
 * type Result = ReplaceSlugSet<"/blog/[id]", "post-1" | "post-2">;
 * // "/blog/post-1" | "/blog/post-2"
 */
type ReplaceSlugSet<
  Path extends string,
  Slugs extends string,
> = Slugs extends unknown ? ReplaceAll<Path, `[${string}]`, Slugs> : never;

/**
 * 경로의 슬러그들을 staticPaths의 튜플 값으로 치환하는 재귀 헬퍼
 *
 * 경로를 분할하여 각 슬러그를 해당하는 staticPaths 값으로 치환합니다.
 * - 일반 슬러그 `[id]`: staticPaths의 해당 인덱스 값으로 치환
 * - 와일드카드 `[...rest]`: 나머지 모든 값을 펼쳐서 추가 (항상 마지막)
 * - 리터럴: 그대로 유지
 *
 * @example
 * // "/foo/[...slug]"와 [['a', 'b'], ['c']]인 경우
 * // 결과: "/foo/a/b" | "/foo/c"
 *
 * @example
 * // "/foo/[slug1]/[slug2]"와 [['a', 'b'], ['c', 'd']]인 경우
 * // 결과: "/foo/a/b" | "/foo/c/d"
 */
type ReplaceHelper<
  SplitPath extends readonly string[],
  StaticSlugs extends readonly string[],
  SlugCountArr extends null[] = [],
  Result extends string[] = [],
> = SplitPath extends [
  infer PathPart extends string,
  ...infer Rest extends string[],
]
  ? PathPart extends `[...${string}]`
    ? [...Result, ...StaticSlugs]
    : PathPart extends `[${string}]`
      ? ReplaceHelper<
          Rest,
          StaticSlugs,
          [...SlugCountArr, null],
          [...Result, StaticSlugs[SlugCountArr["length"]]]
        >
      : ReplaceHelper<Rest, StaticSlugs, SlugCountArr, [...Result, PathPart]>
  : Result;

/**
 * ReplaceHelper의 진입점
 *
 * 경로를 분할하고 치환 후 다시 결합합니다.
 * staticPaths가 튜플 배열일 때 각 튜플에 대해 반복합니다.
 */
type ReplaceTupleStaticPaths<
  Path extends string,
  StaticPathSet extends readonly string[],
> = StaticPathSet extends unknown
  ? Join<ReplaceHelper<Split<Path, "/">, StaticPathSet>, "/">
  : never;

/**
 * 정적 슬러그 페이지의 모든 가능한 경로를 수집합니다.
 *
 * staticPaths 타입에 따라 적절한 치환 방식을 선택합니다.
 * - 단순 문자열 배열: ReplaceSlugSet 사용
 * - 튜플 배열: ReplaceTupleStaticPaths 사용
 */
type CollectPathsForStaticSlugPage<Page extends StaticSlugPage> = Page extends {
  path: infer Path extends string;
  render: "static";
  staticPaths: infer StaticPaths extends
    | readonly string[]
    | ReadOnlyStringTupleList;
}
  ? StaticPaths extends readonly string[]
    ? ReplaceSlugSet<Path, StaticPaths[number]>
    : StaticPaths extends ReadOnlyStringTupleList
      ? ReplaceTupleStaticPaths<Path, StaticPaths[number]>
      : never
  : never;

/**
 * 동적 페이지의 경로 타입을 생성합니다.
 *
 * 모든 슬러그를 `string`으로 치환합니다.
 *
 * @example
 * // "/users/[id]" => "/users/${string}"
 */
type CollectPathsForDynamicSlugPage<Page extends DynamicPage> = Page extends {
  path: infer Path extends string;
}
  ? ReplaceAll<Path, `[${string}]`, string>
  : never;

/**
 * 페이지별 모든 가능한 경로를 수집합니다.
 *
 * 페이지 타입에 따라 적절한 경로 생성 방식을 선택합니다:
 * - 슬러그 없음: 경로를 그대로 반환
 * - 정적 슬러그: staticPaths 값으로 치환된 경로들을 반환
 * - 동적 슬러그: `${string}` 타입으로 치환된 경로를 반환
 *
 * @example
 * type Paths1 = CollectPaths<{ path: "/about"; render: "static" }>;
 * // "/about"
 *
 * @example
 * type Paths2 = CollectPaths<{
 *   path: "/blog/[id]";
 *   render: "static";
 *   staticPaths: ["post-1", "post-2"];
 * }>;
 * // "/blog/post-1" | "/blog/post-2"
 *
 * @example
 * type Paths3 = CollectPaths<{ path: "/users/[id]"; render: "dynamic" }>;
 * // "/users/${string}"
 */
export type CollectPaths<EachPage extends AnyPage> = EachPage extends unknown
  ? IsPageWithSlug<EachPage> extends true
    ? EachPage extends StaticSlugPage
      ? CollectPathsForStaticSlugPage<EachPage>
      : EachPage extends DynamicPage
        ? CollectPathsForDynamicSlugPage<EachPage>
        : never
    : EachPage["path"]
  : never;

/**
 * 모든 페이지 타입을 나타내는 제네릭 타입
 *
 * createPages의 반환 타입 추론에 사용됩니다.
 */
export type AnyPage = {
  path: string;
  render: "static" | "dynamic";
  staticPaths?: readonly string[] | readonly (readonly string[])[];
};

/**
 * createPages의 응답에서 모든 페이지의 경로를 추출합니다.
 *
 * 사용자가 정의한 모든 페이지의 경로를 유니온 타입으로 반환합니다.
 * Link 컴포넌트 등에서 타입 안전성을 보장하는 데 사용됩니다.
 *
 * @example
 * const pages = createPages(async ({ createPage }) => {
 *   createPage({
 *     render: 'static',
 *     path: '/foo',
 *     component: Foo,
 *   });
 *   createPage({
 *     render: 'static',
 *     path: '/bar',
 *     component: Bar,
 *   });
 * });
 *
 * type MyPaths = PathsForPages<typeof pages>;
 * // "/foo" | "/bar"
 */
export type PathsForPages<
  PagesResult extends { DO_NOT_USE_pages: AnyPage } | AnyPage,
> = PagesResult extends { DO_NOT_USE_pages: AnyPage }
  ? CollectPaths<PagesResult["DO_NOT_USE_pages"]> extends never
    ? string
    : CollectPaths<PagesResult["DO_NOT_USE_pages"]>
  : PagesResult extends AnyPage
    ? CollectPaths<PagesResult> extends never
      ? string
      : CollectPaths<PagesResult>
    : never;

/**
 * 경로에서 슬러그 이름들을 추출하는 재귀 헬퍼
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
 * 경로에서 슬러그 이름들을 추출합니다.
 *
 * [변수명] 패턴의 변수명만 추출하여 문자열 배열로 반환합니다.
 *
 * @example
 * type Slugs0 = GetSlugs<"/about">;
 * // []
 *
 * @example
 * type Slugs1 = GetSlugs<"/blog/[id]">;
 * // ["id"]
 *
 * @example
 * type Slugs2 = GetSlugs<"/blog/[category]/[id]">;
 * // ["category", "id"]
 *
 * @example
 * type Slugs3 = GetSlugs<"/docs/[...rest]">;
 * // ["...rest"]
 */
export type GetSlugs<Route extends string> = _GetSlugs<Route>;

/**
 * Config에서 페이지 경로를 추출합니다.
 *
 * 슬러그가 포함된 경로를 문자열 리터럴로 반환합니다.
 */
export type PagePath<Config> = Config extends {
  pages: { path: infer Path };
}
  ? Path
  : never;

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
 * 와일드카드 슬러그에서 `...` 접두사를 제거합니다.
 *
 * @private
 *
 * @example
 * type Clean1 = CleanWildcard<"...rest">;  // "rest"
 * type Clean2 = CleanWildcard<"id">;       // "id"
 */
type CleanWildcard<Slug extends string> = Slug extends `...${infer Wildcard}`
  ? Wildcard
  : Slug;

/**
 * 슬러그 이름들을 Props 타입으로 변환합니다.
 *
 * 각 슬러그 이름을 키로, 해당 슬러그의 타입을 값으로 하는 객체 타입을 생성합니다.
 * - 일반 슬러그: `string`
 * - 나머지 파라미터 (`...rest`): `string[]`
 *
 * @example
 * type Props1 = SlugTypes<"/blog/[id]">;
 * // { id: string }
 *
 * @example
 * type Props2 = SlugTypes<"/blog/[category]/[id]">;
 * // { category: string; id: string }
 *
 * @example
 * type Props3 = SlugTypes<"/docs/[...rest]">;
 * // { rest: string[] }
 *
 * @example
 * type Props0 = SlugTypes<"/about">;
 * // {}
 */
type SlugTypes<Path extends string> = GetSlugs<Path> extends string[]
  ? {
      [Slug in GetSlugs<Path>[number] as CleanWildcard<Slug>]: IndividualSlugType<Slug>;
    }
  : never;

/**
 * 페이지 컴포넌트가 받을 Props 타입을 생성합니다.
 *
 * RouteProps (path, query)와 SlugTypes (동적 파라미터)를 합쳐서
 * 페이지 컴포넌트의 Props 타입을 만듭니다. hash는 제외됩니다.
 *
 * @example
 * type AboutProps = PropsForPages<"/about">;
 * // { path: string; query?: string }
 *
 * @example
 * type BlogProps = PropsForPages<"/blog/[id]">;
 * // { path: string; query?: string; id: string }
 *
 * @example
 * type PostProps = PropsForPages<"/blog/[category]/[id]">;
 * // { path: string; query?: string; category: string; id: string }
 *
 * @example
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
 * 응답의 render 타입을 추출합니다.
 *
 * render가 string이면 dynamic으로 간주합니다.
 *
 * @private
 */
type GetResponseType<Response extends { render: string }> =
  string extends Response["render"] ? { render: "dynamic" } : Response;

/**
 * getConfig 함수의 응답 타입을 추출합니다.
 *
 * fs-router에서 타입 생성 시 사용되며,
 * 타입 추론에 실패하면 {render: 'dynamic'}으로 폴백합니다.
 */
export type GetConfigResponse<
  Fn extends () => Promise<{ render: string }> | { render: string },
> =
  ReturnType<Fn> extends { render: string }
    ? GetResponseType<ReturnType<Fn>>
    : GetResponseType<Awaited<ReturnType<Fn>>>;
