#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var _1 = require(".");
var fs = require("fs");
var Fiber = require("fibers");
var commander_1 = require("commander");
var APP_NAME = "vimeo-library-manager";
/**
 * Run the commands with a configured Vimeo Library Manager instance, and exception handling
 */
function runAction(action, args) {
  var opts = args[args.length - 1];
  var parent = opts.parent;
  var config = parent.config,
    debug = parent.debug;
  var manager = _1.createVimeoLibraryManager({
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
var wrapAction = function (action) {
  return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    return runAction(action, args);
  };
};
/**
 * Define common options for uploading / editing videos
 */
function addUpdateEditOptions(command) {
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
function parseUpdateEditOptions(options) {
  var setTitle = options.setTitle,
    setDescription = options.setDescription,
    setDescriptionFile = options.setDescriptionFile,
    setCustom = options.setCustom,
    setCustomFile = options.setCustomFile,
    setPrivacy = options.setPrivacy,
    setPassword = options.setPassword;
  var data = {};
  if (setCustomFile !== undefined) {
    var customString = void 0;
    try {
      customString = fs.readFileSync(setCustomFile, "utf8");
    } catch (error) {
      throw new Error(
        "Can't read custom data file '" + setCustomFile + "': " + error.message
      );
    }
    try {
      var custom = JSON.parse(customString);
      _1.mergeInto(data, custom);
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
      var custom = JSON.parse(setCustom);
      _1.mergeInto(data, custom);
    } catch (error) {
      throw new Error("The custom data you specified is not valid JSON!");
    }
  }
  if (setTitle !== undefined) {
    data.name = setTitle;
  }
  if (setDescriptionFile !== undefined) {
    try {
      data.description = fs
        .readFileSync(setDescriptionFile, {
          encoding: "utf8",
        })
        .trim();
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
    _1.mergeInto(data, { privacy: { view: setPrivacy } });
  }
  if (setPassword !== undefined) {
    _1.mergeInto(data, {
      password: setPassword,
      privacy: { view: "password" },
    });
  }
  return data;
}
/**
 * Define common options for uploading / replacing videos
 */
function addUpdateReplaceOptions(command) {
  return command
    .option("--wait-for-encoding", "Wait until the video encoding finishes")
    .option(
      "--thumbnail-time-offset <seconds>",
      "Specify the time offset from where to take the thumbnail. (The default is from the middle of the video.)"
    )
    .option("--open", "Open in browser");
}
function describeVideo(video) {
  var privacy = video.privacy,
    link = video.link,
    name = video.name,
    duration = video.duration;
  console.log(link, "(", duration, ")", "\t\t", privacy.view, "\t", name);
}
function cli() {
  var program = new commander_1.Command(APP_NAME);
  program.version("0.0.10");
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
    .action(
      wrapAction(function (manager) {
        return manager.checkLoginStatus();
      })
    );
  program
    .command("setup <client-id> <client-secret> <redirect-url>")
    .description("Set up your Vimeo access")
    .action(
      wrapAction(function (vimeo, args) {
        var clientId = args[0],
          clientSecret = args[1],
          redirectUrl = args[2];
        vimeo.setup({
          clientId: clientId,
          clientSecret: clientSecret,
          redirectUrl: redirectUrl,
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
      wrapAction(function (manager, options) {
        var _a = options[0],
          browserLaunch = _a.browserLaunch,
          webServer = _a.webServer;
        var url = manager.startLogin({
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
      wrapAction(function (manager, args) {
        var stateToken = args[0],
          codeToken = args[1];
        manager.finishLogin(stateToken, codeToken);
      })
    );
  program
    .command("logout")
    .description("Log out from vimeo")
    .action(
      wrapAction(function (manager) {
        return manager.logout();
      })
    );
  program
    .command("list-videos")
    .description("List my videos")
    .action(
      wrapAction(function (manager) {
        var results = manager.getMyVideos();
        if (!results.length) {
          console.log("I don't see no videos here.");
        } else if (results.length === 1) {
          console.log("Found one video:");
          console.log();
          describeVideo(results[0]);
          console.log();
        } else {
          console.log("Found", results.length, "videos:");
          console.log();
          results.forEach(describeVideo);
        }
      })
    );
  program
    .command("open-video <video-id>")
    .description("Open a video in a browser")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0];
        manager.openVideo(videoId);
      })
    );
  var update = program.command("update-data <video-id>");
  // @ts-ignore
  addUpdateEditOptions(update)
    .description("Update video meta-data")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0],
          opts = args[1];
        var data = parseUpdateEditOptions(opts);
        var video = manager.updateVideoData(videoId, data);
        describeVideo(video);
      })
    );
  var upload = program.command("upload-video <video-file>");
  // @ts-ignore
  addUpdateEditOptions(upload);
  // @ts-ignore
  addUpdateReplaceOptions(upload)
    .option(
      "--write-id-to <id-file>",
      "Write the ID of the new video to a file"
    )
    .description("Upload a new video")
    .action(
      wrapAction(function (manager, args) {
        var videoFileName = args[0],
          opts = args[1];
        var data = parseUpdateEditOptions(opts);
        var waitForEncoding = opts.waitForEncoding,
          thumbnailTimeOffset = opts.thumbnailTimeOffset,
          open = opts.open,
          writeIdTo = opts.writeIdTo;
        var video = manager.uploadVideo(videoFileName, data, {
          waitForEncoding: waitForEncoding,
          thumbnailTime: thumbnailTimeOffset,
          openInBrowser: open,
          idFileName: writeIdTo,
        });
        describeVideo(video);
      })
    );
  program
    .command("delete-video <video-id>")
    .description("Delete a video")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0];
        manager.deleteVideo(videoId);
      })
    );
  var replace = program.command("replace-content <video-id> <video-file-name>");
  // @ts-ignore
  addUpdateReplaceOptions(replace)
    .option("--no-recreate-thumbnail", "Don't recreate the thumbnail")
    .option(
      "--ignore-hash",
      "Ignore the results of the hash comparison, upload anyway"
    )
    .description("Replace video content")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0],
          videoFileName = args[1],
          opts = args[2];
        var waitForEncoding = opts.waitForEncoding,
          open = opts.open,
          recreateThumbnail = opts.recreateThumbnail,
          ignoreHash = opts.ignoreHash,
          thumbnailTimeOffset = opts.thumbnailTimeOffset;
        manager.replaceVideoContent(videoId, videoFileName, {
          waitForEncoding: waitForEncoding,
          keepThumbnail: !recreateThumbnail,
          thumbnailTime: thumbnailTimeOffset,
          openInBrowser: open,
          ignoreHash: ignoreHash,
        });
      })
    );
  program
    .command("list-thumbnails <video-id>")
    .description("List the thumbnails for a video")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0];
        var thumbnails = manager.getAllThumbnails(videoId);
        console.log(
          "Thumbnails:",
          JSON.stringify(thumbnails, null, "  "),
          // thumbnails,
          "\n"
        );
      })
    );
  program
    .command("create-thumbnail <video-id>")
    .description("Create a new thumbnail for the video")
    .option(
      "--time-offset <seconds>",
      "Specify the time offset from where to take the thumbnail. (The default is from the middle of the video.)"
    )
    .option("--no-set-default", "Don't set the new thumbnail as default")
    .option("--open", "Open in browser")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0],
          opts = args[1];
        var active = opts.setDefault,
          openInBrowser = opts.open,
          time = opts.timeOffset;
        manager.createThumbnail(videoId, {
          time: time,
          active: active,
          openInBrowser: openInBrowser,
        });
      })
    );
  program
    .command("recreate-thumbnail <video-id>")
    .description("Re-create the thumbnail for the video")
    .option(
      "--time-offset <seconds>",
      "Specify the time offset from where to take the thumbnail. (The default is from the middle of the video.)"
    )
    .option("--open", "Open in browser")
    .action(
      wrapAction(function (manager, args) {
        var videoId = args[0],
          opts = args[1];
        var openInBrowser = opts.open,
          time = opts.timeOffset;
        manager.recreateThumbnail(videoId, {
          time: time,
          openInBrowser: openInBrowser,
        });
      })
    );
  console.log("[" + APP_NAME + "]");
  console.log();
  program.parse(process.argv);
  console.log();
}
Fiber(cli).run();
