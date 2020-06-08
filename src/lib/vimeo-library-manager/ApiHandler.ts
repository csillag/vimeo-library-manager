import { IncomingMessage, ServerResponse } from "http";

const lodashGet = require("lodash.get");
const fs = require("fs");
const path = require("path");
const shortId = require("shortid");
const open = require("open");
const connect = require("connect");
const http = require("http");
const URI = require("uri-js");
import Fiber = require("fibers");

import {
  LoginInfo,
  SyncApi,
  SyncApiHandler,
  VideoUpdateData,
} from "../vimeo-access-sync";
import {
  Api,
  CreateThumbnailConfig,
  LoginConfig,
  ManagerConfig,
  ReCreateThumbnailConfig,
  ReplaceConfig,
  SetupInfo,
  UploadConfig,
} from "./Api";
import { AccessScope, VideoData } from "../vimeo-access";
import { getHashSync, parseQuery, reduceChanges, sleep, slow } from "./util";
import { Picture, PictureSizeInfo } from "../vimeo-access/MoreTypes";

interface Session {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  stateToken?: string;
  accessToken?: string;
  userName?: string;
  userUri?: string;
  scopes?: AccessScope[];
}

export const videoUriToId = (uri: string) => uri!.substr(8);
export const pictureUriToId = (uri: string) =>
  uri!.substr(uri!.lastIndexOf("/") + 1);

export function selectLargestPicture(picture: Picture): PictureSizeInfo {
  return picture.sizes.reduce(
    (last: PictureSizeInfo, current: PictureSizeInfo) =>
      current.width > last.width ? current : last,
    picture.sizes[0]
  );
}

export class ApiHandler implements Api {
  constructor(private readonly _managerConfig: ManagerConfig) {}

  protected _log(...stuff: any[]) {
    if (this._managerConfig.logLevel === "DEBUG") {
      console.log(...stuff);
    }
  }

  /**
   * We store our cached session information.
   *
   * DON'T ACCESS THIS DIRECTLY. Use `_session` instead.
   */
  private _sessionData: Session | undefined;

  /**
   * Get the name of the config file to use.
   */
  private get _sessionFileName() {
    return (
      this._managerConfig.configFileName ||
      process.env.HOME + "/.vimeo-library-manager/config.json"
    );
  }

  /**
   * Load the save session info
   */
  private _loadSession() {
    let sessionString: string;
    try {
      sessionString = fs.readFileSync(this._sessionFileName).toString("utf8");
    } catch (e1) {
      throw new Error(
        "Can't read config file '" +
          this._sessionFileName +
          "'. You need to set up your Vimeo access."
      );
    }
    let data: any;
    try {
      data = JSON.parse(sessionString);
    } catch (e2) {
      throw new Error(
        "Config file '" +
          this._sessionFileName +
          "' doesn't contain valid JSON data. You need to set up your Vimeo access."
      );
    }
    this._sessionData = data;
  }

  /**
   * Return the saved session info
   *
   * Load it first, if required
   */
  protected get _session(): Session {
    if (this._sessionData === undefined) {
      this._loadSession();
    }
    return this._sessionData!;
  }

  /**
   * Save the current session info
   */
  protected _saveSession(): void {
    const configFilePath = path.dirname(this._sessionFileName);
    try {
      if (!fs.existsSync(configFilePath)) {
        fs.mkdirSync(configFilePath, { recursive: true });
      }
      fs.writeFileSync(
        this._sessionFileName,
        JSON.stringify(this._sessionData, null, "  ") + "\n",
        "utf8"
      );
      this._log("Saved config to", this._sessionFileName);
    } catch (error) {
      throw new Error("Couldn't save config file: " + error.message);
    }
  }

  /**
   * Our vimeo client
   *
   * DON'T ACCESS THIS DIRECTLY. Use `_vimeo` instead.
   */
  private _vimeoClient: SyncApi | undefined;

