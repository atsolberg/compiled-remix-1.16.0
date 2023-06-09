/**
 * @remix-run/server-runtime v1.16.0
 *
 * Copyright (c) Remix Software Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.md file in the root directory of this source tree.
 *
 * @license MIT
 */
'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

function broadcastDevReady(build, origin) {
  origin ?? (origin = process.env.REMIX_DEV_HTTP_ORIGIN);
  if (!origin) throw Error("Dev server origin not set");
  fetch(`${origin}/ping`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      buildHash: build.assets.version
    })
  }).catch(error => {
    console.error(`Could not reach Remix dev server at ${origin}`);
  });
}
function logDevReady(build) {
  console.log(`[REMIX DEV] ${build.assets.version} ready`);
}

exports.broadcastDevReady = broadcastDevReady;
exports.logDevReady = logDevReady;
