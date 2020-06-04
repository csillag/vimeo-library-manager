/**
 * Information about embedding a video
 *
 * Supposed to be described here:
 *
 * https://developer.vimeo.com/api/reference/responses/embed-settings
 *
 * ... but what I see is quite different, so I am documenting the reality here.
 */
export interface EmbedSettings {
  /**
   * HTML code recommended for embedding this video
   */
  html: string;

  badges: any;
}

/**
 * A video's privacy setting.
 */
export interface PrivacySettings {
  /**
   * The general privacy setting for the video.
   *
   * Option descriptions:
   * - anybody - Anyone can view the video.
   * - contacts - Only contacts can view the video.
   * - disable - Hide from vimeo
   * - nobody - No one besides the owner can view the video.
   * - password - Anyone with the video's password can view the video.
   * - unlisted - Not searchable from vimeo.com
   * - users - Only people with a Vimeo account can view the video.
   */
  view:
    | "anybody"
    | "contacts"
    | "disable"
    | "nobody"
    | "password"
    | "unlisted"
    | "users";

  /**
   * Whether the video can be added to collections.
   */
  add: boolean;

  /**
   * Who can comment on the video?
   *
   * Option descriptions:
   * - anybody - Anyone can comment on the video.
   * - contacts - Only contacts can comment on the video.
   * - nobody - No one can comment on the video.
   */
  comments: "anybody" | "contacts" | "nobody";

  /**
   * The video's download permission setting.
   */
  download: boolean;

  /**
   * The video's embed permission setting
   *
   * Option descriptions:
   * - private - The video is private.
   * - public - Anyone can embed the video.
   */
  embed: "private" | "public";
}

/**
 * Info about a specific version if an image
 */
export interface PictureSizeInfo {
  /**
   * The width of the image.
   */
  width: number;

  /**
   * The height of the image.
   */
  height: number;

  /**
   * The direct link to the image.
   */
  link: string;

  /**
     *
     The direct link to the image with a play button overlay.
     */
  link_with_play_button: string;
}

export type TagMetadata = any; // TODO

export interface Tag {
  /**
   * The normalized canonical tag name.
   */
  canonical: string;

  /**
   * The tag value.
   */
  name: string;

  /**
   * The tag's resource key string.
   */
  resource_key: string;

  /**
   * The canonical relative URI of the tag.
   */
  uri: string;

  /**
   * Metadata about the group.
   */
  metadata: TagMetadata;
}

/**
 * Pictures for a video
 */
export interface Picture {
  /**
   * The picture's URI.
   */
  uri: string;

  /**
     *
     Whether this picture is the active picture for its parent resource.
     */
  active: boolean;

  /**
   * The type of the picture
   *
   * Option descriptions:
   * - caution - An image that is appropriate for all ages.
   * - custom - A custom image for the video.
   * - default - The default image for the video.
   */
  type: "caution" | "custom" | "default";

  /**
   * An array containing reference information about all available image files.
   */
  sizes: PictureSizeInfo[];
}

/**
 * A collection of stats associated with a video.
 */
export interface VideoStats {
  /**
   * The current total number of times that the video has been played.
   */
  plays: number | null;
}

/**
 * A description of a video category
 *
 * See here: https://developer.vimeo.com/api/reference/responses/category
 */
export interface VideoCategory {
  /**
   * The display name that identifies the category.
   */
  name: string;

  // TODO: there are many more fields here.
}

/**
 * A list of resource URIs related to the video.
 */
export type VideoConnections = any; // TODO

/**
 *
 */
export type VideoInteractions = any; // TODO

/**
 * A video's metadata.
 */
export interface VideoMetadata {
  /**
   * A list of resource URIs related to the video.
   */
  connections: VideoConnections;

  /**
   * Interactions with this video
   */
  interactions: VideoInteractions;
}

/**
 * A user
 *
 * See https://developer.vimeo.com/api/reference/responses/user
 */
export interface User {
  /**
   * The unique identifier of the user within Vimeo
   */
  uri: string;

  /**
   * The user's display name.
   */
  name: string;

  // TODO

