 var path = require('path');
 var webpack = require('webpack');

 module.exports = {
 	mode: 'development',
     entry: './public/controller.js',
     output: {
         path: path.resolve(__dirname, 'public'),
         filename: 'main.bundle.js'
     },
     module: {
         rules: [
             { test: /\.js$/, use: 'babel-loader' }
         ]
     },
     stats: {
         colors: true
     },
     devtool: 'source-map'
 };