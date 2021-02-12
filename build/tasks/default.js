const {clean} = require("./clean");
const {compile} = require("./compile");
const {example} = require("./examples");
const {series} = require("gulp");

exports.defaultTask = series(clean, compile, example);
exports.example = example;