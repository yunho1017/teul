/**
 * 문자열을 Web Streams API의 ReadableStream으로 변환합니다.
 * SSR에서 HTML 문자열을 스트림으로 변환하여 Response로 전송할 때 사용합니다.
 *
 * @example
 * const html = '<html><body>Hello</body></html>';
 * const stream = stringToStream(html);
 * return new Response(stream, { headers: { 'Content-Type': 'text/html' } });
 */
export const stringToStream = (str: string): ReadableStream => {
  const encoder = new TextEncoder();
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(str));
      controller.close();
    },
  });
};
