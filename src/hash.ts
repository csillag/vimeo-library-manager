import fs = require("fs");
import crypto = require("crypto");
import {wrapPromiseAsync1} from "./lib/fiber-async-function-wrappers";

const hash = crypto.createHash("shake256");

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

export const getHashSync = wrapPromiseAsync1(getHash, this);
