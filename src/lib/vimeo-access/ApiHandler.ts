import { Api } from "./Api";
import { AuthInfo, ClientParams, LoginInfo, Video } from "./Types";
import { Vimeo } from "vimeo";

const SCOPES = "public create interact private edit delete";

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

  getLoginUrl(): string {
    if (!this._auth.redirectUrl) {
      throw new Error("Redirect URL is not configured!");
    }
    return (this._client.buildAuthorizationEndpoint(
      this._auth.redirectUrl,
      SCOPES,
      "login"
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
              user: user.name,
              scopes: scope.split(" "),
            });
          }
        }
      );
    });
  }

  tutorial() {
    return new Promise((resolve, reject) => {
      this._client.request(
        {
          method: "GET",
          path: "/tutorial",
        },
        (error: any, body, _statusCode, _headers) => {
          if (error) {
            reject(error.message);
            return;
          }
          resolve(body.message);
        }
      );
    });
  }

  listMyVideos(): Promise<Video[]> {
    return Promise.resolve([]);
  }
}
