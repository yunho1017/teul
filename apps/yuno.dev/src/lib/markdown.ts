import hljs from "highlight.js";
import { marked } from "marked";
import { markedHighlight } from "marked-highlight";

// 빌드 타임에 코드블록을 highlight.js로 구문 강조한다.
// 토큰 색상은 styles.css의 `.prose .hljs-*` 규칙에서 정의한다.
marked.use(
  markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  }),
);

export { marked };
