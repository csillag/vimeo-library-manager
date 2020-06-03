import { getNormalClient } from "./auth";
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

export function updateVideoData(videoId: string, dataString: string) {
  console.log();
  let data: VideoUpdateData = {};
  try {
    data = JSON.parse(dataString);
  } catch (error) {
    console.error("The data you specified is not valid JSON!");
    console.error();
    return;
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

  try {
    const result = vimeo.editVideo(videoId, data);
    console.log("Result is:", result);
  } catch (error) {
    console.error("Error while editing video:", error);
    console.error();
  }
}
