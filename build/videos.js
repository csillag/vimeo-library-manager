"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateVideoData = exports.listVideos = void 0;
var auth_1 = require("./auth");
var config_1 = require("./config");
function listVideos() {
    var vimeo = auth_1.getNormalClient();
    if (!vimeo) {
        return;
    }
    var config = config_1.loadConfig();
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
    var title = options.title, description = options.description, custom = options.custom;
    var data = {};
    try {
        data = JSON.parse(custom);
    }
    catch (error) {
        console.error("The data you specified is not valid JSON!");
        console.error();
        return;
    }
    if (title !== undefined) {
        data.name = title;
    }
    if (description !== undefined) {
        data.description = description;
    }
    console.log("Editing video", videoId, "with data", JSON.stringify(data, null, "  "));
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
    try {
        var result = vimeo.editVideo(videoId, data);
        console.log("Result is:", result);
    }
    catch (error) {
        console.error("Error while editing video:", error);
        console.error();
    }
}
exports.updateVideoData = updateVideoData;