  /**
   * The user's account type
   *
   * Option descriptions:
   *
   * - basic - The user has a Vimeo Basic subscription.
   * - business - The user has a Vimeo Business subscription.
   * - live_business - The user has a Vimeo Business Live subscription.
   * - live_premium - The user has a Vimeo Premium subscription.
   * - live_pro - The user has a Vimeo PRO Live subscription.
   * - plus - The user has a Vimeo Plus subscription.
   * - pro - The user has a Vimeo Pro subscription.
   * - pro_unlimited - The user has a Vimeo PRO Unlimited subscription.
   * - producer - The user has a Vimeo Producer subscription.
   */
  account:
    | "basic"
    | "business"
    | "live_business"
    | "live_premium"
    | "live_pro"
    | "plus"
    | "pro"
    | "pro_unlimited"
    | "producer";
}

/**
 * Description of a video uploader app
 */
export interface VideoUploaderApp {
  /**
   * The name of the app
   */
  name: string;

  /**
   * The canonical relative URI of this app
   */
  uri: string;
}

export interface Transcode {
  status: "complete" | "error" | "in_progress";
}

/**
 * Data for a video
 *
 * As described here:
 *
 * https://developer.vimeo.com/api/reference/responses/video
 */
export interface VideoData {
  /**
   * The video's canonical relative URI.
   */
  uri: string;

  /**
   * The video's title.
   */
  name: string;

  /**
      A brief explanation of the video's content.
     */
  description: string;

  /**
   * What kind of content is this?
   *
   * Possible values are:
   *
   * - live - The video is or was a live event.
   * - stock - The video is a Vimeo Stock video.
   * - video - The video is a standard Vimeo video
   */
  type: "live" | "stock" | "video";

  /**
   * The link to the video.
   */
  link: string;

  /**
   * The video's duration in seconds.
   */
  duration: number;

  /**
   * The video's width in pixels.
   */
  width: number;

  /**
   * The video's height in pixels.
   */
  height: number;

  /**
   * The video's primary language.
   */
  language: string | null;

  /**
   * Information about embedding this video.
   */
  embed: EmbedSettings;

  /**
   * The time in ISO 8601 format when the video was created.
   */
  created_time: string;

  /**
   * The time in ISO 8601 format when the video metadata was last modified.
   */
  modified_time: string;

  /**
   * The time in ISO 8601 format when the video was released.
   */
  release_time: string;

  /**
   * The content ratings of this video.
   */
  content_rating: string[];

  /**
   * The Creative Commons license used for the video:
   *
   * Option descriptions:
   *
   * by - Attribution
   * by-nc - Attribution Non-Commercial
   * by-nc-nd - Attribution Non-Commercial No Derivatives
   * by-nc-sa - Attribution Non-Commercial Share Alike
   * by-nd - Attribution No Derivatives
   * by-sa - Attribution Share Alike
   * cc0 - Public Domain Dedication
   */
  license:
    | null
    | "by"
    | "by-nc"
    | "by-nc-nd"
    | "by-nc-sa"
    | "by-nd"
    | "by-sa"
    | "cc0";

  /**
   * The video's privacy setting.
   */
  privacy: PrivacySettings;

  /**
   * The active picture for this video.
   */
  pictures: Picture;

  /**
   * An array of all tags assigned to this video.
   */
  tags: Tag[];

  /**
   * A collection of stats associated with this video.
   */
  stats: VideoStats;

  /**
   * The categories to which this video belongs.
   */
  categories: VideoCategory[];

  /**
   * The video's metadata.
   */
  metadata: VideoMetadata;

  /**
   * The video owner.
   */
  user: User;

  /**
   * The app that has uploaded this video.
   *
   * (Undocumented)
   */
  app: VideoUploaderApp;

  /**
   * The status code for the availability of the video. This field is deprecated in favor of upload and transcode.
   *
   * Option descriptions:
   * - available - The video is available.
   * - quota_exceeded - The user's quota is exceeded with this video.
   * - total_cap_exceeded - The user has exceeded their total cap with this video.
   * - transcode_starting - Transcoding is beginning for the video.
   * - transcoding - Transcoding is underway for the video.
   * - transcoding_error - There was an error in transcoding the video.
   * - unavailable - The video is unavailable.
   * - uploading - The video is being uploaded.
   * - uploading_error - There was an error in uploading the video.
   */
  status:
    | "available"
    | "quota_exceeded"
    | "total_cap_exceeded"
    | "transcode_starting"
    | "transcoding"
    | "transcoding_error"
    | "unavailable"
    | "uploading"
    | "uploading_error";

  /**
   * The resource key string of the video.
   */
  resource_key: string;

  /**
   * The upload information for this video.
   */
  upload: any; // TODO

  /**
   * The transcode information for a video upload.
   */
  transcode: Transcode;
}
