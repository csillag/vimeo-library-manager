"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncApiHandler = void 0;
var fiber_async_function_wrappers_1 = require("../fiber-async-function-wrappers");
var vimeo_access_1 = require("../vimeo-access");
var SyncApiHandler = /** @class */ (function () {
    function SyncApiHandler(auth, params) {
        var _this = this;
        this._vimeoAsync = new vimeo_access_1.ApiHandler(auth, params);
        this.getLoginUrl = function () { return _this._vimeoAsync.getLoginUrl(); };
        this.finishLogin = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.finishLogin, this._vimeoAsync);
        this.tutorial = fiber_async_function_wrappers_1.wrapPromiseAsync0(this._vimeoAsync.tutorial, this._vimeoAsync);
        this.listMyVideos = fiber_async_function_wrappers_1.wrapPromiseAsync0(this._vimeoAsync.listMyVideos, this._vimeoAsync);
        this.editVideo = fiber_async_function_wrappers_1.wrapPromiseAsync2(this._vimeoAsync.editVideo, this._vimeoAsync);
    }
    return SyncApiHandler;
}());
exports.SyncApiHandler = SyncApiHandler;
