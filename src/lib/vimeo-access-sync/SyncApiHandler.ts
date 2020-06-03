import { SyncApi } from "./SyncApi";
import {
  wrapPromiseAsync0,
  wrapPromiseAsync1,
  // wrapPromiseAsync2,
} from "../fiber-async-function-wrappers";
import {
  Api,
  ApiHandler,
  AuthInfo,
  ClientParams,
  LoginInfo,
  Video,
} from "../vimeo-access";

export class SyncApiHandler implements SyncApi {
  private readonly _vimeoAsync: Api;

  readonly getLoginUrl: () => string;
  readonly finishLogin: (loginToken: string) => LoginInfo;
  readonly tutorial: () => string;
  readonly listMyVideos: () => Video[];

  constructor(auth: AuthInfo, params?: ClientParams) {
    this._vimeoAsync = new ApiHandler(auth, params);

    this.getLoginUrl = () => this._vimeoAsync.getLoginUrl();
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
  }
}
