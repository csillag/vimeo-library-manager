"use strict";
/**
 * Test VIMEO API access
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.logout = exports.getNormalClient = exports.testAccess = void 0;
var vimeo_access_sync_1 = require("./lib/vimeo-access-sync");
function testAccess() { }
exports.testAccess = testAccess;
function getNormalClient() {
    var config = getConfig();
    if (!config) {
        return;
    }
    log("Config is", config);
    return new vimeo_access_sync_1.SyncApiHandler({
        clientId: clientId,
        clientSecret: clientSecret,
        accessToken: accessToken,
    });
}
exports.getNormalClient = getNormalClient;
function logout() { }
exports.logout = logout;
