#!/usr/bin/env node

import Fiber = require("fibers");
import process = require("process");
import { program } from "./common";
import {
  finishLogin,
  initAccess,
  logout,
  startLogin,
  testAccess,
} from "./auth";
import { updateVideoData, listVideos } from "./videos";

function configureCLI() {
  program.version("0.0.3");
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
    .command("start-login")
    .description("Start the login process")
    .action(startLogin);

  program
    .command("finish-login <code>")
    .description("Finish the login process")
    .action(finishLogin);

  program.command("logout").description("Log out from vimeo").action(logout);

  program
    .command("list-videos")
    .description("List my videos")
    .action(listVideos);

  program
    .command("update-data <video-id>")
    .option("--title <title>", "Set title")
    .option("--description <description>", "Set description")
    .option("--custom <JSON-data>", "Set custom data", "{}")
    .description("Update video data")
    .action(updateVideoData);
}

function main() {
  configureCLI();
  program.parse(process.argv);
}

Fiber(main).run();
