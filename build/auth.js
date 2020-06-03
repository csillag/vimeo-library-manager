"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.hasScope = exports.finishLogin = exports.startLogin = exports.getNormalClient = exports.initAccess = exports.testAccess = void 0;
/**
 * Test VIMEO API access
 */
var common_1 = require("./common");
var config_1 = require("./config");
var vimeo_access_sync_1 = require("./lib/vimeo-access-sync");
function testAccess() {
    console.log();
    console.log("Checking your Vimeo status...");
    console.log();
    common_1.log("Should test Vimeo access");
    var config = config_1.getConfig();
    if (!config) {
        return;
    }
    common_1.log("Config is", config);
    if (config.accessToken) {
        common_1.log("Apparently, there is an access token....");
        console.log("Allegedly, you are logged in as", config.userName, "(", config.userUri, ")");
        console.log("The allowed scopes are:", config.scopes);
        console.log();
        var vimeo = getNormalClient();
        if (!vimeo) {
            return;
        }
        try {
            var foo = vimeo.tutorial();
            console.log("Test API call says: ", foo);
            console.log();
        }
        catch (err) {
            console.error("Error while executing test API call:", err);
            console.error();
        }
    }
    else {
        common_1.log("No access token found. Let's see if we could log in...");
        var client = getLoginClient();
        if (client) {
            console.log("You have configured your client, but haven't logged in yet.", "Continue with '" + common_1.APP_NAME + " start-login'!");
            console.log();
        }
    }
}
exports.testAccess = testAccess;
function initAccess(clientId, clientSecret, redirectUrl) {
    common_1.log("Init command called", clientId, clientSecret, redirectUrl);
    config_1.setConfig({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUrl: redirectUrl,
    });
    if (config_1.saveConfig()) {
        console.log();
        console.log("OK, now you can execute the start-login command!");
        console.log();
    }
}
exports.initAccess = initAccess;
function getLoginClient() {
    var config = config_1.getConfig();
    if (!config) {
        return;
    }
    var clientId = config.clientId, clientSecret = config.clientSecret, redirectUrl = config.redirectUrl;
    if (!clientId) {
        console.error("Client ID is missing from the configuration.");
        console.error("You need to re-initiate your Vimeo access. (See the 'init' command.)");
    }
    if (!clientSecret) {
        console.error("Client secret is missing from the configuration.");
        console.error("You need to re-initiate your Vimeo access. (See the 'init' command.)");
    }
    if (!redirectUrl) {
        console.error("Redirect URL is missing from the configuration.");
        console.error("You need to re-initiate your Vimeo access. (See the 'init' command.)");
    }
    common_1.log("Config is", config);
    return new vimeo_access_sync_1.SyncApiHandler({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUrl: redirectUrl,
    });
}
function getNormalClient() {
    var config = config_1.getConfig();
    if (!config) {
        return;
    }
    var clientId = config.clientId, clientSecret = config.clientSecret, accessToken = config.accessToken;
    if (!clientId) {
        console.error("Client ID is missing from the configuration.");
        console.error("You need to re-initiate your Vimeo access. (See the 'init' command.)");
    }
    if (!clientSecret) {
        console.error("Client secret is missing from the configuration.");
        console.error("You need to re-initiate your Vimeo access. (See the 'init' command.)");
    }
    if (!accessToken) {
        console.error("Access token is missing from the configuration.");
        console.error("You need to log in to Vimeo. (See the 'start-login' command.)");
    }
    common_1.log("Config is", config);
    return new vimeo_access_sync_1.SyncApiHandler({
        clientId: clientId,
        clientSecret: clientSecret,
        accessToken: accessToken,
    });
}
exports.getNormalClient = getNormalClient;
function startLogin() {
    common_1.log("Should test Vimeo access");
    var vimeo = getLoginClient();
    if (!vimeo) {
        return;
    }
    var url = vimeo.getLoginUrl();
    console.log("Open this URL to log in:", url);
    console.log();
    console.log("After granting permission, you will be redirected to a non-existent page.", "Copy the code from the URL, and run '" +
        common_1.APP_NAME +
        " finish-login <code>' !");
}
exports.startLogin = startLogin;
function finishLogin(code) {
    common_1.log("Should finish logging in with code", code);
    var vimeo = getLoginClient();
    if (!vimeo) {
        return;
    }
    console.log();
    console.log("Attempting to log in...");
    console.log();
    try {
        var info = vimeo.finishLogin(code);
        var userUri = info.userUri, userName = info.userName, scopes = info.scopes, accessToken = info.accessToken;
        console.log("Logged in as", userUri, userName, "!");
        var config = config_1.getConfig();
        config.accessToken = accessToken;
        config.userUri = userUri;
        config.userName = userName;
        config.scopes = scopes;
        config_1.saveConfig();
        console.log();
        console.log("Now you can use all functions.");
        console.log();
    }
    catch (error) {
        console.error("Failed to log in:", error);
        console.error();
    }
}
exports.finishLogin = finishLogin;
function hasScope(scope) {
    var config = config_1.getConfig();
    if (!config) {
        return false;
    }
    var scopes = config.scopes;
    if (!scopes) {
        return false;
    }
    return scopes.indexOf(scope) !== -1;
}
exports.hasScope = hasScope;
function logout() {
    var config = config_1.getConfig();
    // TODO: Actually invalidate the token, instead of just dropping it
    delete config.accessToken;
    delete config.userUri;
    delete config.userName;
    delete config.scopes;
    config_1.saveConfig();
    console.log();
    console.log("Logged out from vimeo.");
    console.log();
}
exports.logout = logout;