  protected get _vimeo(): SyncApi {
    if (this._vimeoClient === undefined) {
      this._vimeoClient = new SyncApiHandler(this._session, {
        debug: this._managerConfig.logLevel === "DEBUG",
      });
    }
    return this._vimeoClient;
  }

  /**
   * Set up your Vimeo session.
   *
   * This needs to be done only once, before even attempting to log into the system.
   * The setup configuration will be saved in the configuration file.
   */
  setup(info: SetupInfo) {
    this._sessionData = info;
    this._saveSession();
    console.log(
      "Saved new setup with the provided info. The next step is to log in."
    );
  }

  /**
   * Make sure that we have adequate info in the saved session to log in
   */
  private _checkLoginConfig() {
    const { clientId, clientSecret, redirectUrl } = this._session;
    if (!clientId) {
      throw new Error(
        "Client ID is missing from the configuration. You need to set up your Vimeo session."
      );
    }
    if (!clientSecret) {
      throw new Error(
        "Client secret is missing from the configuration. You need to set up your Vimeo session."
      );
    }
    if (!redirectUrl) {
      throw new Error(
        "Redirect URL is missing from the configuration. You need to set up your Vimeo session."
      );
    }
  }

  /**
   * Make sure we have adequate info in the saved session to access Vimeo
   */
  // private _checkFullConfig() {
  //   this._checkLoginConfig();
  //
  //   const { accessToken } = this._session;
  //   if (!accessToken) {
  //     throw new Error(
  //       "Access token is missing from the configuration. You need to log in to Vimeo."
  //     );
  //   }
  // }

  protected _launchServer() {
    const app = connect();

    // Find out the path we need to listen to
    const { path: wantedPath } = URI.parse(this._session.redirectUrl);

    // respond to all requests
    app.use((req: IncomingMessage, res: ServerResponse) => {
      const { path, query } = URI.parse(req.url);
      if (path === wantedPath) {
        // We have our callback!
        const values = parseQuery(query);
        const { state, code } = values;
        try {
          const fileName = __dirname + "/../../../assets/success.html";
          res.end(fs.readFileSync(fileName));
          Fiber(() => {
            this.finishLogin(state, code);
            process.exit(0);
          }).run();
        } catch (error) {
          res.end(error.message);
        }
      } else {
        res.end("Move along, nothing to see here.\n");
      }
    });
    http.createServer(app).listen(3000);
  }

  startLogin(config: LoginConfig) {
    this._checkLoginConfig();
    const { noWebServer, noBrowserLaunch } = config;

    // Generate a new state token. We need this to verify the redirect
    const stateToken = shortId.generate();

    // Generate a new login URL with our state token
    const url = this._vimeo.getLoginUrl(stateToken);

    // Save the state token
    /**
     * We put the state token
     */
    this._session.stateToken = stateToken;
    this._saveSession();

    if (!noBrowserLaunch) {
      console.log("Launching web browser...");
      open(url).then(
        () => {},
        (_r: any) => {
          throw new Error("Failed to launch web browser.");
        }
      );
    }

    if (!noWebServer) {
      console.log("Launching web server, anticipating redirect call...");
      this._launchServer();
    }

    return url;
  }

  finishLogin(stateToken: string, codeToken: string) {
    this._checkLoginConfig();
    const { stateToken: wantedStateToken } = this._session;
    if (wantedStateToken === undefined) {
      throw new Error(
        "As per my records, we don't have a pending login process!"
      );
    }
    if (stateToken !== wantedStateToken) {
      throw new Error("Invalid state token!");
    }

    let info: LoginInfo;
    slow("getting access token from Vimeo", () => {
      info = this._vimeo.finishLogin(codeToken);
    });
    const { userUri, userName, scopes, accessToken } = info!;
    console.log("Logged in as", userUri, userName, "!");

    delete this._session.stateToken;
    Object.assign(this._session, {
      accessToken,
      userUri,
      scopes,
    });
    this._saveSession();
  }

