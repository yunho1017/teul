/**
 * 여러 경로를 하나로 합치고 정규화합니다.
 * . 과 .. 을 처리하여 정리된 경로를 반환합니다.
 *
 * @example
 * joinPath('/foo', 'bar') // → '/foo/bar'
 * joinPath('/foo', '../bar') // → '/bar'
 * joinPath('foo', './bar') // → 'foo/bar'
 * joinPath('/foo', '', 'bar') // → '/foo/bar'
 */
export const joinPath = (...paths: string[]) => {
  const isAbsolute = paths[0]?.startsWith("/");
  const items = ([] as string[]).concat(
    ...paths.map((path) => path.split("/")),
  );
  const stack: string[] = [];
  for (const item of items) {
    if (item === "..") {
      if (stack.length && stack[stack.length - 1] !== "..") {
        stack.pop();
      } else if (!isAbsolute) {
        stack.push("..");
      }
    } else if (item && item !== ".") {
      stack.push(item);
    }
  }
  return (isAbsolute ? "/" : "") + stack.join("/") || ".";
};

export type PathSpecItem =
  | { type: "literal"; name: string }
  | { type: "group"; name?: string };
export type PathSpec = readonly PathSpecItem[];

/**
 * 경로 문자열을 파싱하여 각 세그먼트의 타입을 분석합니다.
 * [name] 형태는 동적 파라미터(group)로 처리됩니다.
 *
 * @example
 * parsePathWithSlug('/about/team')
 * // → [
 * //   { type: 'literal', name: 'about' },
 * //   { type: 'literal', name: 'team' }
 * // ]
 *
 * parsePathWithSlug('/blog/[id]')
 * // → [
 * //   { type: 'literal', name: 'blog' },
 * //   { type: 'group', name: 'id' }
 * // ]
 */
export const parsePathWithSlug = (path: string): PathSpec =>
  path
    .split("/")
    .filter(Boolean)
    .map((name) => {
      let type: "literal" | "group" = "literal";
      const isSlug = name.startsWith("[") && name.endsWith("]");
      if (isSlug) {
        type = "group";
        name = name.slice(1, -1);
      }

      return { type, name };
    });

/**
 * PathSpec 객체를 다시 경로 문자열로 변환합니다.
 * parsePathWithSlug의 반대 동작입니다.
 *
 * @example
 * pathSpecAsString([
 *   { type: 'literal', name: 'blog' },
 *   { type: 'group', name: 'id' }
 * ])
 * // → '/blog/[id]'
 *
 * pathSpecAsString([
 *   { type: 'literal', name: 'about' },
 *   { type: 'literal', name: 'team' }
 * ])
 * // → '/about/team'
 */
export const pathSpecAsString = (path: PathSpec) => {
  return (
    "/" +
    path
      .map(({ type, name }) => {
        if (type === "literal") {
          return name;
        } else if (type === "group") {
          return `[${name}]`;
        }
      })
      .join("/")
  );
};

/**
 * PathSpec을 정규표현식 패턴으로 변환합니다.
 * 라우팅 매칭에 사용됩니다.
 *
 * @example
 * path2regexp([
 *   { type: 'literal', name: 'blog' },
 *   { type: 'group', name: 'id' }
 * ])
 * // → '^/blog/([^/]+)$'
 * // '/blog/123'과 매칭됨, '/blog/123/edit'은 매칭 안됨
 *
 * path2regexp([
 *   { type: 'literal', name: 'about' }
 * ])
 * // → '^/about$'
 * // '/about'만 정확히 매칭
 */
