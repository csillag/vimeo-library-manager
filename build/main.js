#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fiber = require("fibers");
var process = require("process");
var common_1 = require("./common");
var auth_1 = require("./auth");
var videos_1 = require("./videos");
function configureCLI() {
    common_1.program.version("0.0.4");
    common_1.program
        .option("-c, --config <config-file>", "path to config file", process.env.HOME + "/.vimeo-library-manager/config.json")
        .option("-d, --debug", "output extra debugging");
    common_1.program
        .command("test")
        .description("Test your Vimeo access")
        .action(auth_1.testAccess);
    common_1.program
        .command("init <client-id> <client-secret> <client-redirect-url>")
        .description("Initiate your Vimeo access")
        .action(auth_1.initAccess);
    common_1.program
        .command("login")
        .description("Start the login process")
        .action(auth_1.startLogin);
    common_1.program
        .command("finish-login <code>", { hidden: true })
        .description("Finish the login process")
        .action(auth_1.finishLogin);
    common_1.program.command("logout").description("Log out from vimeo").action(auth_1.logout);
    common_1.program
        .command("list-videos")
        .description("List my videos")
        .action(videos_1.listVideos);
    common_1.program
        .command("update-data <video-id>")
        .option("--title <title>", "Set title")
        .option("--description <description>", "Set description")
        .option("--custom <JSON-data>", "Set custom data", "{}")
        .description("Update video data")
        .action(videos_1.updateVideoData);
}
function main() {
    configureCLI();
    common_1.program.parse(process.argv);
}
Fiber(main).run();
