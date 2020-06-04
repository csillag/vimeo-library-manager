import { log } from "./common";

const lodashGet = require("lodash.get");

function get(object: any, path?: string): any {
  if (!!path) {
    const realPath = path[0] === "." ? path.substr(1) : path;
    return lodashGet(object, realPath);
  } else {
    return object;
  }
}

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
        log("Removing empty object at", path);
        delete changeParent[currentKey];
      } else {
        // This is the main data object, ignore it
      }
    }
  } else {
    // This is a single value, we can compare
    if (currentChange === currentReference) {
      log("Deleting leaf at", path);
      delete changeParent[currentKey];
    }
  }
}
