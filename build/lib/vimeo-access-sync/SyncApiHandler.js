"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SyncApiHandler = void 0;
var fiber_async_function_wrappers_1 = require("../fiber-async-function-wrappers");
var vimeo_access_1 = require("../vimeo-access");
var SyncApiHandler = /** @class */ (function () {
    function SyncApiHandler(auth, params) {
        var _this = this;
        this._vimeoAsync = new vimeo_access_1.ApiHandler(auth, params);
        this.getLoginUrl = function (stateToken) {
            return _this._vimeoAsync.getLoginUrl(stateToken);
        };
        this.finishLogin = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.finishLogin, this._vimeoAsync);
        this.tutorial = fiber_async_function_wrappers_1.wrapPromiseAsync0(this._vimeoAsync.tutorial, this._vimeoAsync);
        this.listMyVideos = fiber_async_function_wrappers_1.wrapPromiseAsync0(this._vimeoAsync.listMyVideos, this._vimeoAsync);
        this.editVideo = fiber_async_function_wrappers_1.wrapPromiseAsync2(this._vimeoAsync.editVideo, this._vimeoAsync);
        this.getVideo = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.getVideo, this._vimeoAsync);
        this.uploadVideo = fiber_async_function_wrappers_1.wrapPromiseAsync3(this._uploadVideoPromise, this);
        this.waitForEncoding = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.waitForEncoding, this._vimeoAsync);
        this.deleteVideo = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.deleteVideo, this._vimeoAsync);
    }
    SyncApiHandler.prototype._uploadVideoPromise = function (videoFileName, data, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._vimeoAsync.uploadVideo(videoFileName, data, function (url) {
                resolve(url);
            }, onProgress, function (error) {
                reject(error);
            });
        });
    };
    return SyncApiHandler;
}());
exports.SyncApiHandler = SyncApiHandler;
