import { SyncApi } from "./SyncApi";
import {
  wrapPromiseAsync0,
  wrapPromiseAsync1,
  wrapPromiseAsync2,
  wrapPromiseAsync3,
  wrapPromiseAsync3m,
} from "../fiber-async-function-wrappers";
import {
  Api,
  ApiHandler,
  AuthInfo,
  ClientParams,
  LoginInfo,
  Showcase,
  UploadProgressCallback,
  VideoData,
  VideoUpdateData,
} from "../vimeo-access";
import { Picture, UploadPicture } from "../vimeo-access/MoreTypes";

export class SyncApiHandler implements SyncApi {
  private readonly _vimeoAsync: Api;

  readonly getLoginUrl: (stateToken: string) => string;
  readonly finishLogin: (loginToken: string) => LoginInfo;
  readonly tutorial: () => string;
  readonly listMyVideos: () => VideoData[];
  readonly editVideo: (videoId: string, data: VideoUpdateData) => void;
  readonly getVideo: (videoId: string) => VideoData;
  readonly uploadVideo: (
    videoFileName: string,
    data: VideoUpdateData,
    onProgress: UploadProgressCallback
  ) => string;
  readonly waitForEncodingToStart: (videoId: string) => void;
  readonly waitForEncodingToFinish: (videoId: string) => void;
  readonly deleteVideo: (videoId: string) => void;
  readonly replaceVideo: (
    videoId: string,
    videoFileName: string,
    onProgress: UploadProgressCallback
  ) => void;
  readonly getAllThumbnails: (videoId: string) => Picture[];
  readonly deleteThumbnail: (videoId: string, pictureId: string) => void;
  readonly createThumbnail: (
    videoId: string,
    time: number,
    active?: boolean
  ) => Picture;

  readonly initiateThumbnailUpload: (picturesUri: string) => UploadPicture;
  readonly uploadThumbnail: (
    uploadUri: string,
    contentType: string,
    data: Buffer
  ) => void;
  readonly setThumbnailActive: (uri: string, active: boolean) => void;
  readonly getShowcase: (showcaseId: string) => Showcase;
  readonly getVideosInShowcase: (showcaseId: string) => VideoData[];

  _uploadVideoPromise(
    videoFileName: string,
    data: VideoUpdateData,
    onProgress: UploadProgressCallback
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this._vimeoAsync.uploadVideo(
        videoFileName,
        data,
        (url: string) => {
          resolve(url);
        },
        onProgress,
        (error: string) => {
          reject(new Error(error));
        }
      );
    });
  }

  _replaceVideoPromise(
    videoId: string,
    videoFileName: string,
    onProgress: UploadProgressCallback
  ): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this._vimeoAsync.replaceVideo(
        videoId,
        videoFileName,
        (url: string) => {
          resolve(url);
        },
        onProgress,
        (error: string) => {
          reject(new Error(error));
        }
      );
    });
  }

  constructor(auth: AuthInfo, params?: ClientParams) {
    this._vimeoAsync = new ApiHandler(auth, params);

    this.getLoginUrl = (stateToken: string) =>
      this._vimeoAsync.getLoginUrl(stateToken);
    this.finishLogin = wrapPromiseAsync1(
      this._vimeoAsync.finishLogin,
      this._vimeoAsync
    );
    this.tutorial = wrapPromiseAsync0(
      this._vimeoAsync.tutorial,
      this._vimeoAsync
    );
    this.listMyVideos = wrapPromiseAsync0(
      this._vimeoAsync.listMyVideos,
      this._vimeoAsync
    );
    this.editVideo = wrapPromiseAsync2(
      this._vimeoAsync.editVideo,
      this._vimeoAsync
    );
    this.getVideo = wrapPromiseAsync1(
      this._vimeoAsync.getVideo,
      this._vimeoAsync
    );
    this.uploadVideo = wrapPromiseAsync3(this._uploadVideoPromise, this);
    this.waitForEncodingToStart = wrapPromiseAsync1(
      this._vimeoAsync.waitForEncodingToStart,
      this._vimeoAsync
    );
    this.waitForEncodingToFinish = wrapPromiseAsync1(
      this._vimeoAsync.waitForEncodingToFinish,
      this._vimeoAsync
    );
    this.deleteVideo = wrapPromiseAsync1(
      this._vimeoAsync.deleteVideo,
      this._vimeoAsync
    );
    this.replaceVideo = wrapPromiseAsync3(this._replaceVideoPromise, this);
    this.getAllThumbnails = wrapPromiseAsync1(
      this._vimeoAsync.getAllThumbnails,
      this._vimeoAsync
    );
    this.deleteThumbnail = wrapPromiseAsync2(
      this._vimeoAsync.deleteThumbnail,
      this._vimeoAsync
    );
    this.createThumbnail = wrapPromiseAsync3m<string, number, boolean, Picture>(
      this._vimeoAsync.createThumbnail,
      false,
      this._vimeoAsync
    );
    this.initiateThumbnailUpload = wrapPromiseAsync1(
      this._vimeoAsync.initiateThumbnailUpload,
      this._vimeoAsync
    );
    this.uploadThumbnail = wrapPromiseAsync3(
      this._vimeoAsync.uploadThumbnail,
      this._vimeoAsync
    );
    this.setThumbnailActive = wrapPromiseAsync2(
      this._vimeoAsync.setThumbnailActive,
      this._vimeoAsync
    );
    this.getShowcase = wrapPromiseAsync1(
      this._vimeoAsync.getShowcase,
      this._vimeoAsync
    );
    this.getVideosInShowcase = wrapPromiseAsync1(
      this._vimeoAsync.getVideosInShowcase,
      this._vimeoAsync
    );
  }
}
