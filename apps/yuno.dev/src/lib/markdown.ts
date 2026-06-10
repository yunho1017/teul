import hljs from "highlight.js";
import { Marked } from "marked";

// 코드펜스 info string에서 언어와 title을 파싱한다.
// 예: ```js title="app-a/dist/main.js"  → { lang: "js", title: "app-a/dist/main.js" }
//     ```js                             → { lang: "js", title: "" }
function parseInfo(infostring = "") {
  const info = infostring.trim();
  const titleMatch = info.match(/\btitle=(?:"([^"]*)"|'([^']*)'|(\S+))/);
  const title = titleMatch ? titleMatch[1] ?? titleMatch[2] ?? titleMatch[3] ?? "" : "";
  const lang = info.replace(/\btitle=(?:"[^"]*"|'[^']*'|\S+)/, "").trim().split(/\s+/)[0] ?? "";
  return { lang, title };
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// 전역 marked 싱글톤을 .use()로 변형하면 HMR 시 확장이 누적돼 코드블록이
// 이중 하이라이트(이스케이프)되므로, 독립 인스턴스를 만들어 사용한다.
//
// 빌드 타임에 코드블록을 highlight.js로 구문 강조하고,
// `title="..."` 이 있으면 코드 위에 파일명 헤더를 붙인다.
// 토큰 색상은 styles.css의 `.prose .hljs-*`, 헤더는 `.prose .code-filename` 규칙에서 정의한다.
const instance = new Marked({
  renderer: {
    code(code, infostring) {
      const { lang, title } = parseInfo(infostring);
      const language = lang && hljs.getLanguage(lang) ? lang : "plaintext";
      const highlighted = hljs.highlight(code, { language }).value;
      const langClass = lang ? `hljs language-${lang}` : "hljs";
      const header = title
        ? `<div class="code-filename">${escapeHtml(title)}</div>`
        : "";
      return `<figure class="code-block${title ? " has-filename" : ""}">${header}<pre><code class="${langClass}">${highlighted}</code></pre></figure>`;
    },
  },
});

const marked = (src: string) => instance.parse(src);

export { marked };
