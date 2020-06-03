"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.finishLogin = exports.startLogin = exports.initAccess = exports.testAccess = void 0;
/**
 * Test VIMEO API access
 */
var common_1 = require("./common");
var config_1 = require("./config");
var vimeo_access_1 = require("./lib/vimeo-access");
function testAccess() {
    console.log();
    console.log("Checking your Vimeo status...");
    console.log();
    common_1.log("Should test Vimeo access");
    var config = config_1.loadConfig();
    if (!config) {
        return;
    }
    common_1.log("Config is", config);
    if (config.accessToken) {
        common_1.log("Apparently, there is an access token....");
        var vimeo = getNormalClient();
        if (!vimeo) {
            return;
        }
        vimeo.tutorial().then(function (foo) {
            console.log("Test API call says: ", foo);
            console.log();
        }, function (err) {
            console.error("Error while executing test API call:", err);
            console.error();
        });
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
    if (config_1.saveConfig({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUrl: redirectUrl,
    })) {
        console.log();
        console.log("OK, now you can execute the start-login command!");
        console.log();
    }
}
exports.initAccess = initAccess;
function getLoginClient() {
    var config = config_1.loadConfig();
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
    return new vimeo_access_1.ApiHandler({
        clientId: clientId,
        clientSecret: clientSecret,
        redirectUrl: redirectUrl,
    });
}
function getNormalClient() {
    var config = config_1.loadConfig();
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
    return new vimeo_access_1.ApiHandler({
        clientId: clientId,
        clientSecret: clientSecret,
        accessToken: accessToken,
    });
}
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
    vimeo.finishLogin(code).then(function (info) {
        var user = info.user, scopes = info.scopes, accessToken = info.accessToken;
        console.log("Logged in as", user, "!");
        var config = config_1.loadConfig();
        config.accessToken = accessToken;
        config.user = user;
        config.scopes = scopes;
        config_1.saveConfig(config);
        console.log();
        console.log("Now you can use all functions.");
        console.log();
    }, function (error) {
        console.error("Failed to log in:", error);
        console.error();
    });
}
exports.finishLogin = finishLogin;
