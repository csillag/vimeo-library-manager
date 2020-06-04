#!/usr/bin/env node
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var Fiber = require("fibers");
var cli_1 = require("./cli");
function main() {
    cli_1.configureCLI();
    cli_1.runCommand();
}
Fiber(main).run();