  logout() {
    // TODO: Actually invalidate the token, instead of just dropping it
    const session = this._session;
    delete session.accessToken;
    delete session.userUri;
    delete session.userName;
    delete session.scopes;
    this._saveSession();
    console.log("Logged out from Vimeo.");
  }

  checkLoginStatus() {
    const { userName, userUri, accessToken } = this._session;
    if (accessToken) {
      this._log("We have an access token.");
      let result: string;
      slow("trying to access Vimeo", () => {
        result = this._vimeo.tutorial();
      });
      console.log("Test API call says: ", result!);
      console.log();
      console.log("You are logged in as", userName, "(", userUri, ")");
    } else {
      this._log("No access token found; let's see if set up is correct...");
      this._checkLoginConfig();
      console.log("You have set up your client, but haven't logged in yet.");
    }
  }

  getMyVideos(): VideoData[] {
    let results: VideoData[];
    slow(
      "loading the list from Vimeo",
      () => {
        results = this._vimeo.listMyVideos();
      },
      { hide: true }
    );
    return results!;
  }

  getVideo(videoId: string): VideoData {
    let result: VideoData;
    slow(
      "loading video data from Vimeo",
      () => {
        result = this._vimeo.getVideo(videoId);
      },
      { hide: true }
    );
    return result!;
  }

  updateVideoData(videoId: string, data: VideoUpdateData): VideoData {
    this._log(
      "Editing video",
      videoId,
      "with data",
      JSON.stringify(data, null, "  "),
      "\n"
    );

    const video = this.getVideo(videoId);

    if (video.user.uri !== this._session.userUri) {
      throw new Error(
        "I can only touch your videos, but this video is owned by: " +
          video.user.uri +
          " " +
          video.user.name
      );
    }

    reduceChanges(data, video);

    if (!Object.keys(data).length) {
      throw new Error("Your video has all this data! Nothing to update.");
    }

    console.log("Actual changes:", JSON.stringify(data, null, "  "));
    console.log();

    slow("updating data", () => {
      this._vimeo.editVideo(videoId, data);
    });

    return this.getVideo(videoId);
  }

  uploadVideo(
    videoFileName: string,
    data: VideoUpdateData,
    config: UploadConfig
  ): VideoData {
    console.log(
      "Uploading",
      videoFileName,
      "as",
      "'" + data.name + "' ...",
      "\n"
    );

    const { waitForEncoding, openInBrowser, idFileName } = config;

    let hash: string;
    slow("calculating hash", () => {
      hash = getHashSync(videoFileName);
      Object.assign(data, { embed: { logos: { custom: { link: hash } } } });
    });

    let uri: string;

    slow("uploading video file", (control) => {
      uri = this._vimeo.uploadVideo(videoFileName, data!, (uploaded, total) => {
        control.setText(
          "Uploaded " + Math.round((100 * uploaded) / total) + "%"
        );
      });
    });

    const videoId = videoUriToId(uri!);

    if (idFileName !== undefined) {
      try {
        fs.writeFileSync(idFileName, videoId);
      } catch (error) {
        throw new Error(
          "Couldn't save video ID to '" + idFileName + "': " + error.message
        );
      }
    }
    if (waitForEncoding) {
      slow("waiting for encoding", () => {
        this._vimeo.waitForEncodingToFinish(videoId);
      });
    }
    let video: VideoData;
    slow("checking end result", () => {
      video = this._vimeo.getVideo(videoId);
    });
    if (openInBrowser) {
      console.log("Opening in browser:", video!.link, "\n");
      open(video!.link).then();
    }
    return video!;
  }

  deleteVideo(videoId: string) {
    console.log("Going to delete video", videoId, "\n");
    slow("deleting video", () => this._vimeo.deleteVideo(videoId));
  }

