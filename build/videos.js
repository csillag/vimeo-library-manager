"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = exports.updateVideoData = exports.listVideos = void 0;
var auth_1 = require("./auth");
var config_1 = require("./config");
var json_compare_1 = require("./json-compare");
var common_1 = require("./common");
var cli_1 = require("./cli");
function listVideos() {
    var vimeo = auth_1.getNormalClient();
    if (!vimeo) {
        return;
    }
    var config = config_1.getConfig();
    var userName = config.userName;
    console.log();
    console.log("Listing videos for", userName, "...");
    console.log();
    try {
        var results = vimeo.listMyVideos();
        console.log("Found", results.length, "videos:");
        console.log();
        results.forEach(function (video) {
            var privacy = video.privacy, link = video.link, name = video.name;
            console.log(link, "\t\t", privacy.view, "\t", name);
        });
        console.log();
    }
    catch (error) {
        console.error(error);
    }
}
exports.listVideos = listVideos;
function updateVideoData(videoId, options) {
    var data = cli_1.parseCommonOptions(options);
    if (!data) {
        return;
    }
    common_1.log("Editing video", videoId, "with data", JSON.stringify(data, null, "  "));
    console.log();
    var vimeo = auth_1.getNormalClient();
    if (!vimeo) {
        return;
    }
    if (!auth_1.hasScope("edit")) {
        console.error("This session doesn't have EDIT scope. Please log out and log in again, with the correct permissions.");
        console.error();
        return;
    }
    var video;
    try {
        video = vimeo.getVideo(videoId);
    }
    catch (error) {
        console.error("Error while checking out requested video:", error);
        console.error();
        return;
    }
    var config = config_1.getConfig();
    if (video.user.uri !== config.userUri) {
        console.error("I can only touch your videos.");
        console.error("But this video is owned by:", video.user.uri, video.user.name);
        console.error();
        return;
    }
    json_compare_1.reduceChanges(data, video);
    if (!Object.keys(data).length) {
        console.log("Your video has all this data! Nothing to update.");
        console.log();
        return;
    }
    console.log("Actual changes:", JSON.stringify(data, null, "  "));
    console.log();
    try {
        var result = vimeo.editVideo(videoId, data);
        console.log("Result is:", result);
        console.log();
    }
    catch (error) {
        console.error("Error while editing video:", error);
        console.error();
    }
}
exports.updateVideoData = updateVideoData;
function uploadVideo(videoFile, options) {
    var data = cli_1.parseCommonOptions(options);
    console.log("Should upload video", videoFile, "data:", data);
}
exports.uploadVideo = uploadVideo;
