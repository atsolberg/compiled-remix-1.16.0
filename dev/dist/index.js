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

var index = require('./cli/index.js');
var create = require('./cli/create.js');
var dependencies = require('./dependencies.js');



exports.cli = index;
exports.createApp = create.createApp;
exports.getDependenciesToBundle = dependencies.getDependenciesToBundle;
