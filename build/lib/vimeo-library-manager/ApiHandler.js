"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiHandler = exports.selectLargestPicture = exports.pictureUriToId = exports.videoUriToId = void 0;
var lodashGet = require("lodash.get");
var fs = require("fs");
var path = require("path");
var shortId = require("shortid");
var open = require("open");
var connect = require("connect");
var http = require("http");
var URI = require("uri-js");
var Fiber = require("fibers");
var vimeo_access_sync_1 = require("../vimeo-access-sync");
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
                this._vimeoClient = new vimeo_access_sync_1.SyncApiHandler(this._session, {
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
    /**
     * Make sure we have adequate info in the saved session to access Vimeo
     */
    // private _checkFullConfig() {
    //   this._checkLoginConfig();
    //
    //   const { accessToken } = this._session;
    //   if (!accessToken) {
    //     throw new Error(
    //       "Access token is missing from the configuration. You need to log in to Vimeo."
    //     );
    //   }
    // }
    ApiHandler.prototype._launchServer = function () {
        var _this = this;
        var app = connect();
        // Find out the path we need to listen to
        var wantedPath = URI.parse(this._session.redirectUrl).path;
        // respond to all requests
        app.use(function (req, res) {
            var _a = URI.parse(req.url), path = _a.path, query = _a.query;
            if (path === wantedPath) {
                // We have our callback!
                var values = util_1.parseQuery(query);
                var state_1 = values.state, code_1 = values.code;
                try {
                    var fileName = __dirname + "/../../../assets/success.html";
                    res.end(fs.readFileSync(fileName));
                    Fiber(function () {
                        _this.finishLogin(state_1, code_1);
                        process.exit(0);
                    }).run();
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
        var stateToken = shortId.generate();
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
        var _this = this;
        this._checkLoginConfig();
        var wantedStateToken = this._session.stateToken;
        if (wantedStateToken === undefined) {
            throw new Error("As per my records, we don't have a pending login process!");
        }
        if (stateToken !== wantedStateToken) {
            throw new Error("Invalid state token!");
        }
        var info;
        util_1.slow("getting access token from Vimeo", function () {
            info = _this._vimeo.finishLogin(codeToken);
        });
        var _a = info, userUri = _a.userUri, userName = _a.userName, scopes = _a.scopes, accessToken = _a.accessToken;
        console.log("Logged in as", userUri, userName, "!");
        delete this._session.stateToken;
        util_1.mergeInto(this._session, {
            accessToken: accessToken,
            userUri: userUri,
            scopes: scopes,
        });
        this._saveSession();
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
        var _this = this;
        var _a = this._session, userName = _a.userName, userUri = _a.userUri, accessToken = _a.accessToken;
        if (accessToken) {
            this._log("We have an access token.");
            var result_1;
            util_1.slow("trying to access Vimeo", function () {
                result_1 = _this._vimeo.tutorial();
            });
            console.log("Test API call says: ", result_1);
            console.log();
            console.log("You are logged in as", userName, "(", userUri, ")");
        }
        else {
            this._log("No access token found; let's see if set up is correct...");
            this._checkLoginConfig();
            console.log("You have set up your client, but haven't logged in yet.");
        }
    };
    ApiHandler.prototype.getMyVideos = function () {
        var _this = this;
        var results;
        util_1.slow("loading the list from Vimeo", function () {
            results = _this._vimeo.listMyVideos();
        }, { hide: true });
        return results;
    };
    ApiHandler.prototype.getVideo = function (videoId) {
        var _this = this;
        var result;
        util_1.slow("loading video data from Vimeo", function () {
            result = _this._vimeo.getVideo(videoId);
        }, { hide: true });
        return result;
    };
    ApiHandler.prototype.updateVideoData = function (videoId, data) {
        var _this = this;
        this._log("Editing video", videoId, "with data", JSON.stringify(data, null, "  "), "\n");
        var video = this.getVideo(videoId);
        if (video.user.uri !== this._session.userUri) {
            throw new Error("I can only touch your videos, but this video is owned by: " +
                video.user.uri +
                " " +
                video.user.name);
        }
        util_1.reduceChanges(data, video);
        if (!Object.keys(data).length) {
            throw new Error("Your video has all this data! Nothing to update.");
        }
        console.log("Change(s) detected at: ", util_1.getKeys(data).join(", ") + ".", "\n");
        util_1.slow("updating data", function () {
            _this._vimeo.editVideo(videoId, data);
        });
        return this.getVideo(videoId);
    };
    ApiHandler.prototype.uploadVideo = function (videoFileName, data, config) {
        var _this = this;
        console.log("Uploading", videoFileName, "as", "'" + data.name + "' ...", "\n");
        var waitForEncoding = config.waitForEncoding, openInBrowser = config.openInBrowser, idFileName = config.idFileName;
        var hash;
        util_1.slow("calculating hash", function () {
            hash = util_1.getHashSync(videoFileName);
            util_1.mergeInto(data, { embed: { logos: { custom: { link: hash } } } });
        });
        var uri;
        util_1.slow("uploading video file", function (control) {
            uri = _this._vimeo.uploadVideo(videoFileName, data, function (uploaded, total) {
                control.setText("Uploaded " + Math.round((100 * uploaded) / total) + "%");
            });
        });
        var videoId = exports.videoUriToId(uri);
        if (idFileName !== undefined) {
            try {
                fs.writeFileSync(idFileName, videoId);
            }
            catch (error) {
                throw new Error("Couldn't save video ID to '" + idFileName + "': " + error.message);
            }
        }
        if (waitForEncoding) {
            util_1.slow("waiting for encoding", function () {
                _this._vimeo.waitForEncodingToFinish(videoId);
            });
        }
        var video;
        util_1.slow("checking end result", function () {
            video = _this._vimeo.getVideo(videoId);
        });
        if (openInBrowser) {
            console.log("Opening in browser:", video.link, "\n");
            open(video.link).then();
        }
        return video;
    };
    ApiHandler.prototype.deleteVideo = function (videoId) {
        var _this = this;
        console.log("Going to delete video", videoId, "\n");
        util_1.slow("deleting video", function () { return _this._vimeo.deleteVideo(videoId); });
    };
    ApiHandler.prototype.replaceVideoContent = function (videoId, videoFileName, config) {
        var _this = this;
        console.log("Replacing video content for", videoId, "with", videoFileName, "...", "\n");
        var waitForEncoding = config.waitForEncoding, openInBrowser = config.openInBrowser, keepThumbnail = config.keepThumbnail, thumbnailTime = config.thumbnailTime, ignoreHash = config.ignoreHash;
        var video = this.getVideo(videoId);
        var oldHash = lodashGet(video, "embed.logos.custom.link");
        var newHash;
        util_1.slow("calculating hash", function () {
            newHash = "http://" + util_1.getHashSync(videoFileName);
        });
        if (newHash === oldHash) {
            if (ignoreHash) {
                console.log("The video content seems to be the same, but replacing anyway, as requested.", "\n");
            }
            else {
                throw new Error("The video content is the same!");
            }
        }
        util_1.slow("updating meta-data", function () {
            _this._vimeo.editVideo(videoId, {
                embed: { logos: { custom: { link: newHash } } },
            });
        });
        util_1.slow("uploading video file", function (control) {
            _this._vimeo.replaceVideo(videoId, videoFileName, function (uploaded, total) {
                control.setText("Uploaded " + Math.round((100 * uploaded) / total) + "%");
            });
        });
        if (waitForEncoding || !keepThumbnail) {
            util_1.slow("waiting for encoding", function (control) {
                control.setText("waiting for encoding to start...");
                _this._vimeo.waitForEncodingToStart(videoId);
                control.setText("waiting for encoding to finish...");
                _this._vimeo.waitForEncodingToFinish(videoId);
            });
        }
        if (!keepThumbnail) {
            util_1.slow("waiting for the video to be ready for thumbnail generation", function () {
                util_1.sleep(10 * 1000); // TODO: what out what is a safe value here
            });
            this.recreateThumbnail(videoId, { time: thumbnailTime });
        }
        util_1.slow("checking end result", function () {
            video = _this._vimeo.getVideo(videoId);
        });
        if (openInBrowser) {
            console.log("Opening in browser:", video.link, "\n");
            open(video.link).then();
        }
        return video;
    };
    ApiHandler.prototype.openVideo = function (videoId) {
        var video = this._vimeo.getVideo(videoId);
        console.log("Opening in browser:", video.link, "\n");
        open(video.link).then();
    };
    ApiHandler.prototype.getAllThumbnails = function (videoId) {
        var _this = this;
        var result;
        util_1.slow("getting data about thumbnails", function () {
            result = _this._vimeo.getAllThumbnails(videoId);
        });
        return result;
    };
    ApiHandler.prototype.deleteThumbnail = function (videoId, pictureId) {
        var _this = this;
        console.log("Going to delete thumbnail", pictureId, "for video", videoId, "\n");
        util_1.slow("deleting thumbnail", function () {
            return _this._vimeo.deleteThumbnail(videoId, pictureId);
        });
    };
    ApiHandler.prototype.deleteThumbnails = function (videoId) {
        var _this = this;
        console.log("Going to delete thumbnails", "for video", videoId, "\n");
        var thumbnails = this.getAllThumbnails(videoId);
        thumbnails.forEach(function (thumbnail) {
            var pictureId = exports.pictureUriToId(thumbnail.uri);
            util_1.slow("deleting thumbnail " + pictureId, function () {
                return _this._vimeo.deleteThumbnail(videoId, pictureId);
            });
        });
    };
    ApiHandler.prototype.createThumbnail = function (videoId, config) {
        var _this = this;
        if (config === void 0) { config = {}; }
        var time = config.time, active = config.active, openInBrowser = config.openInBrowser;
        var wantedTime = time;
        if (wantedTime === undefined) {
            var video = this.getVideo(videoId);
            wantedTime = video.duration / 2;
        }
        var result;
        util_1.slow("creating thumbnail", function () {
            result = _this._vimeo.createThumbnail(videoId, wantedTime, active);
        });
        if (openInBrowser) {
            var link = selectLargestPicture(result).link;
            console.log("Opening in browser:", link, "\n");
            open(link).then();
        }
        return result;
    };
    ApiHandler.prototype.recreateThumbnail = function (videoId, config) {
        if (config === void 0) { config = {}; }
        var time = config.time, openInBrowser = config.openInBrowser;
        this.deleteThumbnails(videoId);
        return this.createThumbnail(videoId, {
            time: time,
            active: true,
            openInBrowser: openInBrowser,
        });
    };
    return ApiHandler;
}());
exports.ApiHandler = ApiHandler;
