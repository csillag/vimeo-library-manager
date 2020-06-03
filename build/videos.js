"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listVideos = void 0;
var auth_1 = require("./auth");
var config_1 = require("./config");
function listVideos() {
    var vimeo = auth_1.getNormalClient();
    if (!vimeo) {
        return;
    }
    var config = config_1.loadConfig();
    var user = config.user;
    console.log();
    console.log("Listing videos for", user, "...");
    console.log();
    try {
        var results = vimeo.listMyVideos();
        console.log("Found", results.length, "videos:");
        console.log();
        results.forEach(function (video) {
            var link = video.link, name = video.name;
            console.log(link, "\t\t", name);
        });
        console.log();
    }
    catch (error) {
        console.error(error);
    }
}
exports.listVideos = listVideos;
