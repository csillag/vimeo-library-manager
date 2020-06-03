/**
 * Test VIMEO API access
 */
import { APP_NAME, log } from "./common";
import { loadConfig, saveConfig } from "./config";
import { SyncApi, SyncApiHandler } from "./lib/vimeo-access-sync";

export function testAccess() {
  console.log();
  console.log("Checking your Vimeo status...");
  console.log();
  log("Should test Vimeo access");
  const config = loadConfig();
  if (!config) {
    return;
  }
  log("Config is", config);
  if (config.accessToken) {
    log("Apparently, there is an access token....");
    console.log(
      "Allegedly, you are logged in as",
      config.userName,
      "(",
      config.userUri,
      ")"
    );

    const vimeo = getNormalClient();
    if (!vimeo) {
      return;
    }
    try {
      const foo = vimeo.tutorial();
      console.log("Test API call says: ", foo);
      console.log();
    } catch (err) {
      console.error("Error while executing test API call:", err);
      console.error();
    }
  } else {
    log("No access token found. Let's see if we could log in...");
    const client = getLoginClient();
    if (client) {
      console.log(
        "You have configured your client, but haven't logged in yet.",
        "Continue with '" + APP_NAME + " start-login'!"
      );
      console.log();
    }
  }
}

export function initAccess(
  clientId: string,
  clientSecret: string,
  redirectUrl: string
) {
  log("Init command called", clientId, clientSecret, redirectUrl);
  if (
    saveConfig({
      clientId,
      clientSecret,
      redirectUrl,
    })
  ) {
    console.log();
    console.log("OK, now you can execute the start-login command!");
    console.log();
  }
}

function getLoginClient(): SyncApi | undefined {
  const config = loadConfig();
  if (!config) {
    return;
  }
  const { clientId, clientSecret, redirectUrl } = config;
  if (!clientId) {
    console.error("Client ID is missing from the configuration.");
    console.error(
      "You need to re-initiate your Vimeo access. (See the 'init' command.)"
    );
  }
  if (!clientSecret) {
    console.error("Client secret is missing from the configuration.");
    console.error(
      "You need to re-initiate your Vimeo access. (See the 'init' command.)"
    );
  }
  if (!redirectUrl) {
    console.error("Redirect URL is missing from the configuration.");
    console.error(
      "You need to re-initiate your Vimeo access. (See the 'init' command.)"
    );
  }
  log("Config is", config);
  return new SyncApiHandler({
    clientId,
    clientSecret,
    redirectUrl,
  });
}

export function getNormalClient(): SyncApi | undefined {
  const config = loadConfig();
  if (!config) {
    return;
  }
  const { clientId, clientSecret, accessToken } = config;
  if (!clientId) {
    console.error("Client ID is missing from the configuration.");
    console.error(
      "You need to re-initiate your Vimeo access. (See the 'init' command.)"
    );
  }
  if (!clientSecret) {
    console.error("Client secret is missing from the configuration.");
    console.error(
      "You need to re-initiate your Vimeo access. (See the 'init' command.)"
    );
  }
  if (!accessToken) {
    console.error("Access token is missing from the configuration.");
    console.error(
      "You need to log in to Vimeo. (See the 'start-login' command.)"
    );
  }
  log("Config is", config);
  return new SyncApiHandler({
    clientId,
    clientSecret,
    accessToken,
  });
}

export function startLogin() {
  log("Should test Vimeo access");
  const vimeo = getLoginClient();
  if (!vimeo) {
    return;
  }
  const url = vimeo.getLoginUrl();
  console.log("Open this URL to log in:", url);
  console.log();
  console.log(
    "After granting permission, you will be redirected to a non-existent page.",
    "Copy the code from the URL, and run '" +
      APP_NAME +
      " finish-login <code>' !"
  );
}

export function finishLogin(code: string) {
  log("Should finish logging in with code", code);
  const vimeo = getLoginClient();
  if (!vimeo) {
    return;
  }
  console.log();
  console.log("Attempting to log in...");
  console.log();
  try {
    const info = vimeo.finishLogin(code);
    const { userUri, userName, scopes, accessToken } = info;
    console.log("Logged in as", userUri, userName, "!");

    const config = loadConfig()!;
    config.accessToken = accessToken;
    config.userUri = userUri;
    config.userName = userName;
    config.scopes = scopes;
    saveConfig(config);
    console.log();
    console.log("Now you can use all functions.");
    console.log();
  } catch (error) {
    console.error("Failed to log in:", error);
    console.error();
  }
}

export function logout() {
  const config = loadConfig()!;
  // TODO: Actually invalidate the token, instead of just dropping it
  delete config.accessToken;
  delete config.userUri;
  delete config.userName;
  delete config.scopes;
  saveConfig(config);
  console.log();
  console.log("Logged out from vimeo.");
  console.log();
}
