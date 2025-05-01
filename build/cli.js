#!/usr/bin/env node
"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var fs = require("fs");
var commander_1 = require("commander");
var APP_NAME = "vimeo-library-manager";
/**
 * Run the commands with a configured Vimeo Library Manager instance, and exception handling
 */
function runAction(action, args) {
    return __awaiter(this, void 0, void 0, function () {
        var opts, parent, config, debug, manager, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts = args[args.length - 1];
                    parent = opts.parent;
                    config = parent.config, debug = parent.debug;
                    manager = _1.createVimeoLibraryManager({
                        configFileName: config,
                        logLevel: debug ? "DEBUG" : "NORMAL",
                    });
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, action(manager, args)];
                case 2:
                    _a.sent();
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    console.error("\x1b[31m", "\n", debug ? error_1 : error_1.message);
                    console.error("\x1b[0m");
                    return [3 /*break*/, 4];
                case 4: return [2 /*return*/];
            }
        });
    });
}
var wrapAction = function (action) { return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        args[_i] = arguments[_i];
    }
    return runAction(action, args);
}; };
/**
 * Define common options for uploading / editing videos
 */
function addUpdateEditOptions(command) {
    return command
        .option("--set-title <title>", "Set title")
        .option("--set-description <description>", "Set description")
        .option("--set-description-file <description-file>", "Load description from a file")
        .option("--set-color <color>", "Set color")
        .option("--set-custom <JSON-data>", "Set custom JSON data")
        .option("--set-custom-file <JSON-data-file>", "Set custom JSON data from a file")
        .option("--set-privacy <policy>", "Set privacy policy")
        .option("--set-password <password>", "Set the password");
}
/**
 * Parse common options for uploading / editing videos
 */
function parseUpdateEditOptions(options) {
    var setTitle = options.setTitle, setDescription = options.setDescription, setDescriptionFile = options.setDescriptionFile, setCustom = options.setCustom, setCustomFile = options.setCustomFile, setPrivacy = options.setPrivacy, setPassword = options.setPassword, setColor = options.setColor;
    var data = {};
    if (setCustomFile !== undefined) {
        var customString = void 0;
        try {
            customString = fs.readFileSync(setCustomFile, "utf8");
        }
        catch (error) {
            throw new Error("Can't read custom data file '" +
                setCustomFile +
                "': " +
                error.message);
        }
        try {
            var custom = JSON.parse(customString);
            _1.mergeInto(data, custom);
        }
        catch (error) {
            throw new Error("The custom data you specified in '" +
                setCustomFile +
                "' is not valid JSON!");
        }
    }
    if (setCustom !== undefined) {
        try {
            var custom = JSON.parse(setCustom);
            _1.mergeInto(data, custom);
        }
        catch (error) {
            throw new Error("The custom data you specified is not valid JSON!");
        }
    }
    if (setTitle !== undefined) {
        data.name = setTitle;
    }
    if (setDescriptionFile !== undefined) {
        try {
            data.description = fs
                .readFileSync(setDescriptionFile, {
                encoding: "utf8",
            })
                .trim();
        }
        catch (error) {
            throw new Error("Can't read specified description file '" +
                setDescriptionFile +
                "': " +
                error.message);
        }
    }
    if (setDescription !== undefined) {
        data.description = setDescription;
    }
    if (setColor !== undefined) {
        data.embed.color = setColor;
    }
    if (setPrivacy !== undefined) {
        _1.mergeInto(data, { privacy: { view: setPrivacy } });
    }
    if (setPassword !== undefined) {
        _1.mergeInto(data, {
            password: setPassword,
            privacy: { view: "password" },
        });
    }
    return data;
}
/**
 * Define common options for uploading / replacing videos
 */
