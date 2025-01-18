import { HTMLAttributes } from "react";

export interface TypeAnimationProps {
  sequence: Array<string | number>; // 문자열과 딜레이(ms)만 허용
  ref?: React.Ref<HTMLSpanElement>; // span으로 고정
}

// 내부 helper 타입들
export type StringSplitter = (text: string) => ReadonlyArray<string>;
