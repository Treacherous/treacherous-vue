const gulp = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const paths = require("../paths");
const webpack = require('webpack-stream');
const runSequence = require("run-sequence");

var compileFor = function(moduleType, withTypings = false, target = "es2015") {
    console.log(`Compiling for ${moduleType} - targetting ${target}`);
    var tsProject = ts.createProject('tsconfig.json', {
        declaration: withTypings || false,
        module: moduleType,
        target: target
    });

    var tsResult = gulp.src(`${paths.src}/**/*.ts`)
        .pipe(tsProject());

    if(withTypings) {
        return merge([
            tsResult.dts.pipe(gulp.dest(paths.dist + "/definitions")),
            tsResult.js.pipe(gulp.dest(paths.dist + "/" + moduleType))
        ]);
    }

    return tsResult.js.pipe(gulp.dest(paths.dist + "/" +moduleType));
}

gulp.task("compile-webpack", function() {
    return gulp.src(`${paths.dist}/es2015/plugin.js`)
        .pipe(webpack({
            output: {
                filename: "treacherous.vue.umd.js",
                library: "TreacherousVue",
                libraryTarget: "umd"
            }
        }))
        .pipe(gulp.dest(`${paths.dist}/umd`))
});

gulp.task('compile-modules', function(){
    return merge([
        compileFor("commonjs", true),
        compileFor("es2015")
    ])
});

gulp.task('compile', ["clean"], function(callback) {
    return runSequence('compile-modules', 'compile-webpack', callback);
});