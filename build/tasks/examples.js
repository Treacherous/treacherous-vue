var gulp = require('gulp');
var webpack = require('webpack-stream');
var examplesDir = "example";

gulp.task('example', function() {
    return gulp.src(`${examplesDir}/app.js`)
        .pipe(webpack({
            module: {
                rules: [
                    { test: /\.html$/, use: [ "raw-loader" ] }
                ]
            },
            output: {
                filename: "compiled.js"
            }
        }))
        .pipe(gulp.dest(`${examplesDir}`));
});