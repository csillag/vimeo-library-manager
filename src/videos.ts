import { getNormalClient, hasScope } from "./auth";
import { getConfig } from "./config";
import { VideoData, VideoUpdateData } from "./lib/vimeo-access";

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
  const { title, description, custom } = options;

  let data: VideoUpdateData = {};
  try {
    data = JSON.parse(custom);
  } catch (error) {
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
  console.log(
    "Editing video",
    videoId,
    "with data",
    JSON.stringify(data, null, "  ")
  );
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

  try {
    const result = vimeo!.editVideo(videoId, data);
    console.log("Result is:", result);
  } catch (error) {
    console.error("Error while editing video:", error);
    console.error();
  }
}
