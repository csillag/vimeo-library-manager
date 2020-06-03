import { LoginInfo, Video } from "./Types";

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
  tutorial(): any;
  listMyVideos(): Promise<Video[]>;
}
