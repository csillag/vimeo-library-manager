import { LoginInfo, VideoUpdateData } from "./Types";
import { VideoData } from "./MoreTypes";

export interface Api {
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
  finishLogin(loginToken: string): Promise<LoginInfo>;

  /**
   * Make a test API call
   */
  tutorial(): Promise<string>;

  /**
   * List the user's videos
   */
  listMyVideos(): Promise<VideoData[]>;

  /**
   * Get data about a video
   */
  getVideo(videoId: string): Promise<VideoData>;

  /**
   * This method edits the specified video.
   */
  editVideo(videoId: string, data: VideoUpdateData): Promise<string>;
}
