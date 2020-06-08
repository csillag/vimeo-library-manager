import fs = require("fs");
import crypto = require("crypto");
const lodashGet = require("lodash.get");
const ora = require("ora");
const Fiber = require("fibers");
import { wrapPromiseAsync1 } from "../fiber-async-function-wrappers";

/**
 * A simple function to parse a HTML query string to key-value pairs
 */
export function parseQuery(query: string): any {
  const result = {};
  query.split("&").forEach((query) => {
    const [key, value] = query.split("=");
    (result as any)[key] = value;
  });
  return result;
}

const hash = crypto.createHash("shake256");

/**
 * A simple function to get a hash string for a file
 */
function getHash(filename: string): Promise<string> {
  return new Promise<string>((resolve, _reject) => {
    const input = fs.createReadStream(filename);
    input.on("readable", () => {
      // Only one element is going to be produced by the
      // hash stream.
      const data = input.read();
      if (data) hash.update(data);
      else {
        const digest = hash.digest("hex");
        resolve(digest);
      }
    });
  });
}

/**
 * A simple synchronous function to get a hash string for a file
 */
export const getHashSync = wrapPromiseAsync1(getHash, this);

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
 * @param changeParent  The immediate upper level sub-tree
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

interface SlowConfig {
  hide?: boolean;
}

interface SlowControl {
  setText(text: string): void;
}

type SlowAction = (control: SlowControl) => void;

export function slow(
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
    action(control);
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

/**
 * This function is usable in Fiber environments
 */
export function sleep(ms: number) {
  const fiber = Fiber.current;
  setTimeout(function () {
    fiber.run();
  }, ms);
  Fiber.yield();
}
