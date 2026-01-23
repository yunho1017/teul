// 간단한 로거

export const logger = {
  info: (message: string) => {
    console.log(`[teul] ${message}`);
  },

  error: (message: string, error?: any) => {
    console.error(`[teul] Error: ${message}`);
    if (error) console.error(error);
  },

  success: (message: string) => {
    console.log(`[teul] ✓ ${message}`);
  },
};
