import { Command } from "commander";

export const APP_NAME = "vimeo-library-manager";

export const program = new Command(APP_NAME);

export function log(...stuff: any[]) {
  if (program.opts().debug) {
    console.log(...stuff);
  }
}
