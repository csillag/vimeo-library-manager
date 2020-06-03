"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.log = exports.program = exports.APP_NAME = void 0;
var commander_1 = require("commander");
exports.APP_NAME = "vimeo-library-manager";
exports.program = new commander_1.Command(exports.APP_NAME);
function log() {
    var stuff = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        stuff[_i] = arguments[_i];
    }
    if (exports.program.opts().debug) {
        console.log.apply(console, stuff);
    }
}
exports.log = log;
