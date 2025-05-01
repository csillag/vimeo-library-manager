import { IncomingMessage, ServerResponse } from "http";

import lodashGet from "lodash/get";
import fs = require("fs");
import path = require("path");
import shortId from "shortid";
import open = require("open");
import connect = require("connect");
import http = require("http");
import URI = require("uri-js");

import {
  LoginInfo,
  Showcase,
  Api as VimeoApi,
  ApiHandler as VimeoApiHandler,
  VideoUpdateData,
} from "../vimeo-access";
import {
  Api,
  CreateThumbnailConfig,
  LoginConfig,
  ManagerConfig,
  ReCreateThumbnailConfig,
  ReplaceConfig,
  SetupInfo,
  ShowcaseInfo,
  UpdateDataConfig,
  UploadConfig,
  UploadThumbnailConfig,
} from "./Api";
import { AccessScope, VideoData } from "../vimeo-access";
import {
  getHash,
  getKeys,
  mergeInto,
  parseQuery,
  reduceChanges,
  sleep,
  slow,
} from "./util";
import {
  Picture,
  PictureSizeInfo,
  UploadPicture,
} from "../vimeo-access/MoreTypes";

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

const contentTypes = {
  png: "image/png",
  jpg: "image/jpg",
  gif: "image/gif",
};

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
      throw new Error("Couldn't save config file: " + (error as any).message);
    }
  }

  /**
   * Our vimeo client
   *
   * DON'T ACCESS THIS DIRECTLY. Use `_vimeo` instead.
   */
  private _vimeoClient: VimeoApi | undefined;

  protected get _vimeo(): VimeoApi {
    if (this._vimeoClient === undefined) {
      this._vimeoClient = new VimeoApiHandler(this._session, {
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

  protected _launchServer() {
    const app = connect();

    // Find out the path we need to listen to
    const { path: wantedPath } = URI.parse(this._session.redirectUrl);

    // respond to all requests
    app.use((req: IncomingMessage, res: ServerResponse) => {
      if (!req.url) return;
      const { path, query } = URI.parse(req.url);
      if (!query) return;
      if (path === wantedPath) {
        // We have our callback!
        const values = parseQuery(query);
        const { state, code } = values;
        try {
          const fileName = __dirname + "/../../../assets/success.html";
          res.end(fs.readFileSync(fileName));

          void this.finishLogin(state, code);
          // process.exit(0); // TODO find out what we need here
        } catch (error) {
          res.end((error as any).message);
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

  async finishLogin(stateToken: string, codeToken: string) {
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
    await slow("getting access token from Vimeo", async () => {
      info = await this._vimeo.finishLogin(codeToken);
    });
    const { userUri, scopes, accessToken } = info!;
    console.log("Logged in as", userUri, "!");

    delete this._session.stateToken;
    mergeInto(this._session, {
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

  async checkLoginStatus() {
    const { userName, userUri, accessToken } = this._session;
    if (accessToken) {
      this._log("We have an access token.");
      let result: string;
      await slow("trying to access Vimeo", async () => {
        result = await this._vimeo.tutorial();
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

  async getMyVideos(): Promise<VideoData[]> {
    let results: VideoData[];
    await slow(
      "loading the list from Vimeo",
      async () => {
        results = await this._vimeo.listMyVideos();
      },
      { hide: true }
    );
    return results!;
  }

  async getVideo(videoId: string): Promise<VideoData> {
    let result: VideoData;
    await slow(
      "loading video data from Vimeo",
      async () => {
        result = await this._vimeo.getVideo(videoId);
      },
      { hide: true }
    );
    return result!;
  }

  async updateVideoData(
    videoId: string,
    data: VideoUpdateData,
    config: UpdateDataConfig = {}
  ): Promise<VideoData> {
    const { silent } = config;

    this._log(
      "Editing video",
      videoId,
      "with data",
      JSON.stringify(data, null, "  "),
      "\n"
    );

    const video = await this.getVideo(videoId);

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
      console.log("Your video has all this data! Nothing to update.", "\n");
      return video;
    }

    if (!silent) {
      console.log(
        "Change(s) detected at: ",
        getKeys(data).join(", ") + ".",
        "\n"
      );
    }

    this._log(data);

    await slow("updating data", async () => {
      await this._vimeo.editVideo(videoId, data);
    });

    return await this.getVideo(videoId);
  }

  async uploadVideo(
    videoFileName: string,
    data: VideoUpdateData,
    config: UploadConfig
  ): Promise<VideoData> {
    console.log(
      "Uploading",
      videoFileName,
      "as",
      "'" + data.name + "' ...",
      "\n"
    );

    const {
      waitForEncoding,
      thumbnailTime,
      thumbnailImageFile,
      openInBrowser,
      idFileName,
    } = config;

    this._log("Received data:", data);

    let hash: string;
    await slow("calculating hash", async () => {
      hash = "http://" + (await getHash(videoFileName));
      mergeInto(data, { embed: { logos: { custom: { link: hash } } } });
    });

    let uri: string;

    await slow("uploading video file", async (control) => {
      uri = await this._vimeo.uploadVideo(
        videoFileName,
        data!,
        (uploaded, total) => {
          control.setText(
            "Uploaded " + Math.round((100 * uploaded) / total) + "%"
          );
        }
      );
    });

    const videoId = videoUriToId(uri!);

    if (idFileName !== undefined) {
      try {
        fs.writeFileSync(idFileName, videoId);
      } catch (error) {
        throw new Error(
          "Couldn't save video ID to '" +
            idFileName +
            "': " +
            (error as any).message
        );
      }
    }

    /**
     * For some reason, just after uploading, some fields (like the name a.k.a. title) get messed up.
     * To work around this, we update the metadata right away.
     */
    await this.updateVideoData(videoId, data, { silent: true });

    if (waitForEncoding || thumbnailTime !== undefined) {
      await slow("waiting for encoding", async () => {
        await this._vimeo.waitForEncodingToFinish(videoId);
      });
    }

    let wantedThumbnail: Picture | undefined;

    /**
     * If we were passed a time, create a thumbnail from that spot
     */
    if (thumbnailTime !== undefined) {
      wantedThumbnail = await this.recreateThumbnail(videoId, {
        time: thumbnailTime,
      });
    }

    /**
     * If we were passed a thumbnail image file, upload that, too
     */
    if (thumbnailImageFile) {
      wantedThumbnail = await this.uploadThumbnail(
        videoId,
        thumbnailImageFile,
        {
          active: true,
        }
      );
    }

    if (wantedThumbnail) {
      console.log("Wanted thumbnail is", wantedThumbnail.uri);
    }

    let video: VideoData;
    await slow("checking end result", async () => {
      video = await this._vimeo.getVideo(videoId);
    });

    this._log("Video data is", video!);

    if (openInBrowser) {
      console.log("Opening in browser:", video!.link, "\n");
      open(video!.link).then();
    }
    return video!;
  }

  async deleteVideo(videoId: string): Promise<void> {
    console.log("Going to delete video", videoId, "\n");
    await slow("deleting video", () => this._vimeo.deleteVideo(videoId));
  }

  async replaceVideoContent(
    videoId: string,
    videoFileName: string,
    config: ReplaceConfig
  ): Promise<VideoData> {
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
      thumbnailImageFile,
      ignoreHash,
    } = config;

    let video = await this.getVideo(videoId);
    const oldHash = lodashGet(video, "embed.logos.custom.link");

    let newHash = "unset";
    await slow("calculating hash", async () => {
      newHash = "http://" + (await getHash(videoFileName));
    });

    if (newHash! === oldHash) {
      if (ignoreHash) {
        console.log(
          "The video content seems to be the same, but replacing anyway, as requested.",
          "\n"
        );
      } else {
        console.log("The video content is the same. Nothing to update.", "\n");
        return video;
      }
    }

    await slow("uploading video file", async (control) => {
      await this._vimeo.replaceVideo(
        videoId,
        videoFileName,
        (uploaded, total) => {
          control.setText(
            "Uploaded " + Math.round((100 * uploaded) / total) + "%"
          );
        }
      );
    });

    await slow("updating meta-data", async () =>
      this._vimeo.editVideo(videoId, {
        embed: { logos: { custom: { link: newHash! } } },
      })
    );

    if (waitForEncoding || (!keepThumbnail && !thumbnailImageFile)) {
      await slow("waiting for encoding", async (control) => {
        control.setText("waiting for encoding to start...");
        await this._vimeo.waitForEncodingToStart(videoId);
        control.setText("waiting for encoding to finish...");
        await this._vimeo.waitForEncodingToFinish(videoId);
      });
    }

    if (!keepThumbnail) {
      /**
       * If we were passed a thumbnail image file, upload that, too
       */
      if (thumbnailImageFile) {
        await this.uploadThumbnail(videoId, thumbnailImageFile!, {
          active: true,
        });
      } else {
        /**
         * We will generate a thumbnail from the image
         */
        await slow(
          "waiting for the video to be ready for thumbnail generation",
          async () => {
            await sleep(30 * 1000); // TODO: what out what is a safe value here
          }
        );
        await this.recreateThumbnail(videoId, { time: thumbnailTime });
      }
    }

    await slow("checking end result", async () => {
      video = await this._vimeo.getVideo(videoId);
    });
    if (openInBrowser) {
      console.log("Opening in browser:", video!.link, "\n");
      open(video!.link).then();
    }
    return video!;
  }

  async openVideo(videoId: string) {
    const video = await this._vimeo.getVideo(videoId);
    console.log("Opening in browser:", video!.link, "\n");
    open(video!.link).then();
  }

  async getAllThumbnails(videoId: string): Promise<Picture[]> {
    let result: Picture[];
    await slow("getting data about thumbnails", async () => {
      result = await this._vimeo.getAllThumbnails(videoId);
    });
    return result!;
  }

  async deleteThumbnail(videoId: string, pictureId: string) {
    console.log(
      "Going to delete thumbnail",
      pictureId,
      "for video",
      videoId,
      "\n"
    );
    await slow("deleting thumbnail", () =>
      this._vimeo.deleteThumbnail(videoId, pictureId)
    );
  }

  async deleteThumbnails(videoId: string) {
    console.log("Going to delete thumbnails", "for video", videoId, "\n");
    const thumbnails = await this.getAllThumbnails(videoId);
    thumbnails.forEach((thumbnail) => {
      const pictureId = pictureUriToId(thumbnail.uri);
      slow(
        "deleting thumbnail " + pictureId,
        async () => await this._vimeo.deleteThumbnail(videoId, pictureId)
      );
    });
  }

  async createThumbnail(
    videoId: string,
    config: CreateThumbnailConfig = {}
  ): Promise<Picture> {
    const { time, active, openInBrowser } = config;
    let wantedTime = time;
    if (wantedTime === undefined) {
      const video = await this.getVideo(videoId);
      wantedTime = video.duration / 2;
    }
    let result: Picture;
    await slow("creating thumbnail", async () => {
      result = await this._vimeo.createThumbnail(videoId, wantedTime!, active);
    });
    if (openInBrowser) {
      const { link } = selectLargestPicture(result!);
      console.log("Opening in browser:", link, "\n");
      open(link).then();
    }
    return result!;
  }

  async recreateThumbnail(
    videoId: string,
    config: ReCreateThumbnailConfig = {}
  ): Promise<Picture> {
    const { time, openInBrowser } = config;
    await this.deleteThumbnails(videoId);
    return await this.createThumbnail(videoId, {
      time,
      active: true,
      openInBrowser,
    });
  }

  async uploadThumbnail(
    videoId: string,
    fileName: string,
    config: UploadThumbnailConfig = {}
  ): Promise<Picture> {
    this._log("Uploading new thumbnail for", videoId);
    const { active, openInBrowser } = config;
    this._log("(Activate: ", active, "; open: ", openInBrowser, ")");
    const video = await this.getVideo(videoId);
    const picturesUri = video.metadata.connections.pictures.uri;
    this._log("Pictures URI is", picturesUri);

    // Load the data
    const data = fs.readFileSync(fileName);
    this._log("Read", data.length, "bytes from", fileName);
    const extension = path.extname(fileName).toLowerCase().substr(1);
    const contentType = (contentTypes as any)[extension];
    if (!contentType) {
      throw new Error(
        "Unknown image extension '" +
          extension +
          "'. Please stick to " +
          Object.keys(contentTypes).join(", ")
      );
    }

    // Request a new upload
    let uploadPicture: UploadPicture;
    await slow("Requesting a new thumbnail upload", async () => {
      uploadPicture = await this._vimeo.initiateThumbnailUpload(picturesUri);
    });

    const { uri: pictureUri, link: uploadLink } = uploadPicture!;
    this._log("Created new thumbnail picture", pictureUri);
    this._log("Upload link is", uploadLink);

    // Execute the upload
    await slow("uploading image", async () => {
      await this._vimeo.uploadThumbnail(uploadLink, contentType, data);
    });
    this._log("Image uploaded.");

    // Set the image to active
    if (active) {
      await slow("activating new thumbnail", async () => {
        await this._vimeo.setThumbnailActive(uploadPicture.uri, true);
      });
    }

    // Open in browser
    if (openInBrowser) {
      await this.openVideo(videoId);
    }

    return uploadPicture!;
  }

  async getShowcase(showcaseId: string): Promise<ShowcaseInfo> {
    let showcase: Showcase;
    await slow("getting data about the showcase itself", async () => {
      showcase = await this._vimeo.getShowcase(showcaseId);
    });
    let videos: VideoData[];
    await slow("getting the list of videos", async () => {
      videos = await this._vimeo.getVideosInShowcase(showcaseId);
    });

    return {
      ...showcase!,
      videos: videos!,
    };
  }
}