export const path2regexp = (path: PathSpec) => {
  const parts = path.map(({ type, name }) => {
    if (type === "literal") {
      return name;
    } else if (type === "group") {
      return `([^/]+)`;
    } else {
      return `(.*)`;
    }
  });
  return `^/${parts.join("/")}$`;
};
/**
 * PathSpec과 실제 경로를 매칭하여 동적 파라미터 값을 추출합니다.
 *
 * @example
 * getPathMapping(
 *   [
 *     { type: 'literal', name: 'blog' },
 *     { type: 'group', name: 'id' }
 *   ],
 *   '/blog/123'
 * )
 * // → { id: '123' }
 *
 * getPathMapping(
 *   [
 *     { type: 'literal', name: 'about' },
 *     { type: 'literal', name: 'team' }
 *   ],
 *   '/about/team'
 * )
 * // → {} (매칭 성공, 동적 파라미터 없음)
 *
 * getPathMapping(
 *   [{ type: 'literal', name: 'blog' }],
 *   '/about'
 * )
 * // → null (매칭 실패)
 */
export const getPathMapping = (
  pathSpec: PathSpec,
  pathname: string,
): Record<string, string | string[]> | null => {
  const actual = pathname.split("/").filter(Boolean);

  // 경로 길이가 다르면 매칭 실패
  if (pathSpec.length !== actual.length) {
    return null;
  }

  const mapping: Record<string, string | string[]> = {};

  // 각 세그먼트를 순회하며 매칭
  for (let i = 0; i < pathSpec.length; i++) {
    const { type, name } = pathSpec[i]!;

    if (type === "literal") {
      // Literal: 정확히 일치해야 함
      if (name !== actual[i]) {
        return null;
      }
    } else if (type === "group" && name) {
      // Group (동적 파라미터): 값을 매핑에 저장
      mapping[name] = actual[i]!;
    }
  }

  return mapping;
};

/**
 * RSC 경로를 파일 시스템에 안전한 형식으로 인코딩합니다.
 *
 * @param rscPath - 인코딩할 RSC 경로
 * @returns 인코딩된 경로 (.rsc(사용자 정의 가능) 확장자 포함)
 *
 * @example
 * encodeRscPath("/home", ".rsc") // "_/home.rsc"
 * encodeRscPath("/about/", ".rsc") // "_/about/_.rsc"
 * encodeRscPath("", ".rsc") // "_.rsc"
 * encodeRscPath("page", ".rsc") // "page.rsc"
 */
export const encodeRscPath = (rscPath: string, extension: string) => {
  if (rscPath.startsWith("_")) {
    throw new Error("rscPath must not start with `_`: " + rscPath);
  }
  if (rscPath.endsWith("_")) {
    throw new Error("rscPath must not end with `_`: " + rscPath);
  }
  if (rscPath === "") {
    rscPath = "_";
  }
  if (rscPath.startsWith("/")) {
    rscPath = "_" + rscPath;
  }
  if (rscPath.endsWith("/")) {
    rscPath += "_";
  }
  return rscPath + extension;
};

/**
 * 인코딩된 RSC 경로를 원래 형식으로 디코딩합니다.
 *
 * @param rscPath - 디코딩할 인코딩된 경로
 * @returns 디코딩된 원본 경로
 * @throws {Error} .rsc 확장자가 없는 경우 400 상태 코드와 함께 에러 발생
 *
 * @example
 * decodeRscPath("_/home.rsc", ".rsc") // "/home"
 * decodeRscPath("_/about/_.rsc", ".rsc") // "/about/"
 * decodeRscPath("_.rsc", ".rsc") // ""
 * decodeRscPath("page.rsc", ".rsc") // "page"
 */
export const decodeRscPath = (rscPath: string, extension: string) => {
  if (!rscPath.endsWith(extension)) {
    const err = new Error("Invalid encoded rscPath");
    (err as any).statusCode = 400;
    throw err;
  }
  rscPath = rscPath.slice(0, -extension.length);
  if (rscPath.startsWith("_")) {
    rscPath = rscPath.slice(1);
  }
  if (rscPath.endsWith("_")) {
    rscPath = rscPath.slice(0, -1);
  }
  return rscPath;
};
