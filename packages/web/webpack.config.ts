import HtmlWebpackPlugin from "html-webpack-plugin";
import * as path from "path";
import webpack from "webpack";
import env from "dotenv";

env.config({ path: path.resolve(__dirname, "../../.env") });

const dev = process.env.NODE_ENV === "development";

const config = {
  target: "web",
  devServer: {
    port: 8080,
  },
  devtool: false, //dev && "inline-source-map",
  entry: ["regenerator-runtime/runtime", "react-hot-loader/patch"].concat(
    require.resolve("./src"),
  ),
  module: {
    rules: [
      {
        test: /\.scss$/,
        use: [
          // Creates `style` nodes from JS strings
          "style-loader",
          // Translates CSS into CommonJS
          {
            loader: "css-loader",
            options: {
              esModule: false,
              // https://github.com/webpack-contrib/css-loader?tab=readme-ov-file#modules
              modules: {
                exportLocalsConvention: "asIs",
              },
            },
          },
          // Compiles Sass to CSS
          {
            loader: "sass-loader",
            options: {
              implementation: require("sass"),
            },
          },
        ],
      },
      {
        test: /\.(mid|mp3|png|webm)$/,
        use: ["file-loader"],
      },
      {
        test: /\.svg$/i,
        use: [
          {
            loader: "url-loader",
            options: {
              generator: (content: any) =>
                require("mini-svg-data-uri")(content.toString()),
            },
          },
        ],
      },
      {
        test: /\.tsx?$/,
        loader: "babel-loader",
        exclude: /node_modules/,
        options: {
          presets: [
            "@babel/preset-env",
            "@babel/preset-react",
            "@babel/preset-typescript",
          ],
          plugins: ["react-hot-loader/babel"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      events: "events",
      "react-dom": "@hot-loader/react-dom",
    },
    extensions: [".tsx", ".ts", ".js"],
    fallback: {
      // https://viglucci.io/how-to-polyfill-buffer-with-webpack-5
      buffer: require.resolve("buffer"),
      fs: false,
      stream: require.resolve("stream-browserify"),
      util: false,
      zlib: false,
    },
  },
  output: {
    path: path.resolve(__dirname, "public"),
    clean: true,
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.EnvironmentPlugin([
      "GET_TOKEN_URL",
      "NODE_ENV",
      "SPOTIFY_TOKEN",
    ]),
    new webpack.ProvidePlugin({
      Buffer: ["buffer", "Buffer"],
    }),
    // https://webpack.js.org/plugins/copy-webpack-plugin/
    new (require("copy-webpack-plugin"))({
      patterns: [
        {
          context: path.resolve(__dirname, "src/assets"),
          from: dev ? "none" : "api/**/*.json",
          noErrorOnMissing: true,
        },
      ],
    }),
    new HtmlWebpackPlugin({
      favicon: require.resolve("./src/assets/favicon.ico"),
    }),
  ],
};

export default config;
