// webpack v4
const path = require('path')
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const HtmlWebpackPlugin = require('html-webpack-plugin')

const webpackMode = process.env.WEBPACK_MODE || 'development'
const isProduction = webpackMode === 'production'

const distPath = path.join(process.cwd(), 'dist')
const imgPath = path.join(process.cwd(), 'src/assets/images')
const audioPath = path.join(process.cwd(), 'src/assets/sounds')
const sourcePath = path.join(process.cwd(), 'src')

const inArray = (haystack) => (needle) => haystack.some((item) => needle.includes(item))
const dependencyPath = (...folders) => path.join('node_modules', ...folders)
// const localLink = (...folders) => path.join(process.cwd(), '..', ...folders)

const jsEs6Source = inArray([
    path.join(sourcePath, 'js'),
    dependencyPath('tmx-platformer-lib', 'lib')
])

module.exports = {
    entry: [
        path.join(process.cwd(), 'src/js/index.js')
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: '[hash].js'
    },
    target: 'web',
    module: {
        rules: [
            {
                test: /\.js$/,
                include: jsEs6Source,
                use: {
                    loader: 'babel-loader'
                }
            },
            {
                test: /\.scss$/,
                use: [
                    'style-loader',
                    MiniCssExtractPlugin.loader,
                    'css-loader',
                    'sass-loader'
                ]
            },
            {
                test: /\.(png|gif|jpg|svg)$/,
                include: imgPath,
                use: 'url-loader?limit=100&name=[name]-[hash].[ext]'
            },
            {
                test: /\.(mp3|wav)$/,
                include: audioPath,
                loader: 'file-loader?name=[name]-[hash].[ext]'
            },
            {
                test: /\.tmx$/,
                loader: 'xml-loader?explicitChildren=true&preserveChildrenOrder=true'
            }
        ]
    },
    devtool: 'source-map',
    resolve: {
        extensions: ['.js', '.tmx'],
        modules: ['src', 'node_modules']
    },
    plugins: [
        new MiniCssExtractPlugin({
            filename: 'style.[contenthash].css'
        }),
        new HtmlWebpackPlugin({
            inject: true,
            template: path.join(sourcePath, 'index.html'),
            path: distPath,
            filename: 'index.html'
        })
    ],
    optimization: {
        namedModules: true,
        splitChunks: {
            name: 'vendor',
            minChunks: 2
        },
        noEmitOnErrors: true,
        concatenateModules: true
    },
    devServer: {
        contentBase: isProduction ? distPath : sourcePath,
        port: process.env.PORT || 3000,
        stats: {
            assets: true,
            children: false,
            chunks: false,
            hash: false,
            modules: false,
            publicPath: false,
            timings: true,
            version: false,
            warnings: true,
            colors: {
                green: '\u001b[32m'
            }
        }
    }
}
