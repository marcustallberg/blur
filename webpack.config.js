const path = require('path')

module.exports = {
    entry: './js/blur.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'blur_fi.min.js'
    },
    module: {
        rules: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
        }]
    }
};