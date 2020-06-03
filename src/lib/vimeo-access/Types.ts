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

export interface ClientParams {
  /**
   * Should we run in debug mode?
   */
  debug?: boolean;
}

export interface LoginInfo {
  accessToken: string;
  user: string;
  scopes: string[];
}

export interface Video {}
