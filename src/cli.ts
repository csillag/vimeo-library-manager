const fs = require("fs");
import { Command } from "commander";
import { program } from "./common";
import {
  finishLogin,
  initAccess,
  logout,
  startLogin,
  testAccess,
} from "./auth";
import { listVideos, updateVideoData, uploadVideo } from "./videos";
import { VideoUpdateData } from "./lib/vimeo-access";

/**
 * Define common options for uploading / editing videos
 */
function addCommonOptions(command: Command): Command {
  return command
    .option("--set-title <title>", "Set title")
    .option("--set-description <description>", "Set description")
    .option(
      "--set-description-file <description-file>",
      "Load description from a file"
    )
    .option("--set-custom <JSON-data>", "Set custom JSON data")
    .option(
      "--set-custom-file <JSON-data-file>",
      "Set custom JSON data from a file"
    )
    .option("--set-privacy <policy>", "Set privacy policy")
    .option("--set-password <password>", "Set the password");
}

/**
 * Parse common options for uploading / editing videos
 */
export function parseCommonOptions(options: any): VideoUpdateData | undefined {
  const {
    setTitle,
    setDescription,
    setDescriptionFile,
    setCustom,
    setCustomFile,
    setPrivacy,
    setPassword,
  } = options;

  let data: VideoUpdateData = {};
  if (setCustomFile !== undefined) {
    let customString: string;
    try {
      customString = fs.readFileSync(setCustomFile, "utf8");
    } catch (error) {
      console.error();
      console.error(
        "Can't read custom data file",
        "'" + setCustomFile + "':",
        error.message
      );
      console.error();
      return;
    }
    try {
      const custom = JSON.parse(customString);
      Object.assign(data, custom);
    } catch (error) {
      console.error();
      console.error(
        "The custom data you specified in",
        "'" + setCustomFile + "'",
        "is not valid JSON!"
      );
      console.error();
      return;
    }
  }
  if (setCustom !== undefined) {
    try {
      const custom = JSON.parse(setCustom);
      Object.assign(data, custom);
    } catch (error) {
      console.error();
      console.error("The custom data you specified is not valid JSON!");
      console.error();
      return;
    }
  }
  if (setTitle !== undefined) {
    data.name = setTitle;
  }
  if (setDescriptionFile !== undefined) {
    try {
      data.description = fs.readFileSync(setDescriptionFile, {
        encoding: "utf8",
      });
    } catch (error) {
      console.error();
      console.error(
        "Can't read specified description file",
        "'" + setDescriptionFile + "':",
        error.message
      );
      console.error();
      return;
    }
  }
  if (setDescription !== undefined) {
    data.description = setDescription;
  }
  if (setPrivacy !== undefined) {
    Object.assign(data, { privacy: { view: setPrivacy } });
  }
  if (setPassword !== undefined) {
    Object.assign(data, {
      password: setPassword,
      privacy: { view: "password" },
    });
  }

  return data;
}

export function configureCLI() {
  program.version("0.0.4");
  program
    .option(
      "-c, --config <config-file>",
      "path to config file",
      process.env.HOME + "/.vimeo-library-manager/config.json"
    )
    .option("-d, --debug", "output extra debugging");

  program
    .command("test")
    .description("Test your Vimeo access")
    .action(testAccess);

  program
    .command("init <client-id> <client-secret> <client-redirect-url>")
    .description("Initiate your Vimeo access")
    .action(initAccess);

  program
    .command("login")
    .description("Start the login process")
    .action(startLogin);

  program
    .command("finish-login <code>", { hidden: true })
    .description("Finish the login process")
    .action(finishLogin);

  program.command("logout").description("Log out from vimeo").action(logout);

  program
    .command("list-videos")
    .description("List my videos")
    .action(listVideos);

  const update = program.command("update-data <video-id>");
  // @ts-ignore
  addCommonOptions(update)
    .description("Update video meta-data")
    .action(updateVideoData);

  const upload = program.command("upload-video <video-file>");
  // @ts-ignore
  addCommonOptions(upload)
      .option(
          "--write-id-to <id-file>",
          "Write the ID of the new video to a file"
      )
      .option("--wait-for-transcoding", "Wait until transcoding finishes")
      .option("--open", "Open in browser when ready")
    .description("Upload a new video")
    .action(uploadVideo);
}

export function runCommand() {
  program.parse(process.argv);
}
