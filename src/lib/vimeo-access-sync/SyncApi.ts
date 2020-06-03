import { LoginInfo, VideoData, VideoUpdateData } from "../vimeo-access";

export interface SyncApi {
  /**
   * Get a login URL
   *
   * @param redirectUrl configured for the app
   */
  getLoginUrl(): string;

  /**
   * Submit login token, and get an access token
   *
   * @param loginToken received via the redirect
   */
  finishLogin(loginToken: string): LoginInfo;

  /**
   * Make a test API call
   */
  tutorial(): string;

  /**
   * List the user's videos
   */
  listMyVideos(): VideoData[];

  /**
   * Get a video
   */
  getVideo(videoId: string): VideoData;

  /**
   * This method edits the specified video.
   */
  editVideo(videoId: string, data: VideoUpdateData): string;
}
