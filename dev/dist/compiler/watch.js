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

var chokidar = require('chokidar');
var debounce = require('lodash.debounce');
var path = require('path');
var config = require('../config.js');
var compiler = require('./compiler.js');
var log = require('./utils/log.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

function _interopNamespace(e) {
  if (e && e.__esModule) return e;
  var n = Object.create(null);
  if (e) {
    Object.keys(e).forEach(function (k) {
      if (k !== 'default') {
        var d = Object.getOwnPropertyDescriptor(e, k);
        Object.defineProperty(n, k, d.get ? d : {
          enumerable: true,
          get: function () { return e[k]; }
        });
      }
    });
  }
  n["default"] = e;
  return Object.freeze(n);
}

var chokidar__default = /*#__PURE__*/_interopDefaultLegacy(chokidar);
var debounce__default = /*#__PURE__*/_interopDefaultLegacy(debounce);
var path__namespace = /*#__PURE__*/_interopNamespace(path);

function isEntryPoint(config, file) {
  let appFile = path__namespace.relative(config.appDirectory, file);
  let entryPoints = [config.entryClientFile, config.entryServerFile, ...Object.values(config.routes).map(route => route.file)];
  return entryPoints.includes(appFile);
}
async function watch(ctx, {
  reloadConfig = config.readConfig,
  onBuildStart,
  onBuildFinish,
  onFileCreated,
  onFileChanged,
  onFileDeleted
} = {}) {
  var _ctx$config$watchPath;
  let start = Date.now();
  let compiler$1 = await compiler.create(ctx);
  let compile = () => compiler$1.compile().catch(thrown => {
    log.logThrown(thrown);
    return undefined;
  });

  // initial build
  onBuildStart === null || onBuildStart === void 0 ? void 0 : onBuildStart(ctx);
  let manifest = await compile();
  onBuildFinish === null || onBuildFinish === void 0 ? void 0 : onBuildFinish(ctx, Date.now() - start, manifest);
  let restart = debounce__default["default"](async () => {
    onBuildStart === null || onBuildStart === void 0 ? void 0 : onBuildStart(ctx);
    let start = Date.now();
    compiler$1.dispose();
    try {
      ctx.config = await reloadConfig(ctx.config.rootDirectory);
    } catch (thrown) {
      log.logThrown(thrown);
      return;
    }
    compiler$1 = await compiler.create(ctx);
    let manifest = await compile();
    onBuildFinish === null || onBuildFinish === void 0 ? void 0 : onBuildFinish(ctx, Date.now() - start, manifest);
  }, 500);
  let rebuild = debounce__default["default"](async () => {
    onBuildStart === null || onBuildStart === void 0 ? void 0 : onBuildStart(ctx);
    let start = Date.now();
    let manifest = await compile();
    onBuildFinish === null || onBuildFinish === void 0 ? void 0 : onBuildFinish(ctx, Date.now() - start, manifest);
  }, 100);
  let toWatch = [ctx.config.appDirectory];
  if (ctx.config.serverEntryPoint) {
    toWatch.push(ctx.config.serverEntryPoint);
  }
  (_ctx$config$watchPath = ctx.config.watchPaths) === null || _ctx$config$watchPath === void 0 ? void 0 : _ctx$config$watchPath.forEach(watchPath => {
    toWatch.push(watchPath);
  });
  let watcher = chokidar__default["default"].watch(toWatch, {
    persistent: true,
    ignoreInitial: true,
    awaitWriteFinish: {
      stabilityThreshold: 100,
      pollInterval: 100
    }
  }).on("error", error => console.error(error)).on("change", async file => {
    onFileChanged === null || onFileChanged === void 0 ? void 0 : onFileChanged(file);
    await rebuild();
  }).on("add", async file => {
    onFileCreated === null || onFileCreated === void 0 ? void 0 : onFileCreated(file);
    try {
      ctx.config = await reloadConfig(ctx.config.rootDirectory);
    } catch (thrown) {
      log.logThrown(thrown);
      return;
    }
    await (isEntryPoint(ctx.config, file) ? restart : rebuild)();
  }).on("unlink", async file => {
    onFileDeleted === null || onFileDeleted === void 0 ? void 0 : onFileDeleted(file);
    await (isEntryPoint(ctx.config, file) ? restart : rebuild)();
  });
  return async () => {
    await watcher.close().catch(() => undefined);
    compiler$1.dispose();
  };
}

exports.watch = watch;
