"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.slow = exports.reduceChanges = exports.getHashSync = exports.parseQuery = void 0;
var fs = require("fs");
var crypto = require("crypto");
var lodashGet = require("lodash.get");
var ora = require("ora");
var fiber_async_function_wrappers_1 = require("../fiber-async-function-wrappers");
/**
 * A simple function to parse a HTML query string to key-value pairs
 */
function parseQuery(query) {
    var result = {};
    query.split("&").forEach(function (query) {
        var _a = query.split("="), key = _a[0], value = _a[1];
        result[key] = value;
    });
    return result;
}
exports.parseQuery = parseQuery;
var hash = crypto.createHash("shake256");
/**
 * A simple function to get a hash string for a file
 */
function getHash(filename) {
    return new Promise(function (resolve, _reject) {
        var input = fs.createReadStream(filename);
        input.on("readable", function () {
            // Only one element is going to be produced by the
            // hash stream.
            var data = input.read();
            if (data)
                hash.update(data);
            else {
                var digest = hash.digest("hex");
                resolve(digest);
            }
        });
    });
}
/**
 * A simple synchronous function to get a hash string for a file
 */
exports.getHashSync = fiber_async_function_wrappers_1.wrapPromiseAsync1(getHash, this);
/**
 * This get function is an enhanced version of lodash get, which supports empty / undefined path to return the whole object.
 */
function get(object, path) {
    if (!!path) {
        var realPath = path[0] === "." ? path.substr(1) : path;
        return lodashGet(object, realPath);
    }
    else {
        return object;
    }
}
/**
 * Thus function (recursively) minimizes a change request to a nested JSON object.
 *
 * @param change        The change request object
 * @param reference     The original object
 * @param path          Where we are currently in the comparison
 * @param changeParent  The immediate upper level sub-tree
 * @param currentKey    The key where we are currently in the upper level node
 */
function reduceChanges(change, reference, path, changeParent, currentKey) {
    if (path === void 0) { path = ""; }
    if (changeParent === void 0) { changeParent = undefined; }
    if (currentKey === void 0) { currentKey = ""; }
    var currentChange;
    var currentReference;
    currentChange = get(change, path);
    currentReference = get(reference, path);
    var changeType = typeof currentChange;
    var referenceType = typeof currentReference;
    if (changeType !== referenceType) {
        // We can't do anything about this, since even the types are different
        return;
    }
    if (changeType === "object") {
        // This is an object, we should handle this recursively
        Object.keys(currentChange).forEach(function (key) {
            return reduceChanges(change, reference, path + "." + key, currentChange, key);
        });
        // log("Finished object at", path);
        if (!Object.keys(currentChange).length) {
            // We have deleted all children of this object!
            if (!!path) {
                // log("Removing empty object at", path);
                delete changeParent[currentKey];
            }
            else {
                // This is the main data object, ignore it
            }
        }
    }
    else {
        // This is a single value, we can compare
        if (currentChange === currentReference) {
            // log("Deleting leaf at", path);
            delete changeParent[currentKey];
        }
    }
}
exports.reduceChanges = reduceChanges;
function slow(activity, action, config) {
    if (config === void 0) { config = {}; }
    var spinner = ora({
        text: activity + " ...",
        prefixText: " ",
    }).start();
    var control = {
        setText: function (text) {
            spinner.text = text;
        },
    };
    try {
        action(control);
        if (config.hide) {
            spinner.stop();
        }
        else {
            spinner.succeed("Finished " + activity + ".");
            console.log();
        }
    }
    catch (error) {
        spinner.fail("Error while " + activity + ".");
        throw error;
    }
}
exports.slow = slow;
