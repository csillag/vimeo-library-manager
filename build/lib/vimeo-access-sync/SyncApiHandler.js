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
        this.waitForEncodingToStart = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.waitForEncodingToStart, this._vimeoAsync);
        this.waitForEncodingToFinish = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.waitForEncodingToFinish, this._vimeoAsync);
        this.deleteVideo = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.deleteVideo, this._vimeoAsync);
        this.replaceVideo = fiber_async_function_wrappers_1.wrapPromiseAsync3(this._replaceVideoPromise, this);
        this.getAllThumbnails = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.getAllThumbnails, this._vimeoAsync);
        this.deleteThumbnail = fiber_async_function_wrappers_1.wrapPromiseAsync2(this._vimeoAsync.deleteThumbnail, this._vimeoAsync);
        this.createThumbnail = fiber_async_function_wrappers_1.wrapPromiseAsync3m(this._vimeoAsync.createThumbnail, false, this._vimeoAsync);
        this.initiateThumbnailUpload = fiber_async_function_wrappers_1.wrapPromiseAsync1(this._vimeoAsync.initiateThumbnailUpload, this._vimeoAsync);
        this.uploadThumbnail = fiber_async_function_wrappers_1.wrapPromiseAsync3(this._vimeoAsync.uploadThumbnail, this._vimeoAsync);
        this.setThumbnailActive = fiber_async_function_wrappers_1.wrapPromiseAsync2(this._vimeoAsync.setThumbnailActive, this._vimeoAsync);
    }
    SyncApiHandler.prototype._uploadVideoPromise = function (videoFileName, data, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._vimeoAsync.uploadVideo(videoFileName, data, function (url) {
                resolve(url);
            }, onProgress, function (error) {
                reject(new Error(error));
            });
        });
    };
    SyncApiHandler.prototype._replaceVideoPromise = function (videoId, videoFileName, onProgress) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._vimeoAsync.replaceVideo(videoId, videoFileName, function (url) {
                resolve(url);
            }, onProgress, function (error) {
                reject(new Error(error));
            });
        });
    };
    return SyncApiHandler;
}());
exports.SyncApiHandler = SyncApiHandler;
