import { IncomingMessage, ServerResponse } from "http";
import { getConfig } from "./config";
import { finishLogin } from "./auth";
const connect = require("connect");
const http = require("http");
const URI = require("uri-js");
import Fiber = require("fibers");
const fs = require("fs");

function parseQuery(query: string): any {
  const result = {};
  query.split("&").forEach((query) => {
    const [key, value] = query.split("=");
    (result as any)[key] = value;
  });
  return result;
}

function onLogin(code: string) {
  Fiber(() => {
    finishLogin(code);
    process.exit(0);
  }).run();
}

function getSuccess(): number {
  const fileName = __dirname + "/../assets/success.html";
  const success = fs.readFileSync(fileName);
  return success;
}

export function launchServer(stateToken: string) {
  const app = connect();

  // Find out the path we need to listen to
  const config = getConfig();
  const { path: wantedPath } = URI.parse(config!.redirectUrl);

  // respond to all requests
  app.use((req: IncomingMessage, res: ServerResponse) => {
    const { path, query } = URI.parse(req.url);
    if (path === wantedPath) {
      // We have our callback!
      const values = parseQuery(query);
      const { state, code } = values;
      if (state === stateToken) {
        // The state token matches, too!
        onLogin(code);
        res.end(getSuccess());
      } else {
        res.end("Invalid request. Restart login process.\n");
      }
    } else {
      res.end("Move along, nothing to see here.\n");
    }
  });

  http.createServer(app).listen(3000);
}
