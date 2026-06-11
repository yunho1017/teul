---
title: "Module Federation (2) - 빌드 결과물로 확인 해보는 Module Federation 청크 로딩 방식"
date: "2026-06-09"
excerpt: "Consumer·Producer·둘 다인 앱 세 개를 직접 빌드해, 런타임에서 청크를 불러오는 흐름을 정리합니다."
tags: ["Frontend", "Micro-frontend", "Module Federation"]
---

[이전 글](/posts/2026-06-01-module-federation-intro)에서는 Micro-frontend와 Module Federation의 배경과 개념, 그리고 동작 방식을 간단히 정리했습니다.

이번 글에서는 실제로 예제 앱 세 개를 만들어 빌드하고,  
빌드 결과물을 따라가며 따로 빌드된 청크가 런타임에서 어떻게 합쳐지는지 확인해보겠습니다.

---

# 1. 청크(Chunk) 란?

본격적으로 들어가기 전에, 청크에 대해서 간단히 짚고 가겠습니다.

청크는 webpack에서 굳어진 개념입니다.  
webpack은 파일 하나하나를 모듈로 보고, 이 모듈들을 묶어 몇 개의 출력 파일로 내보내는데, 이 출력 파일 단위가 청크입니다.

<div class="mx-auto my-6 max-w-[840px] rounded-2xl bg-[#1f2937] p-5 text-slate-300 sm:p-7" role="img" aria-label="왼쪽 모듈 의존성 그래프가 가운데 webpack을 거쳐 오른쪽 entry와 여러 청크 파일로 출력되는 그림">
<div class="flex flex-col items-stretch gap-6 md:flex-row md:items-center md:gap-4">
<div class="md:flex-1 md:min-w-0">
<div class="font-mono text-[12.5px] leading-relaxed">
<div class="py-0.5"><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">index.js</span></div>
<div class="ml-3 border-l border-slate-600/70 pl-3">
<div class="py-0.5"><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">App.jsx</span></div>
<div class="ml-3 border-l border-slate-600/70 pl-3">
<div class="flex flex-wrap items-center gap-1.5 py-0.5"><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">Button.tsx</span><span class="text-slate-500">→</span><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">styles.css</span></div>
<div class="flex flex-wrap items-center gap-1.5 py-0.5"><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">hooks.ts</span><span class="text-slate-500">→</span><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">dayjs</span></div>
</div>
</div>
<div class="mt-1.5 flex flex-wrap items-center gap-1.5 py-0.5"><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">utils.ts</span><span class="text-slate-500">→</span><span class="inline-flex items-center rounded-md border border-slate-600 bg-[#111827] px-2.5 py-[5px] text-slate-300">hooks.ts</span></div>
</div>
<div class="mt-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">MODULES · 의존성 그래프</div>
</div>
<div class="flex justify-center text-slate-500"><span class="hidden h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-current md:block"></span><span class="h-0 w-0 border-x-[7px] border-t-[10px] border-x-transparent border-t-current md:hidden"></span></div>
<div class="flex shrink-0 flex-col items-center">
<div class="relative" style="width:118px;height:118px;clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:#e6edf3">
<div class="absolute inset-[2px]" style="clip-path:polygon(50% 0,100% 25%,100% 75%,50% 100%,0 75%,0 25%);background:conic-gradient(from 0deg,#8ed6fb 0deg 63.43deg,#1c5f8f 63.43deg 180deg,#1a78bf 180deg 296.57deg,#8ed6fb 296.57deg 360deg)"></div>
</div>
<div class="mt-3 text-[13px] font-bold tracking-wide text-[#93c5fd]">webpack</div>
</div>
<div class="flex justify-center text-slate-500"><span class="hidden h-0 w-0 border-y-[7px] border-l-[10px] border-y-transparent border-l-current md:block"></span><span class="h-0 w-0 border-x-[7px] border-t-[10px] border-x-transparent border-t-current md:hidden"></span></div>
<div class="md:flex-1 md:min-w-0">
<div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
<div class="relative rounded-lg border border-[#60a5fa] bg-[#60a5fa]/[0.13] px-3.5 py-2.5"><div class="font-mono text-[13px] font-bold text-[#60a5fa]">main.js</div><div class="text-[11px] text-slate-400">앱 코드</div><span class="absolute right-2.5 top-2.5 rounded-full bg-[#fbbf24] px-2 py-0.5 text-[10px] font-bold text-[#0b1220]">entry</span></div>
<div class="rounded-lg border border-slate-400 bg-slate-400/10 px-3.5 py-2.5"><div class="font-mono text-[13px] font-bold text-slate-400">vendors.js</div><div class="text-[11px] text-slate-400">라이브러리</div></div>
<div class="rounded-lg border border-slate-400 bg-slate-400/10 px-3.5 py-2.5"><div class="font-mono text-[13px] font-bold text-slate-400">854.js</div></div>
<div class="rounded-lg border border-slate-400 bg-slate-400/10 px-3.5 py-2.5"><div class="font-mono text-[13px] font-bold text-slate-400">605.js</div><div class="text-[11px] text-slate-400">공통 청크</div></div>
</div>
<div class="mt-4 text-center text-[11px] font-bold uppercase tracking-wider text-slate-500">OUTPUT · entry + 청크</div>
</div>
</div>
</div>

번들러는 본래 브라우저에 모듈 시스템이 없던 시절, 여러 모듈을 하나의 파일로 합쳐 브라우저에서 실행할 수 있게 하려고 등장했습니다.

하지만 프론트엔드 제품이 갈수록 커지고 복잡해졌기 때문에, 하나의 파일로 만드는 것은 여러 문제가 있습니다.  
모든 의존성이 한 파일에 들어가면 초기에 내려받아야 할 JS가 비대해져 초기 로딩이 느려지고, 코드를 한 줄만 고쳐도 파일 해시가 통째로 바뀌어 브라우저 캐시를 재사용하지 못합니다.

그래서 webpack은 무작정 한 파일로 묶지 않고, 적절한 단위의 청크로 나눠서 번들링합니다.  
큰 덩어리를 통째로 받는 대신 모듈을 청크로 나눠두고, 그 청크가 필요해지는 시점에 해당 js 파일을 불러옵니다.  
webpack에서 청크를 나누는 방법은 크게 두 가지입니다.

- **`optimization.splitChunks`**: splitChunks 옵션을 활용해 여러 곳에서 공통으로 쓰는 모듈이나 `node_modules`의 라이브러리를 별도 청크로 빼냅니다(vendor 분리 등).
- **동적 `import()`**: `import("./a.js")`처럼 쓰면 webpack이 그 지점을 분리 지점으로 삼아 `a.js`를 별도의 비동기 청크로 만들고, 호출되는 시점에 로드합니다.

흔히 쓰는 `React.lazy`도 결국 이 동적 `import()` 위에서 동작합니다.

그리고 Module Federation 역시 이 동적 import을 활용해, 따로 청크로 분리·빌드된 앱들을 런타임에 필요한 시점에 불러옵니다.

# 2. 예제를 통한 실제 청크가 불러와지는 흐름

아래와 같은 구조의 3가지 앱을 준비했습니다.

<div class="mx-auto my-6 max-w-[560px] rounded-[18px] border border-gray-200 bg-white p-6" role="img" aria-label="app_a는 순수 Consumer로 app_b를 소비하고, app_b는 Consumer이자 Producer로 app_c를 소비하며 Panel을 expose하고, app_c는 순수 Producer로 Widget을 expose하는 위에서 아래로의 구조">
<div class="relative flex items-center min-h-[92px] rounded-2xl border border-gray-300 bg-white px-6 py-4"><span class="absolute left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-500">A</span><div class="flex-1 text-center"><div class="font-mono text-lg font-bold text-gray-900 mb-2">app_a</div><div class="flex justify-center gap-2 mb-1.5"><span class="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[13px] font-semibold text-blue-700">Consumer</span></div><div class="text-[13px] text-gray-500">B 를 소비</div></div></div>
<div class="relative flex flex-col items-center py-1"><div class="h-6 w-0.5 bg-gray-400"></div><div class="h-0 w-0 border-solid border-x-[5px] border-x-transparent border-t-[7px] border-t-gray-400"></div><span class="absolute top-2 left-1/2 ml-3 font-mono text-xs text-gray-400 whitespace-nowrap">import("app_b/Panel")</span></div>
<div class="relative flex items-center min-h-[92px] rounded-2xl border border-gray-300 bg-white px-6 py-4"><span class="absolute left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-500">B</span><div class="flex-1 text-center"><div class="font-mono text-lg font-bold text-gray-900 mb-2">app_b</div><div class="flex justify-center gap-2 mb-1.5"><span class="rounded-full border border-blue-200 bg-blue-50 px-3.5 py-1 text-[13px] font-semibold text-blue-700">Consumer</span><span class="rounded-full border border-green-200 bg-green-50 px-3.5 py-1 text-[13px] font-semibold text-green-700">Producer</span></div><div class="text-[13px] text-gray-500">C 를 소비 · Panel 을 expose</div></div></div>
<div class="relative flex flex-col items-center py-1"><div class="h-6 w-0.5 bg-gray-400"></div><div class="h-0 w-0 border-solid border-x-[5px] border-x-transparent border-t-[7px] border-t-gray-400"></div><span class="absolute top-2 left-1/2 ml-3 font-mono text-xs text-gray-400 whitespace-nowrap">import("app_c/Widget")</span></div>
<div class="relative flex items-center min-h-[92px] rounded-2xl border border-gray-300 bg-white px-6 py-4"><span class="absolute left-4 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 bg-gray-100 text-sm font-bold text-gray-500">C</span><div class="flex-1 text-center"><div class="font-mono text-lg font-bold text-gray-900 mb-2">app_c</div><div class="flex justify-center gap-2 mb-1.5"><span class="rounded-full border border-green-200 bg-green-50 px-3.5 py-1 text-[13px] font-semibold text-green-700">Producer</span></div><div class="text-[13px] text-gray-500">Widget 을 expose</div></div></div>
</div>

각 앱의 Module Federation 설정은 아래와 같습니다.

```js
// A — 순수 Consumer
new ModuleFederationPlugin({
  name: "app_a",
  remotes: { app_b: "app_b@http://localhost:3002/remoteEntry.js" },
  shared: { react: { singleton: true, requiredVersion: false } },
});

// B — Consumer 이자 Producer (omnidirectional)
new ModuleFederationPlugin({
  name: "app_b",
  filename: "remoteEntry.js",
  exposes: { "./Panel": "./src/Panel.js" },
  remotes: { app_c: "app_c@http://localhost:3003/remoteEntry.js" },
  shared: { react: { singleton: true, requiredVersion: false } },
});

// C — 순수 Producer
new ModuleFederationPlugin({
  name: "app_c",
  filename: "remoteEntry.js",
  exposes: { "./Widget": "./src/Widget.js" },
  shared: { react: { singleton: true, requiredVersion: false } },
});
```

> 빌드 결과물을 읽기 좋게 보려고 `optimization: { minimize: false }` 로 빌드했습니다.  
> 아래 코드는 실제 빌드 결과에서 가져온 것입니다.

## 빌드 결과물

각각 앱을 빌드하면 아래와 같은 형태로 `dist` 폴더가 만들어집니다.

<div class="mx-auto my-6 max-w-[640px] overflow-x-auto rounded-lg border border-gray-700 bg-[#1f2937] p-3 font-mono text-[13px] leading-relaxed text-gray-200">
<div class="flex items-center gap-1.5 px-1 py-1"><svg viewBox="0 0 16 16" class="h-3.5 w-3.5 shrink-0 text-gray-500"><path fill="currentColor" d="M5 6l3 3 3-3z"></path></svg><svg viewBox="0 0 16 16" class="h-4 w-4 shrink-0 text-sky-300"><path fill="currentColor" d="M1.5 3h4l1.2 1.4H14a.5.5 0 0 1 .5.5V12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V3.5A.5.5 0 0 1 1.5 3z"></path></svg><span class="font-semibold text-gray-100">app_c/dist/</span><span class="ml-auto pl-4 text-[11px] text-gray-500">App C · 순수 Producer</span></div>
<div class="ml-[15px] border-l border-gray-600/60 pl-3">
<div class="flex items-center gap-2 py-1"><span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-yellow-400/90 text-[8px] font-bold text-gray-900">JS</span><span class="text-gray-200">remoteEntry.js</span><span class="ml-auto whitespace-nowrap pl-6 text-[12px] text-gray-500"># 컨테이너 진입점 (get / init)</span></div>
<div class="flex items-center gap-2 py-1"><span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-sky-400/90 text-[9px] font-bold text-gray-900">{}</span><span class="text-gray-200">mf-manifest.json</span><span class="ml-auto whitespace-nowrap pl-6 text-[12px] text-gray-500"># 컨테이너를 기술하는 매니페스트</span></div>
<div class="flex items-center gap-2 py-1"><span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-sky-400/90 text-[9px] font-bold text-gray-900">{}</span><span class="text-gray-200">mf-stats.json</span><span class="ml-auto whitespace-nowrap pl-6 text-[12px] text-gray-500"># 매니페스트의 상세(stats) 버전</span></div>
<div class="flex items-center gap-2 py-1"><span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-yellow-400/90 text-[8px] font-bold text-gray-900">JS</span><span class="text-gray-200">main.js</span><span class="ml-auto whitespace-nowrap pl-6 text-[12px] text-gray-500"># C를 단독 실행할 때의 엔트리 번들</span></div>
<div class="flex items-center gap-2 py-1"><span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-yellow-400/90 text-[8px] font-bold text-gray-900">JS</span><span class="text-gray-200">__federation_expose_Widget.js</span><span class="ml-auto whitespace-nowrap pl-6 text-[12px] text-gray-500"># exposes로 내보낸 모듈 청크</span></div>
<div class="flex items-center gap-2 py-1"><span class="inline-flex h-4 w-4 shrink-0 items-center justify-center rounded-[3px] bg-yellow-400/90 text-[8px] font-bold text-gray-900">JS</span><span class="text-gray-200">855.js</span><span class="ml-auto whitespace-nowrap pl-6 text-[12px] text-gray-500"># 공유된 react 청크</span></div>
</div>
</div>

여기서 `mf-manifest.json`을 열어보면 이 앱이 무엇을 내보내고(`exposes`) 공유 의존성은 무엇인지(`shared`) JSON으로 정리되어 있습니다..

특히 B의 매니페스트에는 `exposes`와 `remotes`가 동시에 들어 있습니다.

```json title="app_b/dist/mf-manifest.json"
{
  "name": "app_b",
  "metaData": {
    "pluginVersion": "2.4.0",
    "remoteEntry": { "name": "remoteEntry.js" }
  },
  "exposes": [
    {
      "name": "Panel",
      "path": "./Panel",
      "assets": { "js": { "sync": ["__federation_expose_Panel.js"] } }
    }
  ],
  "remotes": [
    {
      "federationContainerName": "app_c",
      "moduleName": "Widget",
      "alias": "app_c",
      "entry": "http://localhost:3003/remoteEntry.js"
    }
  ],
  "shared": [
    {
      "name": "react",
      "version": "18.2.0",
      "singleton": true,
      "requiredVersion": "^18.2.0"
    }
  ]
}
```

## 청크를 불러오는 세가지 방식

빌드된 파일에서 확인해보면 `__webpack_require__.e` 함수에 chunkId를 넘겨서 청크 파일을 불러오는 것을 확인할 수 있습니다.

`__webpack_require__.e` 구현체는 아래와 같이 `__webpack_require__.f` 에 등록된 핸들러를 순회하면서,  
현재 chunkId에 맞는 핸들러가 처리하게 됩니다(실제 생성 코드: [`EnsureChunkRuntimeModule.js`](https://github.com/webpack/webpack/blob/main/lib/runtime/EnsureChunkRuntimeModule.js)).

```js title="app_a/dist/main.js"
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

Module Federation에서 사용하는 청크 핸들러는 `j`, `remotes`, `consumes` 3가지 종류입니다.

이제 각각의 핸들러를 확인해보면서 언제 해당 핸들러가 불리는지, 그리고 어떤 방식으로 가져오는지 확인해보겠습니다.

### f.j

`f.j`는 webpack이 동적 `import()`를 지원할 때 사용하는 기본 핸들러입니다.

webpack은 번들링 도중 동적 `import()` 한 줄을 만났을 때 파싱과 변환 단계를 거쳐서 아래와 같은 코드로 변경합니다([`ImportDependency.js`](https://github.com/webpack/webpack/blob/main/lib/dependencies/ImportDependency.js)).

```js
// as-is
import("./bootstrap");

// to-be
__webpack_require__
  .e(/* import() */ 854)
  .then(__webpack_require__.bind(__webpack_require__, 854));
```

여기서 결과물을 확인했을 때 `__webpack_require__.e`를 호출하는 것을 확인할 수 있고,  
`__webpack_require__.e`를 통해 `__webpack_require__.f.j` 함수가 호출됩니다.

`__webpack_require__.f.j`의 구현체는 아래와 같습니다([`JsonpChunkLoadingRuntimeModule.js`](https://github.com/webpack/webpack/blob/main/lib/web/JsonpChunkLoadingRuntimeModule.js)).

```js title="app_a/dist/main.js"
var installedChunks = { 792: 0 };

__webpack_require__.f.j = (chunkId, promises) => {
  var installedChunkData = installedChunks[chunkId];
  if (installedChunkData !== 0) {
    if (installedChunkData) {
      // 이미 로딩 중인 경우는 promise를 재사용
      promises.push(installedChunkData[2]);
    } else if (180 != chunkId) {
      // promise 생성 및 청크 Record 에 등록
      var promise = new Promise(
        (resolve, reject) =>
          (installedChunkData = installedChunks[chunkId] = [resolve, reject]),
      );
      promises.push((installedChunkData[2] = promise));

      // 청크 url
      var url = __webpack_require__.p + __webpack_require__.u(chunkId);
      var loadingEnded = (event) => {
        if (installedChunks[chunkId]) {
          installedChunkData = installedChunks[chunkId];
          if (installedChunkData !== 0) installedChunks[chunkId] = undefined;
          if (installedChunkData) {
            // 로드 실패 시 ChunkLoadError 로 reject
            var error = new Error("Loading chunk " + chunkId + " failed.");
            error.name = "ChunkLoadError";
            installedChunkData[1](error); // = reject
          }
        }
      };
      __webpack_require__.l(url, loadingEnded, "chunk-" + chunkId, chunkId);
    } else {
      installedChunks[chunkId] = 0;
    }
  }
};
```

`installedChunks`는 어떤 청크가 이미 로드됐는지 기록해두는 Record입니다.  
해당 값이 `0`이면 아무것도 하지 않는 것을 확인하면 `0`은 이미 설치된 상태라는 것을 알 수 있습니다.

또한 promise를 생성하고 이를 `installedChunkData`에 넣는 코드를 보면 promise를 보고 로딩중인지 판단하는것을 알 수 있습니다.

여기서 신기한 점은 `if (180 != chunkId)`입니다.

`if (180 != chunkId)`에서 `180`은 `import { Panel } from "app_b/Panel"`로 만들어진 remote 청크의 id입니다.  
이 청크는 일반 청크가 아니라 `f.remotes`가 담당하기 때문에 `f.j`에서는 건너뜁니다.  
참고로 `180`은 빌드할 때 정해지는 값이라, 청크 구성이 달라지면 다른 숫자나 `!/^(180|240)$/.test(chunkId)` 같은 형태로 바뀝니다.

그리고 마지막에는 url과 end 콜백을 생성해 `__webpack_require__.l`을 호출하는 것을 확인할 수 있습니다([`LoadScriptRuntimeModule.js`](https://github.com/webpack/webpack/blob/main/lib/runtime/LoadScriptRuntimeModule.js)).

```js title="app_a/dist/main.js"
var inProgress = {};
__webpack_require__.l = (url, done, key, chunkId) => {
  // 같은 url 을 이미 로딩 중이면 콜백만 추가하고 끝 (중복 로드 방지)
  if (inProgress[url]) return inProgress[url].push(done);

  var script = document.createElement("script"); // <script> 생성
  script.src = url; // src = publicPath(.p) + 청크파일명(.u)
  // ... charset / nonce / crossOrigin 등 속성 세팅

  inProgress[url] = [done];
  // 로드가 끝나면(성공/실패·타임아웃) 등록된 done 콜백들을 호출
  var onScriptComplete = (prev, event) => {
    clearTimeout(timeout);
    var doneFns = inProgress[url];
    delete inProgress[url];
    doneFns && doneFns.forEach((fn) => fn(event));
  };
  var timeout = setTimeout(
    onScriptComplete.bind(null, undefined, { type: "timeout", target: script }),
    120000,
  );
  script.onerror = onScriptComplete.bind(null, script.onerror);
  script.onload = onScriptComplete.bind(null, script.onload);

  document.head.appendChild(script); // ← 이 순간 브라우저가 청크를 받아 실행
};
```

`__webpack_require__.l`은 JSONP 방식으로 `<script>` 태그로 파일을 불러오는 함수입니다.

구현을 간단히 보면 이렇습니다.

`<script>`를 `document.head`에 붙이면 브라우저가 해당 청크 파일을 받아 실행합니다.

이때 청크 파일은 실행되면서 자기 모듈들을 전역 배열에 `push`합니다.

```js title="app_a/dist/854.js"
(self["webpackChunkapp_a"] = self["webpackChunkapp_a"] || []).push([
  [854], // chunkIds
  {
    854: (module, exports, require) => {
      /* 모듈 코드 */
    },
  }, // 모듈들
]);
```

해당 청크 파일에는 `webpackChunkapp_a` 라는 변수에 모듈을 `push` 하는 것을 확인할 수 있습니다.

다시 main 쪽으로 돌아가서 해당 변수의 정의 부분을 확인해보겠습니다.

```js title="app_a/dist/main.js"
// 런타임 시작부
var chunkLoadingGlobal = (self["webpackChunkapp_a"] =
  self["webpackChunkapp_a"] || []);
// 런타임보다 청크가 먼저 도착해 이미 쌓여 있던 경우를 먼저 처리
chunkLoadingGlobal.forEach(webpackJsonpCallback.bind(null, 0));
// 이후의 push 는 전부 webpackJsonpCallback 으로 (원래 push 는 첫 인자 parentFn 으로 보존)
chunkLoadingGlobal.push = webpackJsonpCallback.bind(
  null,
  chunkLoadingGlobal.push.bind(chunkLoadingGlobal),
);
```

위의 코드처럼 `webpackChunkapp_a`을 선언하고 해당 배열의 `push` 함수를 `webpackJsonpCallback` 함수로 교체하는 것을 알 수 있습니다(이 교체와 `webpackJsonpCallback` 모두 [`JsonpChunkLoadingRuntimeModule.js`](https://github.com/webpack/webpack/blob/main/lib/web/JsonpChunkLoadingRuntimeModule.js)에서 생성됩니다).
결과적으로 청크 파일이 `push`를 호출하면 실제로는 아래 `webpackJsonpCallback`이 불립니다.

```js title="app_a/dist/main.js"
var webpackJsonpCallback = (parentFn, data) => {
  var [chunkIds, moreModules, runtime] = data;
  // 가져온 모듈들을 등록
  for (var moduleId in moreModules) {
    __webpack_require__.m[moduleId] = moreModules[moduleId];
  }
  if (runtime) runtime(__webpack_require__);
  // chunkIds 를 설치 완료로 바꾸면서, 대기 중이던 Promise 를 resolve
  for (var i = 0; i < chunkIds.length; i++) {
    var chunkId = chunkIds[i];
    if (installedChunks[chunkId]) installedChunks[chunkId][0]();
    installedChunks[chunkId] = 0;
  }
};
```

`webpackJsonpCallback`까지 찾아가면 실제로 청크를 불러올 때 등록해뒀던 promise를 resolve 시키고, 완료로 바꾸는 것을 확인할 수 있습니다.

이렇게 다 불린 모듈은
맨 처음 `import()`가 컴파일된 `.then(__webpack_require__.bind(__webpack_require__, 854))`이 실행되면서. `__webpack_require__(854)` 이 실행되게 되고,  
이게 방금 `webpackJsonpCallback`이 `__webpack_require__.m`에 등록해 모듈을 실행해 가져오게 됩니다.

정리하면 `.e(854)`가 청크를 받아오고 → `webpackJsonpCallback`이 모듈 팩토리를 `.m`에 등록하고 → `.then`의 `__webpack_require__(854)`가 그 팩토리를 실행해 `exports`를 만들어 돌려줍니다. 한 번 실행한 모듈은 `__webpack_module_cache__`에 담겨, 다음부터는 다시 실행하지 않고 캐시를 반환합니다.

### f.remotes

`f.remotes`은 이전 글에서 잠시 설명했던 것처럼 Consumer가 Producer가 제공하는 모듈을 가져올 떄 사용되는 함수입니다.

이를 확인하기 전에, 먼저 Producer가 어떤 식으로 빌드되어서 내보내고 있는지 확인해보면 좋습니다.

각각 module-federation 앱에서 expose를 정의하고 빌드하면 컨테이너(`remoteEntry.js`)가 생성된 것을 확인할 수 있는데,  
 `remoteEntry.js` 안에는 expose한 모듈을 어떤 청크로 가져올지 적은 `moduleMap`과, 그걸 꺼내는 `get`, share scope를 맞추는 `init`이 들어 있습니다.

예시로 C의 `remoteEntry.js`를 보면:

```js title="app_c/dist/remoteEntry.js"
var moduleMap = {
  "./Widget": () => {
    return __webpack_require__
      .e(/* __federation_expose_Widget */ 692)
      .then(() => () => __webpack_require__(578));
  },
};

var get = (module, getScope) => {
  __webpack_require__.R = getScope;
  getScope = __webpack_require__.o(moduleMap, module)
    ? moduleMap[module]() // 있으면 해당 로더 실행
    : Promise.resolve().then(() => {
        throw new Error('Module "' + module + '" does not exist in container.');
      });
  __webpack_require__.R = undefined;
  return getScope;
};

var init = (shareScope, initScope, remoteEntryInitOptions) =>
  __webpack_require__.federation.bundlerRuntime.initContainerEntry({
    webpackRequire: __webpack_require__,
    shareScope,
    initScope,
    remoteEntryInitOptions,
    shareScopeKey: "default",
  });

// 컨테이너는 get / init 두 개만 외부에 노출한다
__webpack_require__.d(exports, { get: () => get, init: () => init });
```

이 셋(`moduleMap`·`get`·`init`)을 만들어 주는 건 `ContainerPlugin`입니다([enhanced](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/container/ContainerPlugin.ts)). 플러그인이 컨테이너 엔트리(`remoteEntry.js`)를 추가하고, 위 `moduleMap`·`get`·`init` 코드를 생성하는건 [`ContainerEntryModule.codeGeneration`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/container/ContainerEntryModule.ts#L279-L315)입니다.

그럼 다시 돌아와서 Consumer(app_a) 쪽입니다. A는 `import("app_b/Panel")`을 하고, 빌드하면 이게 `f.remotes` 로더로 변환됩니다

```js
// as-is (app_a)
import("app_b/Panel").then(({ Panel }) => {
  const root = document.getElementById("root");
  if (root) root.appendChild(Panel());
});

// to-be
__webpack_require__
  .e(/* import() */ 180)
  .then(__webpack_require__.t.bind(__webpack_require__, 180, 23))
  .then(({ Panel }) => {
    const root = document.getElementById("root");
    if (root) root.appendChild(Panel());
  });
```

여기서 `f.j`가 건너뛴 그 `180` 청크라는 것을 확인할 수 있고 이를 가져오는 로더가 바로 `f.remotes` 입니다.

```js title="app_a/dist/main.js"
var idToExternalAndNameMapping = { 180: ["default", "./Panel", 681] };
var idToRemoteMap = { 180: [{ externalType: "script", name: "app_b" }] };

__webpack_require__.f.remotes = (chunkId, promises) => {
  __webpack_require__.federation.bundlerRuntime.remotes({
    idToRemoteMap,
    chunkMapping,
    idToExternalAndNameMapping,
    chunkId,
    promises,
    webpackRequire: __webpack_require__,
  });
};
```

`idToExternalAndNameMapping`에는 chunkId별로 어떤 Producer의 어떤 expose에 대응하는지가 미리 박혀 있습니다.  
`180`이면 `["default", "./Panel", 681]`인데, 세 값은 각각 아래를 뜻합니다

- `"default"` — 어느 share scope로 맞출지(공유 의존성 범위 이름). 컨테이너 `init`을 호출할 때 사용됩니다.
- `"./Panel"` — 컨테이너에서 꺼낼 expose 경로. `get("./Panel")`할 떄 사용됩니다.
- `681` — Producer 컨테이너(`app_b`)를 가리키는 external 모듈 id. 해당 id의 모듈을 require해서 `remoteEntry.js`를 로드합니다.

그런데 이 `f.remotes`는 `bundlerRuntime.remotes(...)`를 호출하고,  
실제로 `remoteEntry.js`를 받아오고 모듈을 꺼내는 역할은 `module-federation/runtime`이 합니다.

`bundlerRuntime.remotes`는 인자로 넘겨받은 `idToRemoteMap[id]`에 적힌 `externalType`을 보고 호출할 함수를 결정합니다.([`remotes.ts#L136-L145`](https://github.com/module-federation/core/blob/main/packages/webpack-bundler-runtime/src/remotes.ts#L136-L145)).

현재 케이스는 `externalType`이 `script` 이기 떄문에 `onRemoteLoaded` 함수가 호출되는 것을 확인할 수 있습니다.

```js title="webpack-bundler-runtime/src/remotes.ts"
// data        = idToExternalAndNameMapping[180] = ["default", "./Panel", 681]
// remoteInfos = idToRemoteMap[180]               = [{ externalType: "script", name: "app_b" }]
const onRemoteLoaded = () => {
  const remoteName = decodeName(remoteInfos[0].name, ENCODE_NAME_PREFIX); // "app_b"
  const remoteModuleName = remoteName + data[1].slice(1); // "app_b" + "/Panel"
  return webpackRequire.federation.instance.loadRemote(remoteModuleName, {
    // "app_b/Panel"
    loadFactory: false,
    from: "build",
  });
};
```

이 `loadRemote`는 loadRemote → Module.get → init → getEntry 순으로 함수가 불리는 것을 확인할 수 있습니다.

```js title="app_a/dist/main.js"
async loadRemote(id) {
  const { module, remoteMatchInfo } = await this.getRemoteModuleAndOptions({ id });
  return module.get(remoteMatchInfo.id, remoteMatchInfo.expose);
}

// module.get
async get(id, expose) {
  const remoteEntryExports = await this.init(id);
  const moduleFactory = await remoteEntryExports.get(expose); // 컨테이너 get("./Panel")
  return this.wraperFactory(moduleFactory)();
}

// module.init
async init(id) {
  const remoteEntryExports = await this.getEntry();
  await remoteEntryExports.init(this.host.shareScopeMap);
  return remoteEntryExports;
}
```

> Consumer에서 Producer 컨테이너(`app_b`)를 `Module`이라는 class로 하나씩 관리한다고 보면 됩니다. 캐시에 있으면 그대로 쓰고, 없으면 새로 만듭니다.

이제 여기서 `this.getEntry`, `remoteEntryExports.init`, `remoteEntryExports.get`의 동작을 차례로 보겠습니다.

#### 1. `getEntry`

`getEntry`의 구현은 이렇습니다. `getRemoteEntry`로 `<script>`를 띄워 `remoteEntry.js`를 받고, 로드가 끝나면 전역에서 컨테이너를 꺼내 캐싱합니다.

```js title="app_a/dist/main.js"
async getEntry() {
  if (this.remoteEntryExports) return this.remoteEntryExports;
  const remoteEntryExports = await getRemoteEntry({ remoteInfo: this.remoteInfo });
  return (this.remoteEntryExports = remoteEntryExports);
}

function getRemoteEntry({ remoteInfo }) {
  const key = getRemoteEntryUniqueKey(remoteInfo);
  if (!globalLoading[key]) {
    globalLoading[key] = loadEntryDom({ remoteInfo })    // loadEntryDom은 안쪽에서 loadEntryScript 함수를 호출함
      .then(() => handleRemoteEntryLoaded(remoteInfo));
  }
  return globalLoading[key];
}

function handleRemoteEntryLoaded(name, globalName) {
  const { entryExports } = getRemoteEntryExports(name, globalName);
  return entryExports;
}

const getRemoteEntryExports = (name, globalName) => {
  const remoteEntryKey = globalName;                       // "app_b"
  return { remoteEntryKey, entryExports: CurrentGlobal[remoteEntryKey] }; // window["app_b"]
};
```

`getEntry`는 `f.j`(청크 로딩)와 마찬가지로 `<script>` 태그를 사용해 `remoteEntry.js`를 받습니다([`loadEntryScript`](https://github.com/module-federation/core/blob/main/packages/runtime-core/src/utils/load.ts#L108-L173)).

받아온 `remoteEntry.js`를 보면 컨테이너를 전역 변수에 담아 넘기고 있습니다. `app_a`(A)와 `app_b`(B)는 따로 빌드된 별개의 번들이라 scope가 다르므로, 전역 객체(`window`)를 통해 주고받습니다.

```js title="app_b/dist/remoteEntry.js"
var app_b;
// …
var __webpack_exports__ = __webpack_require__(378); // 378 = 컨테이너 → { get, init }
app_b = __webpack_exports__; // window.app_b = { get, init }
```

결국 `getRemoteEntryExports`가 `CurrentGlobal["app_b"]`(=`window.app_b`)를 읽어 돌려주고, `getEntry`는 그 값을 그대로 반환합니다.  
즉 `getEntry`의 반환값은 `remoteEntry.js`가 전역에 올려둔 컨테이너 `{ get, init }`입니다.

#### 2. `remoteEntryExports.init`

이제 위에서 `remoteEntryExports`가 `remoteEntry.js`의 컨테이너 값인 것을 알았기 떄문에  
`remoteEntryExports.init`은 `app_b` 에서 정의된 `init`함수라는 것을 알 수 있습니다.

위에서 확인한 `remoteEntryExports.init`을 호출시 넘기는 인자 `this.host.shareScopeMap`은 host(`app_a`)가 지금까지 등록한 공유 의존성을 담은 Record입니다.  
`[scope][패키지][버전]` 형태로, 아래와 같습니다:

```js title="this.host.shareScopeMap"
{
  default: {                 // share scope 이름
    react: {                 // 공유 패키지
      "18.2.0": {            // 버전
        from: "app_a",     // 누가 등록했는지
        eager: false,
        get: () => __webpack_require__.e(855).then(() => () => __webpack_require__(855)), // react 로더
        // loadShare로 한 번 로드되면 lib(실제 모듈)·loaded: true 가 채워진다
      },
    },
    // react-dom 등 다른 공유 의존성도 같은 모양으로 쌓인다
  },
}
```

`init`은 이 Record를 통째로 `app_b`에 넘깁니다.
이를 받은 `init` 함수는 아래와 같은 흐름으로 Share Scope를 세팅합니다.

```js title="app_a/dist/main.js"
// app_b 컨테이너의 init (remoteEntry.js)
var init = (shareScope, initScope, remoteEntryInitOptions) =>
  __webpack_require__.federation.bundlerRuntime.initContainerEntry({
    webpackRequire: __webpack_require__,
    shareScope,              // host가 넘긴 share scope
    shareScopeKey: "default",
    initScope, remoteEntryInitOptions,
  });

function initContainerEntry({ webpackRequire, shareScope, shareScopeKey, initScope }) {
  const instance = webpackRequire.federation.instance;
  instance.initShareScopeMap(shareScopeKey || "default", shareScope); // ① scope 연결
  return webpackRequire.I(shareScopeKey || "default", initScope);     // ② 자기 의존성 register
}

initShareScopeMap(scopeName, shareScope) {
  this.shareScopeMap[scopeName] = shareScope; // host가 넘긴 scope 객체를 그대로 가리킨다(병합의 핵심)
}
```

`app_b`는 새 scope를 만들지 않고 host가 넘긴 scope 객체를 그대로 사용합니다.
이어서 `webpackRequire.I`(initialize sharing)가 `app_b`의 react를 그 scope에 `register`하는데,
`register` 함수는 아래와 같습니다.

```js title="app_b/dist/remoteEntry.js"
var uniqueName = "app_b";
var register = (name, version, factory, eager) => {
  var versions = (scope[name] = scope[name] || {});
  var activeVersion = versions[version];
  // 같은 버전이 없거나
  // 로드가 끝나지 않았고 현재의 `eager`와 등록된 `eager` 다르면 eager인 쪽, 같으면 `uniqueName`(번들 이름) 사전순 큰 쪽이 이긴다

  if (
    !activeVersion ||
    (!activeVersion.loaded &&
      (!eager != !activeVersion.eager
        ? eager
        : uniqueName > activeVersion.from))
  ) {
    versions[version] = { get: factory, from: uniqueName, eager: !!eager };
  }
};
register("react", "18.2.0", () =>
  __webpack_require__.e(855).then(() => () => __webpack_require__(855)),
);
```

결과적으로 `register` 함수는 공유받은 스코프에 현재 앱에서 사용하는 공유 모듈들을 등록하는 함수입니다.
공통된 공유 모듈은 위의 규칙을 만족해야지만 업데이트를 하고 그렇지 않으면, 별도로 세팅하지 않는 것을 확인할 수 있습니다.

이런 로직 떄문에 각각 앱에서 같은 버전/인스턴스를 바라볼 수 있습니다.

#### 3. `remoteEntryExports.get`

`init`이 끝나면 `remoteEntryExports.get(expose)`가 `app_b`의 `get`을 부르고,  
`get`함수는 `moduleMap`의 `"./Panel"`로 로더를 찾아 실행하면 Panel 청크를 받은 뒤 실제 코드를 실행시킬 수 있는 함수 (Factory)를 반환합니다.

```js title="app_b/dist/remoteEntry.js"
var moduleMap = {
  "./Panel": () =>
    __webpack_require__.e(546).then(() => () => __webpack_require__(762)),
};
var get = (module, getScope) => moduleMap[module](); // get("./Panel") → 위 로더 실행
```

이를 Consumer(`app_a`)는 바로쓰지 않고 `wraperFactory`로 한 번 감싼 뒤 실행합니다.

```js title="app_a/dist/main.js"
// Module.get
let moduleFactory = await remoteEntryExports.get(expose); // app_b.get("./Panel") → 팩토리
const wrapped = this.wraperFactory(moduleFactory, symbolName);
return await wrapped();                                    // 실행 → Panel exports

wraperFactory(moduleFactory, id) {
  // Factory를 실행해 모듈을 만들고, 식별용 Symbol(mf_module_id)을 붙이는 얇은 래퍼
  if (moduleFactory instanceof Promise)
    return async () => { const res = await moduleFactory(); defineModuleId(res, id); return res; };
  return () => { const res = moduleFactory(); defineModuleId(res, id); return res; };
}
```

Factory 함수를 바로 부르지 않고 `wraperFactory`로 한 겹 감싸는 이유는
실행 결과(Panel `exports`)에 "이건 `app_b/Panel`이다"라는 식별용 Symbol(`mf_module_id`)을 붙여, 런타임·devtools가 어느 remote 모듈인지 추적할 수 있게 하는 것입니다.

그렇게 `wrapped()`가 돌려준 Panel `exports`가 곧 `import("app_b/Panel")`의 결과입니다.

### f.consumes

마지막은 세 번째 로더 `f.consumes`입니다.

앱 A·B·C가 각자 react를 번들에 넣으면 Context와 같은 싱글 인스턴스를 바라봐야하는 경우 문제가 생깁니다.  
이러한 문제를 해결하기 위해서 Module-Federation은 Share Scope 기능을 제공해 각각의 앱에서 공통된 모듈을 바라볼 수 있게 합니다.

우리는 이전에 `f.remotes` 섹션에서 Share Scope를 Container를 불러올 때 세팅해주는 코드를 확인했었습니다.  
이번에는 `f.consumes`을 따라가보면서 실제로 공유 모듈을 불러올 때 어떻게 Share Scope에서 꺼내서 가져오는지 흐름을 따라가보겠습니다.

```js
// as-is
import React from "react";

// to-be
var react = __webpack_require__(973);
```

하지만 빌드 파일을 확인해봐도 `973`의 id를 가진 모듈의 정의는 찾아볼 수 없습니다.

다만 [저번 글](https://yun0.dev/posts/2026-06-01-module-federation-intro)에서 bootstrap 패턴을 사용해야하는 이유를 정리했을 때 봤던 것 처럼,
Module Federation에서는 앱이 실행될 때 런타임상에서 필요한 공유 모듈을 불러옵니다.

`__webpack_require__(973)`은 앱이 로드되기전 이미 불러와진 공유 모듈을 사용하는 코드인 것입니다.

진입점 `import('./bootstrap')`은 `__webpack_require__.e(854)`로 변환됩니다.
그리고 `__webpack_require__.e`는 `__webpack_require__.f`에 등록된 핸들러를 순회합니다.

그리고 아래와 같이 `__webpack_require__.f.consumes` 함수는 `chunkMapping` 레코드에 정의된 `854` 청크가 필요한 공유 모듈 id들을 보고 이를
`__webpack_require__.federation.bundlerRuntime.consumes`에 넘겨 필요한 공유 모듈을 세팅합니다.

```js
__webpack_require__.consumesLoadingData.chunkMapping = {
  854: [973],
};
__webpack_require__.f.consumes = (chunkId, promises) => {
  __webpack_require__.federation.bundlerRuntime.consumes({
    chunkMapping: __webpack_require__.consumesLoadingData.chunkMapping,
    installedModules: installedModules,
    chunkId: chunkId,
    moduleToHandlerMapping,
    promises: promises,
    webpackRequire: __webpack_require__,
  });
};
```

```js title="webpack-bundler-runtime/src/consumes.ts"
// 빌드 시점에 생성된 데이터
__webpack_require__.consumesLoadingData.moduleIdToConsumeDataMapping = {
  973: {
    shareKey: "react",
    singleton: true,
    requiredVersion: false,
    shareScope: ["default"],
    fallback: () =>
      __webpack_require__.e(855).then(() => () => __webpack_require__(855)),
  },
};

var moduleToHandlerMapping = {};

function consumes({
  chunkId,
  chunkMapping,
  moduleToHandlerMapping,
  promises,
  webpackRequire,
}) {
  updateConsumeOptions({ moduleToHandlerMapping, webpackRequire });
  if (!webpackRequire.o(chunkMapping, chunkId)) return;
  chunkMapping[chunkId].forEach((id) => {
    const { shareKey, getter } = moduleToHandlerMapping[id];
    const promise = webpackRequire.federation.instance
      .loadShare(shareKey)
      .then((factory) => (factory === false ? getter() : factory));
    promises.push(
      promise.then((factory) => {
        webpackRequire.m[id] = (module) => (module.exports = factory());
      }),
    );
  });
}

function updateConsumeOptions({ moduleToHandlerMapping, webpackRequire }) {
  const { moduleIdToConsumeDataMapping } = webpackRequire.consumesLoadingData;
  Object.entries(moduleIdToConsumeDataMapping).forEach(([id, data]) => {
    moduleToHandlerMapping[id] ??= {
      shareKey: data.shareKey,
      getter: data.fallback,
      shareInfo: {
        shareConfig: {
          singleton: data.singleton,
          requiredVersion: data.requiredVersion,
        },
        scope: data.shareScope,
      },
    };
  });
}
```

`moduleToHandlerMapping`은 초기엔 빈 `{}` 생성되는데, `consumes()` 함수가 먼저 `updateConsumeOptions`로 채웁니다.

`updateConsumeOptions`는 빌드 시점에 생성된 `moduleIdToConsumeDataMapping`을 `{ shareKey, getter, shareInfo }` 핸들러로 옮겨 담는 거죠.
그 뒤에 `loadShare` 함수를 호출해 실제 공유 모듈을 받아와서 `webpackRequire.m[id]` 에 넣어주는 것을 확인할 수 있습니다.

이렇게 값을 넣어줬기에 앱이 실제로 실행될 때 `__webpack_require__(973)` 모듈을 가져올 수 있는 것입니다.

`loadShare` 함수를 좀 더 디테일하게 보겠습니다:

```js title="runtime-core/src/shared/index.ts"
async loadShare(pkgName, shareInfo) {
  await Promise.all(shareInfo.scope.map((s) => this.initializeSharing(s)));
  const { shared } = getRegisteredShare(this.shareScopeMap, pkgName, shareInfo) || {};
  if (shared) return shared.lib ?? (shared.lib = await shared.get());
}
```

`loadShare`는 react를 꺼내기 전에 `initializeSharing`으로 scope를 initialize하고,
`getRegisteredShare`로 알맞은 버전을 고른 뒤, 그 버전의 `get()`만 실행합니다.

```js title="runtime-core/src/shared/index.ts"
initializeSharing(scopeName = "default") {
  const scope = (this.shareScopeMap[scopeName] ??= {});
  const register = (name, shared) => {
    const versions = (scope[name] ??= {});
    const active = versions[shared.version];
    if (!active || (!active.loaded && (!shared.eager !== !active.eager ? shared.eager : this.host.name > active.from)))
      versions[shared.version] = shared;
  };
  Object.entries(this.host.options.shared).forEach(([name, list]) =>
    list.forEach((shared) => shared.scope.includes(scopeName) && register(name, shared)),
  );
}
```

`initializeSharing`은 이 앱이 선언한 shared(react)를 scope에 `register`합니다.  
`f.remotes`의 `init`과 같은 `register`를 로직이라고 생각하면 됩니다.

```js title="runtime-core/src/utils/share.ts"
function getRegisteredShare(
  shareScopeMap,
  pkgName,
  { scope = "default", shareConfig },
) {
  const versions = shareScopeMap[scope]?.[pkgName];
  if (!versions) return;
  const version = shareConfig.singleton
    ? Object.keys(versions).sort(compareVersion).at(-1)
    : Object.keys(versions).find(
        (v) =>
          shareConfig.requiredVersion === false ||
          satisfy(v, shareConfig.requiredVersion),
      );
  return version ? { shared: versions[version] } : undefined;
}
```

`getRegisteredShare`는 채워진 scope에서 알맞은 버전을 고릅니다.
`singleton`이면 등록된 것 중 가장 높은 버전이고, 아니면 `requiredVersion` 범위를 만족하는 버전입니다.

scope에 아무것도 없으면 `undefined`를 반환해 `loadShare`가 react를 못 찾고, 결국 `consumes`는 `__webpack_require__.consumesLoadingData.moduleIdToConsumeDataMapping` 에 정의된 fallback으로 불러옵니다.

그래서 Producer를 Consumer와 함께 띄우면 Producer의 fallback은 동작하지 않기 때문에 Producer의 react 번들인 `855.js`은 다운로드 되지 않고,  
단독으로 띄웠을 때는 fallback이 작동해 Producer가 독립적으로도 실행할 수 있게 합니다.

#### 공유 모듈의 서브패스(sub-path) 문제

요즘 패키지는 `package.json`의 `exports` 필드로 진입점을 여러 개 둡니다. 그래서 패키지 루트뿐 아니라 그 안의 서브패스를 직접 import할 수 있죠.

- `react/jsx-runtime`, `react-dom/client`
- `@mui/material/Button`, `@mui/material/styles`
- `lodash/get`, `date-fns/format`

여기서 Module Federation의 공유 단위가 패키지가 아니라 모듈(그 import 경로)이라는 것 때문에 발생하는 문제가 있습니다.
예로 `lodash`만 `shared`에 등록하고 `lodash`와 `lodash/get`을 둘 다 import해 빌드하면, 두 import가 서로 다르게 컴파일됩니다.

```js
// import _ from "lodash";        ← shared 등록됨 → consume 스텁(820)을 가리킴
var lodash = __webpack_require__(820);
// import get from "lodash/get";  ← 미등록 → 번들에 포함된 실제 모듈(398)을 직접 require
var get = __webpack_require__(398);
```

그리고 `moduleIdToConsumeDataMapping`에는 `lodash`(820)만 올라옵니다. `lodash/get`(398)은 여기 없고, 그냥 앱 번들에 포함됩니다.

```js
__webpack_require__.consumesLoadingData.moduleIdToConsumeDataMapping = {
  820: { shareKey: "lodash", singleton: true, fallback: () => __webpack_require__.e(218)… },
};
// 398(lodash/get)은 여기 없음 → 공유되지 않음
```

따라서 `820`/`398` 두 모듈에서 동일한 인스턴스를 사용해야하는게 있다면 문제가 생길 수 있습니다.

실제로 [webpack#5476](https://github.com/webpack/webpack.js.org/issues/5476) 이슈가 이 문제이고,  
해당 이슈에서는 두 가지 해결책을 제시합니다.

- **서브패스를 하나씩 명시** — `shared: { "lodash/get": { singleton: true } }`. 정확히 일치해 잡히지만 경로마다 적어야 합니다.
- **끝에 `/`를 붙여 prefix 공유** — `shared: { "lodash/": { singleton: true } }`. `lodash/`로 들어온 서브패스가 각각 개별 공유 모듈(`shareKey`)이 됩니다.

실제로 shared에 `lodash/`를 추가한뒤 빌드를 해보면 아래와 같은 결과물을 확인할 수 있습니다.

```js
// import _ from "lodash";
var lodash = __webpack_require__(820);
// import get from "lodash/get";
var get = __webpack_require__(401);
// import set from "lodash/set";
var set = __webpack_require__(145);

// moduleIdToConsumeDataMapping — 서브패스마다 별도 shareKey 가 생김
__webpack_require__.consumesLoadingData.moduleIdToConsumeDataMapping = {
  820: { shareKey: "lodash", singleton: true, fallback: () => __webpack_require__.e(218)… },
  401: {
    shareKey: "lodash/get",
    singleton: true,
    fallback: () => () => __webpack_require__(398),
  },
  145: {
    shareKey: "lodash/set",
    singleton: true,
    fallback: () => () => __webpack_require__(706),
  },
};
```

이게 빌드 단계에서 가능한 이유는 모든 import는 모듈로 만들어지기 전에 `NormalModuleFactory`의 factorize 훅을 거치는데,  
[`ConsumeSharedPlugin`](https://github.com/module-federation/core/blob/main/packages/enhanced/src/lib/sharing/ConsumeSharedPlugin.ts#L581-L620)이  
request가 prefix로 시작하면 그 자리에서 공유 모듈로 바꿔치기합니다.

```js title="ConsumeSharedPlugin.js"
for (const [prefix, options] of prefixedConsumes) {
  if (request.startsWith(prefix)) {                 // "lodash/get".startsWith("lodash/")
    const remainder = request.slice(prefix.length); // "get"
    return createConsumeSharedModule(…, {
      ...options,
      shareKey: options.shareKey + remainder,        // "lodash/" + "get" = "lodash/get"
    });
  }
}
```

webpack은 import 하나가 모듈이 될 때마다 그 request 문자열을 prefix와 대조하고, 매칭되면 원래 모듈 대신 `sharedModule`을 만들기 떄문에 가능한 것 입니다.

> 끝에 `/`을 붙이는 것이 간단하게 보일 수 있지만, 라이브러리에 따라 `/` 로 해결할 시 앱에서 사용하는 패키지 sub-path 전체가 들어가면서 공용 모듈이 비대해지는 문제를 시킬 수 있습니다.

# 마무리

예제 세 개를 직접 빌드해, 청크가 어떻게 로드되고 런타임에 합쳐지는지를 산출물 코드로 따라가 봤습니다.

코드를 직접 따라가보면서 상당히 복잡한 것처럼 느껴지지만, 정리하면 `__webpack_require__.e`가 `f.j`·`f.remotes`·`f.consumes` 세 로더를 순회하고,  
일반 청크는 `f.j`, 다른 앱의 Producer는 `f.remotes`, 공유 의존성은 `f.consumes`이 각각 담당합니다.

`f.j`가 먼저 `index.js`에서 `bootstrap.js` 청크를 불러옵니다.
이떄 `f.consumes`가 `bootstrap.js` 청크에서 사용하는 공유 모듈을 불러오고,  
불러온 `bootstrap.js`에서 다른 앱의 Producer를 사용한다면 이를 `f.remotes`를 통해서 불러오고,
불러온 Producer의 모듈에서 다시 `f.j`로 Producer의 청크들을 불러오면서 반복됩니다.

원리와 흐름을 알고 나면, 실제 도입에서 발생하는 문제들/제약들이 왜 생기는지가 보입니다.  
공유 범위를 잘못 잡으면 왜 흰 화면이 뜨는지, 왜 bootstrap으로 한 단계 감싸야 하는지와 같은 것들입니다.
