import path from "path";
import fs from "fs";
import { program } from "./common";
import { AccessScope } from "./lib/vimeo-access";

interface Config {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  accessToken?: string;
  userName?: string;
  userUri?: string;
  scopes?: AccessScope[];
}

const getConfigFileName = () => program.opts().config;

let _config: Config | undefined;

export function setConfig(config: Config) {
  _config = config;
}

export function getConfig(forceReload?: boolean) {
  if (_config === undefined || !!forceReload) {
    loadConfig();
  }
  return _config;
}

function loadConfig() {
  const fileName = getConfigFileName();
  let string: string;
  try {
    string = fs.readFileSync(fileName).toString("utf8");
  } catch (e1) {
    console.error("Can't read config file", fileName);
    console.error(
      "You need to initiate your Vimeo access. (See the 'init' command.)"
    );
    _config = undefined;
    return;
  }
  let data: any;
  try {
    data = JSON.parse(string);
  } catch (e2) {
    console.error("Config file", fileName, "is corrupt.");
    console.error(
      "You need to initiate your Vimeo access. (See the 'init' command.)"
    );
    _config = undefined;
    return;
  }
  _config = data;
}

export function saveConfig(): boolean {
  const fileName = getConfigFileName();
  const configFilePath = path.dirname(fileName);
  try {
    if (!fs.existsSync(configFilePath)) {
      fs.mkdirSync(configFilePath, { recursive: true });
    }
    fs.writeFileSync(
      fileName,
      JSON.stringify(_config, null, "  ") + "\n",
      "utf8"
    );
    console.log("Saved config to", fileName);
    return true;
  } catch (error) {
    console.error("Couldn't save config file:", error.message);
    return false;
  }
}
