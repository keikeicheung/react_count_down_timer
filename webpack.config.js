module.exports = {
    entry: ".\\src\\index.js",
    output: {
        filename: "public/bundle.js"
    },
    module: {
        loaders: [
            {
                test: /\.jsx?$/,
                exclude: /(node_modules)/,
                loader: 'babel'
            },
            {
                test: /\.less$/,
                loader: "style!css!less"
            },
            {
                test: /(\.jpg$)|(\.eot$)|(\.svg$)|(\.ttf$)|(\.woff$)|(\.woff2$)/,
                loader: "file-loader?name=../resources/[name].[ext]"
            }
        ]
    }
};