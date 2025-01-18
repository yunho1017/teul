const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");
const ReactServerWebpackPlugin = require("react-server-dom-webpack/plugin");

module.exports = {
  mode: "development",
  entry: ["./framework/globals.css", "./framework/boot.tsx"],
  module: {
    rules: [
      {
        test: /\.tsx|ts?$/,
        use: {
          loader: "babel-loader",
          options: {
            presets: [
              [
                "@babel/preset-react",
                {
                  runtime: "automatic",
                },
              ],
              "@babel/preset-typescript",
            ],
          },
        },
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader", "postcss-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".jsx"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      inject: true,
      template: path.resolve(__dirname, "./public/index.html"),
      favicon: false,
    }),
    new ReactServerWebpackPlugin({
      isServer: false,
    }),
  ],
  output: {
    path: path.resolve(process.env.ROOT_PATH, "dist/client"),
    filename: "[name].js",
    publicPath: "/",
  },
};
