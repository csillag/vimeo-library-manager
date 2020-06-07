import { VideoData, VideoUpdateData } from "../vimeo-access";

export type LogLevel = "SILENT" | "ERROR" | "NORMAL" | "DEBUG";

export interface ManagerConfig {
  /**
   * Where should we store the authorization information?
   *
   * (Default is ~/vimeo-library-manager/config.json
   */
  configFileName?: string;

  /**
   * What level of output do you want on the console?
   *
   * The defined values are:
   * - SILENT: nothing at all
   * - ERROR: only exceptions
   * - NORMAL: the default level of communication
   * - DEBUG: all kinds of internal happenings
   */
  logLevel?: LogLevel;
}

export interface SetupInfo {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
}

export interface LoginConfig {
  /**
   * Tell the library _not_ to launch a web server to receive the login redirect.
   *
   * The default behavior is to handle everything within the library.
   * If you want to do something else, set this to true,
   * and call `finishLogin` manually, when you get the code by whatever means.
   */
  noWebServer?: boolean;

  /**
   * Tell the library _not_ to open the browser at the appropriate login URL.
   *
   * The default behavior is to handle everything within the library.
   * If you want to do something else, set this to true,
   * and direct the user to the returned URL in some other way.
   */
  noBrowserLaunch?: boolean;
}

/**
 * Configuration for upload behavior
 */
export interface UploadConfig {
  /**
   * Should we wait until the encoding finishes?
   */
  waitForEncoding?: boolean;

  /**
   * Should we open the video in a browser?
   */
  openInBrowser?: boolean;

  /**
   * Should we write the resulting videoId to a file?
   */
  idFileName?: string;
}

export interface Api {
  /**
   * Set up your Vimeo session.
   *
   * This needs to be done only once, before even attempting to log in to Vimeo.
   * The setup configuration will be saved in the configuration file.
   */
  setup(info: SetupInfo): void;

  /**
   * Start the login process.
   *
   * You only need to log in once; then the received access token will be saved in the configuration file.
   *
   * It returns the login URL you need to use, if you explicitly disable the automatic system.
   */
  startLogin(config: LoginConfig): string;

  /**
   * Finish the login process.
   *
   * Note that normally you don't need to call this manually, because the library is
   * taking care of the whole process, including setting up a web server to intercept the login
   * redirect, etc. But if you don't want to use that process, then this is where you can pass in
   * your login redirect tokens.
   */
  finishLogin(stateToken: string, codeToken: string): void;

  /**
   * Log out from Vimeo
   */
  logout(): void;

  /**
   * Check your Vimeo login status
   *
   * Verify that Vimeo access is working normally.
   * If not, you will get an exception.
   */
  checkLoginStatus(): void;

  /**
   * Get a list of all my videos
   */
  getMyVideos(): VideoData[];

  /**
   * Get info about a specific video
   */
  getVideo(videoId: string): VideoData;

  /**
   * Update info about a video
   */
  updateVideoData(videoId: string, data: VideoUpdateData): VideoData;

  /**
   * Upload a new video
   */
  uploadVideo(
    videoFileName: string,
    data: VideoUpdateData,
    config: UploadConfig
  ): VideoData;

  /**
   * Delete a video
   */
  deleteVideo(videoId: string): void;
}
