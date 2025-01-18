import type { StringSplitter } from "./index.types";

const OP_CODE_DELETION = "DELETE";
const OP_CODE_WRITING = "WRITING";

export async function type(
  node: HTMLSpanElement,
  splitter: StringSplitter,
  speed: number,
  deletionSpeed: number,
  omitDeletionAnimation: boolean,
  ...args: ReadonlyArray<string | number>
) {
  for (const arg of args) {
    if (typeof arg === "string") {
      await edit(node, splitter, arg, speed, deletionSpeed);
    } else if (typeof arg === "number") {
      await wait(arg);
    }
  }
}

async function edit(
  node: HTMLSpanElement,
  splitter: StringSplitter,
  text: string,
  speed: number,
  deletionSpeed: number
) {
  const nodeContent = node.textContent || "";
  const overlap = getOverlap(nodeContent, text);

  await perform(
    node,
    [
      ...deleter(nodeContent, splitter, overlap),
      ...writer(text, splitter, overlap),
    ],
    speed,
    deletionSpeed
  );
}

async function wait(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function perform(
  node: HTMLSpanElement,
  edits: ReadonlyArray<string>,
  speed: number,
  deletionSpeed: number
) {
  for (const op of editor(edits)) {
    const waitingTime =
      op.opCode(node) === OP_CODE_WRITING ? speed : deletionSpeed;
    op.op(node);
    await wait(waitingTime);
  }
}

function* editor(edits: ReadonlyArray<string>) {
  for (const snippet of edits) {
    yield {
      op: (node: HTMLSpanElement) =>
        requestAnimationFrame(() => (node.textContent = snippet)),
      opCode: (node: HTMLSpanElement) => {
        const nodeContent = node.textContent || "";
        return nodeContent.length > snippet.length
          ? OP_CODE_DELETION
          : OP_CODE_WRITING;
      },
    };
  }
}

function* writer(text: string, splitter: StringSplitter, startIndex = 0) {
  const splitText = splitter(text);
  const endIndex = splitText.length;
  while (startIndex < endIndex) {
    yield splitText.slice(0, ++startIndex).join("");
  }
}

function* deleter(text: string, splitter: StringSplitter, startIndex = 0) {
  const splitText = splitter(text);
  let endIndex = splitText.length;
  while (endIndex > startIndex) {
    yield splitText.slice(0, --endIndex).join("");
  }
}

function getOverlap(start: string, [...end]: string) {
  return [...start, NaN].findIndex((char, i) => end[i] !== char);
}
