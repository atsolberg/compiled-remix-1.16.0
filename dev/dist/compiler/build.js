/**
 * @remix-run/dev v1.16.0
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

var compiler = require('./compiler.js');

async function build(ctx) {
  let compiler$1 = await compiler.create(ctx);
  await compiler$1.compile();
}

exports.build = build;
