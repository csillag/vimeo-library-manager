"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getHashSync = void 0;
var fs = require("fs");
var crypto = require("crypto");
var fiber_async_function_wrappers_1 = require("./lib/fiber-async-function-wrappers");
var hash = crypto.createHash("shake256");

function getHash(filename) {
  return new Promise(function (resolve, _reject) {
    var input = fs.createReadStream(filename);
    input.on("readable", function () {
      // Only one element is going to be produced by the
      // hash stream.
      var data = input.read();
      if (data) hash.update(data);
      else {
        var digest = hash.digest("hex");
        resolve(digest);
      }
    });
  });
}

exports.getHashSync = fiber_async_function_wrappers_1.wrapPromiseAsync1(
  getHash,
  this
);
