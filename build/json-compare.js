"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.reduceChanges = void 0;
var common_1 = require("./common");
var lodashGet = require("lodash.get");
function get(object, path) {
    if (!!path) {
        var realPath = path[0] === "." ? path.substr(1) : path;
        return lodashGet(object, realPath);
    }
    else {
        return object;
    }
}
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
                common_1.log("Removing empty object at", path);
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
            common_1.log("Deleting leaf at", path);
            delete changeParent[currentKey];
        }
    }
}
exports.reduceChanges = reduceChanges;
