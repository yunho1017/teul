---
title: "모듈 시스템 Deep Dive (Intro) — ESM/CJS Interop 문제 해결"
date: "2026-02-18"
excerpt: "도메인 분리 과정에서 마주한 'Element type is invalid' 에러의 원인을 webpack 코드를 따라가며 확인해본다."
tags: ["Frontend", "Module System", "Bundler", "webpack"]
---

현재 회사에서 매장향 관리자 페이지의 도메인을 분리하는 작업을 진행하고 있다.  
하나의 모노리스 구조에서 공통 UI, 유틸리티, API 클라이언트 등을 별도 패키지로 추출하는 작업을 진행하면서,
`@ui`, `@utils` 같은 내부 패키지들을 만들었고, 각 앱에서 import해서 쓰는 구조로 전환하는 중이었다.

현재 설계한 모노레포 구조는 공통 패키지(`@ui`/`@utils` 등)가 의존성을 가진 상태로 번들링되지 않고, external 옵션을 통해 패키지에서 사용하는 모든 의존성은 app 단에서 다루는 방식으로 진행했다.

그 이유는 외부에서 단독으로 사용하는 패키지가 아닐 뿐더러, 의존성을 포함하게 되면 다른 패키지와의 버전 충돌 등으로 관리 포인트가 늘어날 것이라고 판단했기 때문이다.

패키지를 분리하면서 `@ui` 패키지의 `package.json`에 `"type": "module"`을 설정했다.  
ESM이 표준이니 패키지는 ESM으로 설정해두는 것이 맞다고 판단했다.
빌드도 잘 되고, 타입도 잘 잡혔다. 문제가 없어 보였다.

그런데 런타임에서 이런 에러가 터졌다.

```
Element type is invalid: expected a string (for built-in components)
or a class/function (for composite components) but got: object.
```

## 문제 현상

`@ui` 패키지 안에서 애니메이션 라이브러리를 사용하는 컴포넌트가 있었다.
`import Lottie from "lottie-react"`로 가져온 `Lottie`가 React 컴포넌트(함수)가 아니라 모듈 객체 전체였다.

```js
// 기대한 값
Lottie = function Lottie() { ... }  // React 컴포넌트

// 실제 값
Lottie = { default: function Lottie() { ... }, useLottie: ..., __esModule: true }
```

React 입장에서는 객체를 컴포넌트로 렌더링하려 했으니 당연히 에러가 발생한다.

위 에러의 근본적인 원인은 CJS와 ESM이 모듈을 export하는 방식이 달라서 생기는 문제다.  
보통은 번들러에서 상호 호환(interop) 로직이 이를 처리해주는 경우가 대부분인데, 이 로직이 번들러마다 구현 방식이 달라 해결 방법과 접근 방법도 그때마다 다르다.  
어떤 번들러를 어떤 버전으로 사용하느냐, 사용하는 라이브러리가 어떻게 모듈을 정의하고 있는지, 현재 번들러의 설정이 어떻게 되어 있는지 등 다양한 변수가 얽혀 있다.

위 에러의 원인을 webpack 5의 코드를 참고해 파악하고 해결했는데, 그 과정을 정리하고자 한다.

```
참고:

webpack 코드가 워낙 방대하다 보니, 일부분만 참고해서 흐름을 정리한 것이다.
필자가 이해한 부분과 다르게 동작하는 부분이 충분히 있을 수 있다.
```

---

## 원인 분석

lottie-react의 `package.json`을 열어보면 아래와 같다.

```json
{
  "main": "build/index.js",
  "module": "build/index.es.js",
  "browser": "build/index.umd.js"
}
```

