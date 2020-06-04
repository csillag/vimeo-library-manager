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
    const { error, developer_message, invalid_parameters } = data;
    return (
      error +
      (!developer_message ? "" : " " + developer_message) +
      (!invalid_parameters
        ? ""
        : JSON.stringify(invalid_parameters, null, "  "))
    );
  } catch (error) {
    return err.message;
  }
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
            reject(parseError(err));
          } else {
            resolve(body.message);
          }
        }
      );
    });
  }

  listMyVideos(): Promise<VideoData[]> {
    return new Promise<VideoData[]>((resolve, reject) => {
      this._client.request(
        {
          method: "GET",
          path: "/me/videos",
        },
        (error: any, body, _statusCode, _headers) => {
          if (error) {
            reject(parseError(error));
          } else {
            const { total, page, per_page, data } = body;
            console.log(
              "There are",
              total,
              "videos total.",
              "We are at page",
              page,
              ".",
              "There are",
              per_page,
              "videos on each page."
            );
            resolve(data);
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
            reject(parseError(error));
          } else {
            resolve(body);
          }
        }
      );
    });
  }

  editVideo(videoId: string, data: VideoUpdateData): Promise<string> {
    return new Promise<string>((resolve, reject) => {
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
            reject(parseError(error));
          } else {
            // console.log(_body);
            switch (statusCode) {
              case 200:
                resolve("The video was edited.");
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
}
