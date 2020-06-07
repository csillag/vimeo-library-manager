#!/usr/bin/env node

import { createVimeoLibraryManager, VimeoLibraryManager } from ".";

const fs = require("fs");
import Fiber = require("fibers");
import { Command } from "commander";
import { VideoData, VideoUpdateData } from "./lib/vimeo-access";
import { UploadConfig } from "./lib/vimeo-library-manager/Api";

// import {
//   finishLogin,
//   initAccess,
//   logout,
//   startLogin,
//   testAccess,
// } from "./auth";
// import {
//   deleteVideo,
//   listVideos,
//   updateVideoData,
//   uploadVideo,
// } from "./videos";
// import { VideoUpdateData } from "./lib/vimeo-access";

const APP_NAME = "vimeo-library-manager";

type VimeoAction = (manager: VimeoLibraryManager, args: any[]) => void;

/**
 * Run the commands with a configured Vimeo Library Manager instance, and exception handling
 */
function runAction(action: VimeoAction, args: any[]) {
  const opts = args[args.length - 1];
  const { parent } = opts as any;
  const { config, debug } = parent;
  const manager = createVimeoLibraryManager({
    configFileName: config,
    logLevel: debug ? "DEBUG" : "NORMAL",
  });
  try {
    action(manager, args);
  } catch (error) {
    console.error("\x1b[31m", "\n", debug ? error : error.message);
    console.error("\x1b[0m");
  }
}

const wrapAction = (action: VimeoAction) => (...args: any[]) => {
  return runAction(action, args);
};

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
export function parseCommonOptions(options: any): VideoUpdateData {
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
      throw new Error(
        "Can't read custom data file '" + setCustomFile + "': " + error.message
      );
    }
    try {
      const custom = JSON.parse(customString);
      Object.assign(data, custom);
    } catch (error) {
      throw new Error(
        "The custom data you specified in '" +
          setCustomFile +
          "' is not valid JSON!"
      );
    }
  }
  if (setCustom !== undefined) {
    try {
      const custom = JSON.parse(setCustom);
      Object.assign(data, custom);
    } catch (error) {
      throw new Error("The custom data you specified is not valid JSON!");
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
      throw new Error(
        "Can't read specified description file '" +
          setDescriptionFile +
          "': " +
          error.message
      );
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

function describeVideo(video: VideoData) {
  const { privacy, link, name, duration } = video;
  console.log(link, "(", duration, ")", "\t\t", privacy.view, "\t", name);
}

function cli() {
  const program = new Command(APP_NAME);

  program.version("0.0.5");
  program
    .option(
      "-c, --config <config-file>",
      "path to config file"
      // process.env.HOME + "/.vimeo-library-manager/config.json"
    )
    .option("-d, --debug", "output extra debugging");

  program
    .command("test")
    .description("Test your Vimeo access")
    .action(wrapAction((manager) => manager.checkLoginStatus()));

  program
    .command("setup <client-id> <client-secret> <redirect-url>")
    .description("Set up your Vimeo access")
    .action(
      wrapAction((vimeo, args) => {
        const [clientId, clientSecret, redirectUrl] = args;
        vimeo.setup({
          clientId,
          clientSecret,
          redirectUrl,
        });
      })
    );

  program
    .command("login")
    .description("Start the login process")
    .option(
      "--no-web-server",
      "Don't launch a web server (for accepting the incoming login redirect"
    )
    .option("--no-browser-launch", "Don't open the login page in the browser")
    .action(
      wrapAction((manager, options) => {
        const { browserLaunch, webServer } = options[0];
        const url = manager.startLogin({
          noWebServer: !webServer,
          noBrowserLaunch: !browserLaunch,
        });
        if (!browserLaunch) {
          console.log("Now go here to grant access:");
          console.log();
          console.log(url);
        }
        if (!webServer) {
          console.log(
            "After granting permission, you will be redirected to a non-existent page.",
            "Copy the `state` and `code` from the URL, and run '" +
              APP_NAME +
              " finish-login <state> <code>' !"
          );
        }
      })
    );

  program
    .command("finish-login <state-token> <code-token>", { hidden: true })
    .description("Finish the login process")
    .action(
      wrapAction((manager, args) => {
        const [stateToken, codeToken] = args;
        manager.finishLogin(stateToken, codeToken);
      })
    );

  program
    .command("logout")
    .description("Log out from vimeo")
    .action(wrapAction((manager) => manager.logout()));

  program
    .command("list-videos")
    .description("List my videos")
    .action(
      wrapAction((manager) => {
        const results = manager.getMyVideos();
        if (!results.length) {
          console.log("I don't see no videos here.");
        } else if (results.length === 1) {
          console.log("Found one video:");
          console.log();
          describeVideo(results[0]);
        } else {
          console.log("Found", results.length, "videos:");
          console.log();
          results.forEach(describeVideo);
        }
      })
    );

  const update = program.command("update-data <video-id>");
  // @ts-ignore
  addCommonOptions(update)
    .description("Update video meta-data")
    .action(
      wrapAction((manager, args) => {
        const [videoId, opts] = args;
        const data = parseCommonOptions(opts);
        const video = manager.updateVideoData(videoId, data);
        console.log("Data updated.");
        describeVideo(video);
      })
    );

  const upload = program.command("upload-video <video-file>");
  // @ts-ignore
  addCommonOptions(upload)
    .option(
      "--write-id-to <id-file>",
      "Write the ID of the new video to a file"
    )
    .option("--wait-for-encoding", "Wait until then video encoding finishes")
    .option("--open", "Open in browser when ready")
    .description("Upload a new video")
    .action(
      wrapAction((manager, args) => {
        const [videoFileName, opts] = args;
        const data = parseCommonOptions(opts);
        const { waitForEncoding, open } = opts;
        const config: UploadConfig = {
          waitForEncoding,
          openInBrowser: open,
        };
        const video = manager.uploadVideo(videoFileName, data, config);
        describeVideo(video);
      })
    );

  program
    .command("delete-video <video-id>")
    .description("Delete a video")
    .action(
      wrapAction((manager, args) => {
        const [videoId] = args;
        manager.deleteVideo(videoId);
      })
    );
  console.log("[" + APP_NAME + "]");
  console.log();
  program.parse(process.argv);
  console.log();
}

Fiber(cli).run();
