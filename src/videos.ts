const fs = require("fs");
const openInBrowser = require("open");
const ora = require("ora");

import { getNormalClient, hasScope } from "./auth";
import { getConfig } from "./config";
import { VideoData } from "./lib/vimeo-access";
import { reduceChanges } from "./json-compare";
import { log, showError } from "./common";
import { parseCommonOptions } from "./cli";
import { getHashSync } from "./hash";

function describeVideo(video: VideoData) {
  const { privacy, link, name } = video;
  console.log(link, "\t\t", privacy.view, "\t", name);
}

export function listVideos() {
  const vimeo = getNormalClient();
  if (!vimeo) {
    return;
  }

  const config = getConfig()!;
  const { userName } = config;
  console.log();
  console.log("Listing videos for", userName, "...");
  console.log();
  try {
    const results = vimeo.listMyVideos();
    console.log("Found", results.length, "videos:");
    console.log();
    results.forEach(describeVideo);
    console.log();
  } catch (error) {
    showError("Error while getting the list of videos:", error);
  }
}

export function updateVideoData(videoId: string, options: any) {
  const data = parseCommonOptions(options);
  if (!data) {
    return;
  }
  log("Editing video", videoId, "with data", JSON.stringify(data, null, "  "));
  console.log();

  const vimeo = getNormalClient();
  if (!vimeo) {
    return;
  }

  if (!hasScope("edit")) {
    showError(
      "This session doesn't have EDIT scope. Please log out and log in again, with the correct permissions."
    );
    return;
  }

  let video: VideoData;
  try {
    video = vimeo.getVideo(videoId);
  } catch (error) {
    showError("Error while checking out requested video:", error);
    return;
  }

  const config = getConfig()!;
  if (video.user.uri !== config.userUri) {
    showError(
      "I can only touch your videos, but this video is owned by:",
      video.user.uri,
      video.user.name
    );
    return;
  }

  reduceChanges(data, video);

  if (!Object.keys(data).length) {
    console.log("Your video has all this data! Nothing to update.");
    console.log();
    return;
  }

  console.log("Actual changes:", JSON.stringify(data, null, "  "));
  console.log();

  try {
    const result = vimeo!.editVideo(videoId, data);
    console.log("Result is:", result);
    console.log();
  } catch (error) {
    showError("Error while editing video:", error);
  }
}

export function uploadVideo(videoFileName: string, options: any) {
  const data = parseCommonOptions(options);
  const hash = getHashSync(videoFileName);
  Object.assign(data, { embed: { logos: { custom: { link: hash } } } });
  console.log(
    "Should upload video",
    videoFileName,
    "data:",
    JSON.stringify(data, null, "  ")
  );
  console.log();
  const vimeo = getNormalClient();
  if (!vimeo) {
    return;
  }
  let videoId: string;
  const uploading = ora({
    text: "Uploading video ...",
    prefixText: " ",
  }).start();
  try {
    const uri = vimeo.uploadVideo(videoFileName, data!, (uploaded, total) => {
      uploading.text = "Uploaded " + Math.round((100 * uploaded) / total) + "%";
    });
    uploading.succeed("Video uploaded successfully.");
    console.log();
    videoId = uri.substr(8);
  } catch (error) {
    uploading.fail("Failed to upload video." + error);
    return;
  }
  const { writeIdTo } = options;
  if (writeIdTo !== undefined) {
    try {
      fs.writeFileSync(writeIdTo, videoId);
    } catch (error) {
      showError("Error saving video ID to '" + writeIdTo + "':", error);
    }
  }
  const { waitForEncoding, open } = options;

  if (waitForEncoding) {
    const encoding = ora({
      text: "Waiting for encoding to finish...",
      prefixText: " ",
    }).start();
    try {
      console.log();
      vimeo.waitForEncoding(videoId);
      encoding.succeed("Video encoded successfully.");
      console.log();
    } catch (error) {
      encoding.fail("Encoding failed");
      console.error();
    }
  }

  console.log("Checking end result...");
  console.log();
  const video = vimeo.getVideo(videoId);
  describeVideo(video);
  console.log();
  if (open) {
    console.log("Opening video in browser...");
    console.log();
    openInBrowser(video.link);
  }
  console.log();
}
