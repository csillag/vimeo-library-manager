import {
  LoginInfo,
  UploadProgressCallback,
  VideoData,
  VideoUpdateData,
} from "../vimeo-access";
import { Picture } from "../vimeo-access/MoreTypes";

export interface SyncApi {
  /**
   * Get a login URL
   */
  getLoginUrl(stateToken: string): string;

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
  editVideo(videoId: string, data: VideoUpdateData): void;

  /**
   * Upload a new video
   */
  uploadVideo(
    videoFileName: string,
    data: VideoUpdateData,
    onProgress: UploadProgressCallback
  ): string;

  /**
   * Wait for video encoding to start
   */
  waitForEncodingToStart(videoId: string): void;

  /**
   * Wait for video encoding to finish
   */
  waitForEncodingToFinish(videoId: string): void;

  /**
   * Delete a video
   */
  deleteVideo(videoIs: string): void;

  /**
   * Replace the content of a video
   */
  replaceVideo(
    videoId: string,
    videoFileName: string,
    onProgress: UploadProgressCallback
  ): void;

  /**
   * Get all the thumbnails for a video
   */
  getAllThumbnails(videoId: string): Picture[];

  /**
   * Delete a thumbnail
   */
  deleteThumbnail(videoId: string, pictureId: string): void;

  /**
   * Create a new thumbnail for a video
   */
  createThumbnail(videoId: string, time: number, active?: boolean): Picture;
}
