"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.uploadVideo = exports.updateVideoData = exports.listVideos = void 0;
var fs = require("fs");
var openInBrowser = require("open");
var auth_1 = require("./auth");
var config_1 = require("./config");
var json_compare_1 = require("./json-compare");
var common_1 = require("./common");
var cli_1 = require("./cli");
var hash_1 = require("./hash");

function describeVideo(video) {
  var privacy = video.privacy,
    link = video.link,
    name = video.name;
  console.log(link, "\t\t", privacy.view, "\t", name);
}

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
    results.forEach(describeVideo);
    console.log();
  } catch (error) {
    common_1.showError(error);
  }
}
exports.listVideos = listVideos;
function updateVideoData(videoId, options) {
  var data = cli_1.parseCommonOptions(options);
  if (!data) {
    return;
  }
  common_1.log(
    "Editing video",
    videoId,
    "with data",
    JSON.stringify(data, null, "  ")
  );
  console.log();
  var vimeo = auth_1.getNormalClient();
  if (!vimeo) {
    return;
  }
  if (!auth_1.hasScope("edit")) {
    common_1.showError(
      "This session doesn't have EDIT scope. Please log out and log in again, with the correct permissions."
    );
    return;
  }
  var video;
  try {
    video = vimeo.getVideo(videoId);
  } catch (error) {
    common_1.showError("Error while checking out requested video:", error);
    return;
  }
  var config = config_1.getConfig();
  if (video.user.uri !== config.userUri) {
    common_1.showError(
      "I can only touch your videos, but this video is owned by:",
      video.user.uri,
      video.user.name
    );
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
  } catch (error) {
    common_1.showError("Error while editing video:", error);
  }
}
exports.updateVideoData = updateVideoData;

function uploadVideo(videoFileName, options) {
  var data = cli_1.parseCommonOptions(options);
  var hash = hash_1.getHashSync(videoFileName);
  Object.assign(data, { embed: { logos: { custom: { link: hash } } } });
  console.log(
    "Should upload video",
    videoFileName,
    "data:",
    JSON.stringify(data, null, "  ")
  );
  var vimeo = auth_1.getNormalClient();
  if (!vimeo) {
    return;
  }
  var videoId;
  var writeIdTo = options.writeIdTo;
  try {
    var uri = vimeo.uploadVideo(videoFileName, data, function (
      uploaded,
      total
    ) {
      console.log("Uploaded " + Math.round((100 * uploaded) / total) + "%");
    });
    videoId = uri.substr(8);
  } catch (error) {
    common_1.showError(error);
    return;
  }
  if (writeIdTo !== undefined) {
    try {
      fs.writeFileSync(writeIdTo, videoId);
    } catch (error) {
      common_1.showError(
        "Error saving video ID to '" + writeIdTo + "':",
        error
      );
    }
  }
  var open = options.open;
  console.log();
  console.log("Checking end result...");
  console.log();
  var video = vimeo.getVideo(videoId);
  describeVideo(video);
  if (open) {
    console.log("Opening video in browser...");
    console.log();
    openInBrowser(video.link);
  }
  console.log();
}
exports.uploadVideo = uploadVideo;
