import type { FunctionComponent } from "react";
import {
  joinPath,
  pathSpecAsString,
  path2regexp,
  type PathSpec,
} from "../../../utils/path.js";
import type { PageRegistry } from "./page-registry.js";

/**
 * 경로 기반으로 해당하는 레이아웃/라우트를 registry에서 찾아 리턴하는 클래스
 */
export class RouteResolver {
  constructor(private registry: PageRegistry) {}

  /**
   * 주어진 PathSpec에 대한 필요한 레이아웃 경로들을 반환합니다.
   *
   * PageRegistry에서 layout이 존재하는 라우트만 반환합니다.
   *
   * @param spec - 경로 스펙 배열
   * @returns 레이아웃이 존재하는 경로들의 배열
   *
   * @example
   * // PathSpec: [{ type: 'literal', name: 'blog' }, { type: 'literal', name: 'post' }]
   * getLayouts(spec) // ['/', '/blog', '/blog/post']
   */
  getLayouts(spec: PathSpec): string[] {
    const pathSegments = spec.reduce<string[]>(
      (acc, _segment, index) => {
        acc.push(pathSpecAsString(spec.slice(0, index + 1)));
        return acc;
      },
      ["/"],
    );

    return pathSegments.filter((segment) =>
      this.registry.getStaticComponent(joinPath(segment, "layout").slice(1)),
    );
  }

  /**
   * 전체 페이지 중에 주어진 경로에 해당하는 페이지 라우트 정보를 찾습니다.
   *
   * 정적 페이지를 먼저 찾고, 없으면 동적 페이지를 찾습니다.
   * 전체 페이지 정보는 PageRegistry를 통해 가져옵니다.
   *
   * @param path - 찾을 경로 (예: "/about", "/blog/post-1")
   * @returns 라우트 정보 객체 또는 undefined
   *
   * @example
   * // 정적 페이지 찾기
   * // 등록: createPage({ render: "static", path: "/about", component: About })
   * resolver.getPageRoutePath("/about");
   * // 결과: { type: "static", path: "/about" }
   *
   * @example
   * // 동적 페이지 찾기 (슬러그 매칭)
   * // 등록: createPage({ render: "dynamic", path: "/blog/[id]", component: BlogPost })
   * resolver.getPageRoutePath("/blog/post-1");
   * // 결과: {
   * //   type: "dynamic",
   * //   path: "/blog/[id]",
   * //   pathSpec: [{ type: 'literal', name: 'blog' }, { type: 'group', name: 'id' }],
   * //   component: BlogPost
   * // }
   *
   * @example
   * // 페이지를 찾지 못한 경우
   * resolver.getPageRoutePath("/non-existent-page");
   * // 결과: undefined
   */
  getPageRoutePath(path: string):
    | { type: "static"; path: string }
    | {
        type: "dynamic";
        path: string;
        pathSpec: PathSpec;
        component: FunctionComponent<any>;
      }
    | undefined {
    if (this.registry.getStaticComponent(joinPath(path, "page").slice(1))) {
      return { type: "static", path };
    }

    for (const [
      dynamicPath,
      [pathSpec, component],
    ] of this.registry.getDynamicPagePathMap()) {
      const regexp = new RegExp(path2regexp(pathSpec));
      if (regexp.test(path)) {
        return { type: "dynamic", path: dynamicPath, pathSpec, component };
      }
    }

    return undefined;
  }
}
