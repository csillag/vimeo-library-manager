#!/usr/bin/env node

import Fiber = require("fibers");
import { configureCLI, runCommand } from "./cli";

function main() {
  configureCLI();
  runCommand();
}

Fiber(main).run();
