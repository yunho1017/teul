import _ from "lodash";

const get = (object: any, path: string[] | string): any => {
  if (Array.isArray(path) && path.length === 0) {
    return object;
  }
  return _.get(object, path);
};

export default get;
