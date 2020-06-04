import { getNormalClient, hasScope } from "./auth";
import { getConfig } from "./config";
import { VideoData } from "./lib/vimeo-access";
import { reduceChanges } from "./json-compare";
import { log } from "./common";
import { parseCommonOptions } from "./cli";

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
    results.forEach((video) => {
      const { privacy, link, name } = video;
      console.log(link, "\t\t", privacy.view, "\t", name);
    });
    console.log();
  } catch (error) {
    console.error(error);
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
    console.error(
      "This session doesn't have EDIT scope. Please log out and log in again, with the correct permissions."
    );
    console.error();
    return;
  }

  let video: VideoData;
  try {
    video = vimeo.getVideo(videoId);
  } catch (error) {
    console.error("Error while checking out requested video:", error);
    console.error();
    return;
  }

  const config = getConfig()!;
  if (video.user.uri !== config.userUri) {
    console.error("I can only touch your videos.");
    console.error(
      "But this video is owned by:",
      video.user.uri,
      video.user.name
    );
    console.error();
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
    console.error("Error while editing video:", error);
    console.error();
  }
}

export function uploadVideo(videoFile: string, options: any) {
  const data = parseCommonOptions(options);
  console.log("Should upload video", videoFile, "data:", data);
}
