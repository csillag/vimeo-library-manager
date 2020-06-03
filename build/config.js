"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveConfig = exports.getConfig = exports.setConfig = void 0;
var path_1 = __importDefault(require("path"));
var fs_1 = __importDefault(require("fs"));
var common_1 = require("./common");
var getConfigFileName = function () { return common_1.program.opts().config; };
var _config;
function setConfig(config) {
    _config = config;
}
exports.setConfig = setConfig;
function getConfig(forceReload) {
    if (_config === undefined || !!forceReload) {
        loadConfig();
    }
    return _config;
}
exports.getConfig = getConfig;
function loadConfig() {
    var fileName = getConfigFileName();
    var string;
    try {
        string = fs_1.default.readFileSync(fileName).toString("utf8");
    }
    catch (e1) {
        console.error("Can't read config file", fileName);
        console.error("You need to initiate your Vimeo access. (See the 'init' command.)");
        _config = undefined;
        return;
    }
    var data;
    try {
        data = JSON.parse(string);
    }
    catch (e2) {
        console.error("Config file", fileName, "is corrupt.");
        console.error("You need to initiate your Vimeo access. (See the 'init' command.)");
        _config = undefined;
        return;
    }
    _config = data;
}
function saveConfig() {
    var fileName = getConfigFileName();
    var configFilePath = path_1.default.dirname(fileName);
    try {
        if (!fs_1.default.existsSync(configFilePath)) {
            fs_1.default.mkdirSync(configFilePath, { recursive: true });
        }
        fs_1.default.writeFileSync(fileName, JSON.stringify(_config, null, "  ") + "\n", "utf8");
        console.log("Saved config to", fileName);
        return true;
    }
    catch (error) {
        console.error("Couldn't save config file:", error.message);
        return false;
    }
}
exports.saveConfig = saveConfig;
