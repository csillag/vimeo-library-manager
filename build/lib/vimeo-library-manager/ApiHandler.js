"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandler = exports.selectLargestPicture = exports.pictureUriToId = exports.videoUriToId = void 0;
var get_1 = __importDefault(require("lodash/get"));
var fs = require("fs");
var path = require("path");
var shortid_1 = __importDefault(require("shortid"));
var open = require("open");
var connect = require("connect");
var http = require("http");
var URI = require("uri-js");
var vimeo_access_1 = require("../vimeo-access");
var util_1 = require("./util");
exports.videoUriToId = function (uri) { return uri.substr(8); };
exports.pictureUriToId = function (uri) {
    return uri.substr(uri.lastIndexOf("/") + 1);
};
function selectLargestPicture(picture) {
    return picture.sizes.reduce(function (last, current) {
        return current.width > last.width ? current : last;
    }, picture.sizes[0]);
}
exports.selectLargestPicture = selectLargestPicture;
var contentTypes = {
    png: "image/png",
    jpg: "image/jpg",
    gif: "image/gif",
};
var ApiHandler = /** @class */ (function () {
    function ApiHandler(_managerConfig) {
        this._managerConfig = _managerConfig;
    }
    ApiHandler.prototype._log = function () {
        var stuff = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            stuff[_i] = arguments[_i];
        }
        if (this._managerConfig.logLevel === "DEBUG") {
            console.log.apply(console, stuff);
        }
    };
    Object.defineProperty(ApiHandler.prototype, "_sessionFileName", {
        /**
         * Get the name of the config file to use.
         */
        get: function () {
            return (this._managerConfig.configFileName ||
                process.env.HOME + "/.vimeo-library-manager/config.json");
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Load the save session info
     */
    ApiHandler.prototype._loadSession = function () {
        var sessionString;
        try {
            sessionString = fs.readFileSync(this._sessionFileName).toString("utf8");
        }
        catch (e1) {
            throw new Error("Can't read config file '" +
                this._sessionFileName +
                "'. You need to set up your Vimeo access.");
        }
        var data;
        try {
            data = JSON.parse(sessionString);
        }
        catch (e2) {
            throw new Error("Config file '" +
                this._sessionFileName +
                "' doesn't contain valid JSON data. You need to set up your Vimeo access.");
        }
        this._sessionData = data;
    };
    Object.defineProperty(ApiHandler.prototype, "_session", {
        /**
         * Return the saved session info
         *
         * Load it first, if required
         */
        get: function () {
            if (this._sessionData === undefined) {
                this._loadSession();
            }
            return this._sessionData;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Save the current session info
     */
    ApiHandler.prototype._saveSession = function () {
        var configFilePath = path.dirname(this._sessionFileName);
        try {
            if (!fs.existsSync(configFilePath)) {
                fs.mkdirSync(configFilePath, { recursive: true });
            }
            fs.writeFileSync(this._sessionFileName, JSON.stringify(this._sessionData, null, "  ") + "\n", "utf8");
            this._log("Saved config to", this._sessionFileName);
        }
        catch (error) {
            throw new Error("Couldn't save config file: " + error.message);
        }
    };
    Object.defineProperty(ApiHandler.prototype, "_vimeo", {
        get: function () {
            if (this._vimeoClient === undefined) {
                this._vimeoClient = new vimeo_access_1.ApiHandler(this._session, {
                    debug: this._managerConfig.logLevel === "DEBUG",
                });
            }
            return this._vimeoClient;
        },
        enumerable: false,
        configurable: true
    });
    /**
     * Set up your Vimeo session.
     *
     * This needs to be done only once, before even attempting to log into the system.
     * The setup configuration will be saved in the configuration file.
     */
    ApiHandler.prototype.setup = function (info) {
        this._sessionData = info;
        this._saveSession();
        console.log("Saved new setup with the provided info. The next step is to log in.");
    };
    /**
     * Make sure that we have adequate info in the saved session to log in
     */
    ApiHandler.prototype._checkLoginConfig = function () {
        var _a = this._session, clientId = _a.clientId, clientSecret = _a.clientSecret, redirectUrl = _a.redirectUrl;
        if (!clientId) {
            throw new Error("Client ID is missing from the configuration. You need to set up your Vimeo session.");
        }
        if (!clientSecret) {
            throw new Error("Client secret is missing from the configuration. You need to set up your Vimeo session.");
        }
        if (!redirectUrl) {
            throw new Error("Redirect URL is missing from the configuration. You need to set up your Vimeo session.");
        }
    };
    ApiHandler.prototype._launchServer = function () {
        var _this = this;
        var app = connect();
        // Find out the path we need to listen to
        var wantedPath = URI.parse(this._session.redirectUrl).path;
        // respond to all requests
        app.use(function (req, res) {
            if (!req.url)
                return;
            var _a = URI.parse(req.url), path = _a.path, query = _a.query;
            if (!query)
                return;
            if (path === wantedPath) {
                // We have our callback!
                var values = util_1.parseQuery(query);
                var state = values.state, code = values.code;
                try {
                    var fileName = __dirname + "/../../../assets/success.html";
                    res.end(fs.readFileSync(fileName));
                    void _this.finishLogin(state, code);
                    // process.exit(0); // TODO find out what we need here
                }
                catch (error) {
                    res.end(error.message);
                }
            }
            else {
                res.end("Move along, nothing to see here.\n");
            }
        });
        http.createServer(app).listen(3000);
    };
    ApiHandler.prototype.startLogin = function (config) {
        this._checkLoginConfig();
        var noWebServer = config.noWebServer, noBrowserLaunch = config.noBrowserLaunch;
        // Generate a new state token. We need this to verify the redirect
        var stateToken = shortid_1.default.generate();
        // Generate a new login URL with our state token
        var url = this._vimeo.getLoginUrl(stateToken);
        // Save the state token
        /**
         * We put the state token
         */
        this._session.stateToken = stateToken;
        this._saveSession();
        if (!noBrowserLaunch) {
            console.log("Launching web browser...");
            open(url).then(function () { }, function (_r) {
                throw new Error("Failed to launch web browser.");
            });
        }
        if (!noWebServer) {
            console.log("Launching web server, anticipating redirect call...");
            this._launchServer();
        }
        return url;
    };
    ApiHandler.prototype.finishLogin = function (stateToken, codeToken) {
        return __awaiter(this, void 0, void 0, function () {
            var wantedStateToken, info, _a, userUri, scopes, accessToken;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._checkLoginConfig();
                        wantedStateToken = this._session.stateToken;
                        if (wantedStateToken === undefined) {
                            throw new Error("As per my records, we don't have a pending login process!");
                        }
                        if (stateToken !== wantedStateToken) {
                            throw new Error("Invalid state token!");
                        }
                        return [4 /*yield*/, util_1.slow("getting access token from Vimeo", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.finishLogin(codeToken)];
                                        case 1:
                                            info = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        _a = info, userUri = _a.userUri, scopes = _a.scopes, accessToken = _a.accessToken;
                        console.log("Logged in as", userUri, "!");
                        delete this._session.stateToken;
                        util_1.mergeInto(this._session, {
                            accessToken: accessToken,
                            userUri: userUri,
                            scopes: scopes,
                        });
                        this._saveSession();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiHandler.prototype.logout = function () {
        // TODO: Actually invalidate the token, instead of just dropping it
        var session = this._session;
        delete session.accessToken;
        delete session.userUri;
        delete session.userName;
        delete session.scopes;
        this._saveSession();
        console.log("Logged out from Vimeo.");
    };
    ApiHandler.prototype.checkLoginStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, userName, userUri, accessToken, result_1;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        _a = this._session, userName = _a.userName, userUri = _a.userUri, accessToken = _a.accessToken;
                        if (!accessToken) return [3 /*break*/, 2];
                        this._log("We have an access token.");
                        return [4 /*yield*/, util_1.slow("trying to access Vimeo", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.tutorial()];
                                        case 1:
                                            result_1 = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _b.sent();
                        console.log("Test API call says: ", result_1);
                        console.log();
                        console.log("You are logged in as", userName, "(", userUri, ")");
                        return [3 /*break*/, 3];
                    case 2:
                        this._log("No access token found; let's see if set up is correct...");
                        this._checkLoginConfig();
                        console.log("You have set up your client, but haven't logged in yet.");
                        _b.label = 3;
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    ApiHandler.prototype.getMyVideos = function () {
        return __awaiter(this, void 0, void 0, function () {
            var results;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.slow("loading the list from Vimeo", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.listMyVideos()];
                                    case 1:
                                        results = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { hide: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, results];
                }
            });
        });
    };
    ApiHandler.prototype.getVideo = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.slow("loading video data from Vimeo", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.getVideo(videoId)];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); }, { hide: true })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ApiHandler.prototype.updateVideoData = function (videoId, data, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var silent, video;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        silent = config.silent;
                        this._log("Editing video", videoId, "with data", JSON.stringify(data, null, "  "), "\n");
                        return [4 /*yield*/, this.getVideo(videoId)];
                    case 1:
                        video = _a.sent();
                        if (video.user.uri !== this._session.userUri) {
                            throw new Error("I can only touch your videos, but this video is owned by: " +
                                video.user.uri +
                                " " +
                                video.user.name);
                        }
                        util_1.reduceChanges(data, video);
                        if (!Object.keys(data).length) {
                            console.log("Your video has all this data! Nothing to update.", "\n");
                            return [2 /*return*/, video];
                        }
                        if (!silent) {
                            console.log("Change(s) detected at: ", util_1.getKeys(data).join(", ") + ".", "\n");
                        }
                        this._log(data);
                        return [4 /*yield*/, util_1.slow("updating data", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.editVideo(videoId, data)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [4 /*yield*/, this.getVideo(videoId)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiHandler.prototype.uploadVideo = function (videoFileName, data, config) {
        return __awaiter(this, void 0, void 0, function () {
            var waitForEncoding, thumbnailTime, thumbnailImageFile, openInBrowser, idFileName, hash, uri, videoId, wantedThumbnail, video;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Uploading", videoFileName, "as", "'" + data.name + "' ...", "\n");
                        waitForEncoding = config.waitForEncoding, thumbnailTime = config.thumbnailTime, thumbnailImageFile = config.thumbnailImageFile, openInBrowser = config.openInBrowser, idFileName = config.idFileName;
                        this._log("Received data:", data);
                        return [4 /*yield*/, util_1.slow("calculating hash", function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = "http://";
                                            return [4 /*yield*/, util_1.getHash(videoFileName)];
                                        case 1:
                                            hash = _a + (_b.sent());
                                            util_1.mergeInto(data, { embed: { logos: { custom: { link: hash } } } });
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, util_1.slow("uploading video file", function (control) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.uploadVideo(videoFileName, data, function (uploaded, total) {
                                                control.setText("Uploaded " + Math.round((100 * uploaded) / total) + "%");
                                            })];
                                        case 1:
                                            uri = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        videoId = exports.videoUriToId(uri);
                        if (idFileName !== undefined) {
                            try {
                                fs.writeFileSync(idFileName, videoId);
                            }
                            catch (error) {
                                throw new Error("Couldn't save video ID to '" +
                                    idFileName +
                                    "': " +
                                    error.message);
                            }
                        }
                        /**
                         * For some reason, just after uploading, some fields (like the name a.k.a. title) get messed up.
                         * To work around this, we update the metadata right away.
                         */
                        return [4 /*yield*/, this.updateVideoData(videoId, data, { silent: true })];
                    case 3:
                        /**
                         * For some reason, just after uploading, some fields (like the name a.k.a. title) get messed up.
                         * To work around this, we update the metadata right away.
                         */
                        _a.sent();
                        if (!(waitForEncoding || thumbnailTime !== undefined)) return [3 /*break*/, 5];
                        return [4 /*yield*/, util_1.slow("waiting for encoding", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.waitForEncodingToFinish(videoId)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5:
                        if (!(thumbnailTime !== undefined)) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.recreateThumbnail(videoId, {
                                time: thumbnailTime,
                            })];
                    case 6:
                        wantedThumbnail = _a.sent();
                        _a.label = 7;
                    case 7:
                        if (!thumbnailImageFile) return [3 /*break*/, 9];
                        return [4 /*yield*/, this.uploadThumbnail(videoId, thumbnailImageFile, {
                                active: true,
                            })];
                    case 8:
                        wantedThumbnail = _a.sent();
                        _a.label = 9;
                    case 9:
                        if (wantedThumbnail) {
                            console.log("Wanted thumbnail is", wantedThumbnail.uri);
                        }
                        return [4 /*yield*/, util_1.slow("checking end result", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.getVideo(videoId)];
                                        case 1:
                                            video = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 10:
                        _a.sent();
                        this._log("Video data is", video);
                        if (openInBrowser) {
                            console.log("Opening in browser:", video.link, "\n");
                            open(video.link).then();
                        }
                        return [2 /*return*/, video];
                }
            });
        });
    };
    ApiHandler.prototype.deleteVideo = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Going to delete video", videoId, "\n");
                        return [4 /*yield*/, util_1.slow("deleting video", function () { return _this._vimeo.deleteVideo(videoId); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiHandler.prototype.replaceVideoContent = function (videoId, videoFileName, config) {
        return __awaiter(this, void 0, void 0, function () {
            var waitForEncoding, openInBrowser, keepThumbnail, thumbnailTime, thumbnailImageFile, ignoreHash, video, oldHash, newHash;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Replacing video content for", videoId, "with", videoFileName, "...", "\n");
                        waitForEncoding = config.waitForEncoding, openInBrowser = config.openInBrowser, keepThumbnail = config.keepThumbnail, thumbnailTime = config.thumbnailTime, thumbnailImageFile = config.thumbnailImageFile, ignoreHash = config.ignoreHash;
                        return [4 /*yield*/, this.getVideo(videoId)];
                    case 1:
                        video = _a.sent();
                        oldHash = get_1.default(video, "embed.logos.custom.link");
                        newHash = "unset";
                        return [4 /*yield*/, util_1.slow("calculating hash", function () { return __awaiter(_this, void 0, void 0, function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            _a = "http://";
                                            return [4 /*yield*/, util_1.getHash(videoFileName)];
                                        case 1:
                                            newHash = _a + (_b.sent());
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        if (newHash === oldHash) {
                            if (ignoreHash) {
                                console.log("The video content seems to be the same, but replacing anyway, as requested.", "\n");
                            }
                            else {
                                console.log("The video content is the same. Nothing to update.", "\n");
                                return [2 /*return*/, video];
                            }
                        }
                        return [4 /*yield*/, util_1.slow("uploading video file", function (control) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.replaceVideo(videoId, videoFileName, function (uploaded, total) {
                                                control.setText("Uploaded " + Math.round((100 * uploaded) / total) + "%");
                                            })];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, util_1.slow("updating meta-data", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    return [2 /*return*/, this._vimeo.editVideo(videoId, {
                                            embed: { logos: { custom: { link: newHash } } },
                                        })];
                                });
                            }); })];
                    case 4:
                        _a.sent();
                        if (!(waitForEncoding || (!keepThumbnail && !thumbnailImageFile))) return [3 /*break*/, 6];
                        return [4 /*yield*/, util_1.slow("waiting for encoding", function (control) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            control.setText("waiting for encoding to start...");
                                            return [4 /*yield*/, this._vimeo.waitForEncodingToStart(videoId)];
                                        case 1:
                                            _a.sent();
                                            control.setText("waiting for encoding to finish...");
                                            return [4 /*yield*/, this._vimeo.waitForEncodingToFinish(videoId)];
                                        case 2:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 5:
                        _a.sent();
                        _a.label = 6;
                    case 6:
                        if (!!keepThumbnail) return [3 /*break*/, 11];
                        if (!thumbnailImageFile) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.uploadThumbnail(videoId, thumbnailImageFile, {
                                active: true,
                            })];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 8: 
                    /**
                     * We will generate a thumbnail from the image
                     */
                    return [4 /*yield*/, util_1.slow("waiting for the video to be ready for thumbnail generation", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, util_1.sleep(30 * 1000)];
                                    case 1:
                                        _a.sent(); // TODO: what out what is a safe value here
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 9:
                        /**
                         * We will generate a thumbnail from the image
                         */
                        _a.sent();
                        return [4 /*yield*/, this.recreateThumbnail(videoId, { time: thumbnailTime })];
                    case 10:
                        _a.sent();
                        _a.label = 11;
                    case 11: return [4 /*yield*/, util_1.slow("checking end result", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.getVideo(videoId)];
                                    case 1:
                                        video = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 12:
                        _a.sent();
                        if (openInBrowser) {
                            console.log("Opening in browser:", video.link, "\n");
                            open(video.link).then();
                        }
                        return [2 /*return*/, video];
                }
            });
        });
    };
    ApiHandler.prototype.openVideo = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            var video;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this._vimeo.getVideo(videoId)];
                    case 1:
                        video = _a.sent();
                        console.log("Opening in browser:", video.link, "\n");
                        open(video.link).then();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiHandler.prototype.getAllThumbnails = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.slow("getting data about thumbnails", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.getAllThumbnails(videoId)];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ApiHandler.prototype.deleteThumbnail = function (videoId, pictureId) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Going to delete thumbnail", pictureId, "for video", videoId, "\n");
                        return [4 /*yield*/, util_1.slow("deleting thumbnail", function () {
                                return _this._vimeo.deleteThumbnail(videoId, pictureId);
                            })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiHandler.prototype.deleteThumbnails = function (videoId) {
        return __awaiter(this, void 0, void 0, function () {
            var thumbnails;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        console.log("Going to delete thumbnails", "for video", videoId, "\n");
                        return [4 /*yield*/, this.getAllThumbnails(videoId)];
                    case 1:
                        thumbnails = _a.sent();
                        thumbnails.forEach(function (thumbnail) {
                            var pictureId = exports.pictureUriToId(thumbnail.uri);
                            util_1.slow("deleting thumbnail " + pictureId, function () { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.deleteThumbnail(videoId, pictureId)];
                                    case 1: return [2 /*return*/, _a.sent()];
                                }
                            }); }); });
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    ApiHandler.prototype.createThumbnail = function (videoId, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var time, active, openInBrowser, wantedTime, video, result, link;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        time = config.time, active = config.active, openInBrowser = config.openInBrowser;
                        wantedTime = time;
                        if (!(wantedTime === undefined)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getVideo(videoId)];
                    case 1:
                        video = _a.sent();
                        wantedTime = video.duration / 2;
                        _a.label = 2;
                    case 2: return [4 /*yield*/, util_1.slow("creating thumbnail", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.createThumbnail(videoId, wantedTime, active)];
                                    case 1:
                                        result = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 3:
                        _a.sent();
                        if (openInBrowser) {
                            link = selectLargestPicture(result).link;
                            console.log("Opening in browser:", link, "\n");
                            open(link).then();
                        }
                        return [2 /*return*/, result];
                }
            });
        });
    };
    ApiHandler.prototype.recreateThumbnail = function (videoId, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var time, openInBrowser;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        time = config.time, openInBrowser = config.openInBrowser;
                        return [4 /*yield*/, this.deleteThumbnails(videoId)];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.createThumbnail(videoId, {
                                time: time,
                                active: true,
                                openInBrowser: openInBrowser,
                            })];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    ApiHandler.prototype.uploadThumbnail = function (videoId, fileName, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var active, openInBrowser, video, picturesUri, data, extension, contentType, uploadPicture, _a, pictureUri, uploadLink;
            var _this = this;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        this._log("Uploading new thumbnail for", videoId);
                        active = config.active, openInBrowser = config.openInBrowser;
                        this._log("(Activate: ", active, "; open: ", openInBrowser, ")");
                        return [4 /*yield*/, this.getVideo(videoId)];
                    case 1:
                        video = _b.sent();
                        picturesUri = video.metadata.connections.pictures.uri;
                        this._log("Pictures URI is", picturesUri);
                        data = fs.readFileSync(fileName);
                        this._log("Read", data.length, "bytes from", fileName);
                        extension = path.extname(fileName).toLowerCase().substr(1);
                        contentType = contentTypes[extension];
                        if (!contentType) {
                            throw new Error("Unknown image extension '" +
                                extension +
                                "'. Please stick to " +
                                Object.keys(contentTypes).join(", "));
                        }
                        return [4 /*yield*/, util_1.slow("Requesting a new thumbnail upload", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.initiateThumbnailUpload(picturesUri)];
                                        case 1:
                                            uploadPicture = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _b.sent();
                        _a = uploadPicture, pictureUri = _a.uri, uploadLink = _a.link;
                        this._log("Created new thumbnail picture", pictureUri);
                        this._log("Upload link is", uploadLink);
                        // Execute the upload
                        return [4 /*yield*/, util_1.slow("uploading image", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.uploadThumbnail(uploadLink, contentType, data)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 3:
                        // Execute the upload
                        _b.sent();
                        this._log("Image uploaded.");
                        if (!active) return [3 /*break*/, 5];
                        return [4 /*yield*/, util_1.slow("activating new thumbnail", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.setThumbnailActive(uploadPicture.uri, true)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 4:
                        _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!openInBrowser) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.openVideo(videoId)];
                    case 6:
                        _b.sent();
                        _b.label = 7;
                    case 7: return [2 /*return*/, uploadPicture];
                }
            });
        });
    };
    ApiHandler.prototype.getShowcase = function (showcaseId) {
        return __awaiter(this, void 0, void 0, function () {
            var showcase, videos;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, util_1.slow("getting data about the showcase itself", function () { return __awaiter(_this, void 0, void 0, function () {
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0: return [4 /*yield*/, this._vimeo.getShowcase(showcaseId)];
                                    case 1:
                                        showcase = _a.sent();
                                        return [2 /*return*/];
                                }
                            });
                        }); })];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, util_1.slow("getting the list of videos", function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, this._vimeo.getVideosInShowcase(showcaseId)];
                                        case 1:
                                            videos = _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); })];
                    case 2:
                        _a.sent();
                        return [2 /*return*/, __assign(__assign({}, showcase), { videos: videos })];
                }
            });
        });
    };
    return ApiHandler;
}());
exports.ApiHandler = ApiHandler;
