var gulp = require('gulp');
var ts = require('gulp-typescript');
var merge = require('merge2');
var paths = require('../paths');

var compileFor = function(moduleType, declaration = false) {
    var tsProject = ts.createProject('tsconfig.json', {
        module: moduleType,
        declaration: declaration
    });

    var tsResult = gulp.src(`${paths.src}/**/*.ts`)
        .pipe(tsProject());

    if(declaration) {
        return merge([
            tsResult.dts.pipe(gulp.dest(`${paths.dist}/definitions`)),
            tsResult.js.pipe(gulp.dest(`${paths.dist}/${moduleType}`))
        ]);
    }

    return tsResult.pipe(gulp.dest(`${paths.dist}/${moduleType}`));
}

gulp.task("compile:commonjs", function() {
    return compileFor("commonjs", true);
});

gulp.task("compile:amd", function() {
    return compileFor("amd");
});

gulp.task("compile:system", function() {
    return compileFor("system");
});

gulp.task("compile", ["compile:commonjs", "compile:amd", "compile:system"]);

