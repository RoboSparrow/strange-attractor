
//todo: https://github.com/webpack-contrib/mini-css-extract-plugin
const path = require('path');

const webpack = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin');

module.exports = {

    entry: './src/main.js',

    output: {
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist'),
        globalObject: `(typeof self !== 'undefined' ? self : this)`, // temp fix fhttps://github.com/webpack/webpack/issues/6642
    },

    resolve: {
        extensions: ['.js'],
        modules: [path.join(process.cwd(), 'src'), 'node_modules'] // include imported modules
    },

    module: {
        rules: [{
            // eslint-loader
            enforce: "pre", // force source files untouced by other loaders
            test: /\.js$/,
            exclude: /node_modules/,
            loader: "eslint-loader"
        }, {
            // css-loader
            test: /\.css$/,
            use: [ 'style-loader', 'css-loader' ]
        }, {
            // worker-loader
            test: /\.worker\.js$/,
            use: { loader: 'worker-loader' },
      }],
    },

    devtool: "source-map",

    devServer: {
        port: 3008,
        open: true,
        hot: true,
        contentBase: path.resolve(__dirname, 'dist'), //serve from 'dist' folder
        stats: {
            // minimal output on development terminal, show eslint errors and warns, surpress other stats
            assets: false,
            children: false,
            modules: false,
        },
    },

    plugins: [
        // clean up build folder
        new CleanWebpackPlugin(['dist'], {root: process.cwd()}),
        // parse and copy index.html
        new HtmlWebpackPlugin({
            template: path.resolve(__dirname, 'src') + '/index.html'
        }),
        // hmr
        new webpack.HotModuleReplacementPlugin(),
    ]
};
