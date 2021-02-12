const {src, dest, series} = require('gulp');
const ts = require('gulp-typescript');
const merge = require('merge2');
const paths = require("../paths");
const webpack = require('webpack-stream');
const {clean} = require("./clean");

const compileFor = function(moduleType, withTypings = false, target = "es2015") {
    console.log(`Compiling for ${moduleType} - targetting ${target}`);
    const tsProject = ts.createProject('tsconfig.json', {
        declaration: withTypings || false,
        module: moduleType,
        target: target
    });

    const tsResult = src(`${paths.src}/**/*.ts`)
        .pipe(tsProject());

    if(withTypings) {
        return merge([
            tsResult.dts.pipe(dest(paths.dist + "/definitions")),
            tsResult.js.pipe(dest(paths.dist + "/" + moduleType))
        ]);
    }

    return tsResult.js.pipe(dest(paths.dist + "/" +moduleType));
}

function compileWebpack() {
    return src(`${paths.dist}/es2015/plugin.js`)
        .pipe(webpack({
            output: {
                filename: "treacherous.vue.umd.js",
                library: "TreacherousVue",
                libraryTarget: "umd"
            },
            externals: {
                "@treacherous/core": {
                    root: "Treacherous",
                    commonjs: "@treacherous/core",
                    commonjs2: "@treacherous/core"
                },
                "vue": "var Vue"
            }
        }))
        .pipe(dest(`${paths.dist}/umd`))
}

function compileModules(){
    return merge([
        compileFor("commonjs", true),
        compileFor("es2015")
    ])
}

exports.compile = series(clean, compileModules, compileWebpack);