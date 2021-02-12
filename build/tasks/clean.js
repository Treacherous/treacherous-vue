const del = require("del");
const paths = require("../paths");

function clean() {
    return new Promise((resolve, reject) => {
        del.sync(paths.dist);
        resolve();
    });
}

exports.clean = clean;