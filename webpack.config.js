const path = require('path');

 module.exports = {
     entry: './src/js/main.js',
     output: {
         path: path.resolve(__dirname, 'dist'),
         filename: 'blur.bundle.js'
     },
     module: {
        loaders: [{
            test: /\.js$/,
            exclude: /node_modules/,
            loader: 'babel-loader'
         }]
     }
 };