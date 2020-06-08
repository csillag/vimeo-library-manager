import {
  LoginInfo,
  UploadFailCallback,
  UploadProgressCallback,
  UploadSuccessCallback,
  VideoUpdateData,
} from "./Types";
import { Picture, VideoData } from "./MoreTypes";

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
  editVideo(videoId: string, data: VideoUpdateData): Promise<void>;

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
   * Wait for encoding to start on a video
   */
  waitForEncodingToStart(videoId: string): Promise<void>;

  /**
   * Wait for encoding to finish on a video
   */
  waitForEncodingToFinish(videoId: string): Promise<void>;

  /**
   * Delete a video
   */
  deleteVideo(videoIs: string): Promise<void>;

  /**
   * Replace the content of a video
   */
  replaceVideo(
    videoId: string,
    videoFileName: string,
    onSuccess: UploadSuccessCallback,
    onProgress: UploadProgressCallback,
    onFail: UploadFailCallback
  ): void;

  /**
   * Get all the thumbnails for a video
   */
  getAllThumbnails(videoId: string): Promise<Picture[]>;

  /**
   * Delete a thumbnail
   */
  deleteThumbnail(videoId: string, pictureId: string): Promise<void>;

  /**
   * Create a new thumbnail for a video
   */
  createThumbnail(
    videoId: string,
    time: number,
    active?: boolean
  ): Promise<Picture>;
}
