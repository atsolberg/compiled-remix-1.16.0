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

var url = require('url');
var loadConfig = require('postcss-load-config');
var postcss = require('postcss');
var config = require('../../config.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var loadConfig__default = /*#__PURE__*/_interopDefaultLegacy(loadConfig);
var postcss__default = /*#__PURE__*/_interopDefaultLegacy(postcss);

const defaultContext = {
  vanillaExtract: false
};
function isPostcssEnabled(config) {
  return config.postcss || config.tailwind;
}
function getCacheKey({
  config,
  context
}) {
  return [config.rootDirectory, context.vanillaExtract].join("|");
}
let pluginsCache = new Map();
async function loadPostcssPlugins({
  config,
  context = defaultContext
}) {
  if (!isPostcssEnabled(config)) {
    return [];
  }
  let {
    rootDirectory
  } = config;
  let cacheKey = getCacheKey({
    config,
    context
  });
  let cachedPlugins = pluginsCache.get(cacheKey);
  if (cachedPlugins) {
    return cachedPlugins;
  }
  let plugins = [];
  if (config.postcss) {
    try {
      let postcssConfig = await loadConfig__default["default"](
      // We're nesting our custom context values in a "remix"
      // namespace to avoid clashing with other tools.
      // @ts-expect-error Custom context values aren't type safe.
      {
        remix: context
      }, rootDirectory);
      plugins.push(...postcssConfig.plugins);
    } catch (err) {
      // If they don't have a PostCSS config, just ignore it.
    }
  }
  if (config.tailwind) {
    let tailwindPlugin = await loadTailwindPlugin(config);
    if (tailwindPlugin && !hasTailwindPlugin(plugins)) {
      plugins.push(tailwindPlugin);
    }
  }
  pluginsCache.set(cacheKey, plugins);
  return plugins;
}
let processorCache = new Map();
async function getPostcssProcessor({
  config,
  context = defaultContext
}) {
  if (!isPostcssEnabled(config)) {
    return null;
  }
  let cacheKey = getCacheKey({
    config,
    context
  });
  let cachedProcessor = processorCache.get(cacheKey);
  if (cachedProcessor !== undefined) {
    return cachedProcessor;
  }
  let plugins = await loadPostcssPlugins({
    config,
    context
  });
  let processor = plugins.length > 0 ? postcss__default["default"](plugins) : null;
  processorCache.set(cacheKey, processor);
  return processor;
}
function hasTailwindPlugin(plugins) {
  return plugins.some(plugin => "postcssPlugin" in plugin && plugin.postcssPlugin === "tailwindcss");
}
let tailwindPluginCache = new Map();
async function loadTailwindPlugin(config$1) {
  var _await$import;
  if (!config$1.tailwind) {
    return null;
  }
  let {
    rootDirectory
  } = config$1;
  let cacheKey = rootDirectory;
  let cachedTailwindPlugin = tailwindPluginCache.get(cacheKey);
  if (cachedTailwindPlugin !== undefined) {
    return cachedTailwindPlugin;
  }
  let tailwindPath = null;
  try {
    // First ensure they have a Tailwind config
    let tailwindConfigExtensions = [".js", ".cjs", ".mjs", ".ts"];
    let tailwindConfig = config.findConfig(rootDirectory, "tailwind.config", tailwindConfigExtensions);
    if (!tailwindConfig) throw new Error("No Tailwind config found");

    // Load Tailwind from the project directory
    tailwindPath = require.resolve("tailwindcss", {
      paths: [rootDirectory]
    });
  } catch {
    // If they don't have a Tailwind config or Tailwind installed, just ignore it.
    return null;
  }
  let importedTailwindPlugin = tailwindPath ? (_await$import = await import(url.pathToFileURL(tailwindPath).href)) === null || _await$import === void 0 ? void 0 : _await$import.default : null;
  let tailwindPlugin = importedTailwindPlugin && importedTailwindPlugin.postcss // Check that it declares itself as a PostCSS plugin
  ? importedTailwindPlugin : null;
  tailwindPluginCache.set(cacheKey, tailwindPlugin);
  return tailwindPlugin;
}

exports.getPostcssProcessor = getPostcssProcessor;
exports.loadPostcssPlugins = loadPostcssPlugins;
