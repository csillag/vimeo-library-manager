import { getNormalClient, hasScope } from "./auth";
import { loadConfig } from "./config";
import { VideoUpdateData } from "./lib/vimeo-access";

export function listVideos() {
  const vimeo = getNormalClient();
  if (!vimeo) {
    return;
  }

  const config = loadConfig()!;
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

  try {
    const result = vimeo.editVideo(videoId, data);
    console.log("Result is:", result);
  } catch (error) {
    console.error("Error while editing video:", error);
    console.error();
  }
}
