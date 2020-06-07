import { Api } from "./Api";
import {
  AccessScope,
  AuthInfo,
  ClientParams,
  LoginInfo,
  UploadFailCallback,
  UploadProgressCallback,
  UploadSuccessCallback,
  VideoUpdateData,
} from "./Types";
import { Vimeo } from "vimeo";
import { VideoData } from "./MoreTypes";

const wantedScopes: AccessScope[] = [
  "public",
  "create",
  "interact",
  "private",
  "edit",
  "delete",
  "upload",
];

function parseError(err: any): string {
  try {
    const data = JSON.parse(err.message);
    // console.log("Error data is", JSON.stringify(data, null, "  "));
    const { error, developer_message, invalid_parameters, error_code } = data;
    const result =
      error +
      (!developer_message ? "" : " " + developer_message) +
      (!invalid_parameters
        ? ""
        : JSON.stringify(invalid_parameters, null, "  ")) +
      (error_code === undefined ? "" : " Error code: " + error_code);
    // console.log("Result is", result);
    return result;
  } catch (error) {
    // console.log("Failed to parse", error);
    return err.message;
  }
}

function convertError(err: any): Error {
  return new Error(parseError(err));
}

export class ApiHandler implements Api {
  private readonly _client: Vimeo;

  // @ts-ignore
  private log(...stuff: any[]) {
    if (this._params.debug) {
      console.log(...stuff);
    }
  }

  constructor(private _auth: AuthInfo, private _params: ClientParams = {}) {
    const { clientId, clientSecret, accessToken } = _auth;
    this._client = new Vimeo(clientId, clientSecret, accessToken);
  }

  getLoginUrl(stateToken: string): string {
    if (!this._auth.redirectUrl) {
      throw new Error("Redirect URL is not configured!");
    }
    return (this._client.buildAuthorizationEndpoint(
      this._auth.redirectUrl,
      wantedScopes.join(" "),
      stateToken
    ) as unknown) as string;
  }

  finishLogin(code: string) {
    return new Promise<LoginInfo>((resolve, reject) => {
      this._client.accessToken(
        code,
        this._auth.redirectUrl!,
        (error: any, response) => {
          if (error) {
            const errorData = JSON.parse(error.message);
            // console.error(
            //   "Error while getting access token:",
            //   JSON.stringify(errorData, null, "  ")
            // );
            reject(errorData.error_description);
            return;
          }
          const { access_token: accessToken, user, scope } = response;

          if (accessToken) {
            resolve({
              accessToken,
              userUri: user.uri,
              userName: user.name,
              scopes: scope.split(" "),
            });
          }
        }
      );
    });
  }

  tutorial() {
    return new Promise<string>((resolve, reject) => {
      this._client.request(
        {
          method: "GET",
          path: "/tutorial",
        },
        (err: any, body, _statusCode, _headers) => {
          if (err) {
            reject(convertError(err));
          } else {
            resolve(body.message);
          }
        }
      );
    });
  }

  listMyVideos(wantedPage = 1, loaded: VideoData[] = []): Promise<VideoData[]> {
    return new Promise<VideoData[]>((resolve, reject) => {
      this._client.request(
        {
          method: "GET",
          path: "/me/videos?page=" + wantedPage,
        },
        (error: any, body, _statusCode, _headers) => {
          if (error) {
            reject(convertError(error));
          } else {
            const { total, page: currentPage, per_page, data } = body;
            if (currentPage !== wantedPage) {
              reject("I don't understand what is going on here.");
              return;
            }
            const totalPages = Math.ceil(total / per_page);
            const isLast = totalPages === currentPage;
            const upToNow = [...loaded, ...data]; // Unite the already loaded and the new data
            if (isLast) {
              resolve(upToNow);
            } else {
              this.listMyVideos(wantedPage + 1, upToNow).then(resolve, reject);
            }
          }
        }
      );
    });
  }

  getVideo(videoId: string): Promise<VideoData> {
    return new Promise<VideoData>((resolve, reject) => {
      this._client.request(
        {
          method: "GET",
          path: "/videos/" + videoId,
        },
        (error: any, body, _statusCode, _headers) => {
          if (error) {
            reject(convertError(error));
          } else {
            resolve(body);
          }
        }
      );
    });
  }

  editVideo(videoId: string, data: VideoUpdateData): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const path = "/videos/" + videoId;
      this._client.request(
        {
          method: "PATCH",
          path: path,
          query: data as any, // We are passing on the JSON object _and this is fine_.
          headers: { "Content-Type": "application/json" },
        },
        (error: any, _body, statusCode, _headers) => {
          if (error) {
            reject(convertError(error));
          } else {
            // console.log(_body);
            switch (statusCode) {
              case 200:
                resolve();
                break;
              case 400:
                reject("A parameter is invalid.");
                break;
              case 402:
                reject("You are not allowed to do this!");
            }
          }
        }
      );
    });
  }

  uploadVideo(
    videoFileName: string,
    data: VideoUpdateData,
    onSuccess: UploadSuccessCallback,
    onProgress: UploadProgressCallback,
    onFail: UploadFailCallback
  ) {
    this._client.upload(videoFileName, data, onSuccess, onProgress, onFail);
  }

  waitForEncoding(videoId: string): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const checkStatus = () => {
        this.getVideo(videoId).then((video) => {
          const { status } = video.transcode;
          switch (status) {
            case "complete":
              resolve();
              break;
            case "error":
              reject("Transcoding failed");
              break;
            case "in_progress":
              setTimeout(checkStatus, 1000);
              break;
          }
        }, reject);
      };

      checkStatus();
    });
  }

  deleteVideo(videoIs: string): Promise<string> {
    return new Promise<string>((resolve, reject) => {
      this._client.request(
        { method: "DELETE", path: "/videos/" + videoIs },
        (error: any, _body, statusCode, _headers) => {
          if (error) {
            reject(convertError(error));
            return;
          } else {
            switch (statusCode) {
              case 204:
                resolve("The video was deleted.");
                break;
              case 403:
                reject("The authenticated user can't delete this video.");
                break;
            }
          }
        }
      );
    });
  }
}
