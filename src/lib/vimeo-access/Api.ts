import {
  LoginInfo,
  UploadFailCallback,
  UploadProgressCallback,
  UploadSuccessCallback,
  VideoUpdateData,
} from "./Types";
import { VideoData } from "./MoreTypes";

export interface Api {
  /**
   * Get a login URL
   *
   * @param redirectUrl configured for the app
   */
  getLoginUrl(stateToken: string): string;

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

  /**
   * Upload a new video
   */
  uploadVideo(
    videoFileName: string,
    data: VideoUpdateData,
    onSuccess: UploadSuccessCallback,
    onProgress: UploadProgressCallback,
    onFail: UploadFailCallback
  ): void;

  /**
   * Wait for encoding to finish on a video
   */
  waitForEncoding(videoId: string): Promise<void>;

  /**
   * Delete a video
   */
  deleteVideo(videoIs: string): Promise<string>;
}
