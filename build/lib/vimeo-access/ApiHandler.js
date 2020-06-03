"use strict";
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
];
function parseError(err) {
    try {
        var data = JSON.parse(err.message);
        var error = data.error, developer_message = data.developer_message;
        return error + (!developer_message ? "" : " " + developer_message);
    }
    catch (error) {
        return err.message;
    }
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
    ApiHandler.prototype.getLoginUrl = function () {
        if (!this._auth.redirectUrl) {
            throw new Error("Redirect URL is not configured!");
        }
        return this._client.buildAuthorizationEndpoint(this._auth.redirectUrl, wantedScopes.join(" "), "login");
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
                    reject(parseError(err));
                }
                else {
                    resolve(body.message);
                }
            });
        });
    };
    ApiHandler.prototype.listMyVideos = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this._client.request({
                method: "GET",
                path: "/me/videos",
            }, function (error, body, _statusCode, _headers) {
                if (error) {
                    reject(parseError(error));
                }
                else {
                    var total = body.total, page = body.page, per_page = body.per_page, data = body.data;
                    console.log("There are", total, "videos total.", "We are at page", page, ".", "There are", per_page, "videos on each page.");
                    resolve(data);
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
                    reject(parseError(error));
                }
                else {
                    console.log(_body);
                    switch (statusCode) {
                        case 200:
                            resolve("The video was edited.");
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
    return ApiHandler;
}());
exports.ApiHandler = ApiHandler;
