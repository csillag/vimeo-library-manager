import { getNormalClient } from "./auth";
import { loadConfig } from "./config";

export function listVideos() {
  const vimeo = getNormalClient();
  if (!vimeo) {
    return;
  }

  const config = loadConfig()!;
  const { user } = config;
  console.log();
  console.log("Listing videos for", user, "...");
  console.log();
  try {
    const results = vimeo.listMyVideos();
    console.log("Found", results.length, "videos:");
    console.log();
    results.forEach((video) => {
      const { link, name } = video;
      console.log(link, "\t\t", name);
    });
    console.log();
  } catch (error) {
    console.error(error);
  }
}
