import { SyncApi } from "./SyncApi";
import {
  wrapPromiseAsync0,
  wrapPromiseAsync1,
  wrapPromiseAsync2,
  // wrapPromiseAsync2,
} from "../fiber-async-function-wrappers";
import {
  Api,
  ApiHandler,
  AuthInfo,
  ClientParams,
  LoginInfo,
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
  }
}
