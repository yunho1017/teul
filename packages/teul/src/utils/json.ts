export const parseJSONSafe = <T, F = T>(
  json: string | null,
  fallbackValue: F,
): T | F => {
  try {
    if (json === null) {
      return fallbackValue;
    }
    return JSON.parse(json);
  } catch {
    return fallbackValue;
  }
};
