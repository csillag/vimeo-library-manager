"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.mergeInto = exports.sleep = exports.slow = exports.getKeys = exports.reduceChanges = exports.getHash = exports.parseQuery = void 0;
var fs_1 = require("fs");
var crypto_1 = require("crypto");
var get_1 = __importDefault(require("lodash/get"));
var set_1 = __importDefault(require("lodash/set"));
var ora = require("ora");
/**
 * A simple function to parse an HTML query string to key-value pairs
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
/**
 * A simple function to get a hash string for a file
 */
function getHash(filename) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve, reject) {
                    var hash = crypto_1.createHash("sha256");
                    var stream = fs_1.createReadStream(filename);
                    stream.on("data", function (data) { return hash.update(data); });
                    stream.on("end", function () { return resolve(hash.digest("hex")); });
                    stream.on("error", function (err) { return reject(err); });
                })];
        });
    });
}
exports.getHash = getHash;
/**
 * This get function is an enhanced version of lodash get, which supports empty / undefined path to return the whole object.
 */
function get(object, path) {
    if (!!path) {
        var realPath = path[0] === "." ? path.substr(1) : path;
        return get_1.default(object, realPath);
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
 * @param changeParent  The immediate upper level subtree
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
function collectKeys(data, keys, path) {
    if (path === void 0) { path = ""; }
    var node = get(data, path);
    if (typeof node === "object") {
        // TODO: look at this recursively
        Object.keys(node).forEach(function (key) {
            return collectKeys(data, keys, path + "." + key);
        });
    }
    else {
        keys.push(path.substr(1));
    }
}
function getKeys(data) {
    var results = [];
    collectKeys(data, results);
    return results;
}
exports.getKeys = getKeys;
function slow(activity, action, config) {
    if (config === void 0) { config = {}; }
    return __awaiter(this, void 0, void 0, function () {
        var spinner, control, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    spinner = ora({
                        text: activity + " ...",
                        prefixText: " ",
                    }).start();
                    control = {
                        setText: function (text) {
                            spinner.text = text;
                        },
                    };
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 3, , 4]);
                    return [4 /*yield*/, action(control)];
                case 2:
                    _a.sent();
                    if (config.hide) {
                        spinner.stop();
                    }
                    else {
                        spinner.succeed("Finished " + activity + ".");
                        console.log();
                    }
                    return [3 /*break*/, 4];
                case 3:
                    error_1 = _a.sent();
                    spinner.fail("Error while " + activity + ".");
                    throw error_1;
                case 4: return [2 /*return*/];
            }
        });
    });
}
exports.slow = slow;
function sleep(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2 /*return*/, new Promise(function (resolve) { return setTimeout(resolve, ms); })];
        });
    });
}
exports.sleep = sleep;
/**
 * This is like Object.assign(), except that it does a "deep merge"
 */
function mergeInto(target, source) {
    var keys = getKeys(source);
    keys.forEach(function (key) {
        var value = get_1.default(source, key);
        set_1.default(target, key, value);
    });
}
exports.mergeInto = mergeInto;
