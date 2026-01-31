"use client";

import { Component, ReactNode } from "react";
import { Feedback } from "../../../../components/feedback";

type ErrorBoundaryProps = {
  children: ReactNode;
};

type ErrorBoundaryState = {
  hasError: boolean;
  error: Error | null;
};

export class PostErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  render() {
    if (this.state.hasError) {
      return (
        <>
          <title>글을 찾을 수 없습니다</title>
          <Feedback
            icon="🔍"
            title="글을 찾을 수 없습니다"
            description="요청하신 글이 존재하지 않거나 삭제되었습니다."
            buttons={[
              { label: "홈으로 돌아가기", href: "/" },
              {
                label: "전체 글 보기",
                href: "/posts/list",
                variant: "secondary",
              },
            ]}
          />
        </>
      );
    }

    return this.props.children;
  }
}
