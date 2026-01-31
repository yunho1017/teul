import { createElement, type FunctionComponent } from "react";
import {
  joinPath,
  parsePathWithSlug,
  type PathSpec,
} from "../../../utils/path.js";
import type { RootItem } from "./types.js";
import { expandStaticPathSpec, getSlugs } from "./utils.js";

/**
 * 페이지, 레이아웃, 루트 컴포넌트를 등록하고 관리하는 클래스
 *
 * 등록 함수(createPage, createLayout, createRoot)를 제공하며,
 * 이를 통해 등록된 컴포넌트들을 관리합니다.
 *
 * 호출 흐름:
 * - fs-router.ts에서 createPages 호출
 * - create-pages.ts의 configure() 함수에서 registry 사용
 * - 파일 기반 라우팅 대신 createRouter를 직접 사용할 수도 있습니다
 */
export class PageRegistry {
  private staticPathMap = new Map<
    string,
    { literalSpec: PathSpec; pathPattern?: PathSpec }
  >();
  private dynamicPagePathMap = new Map<
    string,
    [PathSpec, FunctionComponent<any>]
  >();
  private staticComponentMap = new Map<string, FunctionComponent<any>>();
  private rootItem: RootItem | undefined = undefined;
  /**
   * 현재 설정 완료 여부를 나타내는 플래그
   *
   * 설정이 완료되지 않은 상태에서 페이지/레이아웃/루트 정보를 가져오는 함수를 호출하면 에러가 발생합니다.
   */
  private configured = false;

  /**
   * 설정 완료 상태로 표시합니다.
   */
  markConfigured() {
    this.configured = true;
  }

  /**
   * 설정 완료 여부를 반환합니다.
   *
   * @returns 설정 완료 여부
   */
  isConfigured(): boolean {
    return this.configured;
  }

  /**
   * 정적 컴포넌트를 등록합니다.
   *
   * 중복 등록 시 에러를 발생시킵니다.
   *
   * @param id - 컴포넌트 식별자 (예: "blog/page", "layout")
   * @param component - 등록할 React 컴포넌트
   * @throws 동일한 ID에 다른 컴포넌트가 이미 등록된 경우 에러 발생
   */
  private registerStaticComponent(
    id: string,
    component: FunctionComponent<any>,
  ) {
    if (
      this.staticComponentMap.has(id) &&
      this.staticComponentMap.get(id) !== component
    ) {
      throw new Error(`Duplicated component for: ${id}`);
    }
    this.staticComponentMap.set(id, component);
  }

  /**
   * 페이지 경로가 이미 존재하는지 확인합니다.
   *
   * @param path - 확인할 경로 (예: "/about", "/blog/[id]")
   * @returns 경로가 존재하면 true, 그렇지 않으면 false
   */
  pagePathExists(path: string): boolean {
    return this.staticPathMap.has(path) || this.dynamicPagePathMap.has(path);
  }

