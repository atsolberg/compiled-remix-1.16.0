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

var exitHook = require('exit-hook');
var fse = require('fs-extra');
var path = require('path');
var prettyMs = require('pretty-ms');
var WebSocket = require('ws');
require('module');
require('esbuild');
require('esbuild-plugin-polyfill-node');
require('fs');
require('url');
require('postcss-load-config');
require('postcss');
require('node:child_process');
require('node:path');
require('node:url');
require('get-port');
require('@npmcli/package-json');
require('semver');
require('minimatch');
require('../config/serverModes.js');
require('prettier');
require('tsconfig-paths/lib/tsconfig-loader');
require('json5');
require('../colors.js');
require('node:fs');
var warnOnce = require('../warnOnce.js');
require('remark-mdx-frontmatter');
require('tsconfig-paths');
require('postcss-modules');
require('../compiler/plugins/cssSideEffectImports.js');
require('../compiler/plugins/vanillaExtract.js');
require('postcss-discard-duplicates');
require('cacache');
require('crypto');
require('@babel/generator');
require('@babel/core');
require('assert');
require('@babel/plugin-syntax-jsx');
require('@babel/plugin-syntax-typescript');
require('recast');
require('jsesc');
var watch = require('../compiler/watch.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var exitHook__default = /*#__PURE__*/_interopDefaultLegacy(exitHook);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var prettyMs__default = /*#__PURE__*/_interopDefaultLegacy(prettyMs);
var WebSocket__default = /*#__PURE__*/_interopDefaultLegacy(WebSocket);

const relativePath = file => path__default["default"].relative(process.cwd(), file);
let clean = config => {
  try {
    fse__default["default"].emptyDirSync(config.assetsBuildDirectory);
  } catch {
    // ignore failed clean up attempts
  }
};
async function liveReload(config) {
  clean(config);
  let wss = new WebSocket__default["default"].Server({
    port: config.devServerPort
  });
  function broadcast(event) {
    setTimeout(() => {
      wss.clients.forEach(client => {
        if (client.readyState === WebSocket__default["default"].OPEN) {
          client.send(JSON.stringify(event));
        }
      });
    }, config.devServerBroadcastDelay);
  }
  function log(message) {
    let _message = `💿 ${message}`;
    console.log(_message);
    broadcast({
      type: "LOG",
      message: _message
    });
  }
  let hasBuilt = false;
  let dispose = await watch.watch({
    config,
    options: {
      mode: "development",
      sourcemap: true,
      onWarning: warnOnce.warnOnce
    }
  }, {
    onBuildStart() {
      clean(config);
      log((hasBuilt ? "Rebuilding" : "Building") + "...");
    },
    onBuildFinish(_, durationMs, manifest) {
      if (manifest === undefined) return;
      hasBuilt = true;
      log((hasBuilt ? "Rebuilt" : "Built") + ` in ${prettyMs__default["default"](durationMs)}`);
      broadcast({
        type: "RELOAD"
      });
    },
    onFileCreated(file) {
      log(`File created: ${relativePath(file)}`);
    },
    onFileChanged(file) {
      log(`File changed: ${relativePath(file)}`);
    },
    onFileDeleted(file) {
      log(`File deleted: ${relativePath(file)}`);
    }
  });
  exitHook__default["default"](() => clean(config));
  return async () => {
    wss.close();
    await dispose();
  };
}

exports.liveReload = liveReload;
