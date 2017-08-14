var gulp = require("gulp");
var del = require("del");
var fs = require('fs');
var paths = require("../paths");

gulp.task("clean", function(callback) {
    del.sync(paths.dist);
    callback();
});