const {src, dest} = require('gulp');
const webpack = require('webpack-stream');
const examplesDir = "example";

function example() {
    return src(`${examplesDir}/app.js`)
        .pipe(webpack({
            module: {
                rules: [
                    { test: /\.html$/, use: [ "raw-loader" ] }
                ]
            },
            output: {
                filename: "compiled.js"
            },
            optimization: {
                minimize: false
            },
        }))
        .pipe(dest(`${examplesDir}`));
}

exports.example = example;