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

var node_child_process = require('node:child_process');
var path = require('node:path');
var node_url = require('node:url');
var fse = require('fs-extra');
var getPort = require('get-port');
var NPMCliPackageJson = require('@npmcli/package-json');
var semver = require('semver');
var routes = require('./config/routes.js');
var routesConvention = require('./config/routesConvention.js');
var serverModes = require('./config/serverModes.js');
var writeTsconfigDefaults = require('./config/write-tsconfig-defaults.js');
var virtualModules = require('./compiler/server/virtualModules.js');
var flatRoutes = require('./config/flat-routes.js');
var detectPackageManager = require('./cli/detectPackageManager.js');
var warnOnce = require('./warnOnce.js');

function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

var path__default = /*#__PURE__*/_interopDefaultLegacy(path);
var fse__default = /*#__PURE__*/_interopDefaultLegacy(fse);
var getPort__default = /*#__PURE__*/_interopDefaultLegacy(getPort);
var NPMCliPackageJson__default = /*#__PURE__*/_interopDefaultLegacy(NPMCliPackageJson);

/**
 * Returns a fully resolved config object from the remix.config.js in the given
 * root directory.
 */
async function readConfig(remixRoot, serverMode = serverModes.ServerMode.Production) {
  var _appConfig$future, _appConfig$future2, _appConfig$future3, _appConfig$future4, _appConfig$future5, _appConfig$future6, _appConfig$future7, _appConfig$future8, _appConfig$future9, _appConfig$future10, _appConfig$future11, _appConfig$future12, _appConfig$future13;
  if (!serverModes.isValidServerMode(serverMode)) {
    throw new Error(`Invalid server mode "${serverMode}"`);
  }
  if (!remixRoot) {
    remixRoot = process.env.REMIX_ROOT || process.cwd();
  }
  let rootDirectory = path__default["default"].resolve(remixRoot);
  let configFile = findConfig(rootDirectory, "remix.config", configExts);
  let appConfig = {};
  if (configFile) {
    let appConfigModule;
    try {
      var _appConfigModule;
      // shout out to next
      // https://github.com/vercel/next.js/blob/b15a976e11bf1dc867c241a4c1734757427d609c/packages/next/server/config.ts#L748-L765
      if (process.env.NODE_ENV === "test") {
        // dynamic import does not currently work inside of vm which
        // jest relies on so we fall back to require for this case
        // https://github.com/nodejs/node/issues/35889
        appConfigModule = require(configFile);
      } else {
        appConfigModule = await import(node_url.pathToFileURL(configFile).href);
      }
      appConfig = ((_appConfigModule = appConfigModule) === null || _appConfigModule === void 0 ? void 0 : _appConfigModule.default) || appConfigModule;
    } catch (error) {
      throw new Error(`Error loading Remix config at ${configFile}\n${String(error)}`);
    }
  }
  if (appConfig.serverBuildTarget) {
    warnOnce.warnOnce(serverBuildTargetWarning, "v2_serverBuildTarget");
  }
  if (!((_appConfig$future = appConfig.future) !== null && _appConfig$future !== void 0 && _appConfig$future.v2_errorBoundary)) {
    warnOnce.warnOnce(errorBoundaryWarning, "v2_errorBoundary");
  }
  if (!((_appConfig$future2 = appConfig.future) !== null && _appConfig$future2 !== void 0 && _appConfig$future2.v2_normalizeFormMethod)) {
    warnOnce.warnOnce(formMethodWarning, "v2_normalizeFormMethod");
  }
  if (!((_appConfig$future3 = appConfig.future) !== null && _appConfig$future3 !== void 0 && _appConfig$future3.v2_meta)) {
    warnOnce.warnOnce(metaWarning, "v2_meta");
  }
  let isCloudflareRuntime = ["cloudflare-pages", "cloudflare-workers"].includes(appConfig.serverBuildTarget ?? "");
  let isDenoRuntime = appConfig.serverBuildTarget === "deno";
  let serverBuildPath = resolveServerBuildPath(rootDirectory, appConfig);
  let serverBuildTarget = appConfig.serverBuildTarget;
  let serverBuildTargetEntryModule = `export * from ${JSON.stringify(virtualModules.serverBuildVirtualModule.id)};`;
  let serverConditions = appConfig.serverConditions;
  let serverDependenciesToBundle = appConfig.serverDependenciesToBundle || [];
  let serverEntryPoint = appConfig.server;
  let serverMainFields = appConfig.serverMainFields;
  let serverMinify = appConfig.serverMinify;
  if (!appConfig.serverModuleFormat) {
    warnOnce.warnOnce(serverModuleFormatWarning, "serverModuleFormatWarning");
  }
  let serverModuleFormat = appConfig.serverModuleFormat || "cjs";
  let serverPlatform = appConfig.serverPlatform || "node";
  if (isCloudflareRuntime) {
    serverConditions ?? (serverConditions = ["worker"]);
    serverDependenciesToBundle = "all";
    serverMainFields ?? (serverMainFields = ["browser", "module", "main"]);
    serverMinify ?? (serverMinify = true);
    serverModuleFormat = "esm";
    serverPlatform = "neutral";
  }
  if (isDenoRuntime) {
    serverConditions ?? (serverConditions = ["deno", "worker"]);
    serverDependenciesToBundle = "all";
    serverMainFields ?? (serverMainFields = ["module", "main"]);
    serverModuleFormat = "esm";
    serverPlatform = "neutral";
  }
  serverMainFields ?? (serverMainFields = serverModuleFormat === "esm" ? ["module", "main"] : ["main", "module"]);
  serverMinify ?? (serverMinify = false);
  if (appConfig.future) {
    if ("unstable_cssModules" in appConfig.future) {
      warnOnce.warnOnce('The "future.unstable_cssModules" config option has been removed as this feature is now enabled automatically.');
    }
    if ("unstable_cssSideEffectImports" in appConfig.future) {
      warnOnce.warnOnce('The "future.unstable_cssSideEffectImports" config option has been removed as this feature is now enabled automatically.');
    }
    if ("unstable_vanillaExtract" in appConfig.future) {
      warnOnce.warnOnce('The "future.unstable_vanillaExtract" config option has been removed as this feature is now enabled automatically.');
    }
    if (appConfig.future.unstable_postcss !== undefined) {
      warnOnce.warnOnce('The "future.unstable_postcss" config option has been deprecated as this feature is now considered stable. Use the "postcss" config option instead.');
    }
    if (appConfig.future.unstable_tailwind !== undefined) {
      warnOnce.warnOnce('The "future.unstable_tailwind" config option has been deprecated as this feature is now considered stable. Use the "tailwind" config option instead.');
    }
  }
  let mdx = appConfig.mdx;
  let postcss = appConfig.postcss ?? ((_appConfig$future4 = appConfig.future) === null || _appConfig$future4 === void 0 ? void 0 : _appConfig$future4.unstable_postcss) === true;
  let tailwind = appConfig.tailwind ?? ((_appConfig$future5 = appConfig.future) === null || _appConfig$future5 === void 0 ? void 0 : _appConfig$future5.unstable_tailwind) === true;
  let appDirectory = path__default["default"].resolve(rootDirectory, appConfig.appDirectory || "app");
  let cacheDirectory = path__default["default"].resolve(rootDirectory, appConfig.cacheDirectory || ".cache");
  let defaultsDirectory = path__default["default"].resolve(__dirname, "config", "defaults");
  let userEntryClientFile = findEntry(appDirectory, "entry.client");
  let userEntryServerFile = findEntry(appDirectory, "entry.server");
  let entryServerFile;
  let entryClientFile;
  let pkgJson = await NPMCliPackageJson__default["default"].load(remixRoot);
  let deps = pkgJson.content.dependencies ?? {};
  if (userEntryServerFile) {
    entryServerFile = userEntryServerFile;
  } else {
    let serverRuntime = deps["@remix-run/deno"] ? "deno" : deps["@remix-run/cloudflare"] ? "cloudflare" : deps["@remix-run/node"] ? "node" : undefined;
    if (!serverRuntime) {
      let serverRuntimes = ["@remix-run/deno", "@remix-run/cloudflare", "@remix-run/node"];
      let formattedList = disjunctionListFormat.format(serverRuntimes);
      throw new Error(`Could not determine server runtime. Please install one of the following: ${formattedList}`);
    }
    let clientRenderer = deps["@remix-run/react"] ? "react" : undefined;
    if (!clientRenderer) {
      throw new Error(`Could not determine renderer. Please install the following: @remix-run/react`);
    }
    let maybeReactVersion = semver.coerce(deps.react);
    if (!maybeReactVersion) {
      let react = ["react", "react-dom"];
      let list = conjunctionListFormat.format(react);
      throw new Error(`Could not determine React version. Please install the following packages: ${list}`);
    }
    let type = maybeReactVersion.major >= 18 || maybeReactVersion.raw === "0.0.0" ? "stream" : "string";
    if (!deps["isbot"] && type === "stream") {
      console.log("adding `isbot` to your package.json, you should commit this change");
      pkgJson.update({
        dependencies: {
          ...pkgJson.content.dependencies,
          isbot: "latest"
        }
      });
      await pkgJson.save();
      let packageManager = detectPackageManager.detectPackageManager() ?? "npm";
      node_child_process.execSync(`${packageManager} install`, {
        cwd: remixRoot,
        stdio: "inherit"
      });
    }
    entryServerFile = `${serverRuntime}/entry.server.${clientRenderer}-${type}.tsx`;
  }
  if (userEntryClientFile) {
    entryClientFile = userEntryClientFile;
  } else {
    let clientRenderer = deps["@remix-run/react"] ? "react" : undefined;
    if (!clientRenderer) {
      throw new Error(`Could not determine runtime. Please install the following: @remix-run/react`);
    }
    let maybeReactVersion = semver.coerce(deps.react);
    if (!maybeReactVersion) {
      let react = ["react", "react-dom"];
      let list = conjunctionListFormat.format(react);
      throw new Error(`Could not determine React version. Please install the following packages: ${list}`);
    }
    let type = maybeReactVersion.major >= 18 || maybeReactVersion.raw === "0.0.0" ? "stream" : "string";
    entryClientFile = `entry.client.${clientRenderer}-${type}.tsx`;
  }
  let entryClientFilePath = userEntryClientFile ? path__default["default"].resolve(appDirectory, userEntryClientFile) : path__default["default"].resolve(defaultsDirectory, entryClientFile);
  let entryServerFilePath = userEntryServerFile ? path__default["default"].resolve(appDirectory, userEntryServerFile) : path__default["default"].resolve(defaultsDirectory, entryServerFile);
  if (appConfig.browserBuildDirectory) {
    warnOnce.warnOnce(browserBuildDirectoryWarning, "browserBuildDirectory");
  }
  let assetsBuildDirectory = appConfig.assetsBuildDirectory || appConfig.browserBuildDirectory || path__default["default"].join("public", "build");
  let absoluteAssetsBuildDirectory = path__default["default"].resolve(rootDirectory, assetsBuildDirectory);
  let devServerPort = Number(process.env.REMIX_DEV_SERVER_WS_PORT) || (await getPort__default["default"]({
    port: Number(appConfig.devServerPort) || 8002
  }));
  // set env variable so un-bundled servers can use it
  process.env.REMIX_DEV_SERVER_WS_PORT = String(devServerPort);
  let devServerBroadcastDelay = appConfig.devServerBroadcastDelay || 0;
  let defaultPublicPath = appConfig.serverBuildTarget === "arc" ? "/_static/build/" : "/build/";
  let publicPath = addTrailingSlash(appConfig.publicPath || defaultPublicPath);
  let rootRouteFile = findEntry(appDirectory, "root");
  if (!rootRouteFile) {
    throw new Error(`Missing "root" route file in ${appDirectory}`);
  }
  let routes$1 = {
    root: {
      path: "",
      id: "root",
      file: rootRouteFile
    }
  };
  let routesConvention$1;
  if ((_appConfig$future6 = appConfig.future) !== null && _appConfig$future6 !== void 0 && _appConfig$future6.v2_routeConvention) {
    routesConvention$1 = flatRoutes.flatRoutes;
  } else {
    warnOnce.warnOnce(flatRoutesWarning, "v2_routeConvention");
    routesConvention$1 = routesConvention.defineConventionalRoutes;
  }
  if (fse__default["default"].existsSync(path__default["default"].resolve(appDirectory, "routes"))) {
    let conventionalRoutes = routesConvention$1(appDirectory, appConfig.ignoredRouteFiles);
    for (let route of Object.values(conventionalRoutes)) {
      routes$1[route.id] = {
        ...route,
        parentId: route.parentId || "root"
      };
    }
  }
  if (appConfig.routes) {
    let manualRoutes = await appConfig.routes(routes.defineRoutes);
    for (let route of Object.values(manualRoutes)) {
      routes$1[route.id] = {
        ...route,
        parentId: route.parentId || "root"
      };
    }
  }
  let watchPaths = [];
  if (typeof appConfig.watchPaths === "function") {
    let directories = await appConfig.watchPaths();
    watchPaths = watchPaths.concat(Array.isArray(directories) ? directories : [directories]);
  } else if (appConfig.watchPaths) {
    watchPaths = watchPaths.concat(Array.isArray(appConfig.watchPaths) ? appConfig.watchPaths : [appConfig.watchPaths]);
  }

  // When tsconfigPath is undefined, the default "tsconfig.json" is not
  // found in the root directory.
  let tsconfigPath;
  let rootTsconfig = path__default["default"].resolve(rootDirectory, "tsconfig.json");
  let rootJsConfig = path__default["default"].resolve(rootDirectory, "jsconfig.json");
  if (fse__default["default"].existsSync(rootTsconfig)) {
    tsconfigPath = rootTsconfig;
  } else if (fse__default["default"].existsSync(rootJsConfig)) {
    tsconfigPath = rootJsConfig;
  }
  if (tsconfigPath) {
    writeTsconfigDefaults.writeConfigDefaults(tsconfigPath);
  }
  let future = {
    unstable_dev: ((_appConfig$future7 = appConfig.future) === null || _appConfig$future7 === void 0 ? void 0 : _appConfig$future7.unstable_dev) ?? false,
    unstable_postcss: ((_appConfig$future8 = appConfig.future) === null || _appConfig$future8 === void 0 ? void 0 : _appConfig$future8.unstable_postcss) === true,
    unstable_tailwind: ((_appConfig$future9 = appConfig.future) === null || _appConfig$future9 === void 0 ? void 0 : _appConfig$future9.unstable_tailwind) === true,
    v2_errorBoundary: ((_appConfig$future10 = appConfig.future) === null || _appConfig$future10 === void 0 ? void 0 : _appConfig$future10.v2_errorBoundary) === true,
    v2_meta: ((_appConfig$future11 = appConfig.future) === null || _appConfig$future11 === void 0 ? void 0 : _appConfig$future11.v2_meta) === true,
    v2_normalizeFormMethod: ((_appConfig$future12 = appConfig.future) === null || _appConfig$future12 === void 0 ? void 0 : _appConfig$future12.v2_normalizeFormMethod) === true,
    v2_routeConvention: ((_appConfig$future13 = appConfig.future) === null || _appConfig$future13 === void 0 ? void 0 : _appConfig$future13.v2_routeConvention) === true
  };
  return {
    appDirectory,
    cacheDirectory,
    entryClientFile,
    entryClientFilePath,
    entryServerFile,
    entryServerFilePath,
    devServerPort,
    devServerBroadcastDelay,
    assetsBuildDirectory: absoluteAssetsBuildDirectory,
    relativeAssetsBuildDirectory: assetsBuildDirectory,
    publicPath,
    rootDirectory,
    routes: routes$1,
    serverBuildPath,
    serverBuildTarget,
    serverBuildTargetEntryModule,
    serverConditions,
    serverDependenciesToBundle,
    serverEntryPoint,
    serverMainFields,
    serverMinify,
    serverMode,
    serverModuleFormat,
    serverPlatform,
    mdx,
    postcss,
    tailwind,
    watchPaths,
    tsconfigPath,
    future
  };
}
function addTrailingSlash(path) {
  return path.endsWith("/") ? path : path + "/";
}
const entryExts = [".js", ".jsx", ".ts", ".tsx"];
function findEntry(dir, basename) {
  for (let ext of entryExts) {
    let file = path__default["default"].resolve(dir, basename + ext);
    if (fse__default["default"].existsSync(file)) return path__default["default"].relative(dir, file);
  }
  return undefined;
}
const configExts = [".js", ".cjs", ".mjs"];
function findConfig(dir, basename, extensions) {
  for (let ext of extensions) {
    let name = basename + ext;
    let file = path__default["default"].join(dir, name);
    if (fse__default["default"].existsSync(file)) return file;
  }
  return undefined;
}
const resolveServerBuildPath = (rootDirectory, appConfig) => {
  let serverBuildPath = "build/index.js";
  switch (appConfig.serverBuildTarget) {
    case "arc":
      serverBuildPath = "server/index.js";
      break;
    case "cloudflare-pages":
      serverBuildPath = "functions/[[path]].js";
      break;
    case "netlify":
      serverBuildPath = ".netlify/functions-internal/server.js";
      break;
    case "vercel":
      serverBuildPath = "api/index.js";
      break;
  }

  // retain deprecated behavior for now
  if (appConfig.serverBuildDirectory) {
    warnOnce.warnOnce(serverBuildDirectoryWarning, "serverBuildDirectory");
    serverBuildPath = path__default["default"].join(appConfig.serverBuildDirectory, "index.js");
  }
  if (appConfig.serverBuildPath) {
    serverBuildPath = appConfig.serverBuildPath;
  }
  return path__default["default"].resolve(rootDirectory, serverBuildPath);
};