function addUpdateReplaceOptions(command) {
    return command
        .option("--wait-for-encoding", "Wait until the video encoding finishes")
        .option("--thumbnail-time-offset <seconds>", "Specify the time offset from where to take the thumbnail. (The default is from the middle of the video.)")
        .option("--thumbnail-file <image-file>", "Use a custom image file as a thumbnail.")
        .option("--open", "Open in browser");
}
function describeVideo(video) {
    var privacy = video.privacy, link = video.link, name = video.name, duration = video.duration;
    console.log(link, "(", duration, ")", "\t\t", privacy.view, "\t", name);
}
function cli() {
    var _this = this;
    var program = new commander_1.Command(APP_NAME);
    program.version("0.0.15");
    program
        .option("-c, --config <config-file>", "path to config file"
    // process.env.HOME + "/.vimeo-library-manager/config.json"
    )
        .option("-d, --debug", "output extra debugging");
    program
        .command("test")
        .description("Test your Vimeo access")
        .action(wrapAction(function (manager) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, manager.checkLoginStatus()];
            case 1: return [2 /*return*/, _a.sent()];
        }
    }); }); }));
    program
        .command("setup <client-id> <client-secret> <redirect-url>")
        .description("Set up your Vimeo access")
        .action(wrapAction(function (vimeo, args) { return __awaiter(_this, void 0, void 0, function () {
        var clientId, clientSecret, redirectUrl;
        return __generator(this, function (_a) {
            clientId = args[0], clientSecret = args[1], redirectUrl = args[2];
            vimeo.setup({
                clientId: clientId,
                clientSecret: clientSecret,
                redirectUrl: redirectUrl,
            });
            return [2 /*return*/];
        });
    }); }));
    program
        .command("login")
        .description("Start the login process")
        .option("--no-web-server", "Don't launch a web server (for accepting the incoming login redirect")
        .option("--no-browser-launch", "Don't open the login page in the browser")
        .action(wrapAction(function (manager, options) { return __awaiter(_this, void 0, void 0, function () {
        var _a, browserLaunch, webServer, url;
        return __generator(this, function (_b) {
            _a = options[0], browserLaunch = _a.browserLaunch, webServer = _a.webServer;
            url = manager.startLogin({
                noWebServer: !webServer,
                noBrowserLaunch: !browserLaunch,
            });
            if (!browserLaunch) {
                console.log("Now go here to grant access:");
                console.log();
                console.log(url);
            }
            if (!webServer) {
                console.log("After granting permission, you will be redirected to a non-existent page.", "Copy the `state` and `code` from the URL, and run '" +
                    APP_NAME +
                    " finish-login <state> <code>' !");
            }
            return [2 /*return*/];
        });
    }); }));
    program
        .command("finish-login <state-token> <code-token>", { hidden: true })
        .description("Finish the login process")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var stateToken, codeToken;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    stateToken = args[0], codeToken = args[1];
                    return [4 /*yield*/, manager.finishLogin(stateToken, codeToken)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("logout")
        .description("Log out from vimeo")
        .action(wrapAction(function (manager) { return __awaiter(_this, void 0, void 0, function () { return __generator(this, function (_a) {
        return [2 /*return*/, manager.logout()];
    }); }); }));
    program
        .command("list-videos")
        .description("List my videos")
        .action(wrapAction(function (manager) { return __awaiter(_this, void 0, void 0, function () {
        var results;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, manager.getMyVideos()];
                case 1:
                    results = _a.sent();
                    if (!results.length) {
                        console.log("I don't see no videos here.");
                    }
                    else if (results.length === 1) {
                        console.log("Found one video:");
                        console.log();
                        describeVideo(results[0]);
                        console.log();
                    }
                    else {
                        console.log("Found", results.length, "videos:");
                        console.log();
                        results.forEach(describeVideo);
                    }
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("show-details <video-id>")
        .description("Show details about a video")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0];
                    return [4 /*yield*/, manager.getVideo(videoId)];
                case 1:
                    video = _a.sent();
                    console.log(video);
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("get-showcase <showcase-id>")
        .description("Get info about one of my showcases")
        .option("--url-only", "Only show the URL for each video")
        .action(wrapAction(function (manager, _a) {
        var showcaseId = _a[0], urlOnly = _a[1].urlOnly;
        return __awaiter(_this, void 0, void 0, function () {
            var result, name, link, videos;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, manager.getShowcase(showcaseId)];
                    case 1:
                        result = _b.sent();
                        name = result.name, link = result.link, videos = result.videos;
                        console.log("Found showcase", '"' + name + '"', "at", link);
                        console.log();
                        console.log("Found", videos.length, "videos:");
                        console.log();
                        videos.forEach(urlOnly ? function (v) { return console.log(v.link); } : describeVideo);
                        return [2 /*return*/];
                }
            });
        });
    }));
    program
        .command("open-video <video-id>")
        .description("Open a video in a browser")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0];
                    return [4 /*yield*/, manager.openVideo(videoId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    var update = program.command("update-data <video-id>");
    // @ts-ignore
    addUpdateEditOptions(update)
        .description("Update video meta-data")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, opts, data, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0], opts = args[1];
                    data = parseUpdateEditOptions(opts);
                    return [4 /*yield*/, manager.updateVideoData(videoId, data)];
                case 1:
                    video = _a.sent();
                    describeVideo(video);
                    return [2 /*return*/];
            }
        });
    }); }));
    var upload = program.command("upload-video <video-file>");
    // @ts-ignore
    addUpdateEditOptions(upload);
    // @ts-ignore
    addUpdateReplaceOptions(upload)
        .option("--write-id-to <id-file>", "Write the ID of the new video to a file")
        .description("Upload a new video")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoFileName, opts, data, waitForEncoding, thumbnailTimeOffset, thumbnailFile, open, writeIdTo, video;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoFileName = args[0], opts = args[1];
                    data = parseUpdateEditOptions(opts);
                    waitForEncoding = opts.waitForEncoding, thumbnailTimeOffset = opts.thumbnailTimeOffset, thumbnailFile = opts.thumbnailFile, open = opts.open, writeIdTo = opts.writeIdTo;
                    return [4 /*yield*/, manager.uploadVideo(videoFileName, data, {
                            waitForEncoding: waitForEncoding,
                            thumbnailTime: thumbnailTimeOffset,
                            thumbnailImageFile: thumbnailFile,
                            openInBrowser: open,
                            idFileName: writeIdTo,
                        })];
                case 1:
                    video = _a.sent();
                    describeVideo(video);
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("delete-video <video-id>")
        .description("Delete a video")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0];
                    return [4 /*yield*/, manager.deleteVideo(videoId)];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    var replace = program.command("replace-content <video-id> <video-file-name>");
    // @ts-ignore
    addUpdateReplaceOptions(replace)
        .option("--no-recreate-thumbnail", "Don't recreate the thumbnail")
        .option("--ignore-hash", "Ignore the results of the hash comparison, upload anyway")
        .description("Replace video content")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, videoFileName, opts, waitForEncoding, open, recreateThumbnail, ignoreHash, thumbnailTimeOffset, thumbnailFile;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0], videoFileName = args[1], opts = args[2];
                    waitForEncoding = opts.waitForEncoding, open = opts.open, recreateThumbnail = opts.recreateThumbnail, ignoreHash = opts.ignoreHash, thumbnailTimeOffset = opts.thumbnailTimeOffset, thumbnailFile = opts.thumbnailFile;
                    return [4 /*yield*/, manager.replaceVideoContent(videoId, videoFileName, {
                            waitForEncoding: waitForEncoding,
                            keepThumbnail: !recreateThumbnail,
                            thumbnailTime: thumbnailTimeOffset,
                            thumbnailImageFile: thumbnailFile,
                            openInBrowser: open,
                            ignoreHash: ignoreHash,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("list-thumbnails <video-id>")
        .description("List the thumbnails for a video")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, thumbnails;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0];
                    return [4 /*yield*/, manager.getAllThumbnails(videoId)];
                case 1:
                    thumbnails = _a.sent();
                    console.log("Thumbnails for", videoId, "are:", "\n", thumbnails
                        .map(function (t) {
                        return " * " + t.uri + " " + t.type + (t.active ? " (active)" : "");
                    })
                        .join("\n"), "\n");
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("create-thumbnail <video-id>")
        .description("Create a new thumbnail for the video")
        .option("--time-offset <seconds>", "Specify the time offset from where to take the thumbnail. (The default is from the middle of the video.)")
        .option("--no-set-default", "Don't set the new thumbnail as default")
        .option("--open", "Open in browser")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, opts, active, openInBrowser, time;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0], opts = args[1];
                    active = opts.setDefault, openInBrowser = opts.open, time = opts.timeOffset;
                    return [4 /*yield*/, manager.createThumbnail(videoId, { time: time, active: active, openInBrowser: openInBrowser })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("recreate-thumbnail <video-id>")
        .description("Re-create the thumbnail for a video")
        .option("--time-offset <seconds>", "Specify the time offset from where to take the thumbnail. (The default is from the middle of the video.)")
        .option("--open", "Open in browser")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, opts, openInBrowser, time;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0], opts = args[1];
                    openInBrowser = opts.open, time = opts.timeOffset;
                    return [4 /*yield*/, manager.recreateThumbnail(videoId, { time: time, openInBrowser: openInBrowser })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    program
        .command("upload-thumbnail <video-id> <image-file>")
        .description("Upload a custom thumbnail for a video")
        .option("--no-activate", "Don't make the new thumbnail active. (You can do it later.)")
        .option("--open", "Open in browser")
        .action(wrapAction(function (manager, args) { return __awaiter(_this, void 0, void 0, function () {
        var videoId, imageFileName, opts, activate, open;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    videoId = args[0], imageFileName = args[1], opts = args[2];
                    activate = opts.activate, open = opts.open;
                    return [4 /*yield*/, manager.uploadThumbnail(videoId, imageFileName, {
                            active: activate,
                            openInBrowser: open,
                        })];
                case 1:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    }); }));
    console.log("[" + APP_NAME + "]");
    program.parse(process.argv);
    console.log();
}
cli();
