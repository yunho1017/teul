import { type FunctionComponent, type ReactNode } from "react";
import { ErrorBoundary } from "../../../client/router/error-boundary.js";
import type { PathSpec } from "../../../utils/path.js";

/**
 * 모든 페이지의 기본 루트 컴포넌트
 *
 * 사용자가 createRoot를 호출하지 않았을 때 사용되는 기본 HTML 구조입니다.
 * ErrorBoundary로 감싸져 있어 렌더링 에러를 처리합니다.
 *
 * @example
 * // 사용자가 createRoot를 호출하지 않은 경우 자동으로 사용됨
 * <DefaultRoot>
 *   <Layout>
 *     <Page />
 *   </Layout>
 * </DefaultRoot>
 *
 * @example
 * // 실제 렌더링 결과
 * <ErrorBoundary>
 *   <html>
 *     <head />
 *     <body>
 *       <Layout>
 *         <Page />
 *       </Layout>
 *     </body>
 *   </html>
 * </ErrorBoundary>
 */
export const DefaultRoot = ({ children }: { children: ReactNode }) => (
  <ErrorBoundary>
    <html>
      <head />
      <body>{children}</body>
    </html>
  </ErrorBoundary>
);

/**
 * 컴포넌트 배열을 중첩된 React 엘리먼트로 변환합니다.
 *
 * 레이아웃을 중첩시킬 때 사용되며, reduceRight를 사용하여
 * 배열의 마지막 요소부터 감싸면서 구조를 만듭니다.
 *
 * @param elements - 중첩시킬 컴포넌트 배열 (바깥쪽부터 안쪽 순서)
 * @param children - 가장 안쪽에 배치될 children
 * @returns 중첩된 React 엘리먼트
 *
 * @example
 * // 두 개의 레이아웃으로 페이지를 감싸는 경우
 * const MainLayout = ({ children }) => <main>{children}</main>;
 * const SidebarLayout = ({ children, showSidebar }) => (
 *   <div className={showSidebar ? 'with-sidebar' : ''}>
 *     {children}
 *   </div>
 * );
 *
 * const result = createNestedElements(
 *   [
 *     { component: MainLayout },
 *     { component: SidebarLayout, props: { showSidebar: true } }
 *   ],
 *   <Page />
 * );
 *
 * // 결과:
 * // <MainLayout>
 * //   <SidebarLayout showSidebar={true}>
 * //     <Page />
 * //   </SidebarLayout>
 * // </MainLayout>
 *
 * @example
 * // 단일 레이아웃으로 감싸는 경우
 * createNestedElements(
 *   [{ component: Container }],
 *   <Content />
 * );
 * // 결과: <Container><Content /></Container>
 */
export const createNestedElements = (
  elements: {
    component: FunctionComponent<any>;
    props?: Record<string, unknown>;
  }[],
  children: ReactNode,
) => {
  return elements.reduceRight<ReactNode>(
    (result, element) => (
      <element.component {...element.props}>{result}</element.component>
    ),
    children,
  );
};

/**
 * PathSpec에서 슬러그(동적 경로 파라미터)의 개수를 계산합니다.
 *
 * PathSpec의 각 항목을 순회하며 literal이 아닌 항목(group, wildcard 등)의
 * 개수를 세어 반환합니다.
 *
 * @param pathSpec - 경로 스펙 배열
 * @returns 슬러그 개수를 담은 객체
 *
 * @example
 * // 슬러그가 없는 정적 경로
 * getSlugs([
 *   { type: 'literal', name: 'blog' },
 *   { type: 'literal', name: 'posts' }
 * ]);
 * // 결과: { numSlugs: 0 }
 *
 * @example
 * // 슬러그가 1개인 동적 경로 (/blog/[id])
 * getSlugs([
 *   { type: 'literal', name: 'blog' },
 *   { type: 'group', name: 'id' }
 * ]);
 * // 결과: { numSlugs: 1 }
 *
 * @example
 * // 슬러그가 여러 개인 경로 (/blog/[category]/[id])
 * getSlugs([
 *   { type: 'literal', name: 'blog' },
 *   { type: 'group', name: 'category' },
 *   { type: 'group', name: 'id' }
 * ]);
 * // 결과: { numSlugs: 2 }
 */
export const getSlugs = (pathSpec: PathSpec) => {
  let numSlugs = 0;
  for (const slug of pathSpec) {
    if (slug.type !== "literal") {
      numSlugs++;
    }
  }
  return { numSlugs };
};

/**
 * PathSpec과 실제 값을 조합하여 정적 경로를 생성합니다.
 *
 * 슬러그가 포함된 경로 패턴(예: /blog/[id])에 실제 값을 대입하여
 * 구체적인 경로(예: /blog/post-1)를 만들고, 슬러그 이름과 값의 매핑을 생성합니다.
 *
 * @param pathSpec - 경로 스펙 배열 (슬러그 포함)
 * @param staticPath - 슬러그에 대입할 실제 값 배열
 * @returns 확장된 경로 정보 (definedPath, pathItems, mapping)
 *
 * @example
 * // 단일 슬러그 경로 확장 (/blog/[id] -> /blog/post-1)
 * expandStaticPathSpec(
 *   [
 *     { type: 'literal', name: 'blog' },
 *     { type: 'group', name: 'id' }
 *   ],
 *   ['post-1']
 * );
 * // 결과: {
 * //   definedPath: '/blog/post-1',
 * //   pathItems: ['blog', 'post-1'],
 * //   mapping: { id: 'post-1' }
 * // }
 *
 * @example
 * // 다중 슬러그 경로 확장 (/blog/[category]/[id] -> /blog/tech/article-1)
 * expandStaticPathSpec(
 *   [
 *     { type: 'literal', name: 'blog' },
 *     { type: 'group', name: 'category' },
 *     { type: 'group', name: 'id' }
 *   ],
 *   ['tech', 'article-1']
 * );
 * // 결과: {
 * //   definedPath: '/blog/tech/article-1',
 * //   pathItems: ['blog', 'tech', 'article-1'],
 * //   mapping: { category: 'tech', id: 'article-1' }
 * // }
 *
 * @example
 * // 슬러그가 없는 경로 (변환 없음)
 * expandStaticPathSpec(
 *   [
 *     { type: 'literal', name: 'about' },
 *     { type: 'literal', name: 'team' }
 *   ],
 *   []
 * );
 * // 결과: {
 * //   definedPath: '/about/team',
 * //   pathItems: ['about', 'team'],
 * //   mapping: {}
 * // }
 */
export function expandStaticPathSpec(pathSpec: PathSpec, staticPath: string[]) {
  const mapping: Record<string, string | string[]> = {};
  let slugIndex = 0;
  const pathItems: string[] = [];
  pathSpec.forEach(({ type, name }) => {
    switch (type) {
      case "literal":
        pathItems.push(name!);
        break;

      case "group":
        pathItems.push(staticPath[slugIndex++]!);
        mapping[name!] = pathItems[pathItems.length - 1]!;
        break;
    }
  });
  const definedPath = "/" + pathItems.join("/");
  return {
    definedPath,
    pathItems,
    mapping,
  };
}
