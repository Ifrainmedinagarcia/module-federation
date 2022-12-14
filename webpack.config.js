const { HotModuleReplacementPlugin } = require('webpack');
const deps = require("./package.json").dependencies;
const HtmlWebPackPlugin = require("html-webpack-plugin");
const ModuleFederationPlugin = require("webpack/lib/container/ModuleFederationPlugin");
const path = require("path");

const rulesForTs = {
  test: /\.(ts|tsx)$/,
  loader: "babel-loader",
  exclude: /node_modules/
};


const rulesForCss = {
  test: /\.(css|s[ac]ss)$/i,
  use: ["style-loader", "css-loader", "postcss-loader"],
};

const rulesForFiles = {
  test: /\.(eot|ttf|woff|woff2|png|jpe?g|gif|svg)$/i,
  use: [
    {
      loader: "file-loader",
    },
  ],
};

const rulesFoJsAuto = {
  test: /\.m?js/,
  type: "javascript/auto",
  resolve: {
    fullySpecified: false,
  },
}

const rules = [rulesForTs, rulesFoJsAuto, rulesForCss, rulesForFiles];


module.exports = (env, arg) => {
  const { mode } = arg;
  const isProduction = mode === "production";
  return {
    entry: './src/index.ts',
    output: {
      filename: isProduction ? "[name].[contenthash].js" : "index.js",
      path: path.resolve(__dirname, "build"),
      publicPath: 'auto',
    },

    resolve: {
      extensions: [".tsx", ".ts", ".jsx", ".js", ".json"],
    },

    devServer: {
      port: 3001,
      open: true,
      historyApiFallback: true,
      liveReload: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
        "Access-Control-Allow-Headers": "X-Requested-With, content-type, Authorization"
      }
     
    },

    module: { rules },

    plugins: [
      new HotModuleReplacementPlugin(),
      new ModuleFederationPlugin({
        name: "mfe1",
        filename: "remoteEntry.js",
        remotes: {
          "app_container": "app_container@http://localhost:3000/remoteEntry.js",
        },
        exposes: {},
        shared: {
          ...deps,
          react: {
            singleton: true,
            requiredVersion: deps.react,
          },
          "react-dom": {
            singleton: true,
            requiredVersion: deps["react-dom"],
          },
        },
      }),
      new HtmlWebPackPlugin({
        template: "./public/index.html",
      }),
    ],

  }
};
