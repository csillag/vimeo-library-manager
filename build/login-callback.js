"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchServer = void 0;
var config_1 = require("./config");
var auth_1 = require("./auth");
var connect = require("connect");
var http = require("http");
var URI = require("uri-js");
var Fiber = require("fibers");
var fs = require("fs");
function parseQuery(query) {
    var result = {};
    query.split("&").forEach(function (query) {
        var _a = query.split("="), key = _a[0], value = _a[1];
        result[key] = value;
    });
    return result;
}
function onLogin(code) {
    Fiber(function () {
        auth_1.finishLogin(code);
        process.exit(0);
    }).run();
}
function getSuccess() {
    var fileName = __dirname + "/../assets/success.html";
    var success = fs.readFileSync(fileName);
    return success;
}
function launchServer(stateToken) {
    var app = connect();
    // Find out the path we need to listen to
    var config = config_1.getConfig();
    var wantedPath = URI.parse(config.redirectUrl).path;
    // respond to all requests
    app.use(function (req, res) {
        var _a = URI.parse(req.url), path = _a.path, query = _a.query;
        if (path === wantedPath) {
            // We have our callback!
            var values = parseQuery(query);
            var state = values.state, code = values.code;
            if (state === stateToken) {
                // The state token matches, too!
                onLogin(code);
                res.end(getSuccess());
            }
            else {
                res.end("Invalid request. Restart login process.\n");
            }
        }
        else {
            res.end("Move along, nothing to see here.\n");
        }
    });
    http.createServer(app).listen(3000);
}
exports.launchServer = launchServer;
