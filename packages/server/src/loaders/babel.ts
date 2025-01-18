import { APP_PATH, COMMON_PATH } from "../constants";

const babelRegister = require("@babel/register");

export default function configureBabel(): void {
  babelRegister({
    ignore: [/[\\\/](node_modules)[\\\/]/],
    presets: [
      ["@babel/preset-react", { runtime: "automatic" }],
      "@babel/preset-typescript",
    ],
    plugins: [
      "@babel/transform-modules-commonjs",
      "@babel/plugin-transform-runtime",
    ],
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    only: [APP_PATH, COMMON_PATH],
  });
}
