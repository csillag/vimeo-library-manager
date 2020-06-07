"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createVimeoLibraryManager = void 0;
var ApiHandler_1 = require("./ApiHandler");
function createVimeoLibraryManager(config) {
    return new ApiHandler_1.ApiHandler(config);
}
exports.createVimeoLibraryManager = createVimeoLibraryManager;
