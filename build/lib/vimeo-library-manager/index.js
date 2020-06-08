"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVimeoLibraryManager = void 0;
var ApiHandler_1 = require("./ApiHandler");
var util_1 = require("./util");
Object.defineProperty(exports, "mergeInto", { enumerable: true, get: function () { return util_1.mergeInto; } });
function createVimeoLibraryManager(config) {
    return new ApiHandler_1.ApiHandler(config);
}
exports.createVimeoLibraryManager = createVimeoLibraryManager;