  /**
   * 페이지를 등록합니다.
   *
   * 정적 페이지(슬러그 없음), 정적 페이지(슬러그 있음 + staticPaths 제공), 동적 페이지를 모두 처리합니다.
   *
   * @param page - 등록할 페이지 정보
   * @param page.render - 렌더링 타입 ("static" 또는 "dynamic")
   * @param page.path - 페이지 경로
   * @param page.component - 페이지 컴포넌트
   * @param page.staticPaths - 정적 경로 배열 (슬러그가 있는 static 페이지의 경우 필수)
   * @throws 설정이 완료된 후 호출되거나, 중복된 경로가 있거나, 잘못된 설정인 경우 에러 발생
   *
   * @example
   * // 슬러그 없는 정적 페이지
   * registerPage({
   *   render: "static",
   *   path: "/about",
   *   component: AboutPage
   * });
   *
   * @example
   * // 슬러그가 있는 정적 페이지
   * registerPage({
   *   render: "static",
   *   path: "/blog/[id]",
   *   component: BlogPost,
   *   staticPaths: [["post-1"], ["post-2"], ["post-3"]]
   * });
   *
   * @example
   * // 동적 페이지
   * registerPage({
   *   render: "dynamic",
   *   path: "/user/[userId]/post/[postId]",
   *   component: UserPost
   * });
   */
  registerPage(page: {
    render: "static" | "dynamic";
    path: string;
    component: FunctionComponent<any>;
    staticPaths?: any;
  }) {
    if (this.configured) {
      throw new Error("createPage no longer available");
    }
    if (this.pagePathExists(page.path)) {
      throw new Error(`Duplicated path: ${page.path}`);
    }

    const pathSpec = parsePathWithSlug(page.path);
    const { numSlugs } = getSlugs(pathSpec);

    if (page.render === "static" && numSlugs === 0) {
      this.staticPathMap.set(page.path, {
        literalSpec: pathSpec,
      });
      const id = joinPath(page.path, "page").replace(/^\//, "");
      if (page.component) {
        this.registerStaticComponent(id, page.component);
      }
    } else if (
      page.render === "static" &&
      numSlugs > 0 &&
      "staticPaths" in page
    ) {
      const staticPaths = page.staticPaths.map((item: any) =>
        (Array.isArray(item) ? item : [item]).map((slug: any) => String(slug)),
      );
      for (const staticPath of staticPaths) {
        if (staticPath.length !== numSlugs) {
          throw new Error("staticPaths does not match with slug pattern");
        }
        const { definedPath, pathItems, mapping } = expandStaticPathSpec(
          pathSpec,
          staticPath,
        );
        this.staticPathMap.set(definedPath, {
          literalSpec: pathItems.map((name) => ({ type: "literal", name })),
          pathPattern: pathSpec,
        });
        const id = joinPath(definedPath, "page").replace(/^\//, "");
        const WrappedComponent = (props: Record<string, unknown>) =>
          createElement(page.component as any, { ...props, ...mapping });
        this.registerStaticComponent(id, WrappedComponent);
      }
    } else if (page.render === "dynamic") {
      // Dynamic page
      this.dynamicPagePathMap.set(page.path, [pathSpec, page.component]);
    } else {
      throw new Error("Invalid page configuration " + JSON.stringify(page));
    }
  }

  /**
   * 레이아웃을 등록합니다.
   *
   * @param layout - 등록할 레이아웃 정보
   * @param layout.render - 렌더링 타입 (현재는 "static"만 지원)
   * @param layout.path - 레이아웃 경로
   * @param layout.component - 레이아웃 컴포넌트
   * @throws 설정이 완료된 후 호출되거나, 잘못된 설정인 경우 에러 발생
   */
  registerLayout(layout: {
    render: "static";
    path: string;
    component: FunctionComponent<any>;
  }) {
    if (this.configured) {
      throw new Error("createLayout no longer available");
    }
    if (layout.render === "static") {
      const id = joinPath(layout.path, "layout").replace(/^\//, "");
      this.registerStaticComponent(id, layout.component);
    } else {
      throw new Error("Invalid layout configuration");
    }
  }

  /**
   * 루트 컴포넌트를 등록합니다.
   *
   * @param root - 등록할 루트 컴포넌트 정보
   * @throws 설정이 완료된 후 호출되거나, 중복 등록되거나, 잘못된 설정인 경우 에러 발생
   */
  registerRoot(root: RootItem) {
    if (this.configured) {
      throw new Error("createRoot no longer available");
    }
    if (this.rootItem) {
      throw new Error(`Duplicated root component`);
    }
    if (root.render === "static") {
      this.rootItem = root;
    } else {
      throw new Error("Invalid root configuration");
    }
  }

  /**
   * 정적 경로 맵을 반환합니다.
   *
   * @returns 정적 경로 맵 (경로 → PathSpec 매핑)
   */
  getStaticPathMap() {
    return this.staticPathMap;
  }

  /**
   * 동적 페이지 경로 맵을 반환합니다.
   *
   * 동적 세그먼트([id] 같은 것)가 없는 경로를 먼저, 있는 경로를 뒤로 정렬합니다.
   *
   * @returns 동적 페이지 경로 맵 (경로 → [PathSpec, Component] 매핑)
   */
  getDynamicPagePathMap() {
    const entries = Array.from(this.dynamicPagePathMap.entries());

    entries.sort((a, b) => {
      const [, [pathSpecA]] = a;
      const [, [pathSpecB]] = b;

      const dynamicCountA = pathSpecA.filter(
        (seg) => seg.type === "group",
      ).length;
      const dynamicCountB = pathSpecB.filter(
        (seg) => seg.type === "group",
      ).length;

      return dynamicCountA - dynamicCountB;
    });

    return new Map(entries);
  }

  /**
   * 정적 컴포넌트 맵을 반환합니다.
   *
   * @returns 정적 컴포넌트 맵 (ID → Component 매핑)
   */
  getStaticComponentMap() {
    return this.staticComponentMap;
  }

  /**
   * 정적 컴포넌트를 가져옵니다.
   *
   * @param id - 컴포넌트 식별자
   * @returns 컴포넌트가 존재하면 컴포넌트, 없으면 undefined
   */
  getStaticComponent(id: string): FunctionComponent<any> | undefined {
    return this.staticComponentMap.get(id);
  }

  /**
   * 루트 컴포넌트를 가져옵니다.
   *
   * @returns 루트 컴포넌트 정보가 존재하면 RootItem, 없으면 undefined
   */
  getRootItem(): RootItem | undefined {
    return this.rootItem;
  }
}
