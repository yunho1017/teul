import _ from "lodash";

const getAllKeys = (obj: Record<string, any>, prefix = ""): string[] => {
  const keys: string[] = [];
  for (const key in obj) {
    if (key === "page") {
      keys.push(prefix);
    } else if (key !== "layout" && key !== "page" && _.isObject(obj[key])) {
      keys.push(...getAllKeys(obj[key], `${prefix}/${key}`));
    }
  }
  return keys;
};

export default getAllKeys;
