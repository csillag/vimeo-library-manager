"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandler = void 0;
var vimeo_1 = require("vimeo");
var SCOPES = "public create interact private edit delete";
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
        return this._client.buildAuthorizationEndpoint(this._auth.redirectUrl, SCOPES, "login");
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
                        user: user.name,
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
            }, function (error, body, _statusCode, _headers) {
                if (error) {
                    reject(error.message);
                    return;
                }
                resolve(body.message);
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
                    reject(error.message);
                    return;
                }
                var total = body.total, page = body.page, per_page = body.per_page, data = body.data;
                console.log("There are", total, "videos total.", "We are at page", page, ".", "There are", per_page, "videos on each page.");
                resolve(data);
            });
        });
    };
    return ApiHandler;
}());
exports.ApiHandler = ApiHandler;
