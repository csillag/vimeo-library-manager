export interface AuthInfo {
  /**
   * App client ID, as configured with Vimeo
   */
  clientId: string;

  /**
   * App client secret, as configured with Vimeo
   */
  clientSecret: string;

  /**
   * The redirect URL configured with Vimeo
   */
  redirectUrl?: string;

  /**
   * If you already have an access token, supply it here
   */
  accessToken?: string;
}

export type AccessScope =
  | "public"
  | "create"
  | "interact"
  | "private"
  | "edit"
  | "upload"
  | "delete";

export interface ClientParams {
  /**
   * Should we run in debug mode?
   */
  debug?: boolean;
}

export interface LoginInfo {
  accessToken: string;
  userUri: string;
  userName: string;
  scopes: AccessScope[];
}

type License =
  | "by"
  | "by-nc"
  | "by-nc-nd"
  | "by-nc-sa"
  | "by-nd"
  | "by-sa"
  | "cc0";

type PrivacyCommentPolicy = "anybody" | "contacts" | "nobody";
type PrivacyEmbedPolicy = "private" | "public" | "whitelist";
type PrivacyViewPolicy =
  | "anybody"
  | "contacts"
  | "disable"
  | "nobody"
  | "password"
  | "unlisted"
  | "users";

export interface PrivacyUpdateData {
  /**
   * Whether a user can add the video to a showcase, channel, or group.
   */
  add?: boolean;

  /**
   * The privacy level required to comment on the video.Option descriptions:
   *
   * - `anybody` - Anyone can comment on the video.
   * - `contacts` - Only the owner's contacts can comment on the video.
   * - `nobody` - No one can comment on the video.
   */
  comments?: PrivacyCommentPolicy;

  /**
   * Whether a user can download the video.
   *
   * This field isn't available to Vimeo Basic members.
   */
  download?: boolean;

  /**
   * The video's embed setting.
   *
   * Specify the whitelist value to restrict embedding to a specific set of domains.
   * For more information, see our
   * [Interacting with Videos](https://developer.vimeo.com/api/guides/videos/interact#set-off-site-privacy) guide.
   *
   * Option descriptions:
   * - `private` - The video can't be embedded.
   * - `public` - The video can be embedded.
   * - `whitelist` - The video can be embedded on the specified domains only.
   */
  embed?: PrivacyEmbedPolicy;

  /**
   * The video's privacy setting.
   *
   * When this value is `users`, `application/json` is the only valid content type.
   * Also, Vimeo Basic members can't set this value to `disable` or `unlisted`.
   *
   * Option descriptions:
   * - `anybody` - Anyone can access the video.
   * - `contacts` - Only the owner's contacts can access the video.
   * - `disable` - The video is disabled.
   * - `nobody` - No one except the owner can access the video.
   * - `password` - Only those with the password can access the video.
   * - `unlisted` - The video is unlisted. Anyone can access it, but it doesn't appear in search.
   * - `users` - Only Vimeo members can access the video.
   */
  view?: PrivacyViewPolicy;
}

export interface VideoUpdateData {
  /**
   * The description of the video.
   */
  description?: string;

  /**
   * The Creative Commons license under which the video is offered.
   */
  license?: License;

  /**
   * The video's default language.
   *
   * For a full list of supported languages, use the /languages?filter=texttracks endpoint.
   */
  locale?: string;

  /**
   * The title of the video.
   */
  name?: string;

  /**
   * The password.
   *
   * When you set privacy.view to password, you must provide the password as an additional parameter.
   */
  password?: string;

  /**
   * Privacy settings
   */
  privacy?: PrivacyUpdateData;

  /**
   * If approach is `live`, the time in ISO 8601 format when the user intends to start streaming.
   */
  scheduled_start_time?: String;

  embed?: any; // TODO
  live?: any; // TODO
  review?: any; // TODO
  spatial?: any; // TODO
}

export type UploadSuccessCallback = (videoUri: string) => void;
export type UploadProgressCallback = (
  bytesUploaded: number,
  bytesTotal: number
) => void;
export type UploadFailCallback = (error: string) => void;