  replaceVideoContent(
    videoId: string,
    videoFileName: string,
    config: ReplaceConfig
  ): VideoData {
    console.log(
      "Replacing video content for",
      videoId,
      "with",
      videoFileName,
      "...",
      "\n"
    );
    const {
      waitForEncoding,
      openInBrowser,
      keepThumbnail,
      thumbnailTime,
      ignoreHash,
    } = config;

    let video = this.getVideo(videoId);
    const oldHash = lodashGet(video, "embed.logos.custom.link");

    let newHash: string;
    slow("calculating hash", () => {
      newHash = "http://" + getHashSync(videoFileName);
    });

    if (newHash! === oldHash) {
      if (ignoreHash) {
        console.log(
          "The video content seems to be the same, but replacing anyway, as requested.",
          "\n"
        );
      } else {
        throw new Error("The video content is the same!");
      }
    }

    slow("updating meta-data", () => {
      this._vimeo.editVideo(videoId, {
        embed: { logos: { custom: { link: newHash! } } },
      });
    });

    slow("uploading video file", (control) => {
      this._vimeo.replaceVideo(videoId, videoFileName, (uploaded, total) => {
        control.setText(
          "Uploaded " + Math.round((100 * uploaded) / total) + "%"
        );
      });
    });

    if (waitForEncoding || !keepThumbnail) {
      slow("waiting for encoding", (control) => {
        control.setText("waiting for encoding to start...");
        this._vimeo.waitForEncodingToStart(videoId);
        control.setText("waiting for encoding to finish...");
        this._vimeo.waitForEncodingToFinish(videoId);
      });
    }

    if (!keepThumbnail) {
      slow("waiting for the video to be ready for thumbnail generation", () => {
        sleep(10 * 1000); // TODO: what out what is a safe value here
      });
      this.recreateThumbnail(videoId, { time: thumbnailTime });
    }

    slow("checking end result", () => {
      video = this._vimeo.getVideo(videoId);
    });
    if (openInBrowser) {
      console.log("Opening in browser:", video!.link, "\n");
      open(video!.link).then();
    }
    return video!;
  }

  openVideo(videoId: string) {
    const video = this._vimeo.getVideo(videoId);
    console.log("Opening in browser:", video!.link, "\n");
    open(video!.link).then();
  }

  getAllThumbnails(videoId: string): Picture[] {
    let result: Picture[];
    slow("getting data about thumbnails", () => {
      result = this._vimeo.getAllThumbnails(videoId);
    });
    return result!;
  }

  deleteThumbnail(videoId: string, pictureId: string) {
    console.log(
      "Going to delete thumbnail",
      pictureId,
      "for video",
      videoId,
      "\n"
    );
    slow("deleting thumbnail", () =>
      this._vimeo.deleteThumbnail(videoId, pictureId)
    );
  }

  deleteThumbnails(videoId: string) {
    console.log("Going to delete thumbnails", "for video", videoId, "\n");
    const thumbnails = this.getAllThumbnails(videoId);
    thumbnails.forEach((thumbnail) => {
      const pictureId = pictureUriToId(thumbnail.uri);
      slow("deleting thumbnail " + pictureId, () =>
        this._vimeo.deleteThumbnail(videoId, pictureId)
      );
    });
  }

  createThumbnail(
    videoId: string,
    config: CreateThumbnailConfig = {}
  ): Picture {
    const { time, active, openInBrowser } = config;
    let wantedTime = time;
    if (wantedTime === undefined) {
      const video = this.getVideo(videoId);
      wantedTime = video.duration / 2;
    }
    let result: Picture;
    slow("creating thumbnail", () => {
      result = this._vimeo.createThumbnail(videoId, wantedTime!, active);
    });
    if (openInBrowser) {
      const { link } = selectLargestPicture(result!);
      console.log("Opening in browser:", link, "\n");
      open(link).then();
    }
    return result!;
  }

  recreateThumbnail(
    videoId: string,
    config: ReCreateThumbnailConfig = {}
  ): Picture {
    const { time, openInBrowser } = config;
    this.deleteThumbnails(videoId);
    return this.createThumbnail(videoId, {
      time,
      active: true,
      openInBrowser,
    });
  }
}