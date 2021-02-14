import {
  LoginInfo,
  Showcase,
  UploadProgressCallback,
  VideoData,
  VideoUpdateData,
} from "../vimeo-access";
import { Picture, UploadPicture } from "../vimeo-access/MoreTypes";

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
   * Create a new thumbnail for a video (by taking a frame from the video)
   */
  createThumbnail(videoId: string, time: number, active?: boolean): Picture;

  /**
   * Initiate uploading a thumbnail.
   *
   * It will return you an upload URL.
   * This is the 2nd step of the process.
   *
   * See https://developer.vimeo.com/api/upload/thumbnails for the detailed description.
   */
  initiateThumbnailUpload(picturesUri: string): UploadPicture;

  /**
   * Upload a new custom thumbnail.
   *
   * This is the 3rd step of the process.
   *
   * See https://developer.vimeo.com/api/upload/thumbnails for the detailed description.
   */
  uploadThumbnail(uploadUri: string, contentType: string, data: Buffer): void;

  /**
   * Activate/deactivate a thumbnail.
   */
  setThumbnailActive(uri: string, active: boolean): void;

  /**
   * Get info about a showcase
   */
  getShowcase(showcaseId: string): Showcase;

  /**
   * Get videos belonging to a showcase
   */
  getVideosInShowcase(showcaseId: string): VideoData[];
}
