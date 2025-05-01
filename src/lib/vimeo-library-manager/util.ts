import { createReadStream } from "fs";
import { createHash } from "crypto";
import lodashGet from "lodash/get";
import lodashSet from "lodash/set";
import ora = require("ora");

/**
 * A simple function to parse an HTML query string to key-value pairs
 */
export function parseQuery(query: string): any {
  const result = {};
  query.split("&").forEach((query) => {
    const [key, value] = query.split("=");
    (result as any)[key] = value;
  });
  return result;
}

/**
 * A simple function to get a hash string for a file
 */
export async function getHash(filename: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const hash = createHash("sha256");
    const stream = createReadStream(filename);

    stream.on("data", (data: Buffer) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (err: Error) => reject(err));
  });
}

/**
 * This get function is an enhanced version of lodash get, which supports empty / undefined path to return the whole object.
 */
function get(object: any, path?: string): any {
  if (!!path) {
    const realPath = path[0] === "." ? path.substr(1) : path;
    return lodashGet(object, realPath);
  } else {
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
export function reduceChanges(
  change: any,
  reference: any,
  path = "",
  changeParent: any = undefined,
  currentKey = ""
) {
  let currentChange: any;
  let currentReference: any;
  currentChange = get(change, path);
  currentReference = get(reference, path);

  const changeType = typeof currentChange;
  const referenceType = typeof currentReference;

  if (changeType !== referenceType) {
    // We can't do anything about this, since even the types are different
    return;
  }
  if (changeType === "object") {
    // This is an object, we should handle this recursively
    Object.keys(currentChange).forEach((key) =>
      reduceChanges(change, reference, path + "." + key, currentChange, key)
    );
    // log("Finished object at", path);
    if (!Object.keys(currentChange).length) {
      // We have deleted all children of this object!
      if (!!path) {
        // log("Removing empty object at", path);
        delete changeParent[currentKey];
      } else {
        // This is the main data object, ignore it
      }
    }
  } else {
    // This is a single value, we can compare
    if (currentChange === currentReference) {
      // log("Deleting leaf at", path);
      delete changeParent[currentKey];
    }
  }
}

function collectKeys(data: Object, keys: string[], path = "") {
  const node = get(data, path);
  if (typeof node === "object") {
    // TODO: look at this recursively
    Object.keys(node).forEach((key) =>
      collectKeys(data, keys, path + "." + key)
    );
  } else {
    keys.push(path.substr(1));
  }
}

export function getKeys(data: Object) {
  const results: string[] = [];
  collectKeys(data, results);
  return results;
}

interface SlowConfig {
  hide?: boolean;
}

interface SlowControl {
  setText(text: string): void;
}

type SlowAction = (control: SlowControl) => Promise<void>;

export async function slow(
  activity: string,
  action: SlowAction,
  config: SlowConfig = {}
) {
  const spinner = ora({
    text: activity + " ...",
    prefixText: " ",
  }).start();
  const control: SlowControl = {
    setText(text: string) {
      spinner.text = text;
    },
  };

  try {
    await action(control);
    if (config.hide) {
      spinner.stop();
    } else {
      spinner.succeed("Finished " + activity + ".");
      console.log();
    }
  } catch (error) {
    spinner.fail("Error while " + activity + ".");
    throw error;
  }
}

export async function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * This is like Object.assign(), except that it does a "deep merge"
 */
export function mergeInto(target: Object, source: Object) {
  const keys = getKeys(source);
  keys.forEach((key) => {
    const value = lodashGet(source, key);
    lodashSet(target, key, value);
  });
}
