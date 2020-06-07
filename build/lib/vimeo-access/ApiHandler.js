"use strict";
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandler = void 0;
var vimeo_1 = require("vimeo");
var wantedScopes = [
    "public",
    "create",
    "interact",
    "private",
    "edit",
    "delete",
    "upload",
];
function parseError(err) {
    try {
        var data = JSON.parse(err.message);
        // console.log("Error data is", JSON.stringify(data, null, "  "));
        var error = data.error, developer_message = data.developer_message, invalid_parameters = data.invalid_parameters, error_code = data.error_code;
        var result = error +
            (!developer_message ? "" : " " + developer_message) +
            (!invalid_parameters
                ? ""
                : JSON.stringify(invalid_parameters, null, "  ")) +
            (error_code === undefined ? "" : " Error code: " + error_code);
        // console.log("Result is", result);
        return result;
    }
    catch (error) {
        // console.log("Failed to parse", error);
        return err.message;
    }
}
function convertError(err) {
    return new Error(parseError(err));
}
var ApiHandler = /** @class */ (function () {
    function ApiHandler(_auth, _params) {
        if (_params === void 0) { _params = {}; }
        this._auth = _auth;
        this._params = _params;
        var clientId = _auth.clientId, clientSecret = _auth.clientSecret, accessToken = _auth.accessToken;
        this._client = new vimeo_1.Vimeo(clientId, clientSecret, accessToken);
    }
    // @ts-ignore
    ApiHandler.prototype.log = function () {
        var stuff = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stuff[_i] = arguments[_i];
        }
        if (this._params.debug) {
            console.log.apply(console, stuff);
        }
    };
    ApiHandler.prototype.getLoginUrl = function (stateToken) {
        if (!this._auth.redirectUrl) {
            throw new Error("Redirect URL is not configured!");
        }
        return this._client.buildAuthorizationEndpoint(this._auth.redirectUrl, wantedScopes.join(" "), stateToken);
    };
    ApiHandler.prototype.finishLogin = function (code) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.accessToken(code, _this._auth.redirectUrl, function (error, response) {
                if (error) {
                    var errorData = JSON.parse(error.message);
                    // console.error(
                    //   "Error while getting access token:",
                    //   JSON.stringify(errorData, null, "  ")
                    // );
                    reject(errorData.error_description);
                    return;
                }
                var accessToken = response.access_token, user = response.user, scope = response.scope;
                if (accessToken) {
                    resolve({
                        accessToken: accessToken,
                        userUri: user.uri,
                        userName: user.name,
                        scopes: scope.split(" "),
                    });
                }
            });
        });
    };
    ApiHandler.prototype.tutorial = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.request({
                method: "GET",
                path: "/tutorial",
            }, function (err, body, _statusCode, _headers) {
                if (err) {
                    reject(convertError(err));
                }
                else {
                    resolve(body.message);
                }
            });
        });
    };
    ApiHandler.prototype.listMyVideos = function (wantedPage, loaded) {
        var _this = this;
        if (wantedPage === void 0) { wantedPage = 1; }
        if (loaded === void 0) { loaded = []; }
        return new Promise(function (resolve, reject) {
            _this._client.request({
                method: "GET",
                path: "/me/videos?page=" + wantedPage,
            }, function (error, body, _statusCode, _headers) {
                if (error) {
                    reject(convertError(error));
                }
                else {
                    var total = body.total, currentPage = body.page, per_page = body.per_page, data = body.data;
                    if (currentPage !== wantedPage) {
                        reject("I don't understand what is going on here.");
                        return;
                    }
                    var totalPages = Math.ceil(total / per_page);
                    var isLast = totalPages === currentPage;
                    var upToNow = __spreadArrays(loaded, data); // Unite the already loaded and the new data
                    if (isLast) {
                        resolve(upToNow);
                    }
                    else {
                        _this.listMyVideos(wantedPage + 1, upToNow).then(resolve, reject);
                    }
                }
            });
        });
    };
    ApiHandler.prototype.getVideo = function (videoId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.request({
                method: "GET",
                path: "/videos/" + videoId,
            }, function (error, body, _statusCode, _headers) {
                if (error) {
                    reject(convertError(error));
                }
                else {
                    resolve(body);
                }
            });
        });
    };
    ApiHandler.prototype.editVideo = function (videoId, data) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var path = "/videos/" + videoId;
            _this._client.request({
                method: "PATCH",
                path: path,
                query: data,
                headers: { "Content-Type": "application/json" },
            }, function (error, _body, statusCode, _headers) {
                if (error) {
                    reject(convertError(error));
                }
                else {
                    // console.log(_body);
                    switch (statusCode) {
                        case 200:
                            resolve();
                            break;
                        case 400:
                            reject("A parameter is invalid.");
                            break;
                        case 402:
                            reject("You are not allowed to do this!");
                    }
                }
            });
        });
    };
    ApiHandler.prototype.uploadVideo = function (videoFileName, data, onSuccess, onProgress, onFail) {
        this._client.upload(videoFileName, data, onSuccess, onProgress, onFail);
    };
    ApiHandler.prototype.waitForEncoding = function (videoId) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var checkStatus = function () {
                _this.getVideo(videoId).then(function (video) {
                    var status = video.transcode.status;
                    switch (status) {
                        case "complete":
                            resolve();
                            break;
                        case "error":
                            reject("Transcoding failed");
                            break;
                        case "in_progress":
                            setTimeout(checkStatus, 1000);
                            break;
                    }
                }, reject);
            };
            checkStatus();
        });
    };
    ApiHandler.prototype.deleteVideo = function (videoIs) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.request({ method: "DELETE", path: "/videos/" + videoIs }, function (error, _body, statusCode, _headers) {
                if (error) {
                    reject(convertError(error));
                    return;
                }
                else {
                    switch (statusCode) {
                        case 204:
                            resolve("The video was deleted.");
                            break;
                        case 403:
                            reject("The authenticated user can't delete this video.");
                            break;
                    }
                }
            });
        });
    };
    return ApiHandler;
}());
exports.ApiHandler = ApiHandler;
