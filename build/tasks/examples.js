var gulp = require('gulp');
var webpack = require('webpack-stream');
var examplesDir = "examples";

function buildExample(exampleName) {
    return gulp.src(`${examplesDir}/${exampleName}/app.js`)
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
    .pipe(gulp.dest(`${examplesDir}/${exampleName}`));
}

gulp.task('examples:basic', function() {
  return buildExample("basic");
});

gulp.task("examples:arrays", function() {
    return buildExample("arrays");
});

gulp.task('examples', ["examples:basic", "examples:arrays"]);