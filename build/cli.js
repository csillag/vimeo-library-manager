"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runCommand = exports.configureCLI = exports.parseCommonOptions = void 0;
var fs = require("fs");
var common_1 = require("./common");
var auth_1 = require("./auth");
var videos_1 = require("./videos");
/**
 * Define common options for uploading / editing videos
 */
function addCommonOptions(command) {
    return command
        .option("--set-title <title>", "Set title")
        .option("--set-description <description>", "Set description")
        .option("--set-description-file <description-file>", "Load description from a file")
        .option("--set-custom <JSON-data>", "Set custom JSON data")
        .option("--set-custom-file <JSON-data-file>", "Set custom JSON data from a file")
        .option("--set-privacy <policy>", "Set privacy policy")
        .option("--set-password <password>", "Set the password");
}
/**
 * Parse common options for uploading / editing videos
 */
function parseCommonOptions(options) {
    var setTitle = options.setTitle, setDescription = options.setDescription, setDescriptionFile = options.setDescriptionFile, setCustom = options.setCustom, setCustomFile = options.setCustomFile, setPrivacy = options.setPrivacy, setPassword = options.setPassword;
    var data = {};
    if (setCustomFile !== undefined) {
        var customString = void 0;
        try {
            customString = fs.readFileSync(setCustomFile, "utf8");
        }
        catch (error) {
            console.error();
            console.error("Can't read custom data file", "'" + setCustomFile + "':", error.message);
            console.error();
            return;
        }
        try {
            var custom = JSON.parse(customString);
            Object.assign(data, custom);
        }
        catch (error) {
            console.error();
            console.error("The custom data you specified in", "'" + setCustomFile + "'", "is not valid JSON!");
            console.error();
            return;
        }
    }
    if (setCustom !== undefined) {
        try {
            var custom = JSON.parse(setCustom);
            Object.assign(data, custom);
        }
        catch (error) {
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
        }
        catch (error) {
            console.error();
            console.error("Can't read specified description file", "'" + setDescriptionFile + "':", error.message);
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
exports.parseCommonOptions = parseCommonOptions;
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
    var update = common_1.program.command("update-data <video-id>");
    // @ts-ignore
    addCommonOptions(update)
        .description("Update video meta-data")
        .action(videos_1.updateVideoData);
    var upload = common_1.program.command("upload-video <video-file>");
    // @ts-ignore
    addCommonOptions(upload)
        .option("--write-id-to <id-file>", "Write the ID of the new video to a file")
        .option("--wait-for-transcoding", "Wait until transcoding finishes")
        .option("--open", "Open in browser when ready")
        .description("Upload a new video")
        .action(videos_1.uploadVideo);
}
exports.configureCLI = configureCLI;
function runCommand() {
    common_1.program.parse(process.argv);
}
exports.runCommand = runCommand;
