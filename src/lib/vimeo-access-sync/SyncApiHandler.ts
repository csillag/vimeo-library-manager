import { SyncApi } from "./SyncApi";
import {
  wrapPromiseAsync0,
  wrapPromiseAsync1,
  wrapPromiseAsync2,
  wrapPromiseAsync3,
  // wrapPromiseAsync2,
} from "../fiber-async-function-wrappers";
import {
  Api,
  ApiHandler,
  AuthInfo,
  ClientParams,
  LoginInfo,
  UploadProgressCallback,
  VideoData,
  VideoUpdateData,
} from "../vimeo-access";

export class SyncApiHandler implements SyncApi {
  private readonly _vimeoAsync: Api;

  readonly getLoginUrl: (stateToken: string) => string;
  readonly finishLogin: (loginToken: string) => LoginInfo;
  readonly tutorial: () => string;
  readonly listMyVideos: () => VideoData[];
  readonly editVideo: (videoId: string, data: VideoUpdateData) => string;
  readonly getVideo: (videoId: string) => VideoData;
  readonly uploadVideo: (
    videoFileName: string,
    data: VideoUpdateData,
    onProgress: UploadProgressCallback
  ) => string;
  readonly waitForEncoding: (videoId: string) => void;
  readonly deleteVideo: (videoId: string) => string;

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
          reject(error);
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

    this.waitForEncoding = wrapPromiseAsync1(
      this._vimeoAsync.waitForEncoding,
      this._vimeoAsync
    );
    this.deleteVideo = wrapPromiseAsync1(
      this._vimeoAsync.deleteVideo,
      this._vimeoAsync
    );
  }
}
