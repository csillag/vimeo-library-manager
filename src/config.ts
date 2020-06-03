import path from "path";
import fs from "fs";
import { program } from "./common";

interface Config {
  clientId: string;
  clientSecret: string;
  redirectUrl: string;
  accessToken?: string;
  user?: string;
  scopes?: string[];
}

const getConfigFileName = () => program.opts().config;

export function loadConfig(): Config | undefined {
  const fileName = getConfigFileName();
  let string: string;
  try {
    string = fs.readFileSync(fileName).toString("utf8");
  } catch (e1) {
    console.error("Can't read config file", fileName);
    console.error(
      "You need to initiate your Vimeo access. (See the 'init' command.)"
    );
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
    return;
  }
  return data;
}

export function saveConfig(config: Config): boolean {
  const fileName = getConfigFileName();
  const configFilePath = path.dirname(fileName);
  try {
    if (!fs.existsSync(configFilePath)) {
      fs.mkdirSync(configFilePath, { recursive: true });
    }
    fs.writeFileSync(
      fileName,
      JSON.stringify(config, null, "  ") + "\n",
      "utf8"
    );
    console.log("Saved config to", fileName);
    return true;
  } catch (error) {
    console.error("Couldn't save config file:", error.message);
    return false;
  }
}
