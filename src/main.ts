#!/usr/bin/env node

import process = require("process");
import { program } from "./common";
import { finishLogin, initAccess, startLogin, testAccess } from "./auth";

function configureCLI() {
  program.version("0.0.1");
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
}

function main() {
  configureCLI();
  program.parse(process.argv);
}

main();

//

// const videos = v.listMyVideos();
// console.log("My videos are", videos);
