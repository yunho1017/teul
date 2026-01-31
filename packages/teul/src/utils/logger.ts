// 간단한 로거

export const logger = {
  info: (message: string) => {
    console.log(`[teul] ${message}`);
  },

  error: (message: string, error?: any) => {
    console.log(`[teul] 에러: ${message}`);
    if (error) console.error(error);
  },

  success: (message: string) => {
    console.log(`[teul] ✓ ${message}`);
  },
  warn: (message: string) => {
    console.log(`[teul] ${message}`);
  },
};

export const createProgressLogger = (total?: number) => {
  const showProgress = process.stdout.isTTY && !process.env.CI;
  let count = 0;
  let timer: ReturnType<typeof setTimeout> | null = null;
  const INTERVAL = 100; // rate limit updates to every 100ms

  const getPrefix = () =>
    total !== undefined ? `(${count}/${total}) ` : `(${count}) `;

  const update = (message: string) => {
    count++;
    if (timer) {
      return;
    }
    timer = setTimeout(() => (timer = null), INTERVAL);
    if (showProgress) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
      process.stdout.write(getPrefix() + message);
    }
  };

  const done = () => {
    if (showProgress) {
      process.stdout.clearLine(0);
      process.stdout.cursorTo(0);
    }
  };

  const getCount = () => count;

  return { update, done, getCount };
};
