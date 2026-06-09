---
title: "Micro-frontend - Module Federation (0)"
date: "2026-06-01"
excerpt: ""
tags: ["Frontend", "Micro-frontend", "Module Federation"]
---

[이전 글](https://yun0.dev/posts/2026-02-18-webpack-esm-cjs-interop)에서 잠시 설명한 것처럼, 현재 회사에서 업주향 관리자 페이지의 도메인 분리 작업을 진행하고 있습니다.

도메인 분리는 장기적으로 Micro-frontend를 도입해, 여러 조직이 업주향 관리자 페이지를 독립적으로 유지보수할 수 있게 하기 위한 사전 작업이었습니다.

최근 사내에서 AI Native의 중요도가 올라가면서, 기능조직으로 나뉘어 있던 프론트엔드 조직을 목적조직으로 분리하려 하고 있고, 그에 따라 Micro-frontend 도입 우선순위도 올라갔습니다.

그래서 관리자 페이지에 Module Federation 기반 Micro-frontend를 도입하게 됐고, 그 과정에서 알게 된 것들을 정리하고자 합니다.

---

## 0. Micro-frontend

Micro-frontend 아키텍쳐는 2016년 11월 [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar/techniques/micro-frontends)에 소개됐고, 2019년 [Cam Jackson의 글](https://martinfowler.com/articles/micro-frontends.html)을 기점으로 알려졌습니다.

이 글에서 백엔드는 마이크로서비스로 잘게 나눠 팀마다 따로 배포하는데, 정작 그 위에 얹히는 프론트엔드는 SPA 하나로 점점 비대해지면서 생기는 문제점을 지적합니다.  
 여러 팀이 한 코드베이스에서 작업하다보면 빌드는 느려지고, 배포는 서로 묶이고, 누가 어디를 책임지는지도 흐려집니다. ThoughtWorks는 이런 상태를 두고 마이크로서비스로 얻은 이점을 프론트엔드가 다시 깎아먹는다고 표현하고 있습니다.

Micro-frontend는 이런 문제점을 해결하기 위해서 백엔드를 쪼갠 것처럼 프론트엔드도 독립적으로 배포할 수 있는 조각으로 나누자고 제안합니다.  
화면 하나를 여러 프론트엔드 앱으로 쪼갠 뒤 다시 합쳐, 사용자에게는 한 앱처럼 보이게 합니다.

그런데 핵심은 코드를 쪼개는 것보다 팀의 소유권입니다. [Michael Geers](https://micro-frontends.org/)는 웹앱을 "독립된 팀이 소유하는 기능들의 조합"으로 보자고 말합니다. 각 팀이 데이터부터 UI까지 한 도메인을 끝까지(end-to-end) 책임지는 구조입니다.

Micro-frontend는 하나의 아키텍쳐인만큼 이를 구현할 수 있는 다양한 기법이 존재합니다.

## 1. 왜 Micro-frontend, 그리고 왜 Module Federation인가

### 왜 Micro-frontend인가

Micro-frontend를 도입하려는 이유는 기술보다 조직의 변화에 있었습니다.

지금 회사는 B2B와 B2C 조직으로 나뉘어 있습니다. 그러다 보니 매장 정보에 값 하나를 추가한다고 했을 때, B2C가 B2B에 개발을 요청하고, 양쪽이 각자 작업한 뒤 배포일을 맞춰 함께 내보내야 합니다.  
변경 하나에 여러 조직이 묶이는 구조라, 빠르게 배포하고 고치기 어렵습니다.

그래서 회사는 기능 중심 조직에서 목적(도메인) 중심 조직으로 옮겨가려고 하고 있습니다.  
매장(전시)·리뷰·결제/혜택·정산처럼 도메인을 나누고, 각 조직이 기획부터 배포·모니터링까지 직접 맡는 구조입니다.

여기에 AI도 영향을 주었습니다.  
개인의 생산성은 분명히 빨라졌지만, 정작 조직은 그만큼 빨라지지 않았습니다.  
코드를 짜는 시간보다 조직 사이의 조율이 병목이었기 때문입니다. 결국 이 병목을 풀려면 경계를 나눠 각 팀이 독립적으로 움직일 수 있어야 했습니다.

그리고 각각의 목적조직의 변경사항들로 다른 조직의 문제를 발생시키면 안됩니다.
그래서 결국 필요한 건 프론트엔드의 독립성이었고, 아래 4가지의 독립성을 보장하기 위해서 Micro-frontend를 도입하게 되었습니다.

- **코드 독립성**: 앱을 각각 독립적으로 빌드할 수 있는가
- **배포 독립성**: 앱 별로 따로 배포할 수 있는가
- **런타임 독립성**: 한 앱의 장애가 다른 영역으로 번지지 않는가
- **팀 독립성**: 다른 팀을 기다리지 않고 결정·배포할 수 있는가

### 왜 Module Federation인가

Micro-frontend를 구현하는 방법은 여러 가지인데, 모듈을 언제 합치느냐(통합 시점)와 따로 배포할 수 있느냐로 갈립니다.

| 방법              | 통합 시점 | 독립 배포 | 비고                                  |
| ----------------- | --------- | --------- | ------------------------------------- |
| npm 패키지        | 빌드 타임 | ✗         | 지금 우리 방식                        |
| iframe            | 런타임    | ✓         | 격리는 확실, UX·성능·상태 공유가 단점 |
| Web Components    | 런타임    | ✓         | 표준 기반, 타입·상태 공유가 복잡      |
| Module Federation | 런타임    | ✓         | 공유 의존성 + 타입 공유까지           |

빌드 타임에 합치는 npm 패키지는 결국 함께 빌드해야 해서 독립 배포가 불가능합니다.
반면 런타임에 합치는 방식은 모듈을 따로 빌드/배포해서 브라우저에서 실행 시점에 합치기 때문에 독립 배포가 가능합니다.

다만 같은 런타임 통합이라도 iframe은 격리는 확실하지만 UX/상태공유가 어렵다는 문제가 있습니다,
Web Components는 표준 기반이지만 아직까지는 성숙하지 않아서 많은 문제가 있습니다.

현재 상황에서 위에서 언급했던 독립성을 챙기면서도, 기존의 사용성을 유지하려면 Module Federation이 가장 좋은 선택이었습니다.

### Module Federation 2.0

Module Federation을 도입하면서 버전의 대한 고민도 있었습니다.

결과적으로 2.0을 선택했고, 그 이유는 번들러 독립성입니다.  
현재 회사에서 B2B(관리자)는 webpack을 사용하고, B2C는 vite를 사용합니다.

기존 Webpack에서만 지원했던 1.0과 달리 2.0은 런타임을 빌드 도구에서 분리했습니다.  
런타임 코어를 `@module-federation/runtime`·`runtime-core`라는 공용 패키지로 빼고, 번들러는 거기에 바인딩만 제공합니다.  
공식 발표에서도 [_"This version decouples the Runtime from build tools"_](https://module-federation.io/blog/announcement)라고 나와있습니다.

## 2. Module Federation

### 등장 배경

Module Federation은 webpack 코어 메인테이너인 Zack Jackson이 [CityJS Conf 2020 발표](https://www.youtube.com/watch?v=-ei6RqZilYI)에서 공개했습니다.

Zack Jackson이 말한 기존의 문제는, 독립적으로 만든 앱끼리 코드를 공유하기가 어렵다는 점이었습니다. 그때까지 쓰던 방법들은 각각 단점이 있었습니다.

- **NPM 패키지**: 공통 코드를 패키지로 떼어 설치해 씁니다. 패키지를 고치면 새 버전을 올리고, 쓰는 앱이 다시 빌드·배포해야 반영됩니다. 공유 코드가 늘수록 버전을 맞추기가 번거롭습니다.
- **Externals**: 라이브러리를 번들에 넣지 않고 실행 시점에 전역(`window.React` 등)에서 가져오게 하는 방식입니다. 그 전역 파일이 없으면 앱이 통째로 죽고(SPOF), 대신 쓸 폴백도 없습니다. 게다가 전부 미리 불러와야 해서, 필요할 때만 가져오는 온디맨드 로딩도 안 됩니다.
- **DLL Plugin**: 자주 안 바뀌는 라이브러리를 미리 빌드해두고 재활용해 빌드 속도를 줄입니다. 대신 무엇을 묶을지 매니페스트를 직접 관리해야 하고, 무엇을 공유할지가 빌드 타임에 정해집니다.
- **Native ESM**: 빌드 단계의 연결이 필요 없다는 장점이 있지만, 빌드 과정이 없는 만큼 트리 셰이킹이 안 되고 JS가 아닌 스타일·자산을 다루기 어렵습니다.

이런 문제를 해결하려고, 독립적으로 빌드된 여러 앱이 런타임에 서로 모듈을 공유하도록 설계한 것이 Module Federation입니다.

이처럼 Module Federation는 독립적인 앱간의 모듈을 공유하는 것에서 출발했기에 Micro-frontend와 상응하는 개념은 아니지만,  
여러 모듈/앱을 런타임상에서 합치기 때문에 모듈별로 독립적인 배포가 가능하다는 점에서 Micro-frontend 구현의 하나로 볼 수 있습니다.

### 핵심 용어

> [Module Federation 2.0 공식 용어집](https://module-federation.io/guide/start/glossary)을 기준으로 정리했습니다.

- **Producer**: `exposes`로 모듈을 내보내는 쪽. 흔히 Remote라고 부릅니다.
- **Consumer**: `remotes`로 다른 Producer의 모듈을 가져다 쓰는 쪽. 흔히 Host라고 부릅니다.
- **Shared (Share Scope)**: 여러 앱이 런타임에 공유하는 의존성의 범위입니다. `react`를 `shared`로 등록하면 Producer와 Consumer가 같은 인스턴스를 쓰게 할 수 있습니다.

### 의존성 공유 (Share Scope)

Module Federation은 공유 의존성을 빌드 타임에 고정하지 않고 런타임에 정합니다.  
여러 앱이 서로 다른 패치 버전의 `react`를 요구해도, 실행 직전에 SemVer를 따져 하나를 골라 다 같이 쓰도록 맞춰 줍니다.  
한쪽에 의존성이 빠져 있으면 다른 앱이 올려둔 것을 대신 받아오는 `self-healing`도 지원합니다.

앞서 본 npm 패키지나 DLL Plugin과 갈리는 지점이 바로 여기입니다.

이 둘은 무엇을 어느 버전으로 공유할지가 빌드 타임에 고정됩니다.  
그래서 한 번 빌드하고 나면, 나중에 다른 앱과 합쳐졌을 때 버전이 어긋나도 손쓸 도리가 없고, 버전을 맞추려면 앱을 통째로 다시 빌드/배포하는 수밖에 없습니다.  
반면 Module Federation은 빌드 시점엔 공유 라이브러리라고 선언만 해 두고, 어떤 인스턴스를 사용할지는 런타임상에서 결정합니다.

조금 더 설명하자면, 각 앱은 부팅할 때 자기가 제공하는 `version`과 받아들일 수 있는 범위 `requiredVersion`(둘 다 보통 `package.json`에서 옵니다)을 share scope에 등록(register)합니다.

실행 시점의 scope는 대략 이런 데이터입니다.

```js
{
  react: {
    "18.2.0": { from: "host",  get: () => /* host의 react 청크 */, loaded: false },
    "18.3.1": { from: "app_b", get: () => /* app_b의 react 청크 */, loaded: false },
  },
}
```

`react`처럼 `singleton`으로 둔 의존성은 이 중 하나만 골라 모두가 같은 인스턴스를 씁니다. (singleton으로 설정하는 이유는 버전이 갈리면 Hooks·Context가 깨지기 때문입니다)

고르는 규칙은 호환되는 가장 높은 버전입니다. 이미 로드된 버전이 있으면 중복 로드를 피하려 그쪽을 먼저 씁니다. 위 예시에서 host·app_b가 모두 `^18.0.0`을 요구하면 더 높은 `18.3.1`로 통일되고, host도 자기 `18.2.0` 대신 그걸 씁니다.

실제 런타임도 [`findVersion`](https://github.com/module-federation/core/blob/main/packages/runtime-core/src/utils/share.ts)이 `versionLt`로 가장 높은 버전을 고른 뒤, [`getRegisteredShare`](https://github.com/module-federation/core/blob/main/packages/runtime-core/src/utils/share.ts)가 `satisfy(version, requiredVersion)`으로 범위를 검증하는 방식입니다.

`self-healing`은 이렇게 모두가 자기 버전을 등록해두기에 가능합니다.

[공식 self-healing 예제](https://github.com/module-federation/module-federation-examples/tree/master/self-healing)에서는 host가 `styled-components`를 `shared`에 넣지 않고 remote만 넣는데, host가 그 의존성을 찾을 때 scope에 remote가 올려둔 것을 대신 가져와(네트워크로 remote에서 받음) 정상 렌더합니다. 한쪽이 빠뜨려도 다른 앱 것으로 메꿔 크래시를 피할 수 있습니다.

이 공유가 일어나는 범위가 Share Scope입니다.  
scope를 여러 개 둘 수 있어, 레거시용과 최신용을 나누면 점진적인 레거시 마이그레이션에서도 활용할 수 있습니다.

#### 동기 import와 bootstrap

하지만 여기서 한 가지 타이밍 문제가 생깁니다.  
위에서 본 버전 협상은 `react` 청크를 네트워크로 받아온 뒤에야 끝나므로 share scope를 채우는 일은 비동기로 동작합니다.

```js
import React from "react";
```

webpack은 이 `import`를 `__webpack_require__(react)`로 컴파일합니다.  
`__webpack_require__`은 webpack이 번들에 심는 모듈 로더 함수입니다.

모듈 id를 받아, 캐시에 있으면 그 `exports`를 바로 돌려주고, 없으면 모듈 팩토리(`__webpack_modules__[id]`)를 그 자리에서 실행해 `module.exports`를 반환합니다. ([`JavascriptModulesPlugin.js`](https://github.com/webpack/webpack/blob/main/lib/javascript/JavascriptModulesPlugin.js#L1728-L1864)).

```js
// 생성된 webpack 런타임 (요약)
function __webpack_require__(moduleId) {
  var cached = __webpack_module_cache__[moduleId];
  if (cached !== undefined) return cached.exports;
  var module = (__webpack_module_cache__[moduleId] = { exports: {} });
  __webpack_modules__[moduleId](module, module.exports, __webpack_require__); // 모듈을 동기로 실행
  return module.exports;
}
```

그리고 웹팩은 청크를 불러올 때 HTML에 `<script src="[chunk-file].js">` 코드를 심는 방식으로 불러옵니다.

이 때 `async`/`defer`가 없는 클래식 `<script>`는 브라우저가 만나는 즉시 파싱을 멈추고, 그 스크립트를 바로 실행합니다(중간에 다른 작업이 끼어들지 못합니다). ([MDN `<script>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script), [HTML Standard](https://html.spec.whatwg.org/multipage/scripting.html#the-script-element)).

문제는 여기서 발생합니다.  
공유 모듈 로딩은 비동기인데 진입점은 동기로 실행되면서, 아직 비어 있는 scope에서 React를 꺼내려다 터지는 아래와 같은 에러가 발생합니다.

```
Invalid loadShareSync function call from runtime #RUNTIME-006
```

이 문제를 푸는 방법을 [Module Federation 공식 문서](https://module-federation.io/guide/troubleshooting/runtime)는 이렇게 설명합니다.

> After **Shared** is set, the corresponding dependent library will be determined to be an asynchronous module. If the **asynchronous entry** is not enabled and `eager: true` is not set, then this error will occur.
> Just choose one of the two: 1. Enable asynchronous entry 2. Set shared `eager: true`.

정리하면, `shared`로 등록한 의존성은 비동기 모듈로 취급되니, 비동기 엔트리(asynchronous entry)를 켜거나 `eager: true`로 두지 않으면 에러가 납니다.  
webpack Docs에도 [_asynchronous boundary_](https://webpack.js.org/concepts/module-federation/)(비동기 경계)라는 명칭으로 이에대한 설명이 나와있습니다.

이 비동기 엔트리를 사용하는 방법이 bootstrap 패턴입니다.  
공유 모듈을 쓰는 코드를 비동기 경계 뒤로 미루는 것으로, 진입점(`index.js`)에는 `import('./bootstrap')` 한 줄만 두고 실제 앱 코드(`import React` 포함)는 `bootstrap.js`로 옮깁니다.

dynamic import 를 사용해 비동기 경계를 만들어, `bootstrap.js`는 share scope가 준비된 뒤에 실행하도록 하는 것입니다.

```js
// index.js
import("./bootstrap");
```

```js
// bootstrap.js — 실제 앱 코드
import React from "react";
// ...
```

그런데 `import('./bootstrap')`가 어떻게 shared scope이 준비된 뒤에 bootstrap 실행을 보장할까요?

간단히 말하면, react와 같은 shared 의존성 로딩을 bootstrap 청크의 사전 작업으로 끼워 넣기 때문입니다.  
`import('./bootstrap')`은 아래와 같이 컴파일됩니다.

```js
__webpack_require__
  .e("bootstrap")
  .then(__webpack_require__.bind(__webpack_require__, "./bootstrap"));

// 생성된 webpack 런타임 (요약)
// f 에는 청크 로딩 단계별 핸들러가 담긴다 (예: j=JS 청크 로드(JSONP), consumes=공유 모듈 로드, remotes=remote 로드)
__webpack_require__.f = {};
__webpack_require__.e = (chunkId) =>
  Promise.all(
    Object.keys(__webpack_require__.f).reduce((promises, key) => {
      __webpack_require__.f[key](chunkId, promises); // 각 핸들러가 필요한 promise를 밀어넣음
      return promises;
    }, []),
  );
```

`__webpack_require__.e`는 그 청크를 불러올 때 필요한 핸들러(`f.*`)를 모두 호출해, 각자가 만든 promise를 `Promise.all`로 함께 기다립니다.

이 핸들러 중 공유 의존성을 맡는 `consumes`를 등록하는 게 Module Federation입니다. MF 2.0(`@module-federation/enhanced`)은 이 핸들러를 직접 구현하지 않고, 실제 로직은 런타임(`@module-federation/webpack-bundler-runtime`)으로 위임하는 형태로 생성합니다([`ConsumeSharedRuntimeModule.ts`](https://github.com/module-federation/core/blob/8a37a93851044bfb2af87d76e7d346c22ae08f51/packages/enhanced/src/lib/sharing/ConsumeSharedRuntimeModule.ts#L131-L183)).

```js
// @module-federation/enhanced 가 생성하는 f.consumes (요약)
__webpack_require__.f.consumes = (chunkId, promises) => {
  __webpack_require__.federation.bundlerRuntime.consumes({
    chunkId,
    promises,
    chunkMapping, // { bootstrap: ["webpack/sharing/consume/default/react/react"] }
    moduleToHandlerMapping, // 공유 모듈 id → { shareKey: "react", shareInfo(버전·singleton 등) }
    installedModules,
    webpackRequire: __webpack_require__,
  });
};
```

위임받은 `bundlerRuntime.consumes`는 그 청크가 소비하는 공유 모듈마다 `loadShare("react")`를 호출해 share scope에서 알맞은 버전을 해석/로드하고, 그 promise를 반환해 Promise.all에 들어가게됩니다.([`consumes.ts`](https://github.com/module-federation/core/blob/8a37a93851044bfb2af87d76e7d346c22ae08f51/packages/webpack-bundler-runtime/src/consumes.ts#L8-L118)).

bootstrap 청크가 react를 소비한다는 걸 webpack이 빌드 타임에 이미 알기 때문에, 가능한 동직입니다.  
그래서 `e("bootstrap")`을 수행했을 때 공유 모듈이 다 로드된 이후에 bootstrap 코드가 실행되게 되고 결과적으로 정상적으로 실행됩니다.

> `shared: { react: { eager: true } }`로 React를 초기 번들에 미리 동기 등록하면 경계 없이도 동작은 합니다. 다만 그만큼 초기 번들이 무거워지고, "필요할 때만 받아오는" 공유의 이점을 잃습니다.

### ModuleFederationPlugin 플러그인 동작 흐름

Module Federation을 사용하면, ModuleFederationPlugin을 통해 `expose` / `remote` / `shared`를 설정하고,  
다른 모듈을 불러 올 수 있습니다.

ModuleFederationPlugin의 간단한 동작 흐름을 정리해보겠습니다.

`ModuleFederationPlugin`은 설정(`exposes`/`remotes`/`shared`)에 따라 필요한 하위 플러그인을 골라 추가해주는 역할을 합니다.

webpack의 `afterPlugins` 훅에서 아래와 같은 코드를 보면 알 수 있습니다. (실제 코드: [`ModuleFederationPlugin.ts`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/container/ModuleFederationPlugin.ts#L225)).

```js
// @module-federation/enhanced — ModuleFederationPlugin (요약)
compiler.hooks.afterPlugins.tap("ModuleFederationPlugin", () => {
  if (exposes)
    new ContainerPlugin({ name, filename, exposes, shareScope }).apply(
      compiler,
    );
  if (remotes)
    new ContainerReferencePlugin({ remoteType, remotes, shareScope }).apply(
      compiler,
    );
  if (shared) new SharePlugin({ shared, shareScope }).apply(compiler);
});
```

한 앱이 `exposes`, `remotes`, `shared`를 동시에 가질 수 있어서, 세 플러그인이 다 추가되기도 하고 일부만 추가되기도 합니다.  
각각의 플러그인에 대해서 간단하게 정리해보겠습니다.

#### ContainerPlugin — Producer

[`ContainerPlugin`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/container/ContainerPlugin.ts#L152)은 내보내는 쪽을 만듭니다.

`exposes` 경로마다 청크를 만들고, 진입점인 `remoteEntry.js`를 생성합니다.  
그 안에는 어떤 expose가 어떤 청크를 쓰는지 적은 `moduleMap`과, 모듈을 꺼내는 `get`, share scope를 맞추는 `init`이 들어갑니다.

```js
// remoteEntry.js (요약)
const moduleMap = {
  "./Panel": () => __webpack_require__.e(chunkId).then(/* ... */),
};
const get = (name) => moduleMap[name](); // 모듈 꺼내기
const init = (shareScope) => {
  /* 공유 의존성 맞춤 */
};
```

#### ContainerReferencePlugin — Consumer

[`ContainerReferencePlugin`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/container/ContainerReferencePlugin.ts#L59)은 가져다 쓰는 쪽을 만듭니다.

`import Panel from "app_b/Panel"` 같은 구문을 external로 처리해 번들에서 빼고, 런타임에 분리된 청크를 가져오게 바꿉니다.  
어느 청크가 어느 remote의 어느 expose인지는 `idToExternalAndNameMapping`에 적어둡니다.

```js
// host 산출물 (요약)
const idToExternalAndNameMapping = { 180: ["default", "./Panel", 681] };
__webpack_require__.f.remotes = (chunkId, promises) => {
  /* remote 청크 로드 */
};
```

#### SharePlugin — Shared Scope

[`SharePlugin`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/sharing/SharePlugin.ts#L134)은 안에서 [`ProvideSharedPlugin`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/sharing/ProvideSharedPlugin.ts#L136)과 [`ConsumeSharedPlugin`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/sharing/ConsumeSharedPlugin.ts#L457)을 붙입니다.

`shared` 의존성을 독립 청크로 빼고, `node_modules` 대신 share scope를 보게 만듭니다.  
각 앱이 자기 버전을 scope에 등록(provide)하고, 쓸 때는 scope에서 꺼냅니다(consume). 호환되는 버전이 없으면 함께 번들된 fallback 청크를 씁니다.

```js
register("react", "18.2.0", () => /* react 청크 */); // provide
__webpack_require__.f.consumes = (chunkId, promises) => {/* scope에서 꺼냄 */};
```

Module Federation에서 다른 모듈(청크)를 어떻게 불러오는지 디테일한 설명은 다음 글에서 다뤄보도록 하겠습니다.