// adds types for `Intl.ListFormat` to the global namespace
// we could also update our `tsconfig.json` to include `lib: ["es2021"]`

let conjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction"
});
let disjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction"
});
let browserBuildDirectoryWarning = "⚠️ REMIX FUTURE CHANGE: The `browserBuildDirectory` config option will be removed in v2. " + "Use `assetsBuildDirectory` instead. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#browserbuilddirectory";
let serverBuildDirectoryWarning = "⚠️ REMIX FUTURE CHANGE: The `serverBuildDirectory` config option will be removed in v2. " + "Use `serverBuildPath` instead. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#serverbuilddirectory";
let serverBuildTargetWarning = "⚠️ REMIX FUTURE CHANGE: The `serverBuildTarget` config option will be removed in v2. " + "Use a combination of server module config values to achieve the same build output. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#serverbuildtarget";
const serverModuleFormatWarning = "⚠️ REMIX FUTURE CHANGE: The `serverModuleFormat` config default option will be changing in v2 " + "from `cjs` to `esm`. You can prepare for this change by explicitly specifying `serverModuleFormat: 'cjs'`. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.16.0/pages/v2#servermoduleformat";
let flatRoutesWarning = "⚠️ REMIX FUTURE CHANGE: The route file convention is changing in v2. " + "You can prepare for this change at your convenience with the `v2_routeConvention` future flag. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#file-system-route-convention";
const errorBoundaryWarning = "⚠️ REMIX FUTURE CHANGE: The behaviors of `CatchBoundary` and `ErrorBoundary` are changing in v2. " + "You can prepare for this change at your convenience with the `v2_errorBoundary` future flag. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#catchboundary-and-errorboundary";
const formMethodWarning = "⚠️ REMIX FUTURE CHANGE: APIs that provide `formMethod` will be changing in v2. " + "All values will be uppercase (GET, POST, etc.) instead of lowercase (get, post, etc.) " + "You can prepare for this change at your convenience with the `v2_normalizeFormMethod` future flag. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#formMethod";
const metaWarning = "⚠️ REMIX FUTURE CHANGE: The route `meta` export signature is changing in v2. " + "You can prepare for this change at your convenience with the `v2_meta` future flag. " + "For instructions on making this change see " + "https://remix.run/docs/en/v1.15.0/pages/v2#meta";

exports.browserBuildDirectoryWarning = browserBuildDirectoryWarning;
exports.errorBoundaryWarning = errorBoundaryWarning;
exports.findConfig = findConfig;
exports.flatRoutesWarning = flatRoutesWarning;
exports.formMethodWarning = formMethodWarning;
exports.metaWarning = metaWarning;
exports.readConfig = readConfig;
exports.serverBuildDirectoryWarning = serverBuildDirectoryWarning;
exports.serverBuildTargetWarning = serverBuildTargetWarning;
exports.serverModuleFormatWarning = serverModuleFormatWarning;
