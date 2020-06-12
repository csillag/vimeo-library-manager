import {
  LoginInfo,
  UploadFailCallback,
  UploadProgressCallback,
  UploadSuccessCallback,
  VideoUpdateData,
} from "./Types";
import { Picture, UploadPicture, VideoData } from "./MoreTypes";

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
   * Create a new thumbnail for a video (by taking a frame from the video)
   */
  createThumbnail(
    videoId: string,
    time: number,
    active?: boolean
  ): Promise<Picture>;

  /**
   * Initiate uploading a thumbnail.
   *
   * It will return you an upload URL.
   * This is the 2nd step of the process.
   *
   * See https://developer.vimeo.com/api/upload/thumbnails for the detailed description.
   */
  initiateThumbnailUpload(picturesUri: string): Promise<UploadPicture>;

  /**
   * Upload a new custom thumbnail.
   *
   * This is the 3rd step of the process.
   *
   * See https://developer.vimeo.com/api/upload/thumbnails for the detailed description.
   */
  uploadThumbnail(
    uploadUri: string,
    contentType: string,
    data: Buffer
  ): Promise<void>;

  /**
   * Activate/deactivate a thumbnail.
   *
   * If you set "value" to false, then we will deactivate it instead.
   */
  setThumbnailActive(uri: string, active: boolean): Promise<void>;
}
