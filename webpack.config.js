const HtmlWebpackPlugin = require("html-webpack-plugin");
const MiniCssPlugin = require("mini-css-extract-plugin");
const path = require("path");

module.exports = {
    entry: "./src/index.js",
    output: {
        path: path.resolve(__dirname, "./dist"),
        filename: "bundle.js",
    },
    devtool: "inline-source-map",
    plugins: [
        new HtmlWebpackPlugin({
            title: "Tree Visualization",
            template: "src/index.html",
        }),
        new MiniCssPlugin(),
    ],
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: [MiniCssPlugin.loader, "css-loader"],
            },
            {
                test: /\.ts$/i,
                use: "ts-loader",
            },
        ],
    },
    resolve: {
        extensions: [".tsx", ".ts", ".js"],
    },
    mode: "development",
};