webpack의 `resolve.mainFields` 기본값은 `["browser", "module", "main"]`이다.([Docs](https://webpack.js.org/configuration/resolve/#resolvemainfields) / [Code](https://github.com/webpack/webpack/blob/7f662db3ca9002398b1420857c2676b6ba37d837/lib/config/defaults.js#L1955))
`browser`가 최우선이므로, ESM 파일(`index.es.js`) 대신 UMD 파일(`index.umd.js`)이 선택됐다.

lottie-react의 UMD 파일은 CJS로 트랜스파일된 형태로 제공된다.

```js
// build/index.umd.js
exports["default"] = Lottie;
exports.useLottie = useLottie;
Object.defineProperty(exports, "__esModule", { value: true });
```

`__esModule: true`는 Babel/TypeScript가 "이 모듈은 원래 ESM이었다"라고 표시하는 convention이다.
원래라면 번들러가 패키지를 가져올 때 `__esModule` 값을 보고 `default`를 올바르게 추출해야 하는데, 이번 케이스에서는 그렇게 동작하지 않았다.

webpack 코드를 참고해서 왜 원하던 동작을 하지 않았는지 알아보자.

<details class="border border-gray-200 rounded-xl px-6 py-5 my-4">
<summary><b>참고: webpack 코드에 등장하는 "Harmony"란?</b></summary>

webpack 소스를 읽다 보면 `HarmonyXxx`로 시작하는 클래스와 플러그인이 곳곳에 등장한다. 여기서 "Harmony"는 ES Modules(ESM)를 가리키는 webpack의 내부 용어다.

ES4 사양이 진영 간 의견 충돌로 폐기된 뒤, TC39는 다음 ECMAScript 사양 개발 프로젝트에 "Harmony"라는 코드네임을 붙였다. 분열된 진영이 다시 하나가 된다는 뜻을 담은 이름이었고, 그 프로젝트의 결과물이 ES6(ECMAScript 2015)다. `import`/`export` 모듈 시스템도 이때 처음 도입됐다.

webpack은 ES6 모듈 지원을 구현하면서 이 코드네임을 내부 용어로 그대로 차용했다.

> webpack 2부터 ES2015 모듈(`import`/`export`)에 대한 기본 지원을 제공한다. — [webpack 공식 문서](https://webpack.js.org/guides/tree-shaking/)

참고 링크:

- [StackOverflow — "What is harmony and what are harmony exports?"](https://stackoverflow.com/questions/52871611/what-is-harmony-and-what-are-harmony-exports)
- [Wikipedia — ECMAScript version history](https://en.wikipedia.org/wiki/ECMAScript_version_history)

</details>

### 1. RuntimeTemplate — import 코드 생성

webpack은 `import Lottie from "lottie-react"` 같은 구문을 만나면, `RuntimeTemplate`에서 실제 번들 코드를 생성한다.([Code](https://github.com/webpack/webpack/blob/main/lib/RuntimeTemplate.js))

```js
// lib/RuntimeTemplate.js (간략화)
if (exportName.length > 0 && exportName[0] === "default") {
  switch (exportsType) {
    case "dynamic":
      return `${importVar}_default()${propertyAccess(exportName, 1)}`;

    case "default-only":
    case "default-with-named":
      exportName = exportName.slice(1);
      break;
  }
}

// ... 중략 ...

if (exportName.length > 0) {
  // exportName이 남아있으면 → importVar["default"] 같은 프로퍼티 접근 코드 생성
  const access = `${importVar}${propertyAccess(used)}`;
  return access;
}

// exportName이 비어있으면 → importVar(모듈 객체 전체)를 그대로 반환
return importVar;
```

이때 핵심 분기 조건이 `exportsType`이다.

`exportsType`은 `getExportsType` 함수로 결정된다.

### 2. exportsType이 결정되는 과정

`exportsType`은 `Module.getExportsType()`에서 결정된다.

```js
// lib/Module.js
getExportsType(moduleGraph, strict) {
  switch (this.buildMeta && this.buildMeta.exportsType) {
    // ...
  }
}
```

`buildMeta.exportsType`은 webpack이 모듈을 파싱하는 단계에서 세팅된다.
CJS 모듈의 경우 `CommonJsExportsParserPlugin`이 코드의 export 패턴을 분석하면서 `DynamicExports`를 통해 값을 설정한다.

lottie-react의 UMD 파일이 파싱되는 과정을 따라가 보자.

`CommonJsExportsParserPlugin`의 로직이 복잡해서 AI 도움을 받아 정리했다.

```
exports["default"] = Lottie;
│
│  assignMemberChain.for("exports") 훅 매칭
│  → enableStructuredExports() → DynamicExports.enable()
│  → exportsType = "default"
│
│  checkNamespace(["default"], ...) → "default" !== "__esModule" → 패스
│
▼
exports.useLottie = useLottie;
│
│  같은 훅, enable()은 이미 호출됨 → 변화 없음
│  checkNamespace(["useLottie"], ...) → "__esModule" 아님 → 패스
│
▼
Object.defineProperty(exports, "__esModule", { value: true });
│
│  call.for("Object.defineProperty") 훅 매칭
│  → property = "__esModule" 추출
│  → getValueOfPropertyDescription({ value: true }) → true 리터럴 추출
│
│  checkNamespace(["__esModule"], true):
│    members[0] === "__esModule"  ✓
│    isTruthyLiteral(true)       ✓
│    topLevel                    ✓
│    → DynamicExports.setFlagged()
│    → exportsType = "flagged"
│
▼
최종: buildMeta.exportsType = "flagged"
```

결과적으로 lottie-react의 `buildMeta.exportsType`은 `"flagged"`로 설정된다.

`"flagged"`가 세팅되는 조건이 CJS 환경에서 `__esModule` 플래그의 존재 여부를 확인하는 것임을 보면, 이 값은 Babel/TypeScript가 ESM → CJS로 트랜스파일한 모듈임을 나타내는 것이라고 볼 수 있다.

다시 `getExportsType`으로 돌아가서, `"flagged"` 타입일 때의 처리를 보자.

```js
// lib/Module.js
case "flagged":
  return strict ? "default-with-named" : "namespace";
```

`strict` 파라미터에 따라 결과가 완전히 갈린다.

`import Lottie from "lottie-react"`는 default import이기 때문에 `exportName`은 `["default"]`로 설정된다.  
앞서 본 `RuntimeTemplate` 코드에서 각 케이스가 어떻게 처리되는지 추적해 보자.

 <div class="border border-gray-200 rounded-xl px-6 py-5 my-4">

  <p class="font-semibold text-base mt-0">"namespace"인 경우:</p>
  <p>"namespace"는 switch문에 별도 분기가 없다. exportName이 ["default"] 그대로 유지된 채 exportName.length > 0 조건에 도달하고, importVar["default"], 즉                 
  exports.default에 접근하는 코드가 생성된다.</p>
  <p>Lottie 컴포넌트 함수가 정상적으로 추출된다.</p>
  </div>

  <div class="border border-gray-200 rounded-xl px-6 py-5 my-4">
  <p class="font-semibold text-base mt-0">"default-with-named"인 경우:</p>
  <p>"default-with-named" 분기에서 exportName = exportName.slice(1)이 실행된다. ["default"]에서 "default"가 제거되어 빈 배열 []이 된다.</p>
  <p>exportName.length > 0 조건을 통과하지 못하고, 함수 끝의 return importVar — 즉 module.exports 객체 전체가 그대로 반환된다.</p>
  <p>Lottie에 객체가 들어가면서 문제가 발생한다.</p>
</div>

결론적으로, `strict` 값이 `true`로 설정되었기 때문에 문제가 발생했다는 것을 알 수 있다.

### 3. strict의 출처 — `strictHarmonyModule`

`getExportsType`을 호출하는 쪽은 `RuntimeTemplate.exportFromImport()`다.  
여기서 `strict`로 전달되는 값을 보면:

```js
// lib/RuntimeTemplate.js
const exportsType = module.getExportsType(
  moduleGraph,
  originModule.buildMeta.strictHarmonyModule, // ← import하는 쪽 모듈의 플래그
);
```

`strict`는 import되는 모듈이 아니라, import를 하는 쪽 모듈의 `buildMeta.strictHarmonyModule` 값이다.

### 4. `strictHarmonyModule`이 세팅되는 경로

webpack은 모듈을 파싱할 때 `HarmonyDetectionParserPlugin`에서 해당 파일이 ESM인지 판단한다.

```js
// lib/dependencies/HarmonyDetectionParserPlugin.js
parser.hooks.program.tap(PLUGIN_NAME, (ast) => {
  const isStrictHarmony =
    parser.state.module.type === JAVASCRIPT_MODULE_TYPE_ESM; // "javascript/esm"인지 확인

  const isHarmony =
    isStrictHarmony ||
    ast.body.some(
      (statement) =>
        statement.type === "ImportDeclaration" ||
        statement.type === "ExportDefaultDeclaration" ||
        statement.type === "ExportNamedDeclaration" ||
        statement.type === "ExportAllDeclaration",
    );

  if (isHarmony) {
    HarmonyExports.enable(parser.state, isStrictHarmony);
  }
});
```

여기서 두 가지 플래그가 구분된다.

- `isHarmony`: 이 파일이 ESM 구문(`import`/`export`)을 사용하는가? → `javascript/auto` 파일이라도 ESM 구문이 있으면 `true`
- `isStrictHarmony`: 이 파일의 모듈 타입이 정확히 `javascript/esm`인가? → `"type": "module"` 또는 `.mjs`일 때만 `true`

`HarmonyExports.enable()`로 넘어가 보면:

```js
// lib/dependencies/HarmonyExports.js
module.exports.enable = (parserState, isStrictHarmony) => {
  const buildMeta = parserState.module.buildMeta;
  buildMeta.exportsType = "namespace";

  if (isStrictHarmony) {
    buildMeta.strictHarmonyModule = true; // ← 여기서 세팅
  }
};
```

`isStrictHarmony`가 `true`일 때만 `strictHarmonyModule = true`가 세팅된다.

즉, `strictHarmonyModule`이 `true`가 되는 원인은 `parser.state.module.type`이 `JAVASCRIPT_MODULE_TYPE_ESM`(`javascript/esm`)으로 설정되었기 때문이다.

### 5. parser.state.module.type

`parser.state.module.type`의 값은 `lib/config/defaults.js`에서 결정된다.

```js
// lib/config/defaults.js (간략화)
const rules = [
  { test: /\.mjs$/i, type: "javascript/esm" },
  {
    test: /\.js$/i,
    descriptionData: { type: "module" },
    type: "javascript/esm",
  },
  { test: /\.cjs$/i, type: "javascript/dynamic" },
  {
    test: /\.js$/i,
    descriptionData: { type: "commonjs" },
    type: "javascript/dynamic",
  },
];
```

`descriptionData`는 해당 파일이 속한 `package.json`의 필드를 참조한다.

`@ui` 패키지의 `package.json`에 `"type": "module"`이 있으므로,
`@ui`의 파일들은 `javascript/esm`으로 분류된다.

결국 `strict` 값은 해당 모듈을 ESM 컨텍스트에서 불러오는지 여부를 판단하는 변수였고, `@ui` 패키지에 `"type": "module"`이 설정되어 있어 import하는 쪽이 strict ESM 모드로 동작했던 것이 문제의 원인이었다.

---

## 해결

해결 방법은 [webpack/webpack#17318](https://github.com/webpack/webpack/issues/17318) 이슈에서 힌트를 얻었다. 발생한 패키지는 달랐지만, 상황은 동일했다.

이슈에서 제안된 해결책은 webpack 설정에서 해당 파일들의 모듈 타입을 `javascript/auto`로 명시하는 것이었다.  
`javascript/auto`를 적용하면 `strict`가 `false`가 되어 `exportsType`이 `"namespace"`로 결정되고, `importVar["default"]`를 통해 Lottie 컴포넌트 함수를 올바르게 가져올 수 있게 된다.

```js
// webpack.config.js
module.exports = {
  module: {
    rules: [
      {
        test: /\.js$/,
        type: "javascript/auto",
      },
    ],
  },
};
```

`@ui` 패키지의 `"type": "module"`을 제거하는 방법도 있었지만, 그 선택은 하지 않았다.  
`"type": "module"`은 패키지가 ESM 기반임을 선언하는 올바른 설정이다. 이 에러 하나를 없애기 위해 패키지의 성격 자체를 바꾸는 건 적절한 해결책이 아니었다.

또 다른 방법으로, `@ui` 패키지를 빌드할 때 `lottie-react`를 external로 남기지 않고 번들에 포함시키는 방법도 있었다.  
위에서 언급한 대로 `@ui` 패키지는 번들링 시 `lottie-react`를 포함한 모든 의존성을 제거했다.
하지만 `lottie-react`를 포함해서 번들링하면, 빌드 파일에서 정상적으로 `default`를 바라보도록 코드가 생성되는 것을 확인할 수 있었다.

처음에는 이 현상이 이상하다고 생각했지만 webpack 코드를 보면 이유를 알 수 있었는데, 간단하게 설명하면 확장자 때문이다.

하지만 이 방법도 문제의 원인을 회피하는 방식인 것 같아 선택하지 않았다.

<details class="border border-gray-200 rounded-xl px-6 py-5 my-4">
<summary><b>lottie-react를 포함해서 빌드하면 정상 동작하는 이유</b></summary>

webpack `defaults.js`의 모듈 타입 규칙을 다시 보면,

```js
// lib/config/defaults.js
{
  test: /\.js$/i,
  descriptionData: { type: "module" },
  type: "javascript/esm",
}
```

`@ui` 빌드 시에는 확장자가 `.tsx`이고, app에서 번들링할 때는 빌드된 `.js` 파일을 읽는다.
이 규칙은 `.js` 확장자에만 적용된다. `@ui`의 소스 파일은 `.tsx`이므로 이 규칙에 매칭되지 않는다.

매칭되는 규칙이 없으면 webpack은 기본 모듈 타입인 `javascript/auto`를 적용한다.

</details>

## 마무리

번들러와 모듈 시스템을 어느 정도 다뤄보면서, 모듈 시스템에 대한 이해가 있다고 생각했다.

하지만 이번 에러를 마주하면서, ESM에서 CJS 모듈을 불러올 때 또는 그 반대 상황에서의 번들러 interop 처리에 대한 이해가 부족했다는 것을 깨달았다.

그래서 번들러와 모듈 시스템의 개념부터, webpack, Vite, Rollup 각 번들러가 어떤 방식으로 interop을 구현했는지 디테일하게 정리해보는 시리즈를 작성해보고자 한다.
