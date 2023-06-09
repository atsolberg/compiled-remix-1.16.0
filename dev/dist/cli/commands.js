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

var path = require('path');
var child_process = require('child_process');
var inspector = require('inspector');
var fse = require('fs-extra');
var getPort = require('get-port');
var ora = require('ora');
var prettyMs = require('pretty-ms');
var esbuild = require('esbuild');
var NPMCliPackageJson = require('@npmcli/package-json');
var semver = require('semver');
var colors = require('../colors.js');
var build$1 = require('../compiler/build.js');
require('chokidar');
require('lodash.debounce');
var config = require('../config.js');
require('module');
require('esbuild-plugin-polyfill-node');
var dependencies = require('../dependencies.js');
require('url');
require('postcss-load-config');
require('postcss');
require('fs');
require('remark-mdx-frontmatter');
require('tsconfig-paths');
require('postcss-modules');
require('../compiler/plugins/cssSideEffectImports.js');
require('../compiler/plugins/vanillaExtract.js');
require('node:path');
require('postcss-discard-duplicates');
require('cacache');
require('crypto');
require('node:fs');
require('@babel/generator');
require('minimatch');
require('@babel/core');
require('assert');
require('@babel/plugin-syntax-jsx');
require('@babel/plugin-syntax-typescript');
require('recast');
var detectPackageManager = require('./detectPackageManager.js');
require('jsesc');
var log = require('../compiler/utils/log.js');
var liveReload = require('../devServer/liveReload.js');
var serve = require('../devServer/serve.js');
var index = require('../devServer_unstable/index.js');
var format = require('../config/format.js');
var create$1 = require('./create.js');
var setup$1 = require('./setup.js');
var index$1 = require('../codemod/index.js');
var error = require('../codemod/utils/error.js');
var task = require('../codemod/utils/task.js');
var useJavascript = require('./useJavascript.js');
var warnOnce = require('../warnOnce.js');

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

var path__namespace = /*#__PURE__*/_interopNamespace(path);
var inspector__default = /*#__PURE__*/_interopDefaultLegacy(inspector);
var fse__namespace = /*#__PURE__*/_interopNamespace(fse);
var getPort__default = /*#__PURE__*/_interopDefaultLegacy(getPort);
var ora__default = /*#__PURE__*/_interopDefaultLegacy(ora);
var prettyMs__default = /*#__PURE__*/_interopDefaultLegacy(prettyMs);
var esbuild__namespace = /*#__PURE__*/_interopNamespace(esbuild);
var NPMCliPackageJson__default = /*#__PURE__*/_interopDefaultLegacy(NPMCliPackageJson);

async function create({
  appTemplate,
  projectDir,
  remixVersion,
  installDeps,
  useTypeScript,
  githubToken,
  debug
}) {
  let spinner = ora__default["default"]("Creating your app…").start();
  await create$1.createApp({
    appTemplate,
    projectDir,
    remixVersion,
    installDeps,
    useTypeScript,
    githubToken,
    debug
  });
  spinner.stop();
  spinner.clear();
}
async function init(projectDir, {
  deleteScript = true
} = {}) {
  let initScriptDir = path__namespace.join(projectDir, "remix.init");
  let initScriptTs = path__namespace.resolve(initScriptDir, "index.ts");
  let initScript = path__namespace.resolve(initScriptDir, "index.js");
  if (await fse__namespace.pathExists(initScriptTs)) {
    await esbuild__namespace.build({
      entryPoints: [initScriptTs],
      format: "cjs",
      platform: "node",
      outfile: initScript
    });
  }
  if (!(await fse__namespace.pathExists(initScript))) {
    return;
  }
  let initPackageJson = path__namespace.resolve(initScriptDir, "package.json");
  let isTypeScript = fse__namespace.existsSync(path__namespace.join(projectDir, "tsconfig.json"));
  let packageManager = detectPackageManager.detectPackageManager() ?? "npm";
  if (await fse__namespace.pathExists(initPackageJson)) {
    child_process.execSync(`${packageManager} install`, {
      cwd: initScriptDir,
      stdio: "ignore"
    });
  }
  let initFn = require(initScript);
  if (typeof initFn !== "function" && initFn.default) {
    initFn = initFn.default;
  }
  try {
    await initFn({
      isTypeScript,
      packageManager,
      rootDirectory: projectDir
    });
    if (deleteScript) {
      await fse__namespace.remove(initScriptDir);
    }
  } catch (error) {
    if (error instanceof Error) {
      error.message = `${colors.error("🚨 Oops, remix.init failed")}\n\n${error.message}`;
    }
    throw error;
  }
}
async function setup(platformArg) {
  let platform;
  if (platformArg === "cloudflare-workers" || platformArg === "cloudflare-pages") {
    console.warn(`Using '${platformArg}' as a platform value is deprecated. Use ` + "'cloudflare' instead.");
    console.log("HINT: check the `postinstall` script in `package.json`");
    platform = setup$1.SetupPlatform.Cloudflare;
  } else {
    platform = setup$1.isSetupPlatform(platformArg) ? platformArg : setup$1.SetupPlatform.Node;
  }
  await setup$1.setupRemix(platform);
  console.log(`Successfully setup Remix for ${platform}.`);
}
async function routes(remixRoot, formatArg) {
  let config$1 = await config.readConfig(remixRoot);
  let format$1 = format.isRoutesFormat(formatArg) ? formatArg : format.RoutesFormat.jsx;
  console.log(format.formatRoutes(config$1.routes, format$1));
}
async function build(remixRoot, modeArg, sourcemap = false) {
  let mode = parseMode(modeArg) ?? "production";
  console.log(`Building Remix app in ${mode} mode...`);
  if (modeArg === "production" && sourcemap) {
    console.warn("\n⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️");
    console.warn("You have enabled source maps in production. This will make your " + "server-side code visible to the public and is highly discouraged! If " + "you insist, please ensure you are using environment variables for " + "secrets and not hard-coding them into your source!");
    console.warn("⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️⚠️\n");
  }
  let start = Date.now();
  let config$1 = await config.readConfig(remixRoot);
  let options = {
    mode,
    sourcemap,
    onWarning: warnOnce.warnOnce
  };
  if (mode === "development" && config$1.future.unstable_dev) {
    let dev = await resolveDevBuild(config$1);
    options.devHttpOrigin = {
      scheme: dev.httpScheme,
      host: dev.httpHost,
      port: dev.httpPort
    };
    options.devWebsocketPort = dev.websocketPort;
  }
  fse__namespace.emptyDirSync(config$1.assetsBuildDirectory);
  await build$1.build({
    config: config$1,
    options
  }).catch(thrown => {
    log.logThrown(thrown);
    process.exit(1);
  });
  console.log(`Built in ${prettyMs__default["default"](Date.now() - start)}`);
}

// TODO: replace watch in v2
async function watch(remixRootOrConfig, modeArg) {
  let mode = parseMode(modeArg) ?? "development";
  console.log(`Watching Remix app in ${mode} mode...`);
  let config$1 = typeof remixRootOrConfig === "object" ? remixRootOrConfig : await config.readConfig(remixRootOrConfig);
  liveReload.liveReload(config$1);
  return await new Promise(() => {});
}
async function dev(remixRoot, flags = {}) {
  if (process.env.NODE_ENV && process.env.NODE_ENV !== "development") {
    console.warn(`Forcing NODE_ENV to be 'development'. Was: ${process.env.NODE_ENV}`);
  }
  process.env.NODE_ENV = "development";
  if (flags.debug) inspector__default["default"].open();
  let config$1 = await config.readConfig(remixRoot);
  if (config$1.future.unstable_dev === false) {
    await serve.serve(config$1, flags.port);
    return await new Promise(() => {});
  }
  await index.serve(config$1, await resolveDevServe(config$1, flags));
}
async function codemod(codemodName, projectDir, {
  dry = false,
  force = false
} = {}) {
  if (!codemodName) {
    console.error(colors.red("Error: Missing codemod name"));
    console.log("Usage: " + colors.gray(`remix codemod <${colors.arg("codemod")}> [${colors.arg("projectDir")}]`));
    process.exit(1);
  }
  try {
    await index$1["default"](projectDir ?? process.cwd(), codemodName, {
      dry,
      force
    });
  } catch (error$1) {
    if (error$1 instanceof error.CodemodError) {
      console.error(`${colors.red("Error:")} ${error$1.message}`);
      if (error$1.additionalInfo) console.info(colors.gray(error$1.additionalInfo));
      process.exit(1);
    }
    if (error$1 instanceof task.TaskError) {
      process.exit(1);
    }
    throw error$1;
  }
}
let clientEntries = ["entry.client.tsx", "entry.client.js", "entry.client.jsx"];
let serverEntries = ["entry.server.tsx", "entry.server.js", "entry.server.jsx"];
let entries = ["entry.client", "entry.server"];

// @ts-expect-error available in node 12+
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat#browser_compatibility
let conjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "conjunction"
});

// @ts-expect-error available in node 12+
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/ListFormat#browser_compatibility
let disjunctionListFormat = new Intl.ListFormat("en", {
  style: "long",
  type: "disjunction"
});
async function generateEntry(entry, remixRoot, useTypeScript = true) {
  let config$1 = await config.readConfig(remixRoot);

  // if no entry passed, attempt to create both
  if (!entry) {
    await generateEntry("entry.client", remixRoot, useTypeScript);
    await generateEntry("entry.server", remixRoot, useTypeScript);
    return;
  }
  if (!entries.includes(entry)) {
    let entriesArray = Array.from(entries);
    let list = conjunctionListFormat.format(entriesArray);
    console.error(colors.error(`Invalid entry file. Valid entry files are ${list}`));
    return;
  }
  let pkgJson = await NPMCliPackageJson__default["default"].load(config$1.rootDirectory);
  let deps = pkgJson.content.dependencies ?? {};
  let maybeReactVersion = semver.coerce(deps.react);
  if (!maybeReactVersion) {
    let react = ["react", "react-dom"];
    let list = conjunctionListFormat.format(react);
    throw new Error(`Could not determine React version. Please install the following packages: ${list}`);
  }
  let type = maybeReactVersion.major >= 18 || maybeReactVersion.raw === "0.0.0" ? "stream" : "string";
  let serverRuntime = deps["@remix-run/deno"] ? "deno" : deps["@remix-run/cloudflare"] ? "cloudflare" : deps["@remix-run/node"] ? "node" : undefined;
  if (!serverRuntime) {
    let serverRuntimes = ["@remix-run/deno", "@remix-run/cloudflare", "@remix-run/node"];
    let formattedList = disjunctionListFormat.format(serverRuntimes);
    console.error(colors.error(`Could not determine server runtime. Please install one of the following: ${formattedList}`));
    return;
  }
  let clientRenderer = deps["@remix-run/react"] ? "react" : undefined;
  if (!clientRenderer) {
    console.error(colors.error(`Could not determine runtime. Please install the following: @remix-run/react`));
    return;
  }
  let defaultsDirectory = path__namespace.resolve(__dirname, "..", "config", "defaults");
  let defaultEntryClient = path__namespace.resolve(defaultsDirectory, `entry.client.${clientRenderer}-${type}.tsx`);
  let defaultEntryServer = path__namespace.resolve(defaultsDirectory, serverRuntime, `entry.server.${clientRenderer}-${type}.tsx`);
  let isServerEntry = entry === "entry.server";
  let contents = isServerEntry ? await createServerEntry(config$1.rootDirectory, config$1.appDirectory, defaultEntryServer) : await createClientEntry(config$1.rootDirectory, config$1.appDirectory, defaultEntryClient);
  let outputExtension = useTypeScript ? "tsx" : "jsx";
  let outputEntry = `${entry}.${outputExtension}`;
  let outputFile = path__namespace.resolve(config$1.appDirectory, outputEntry);
  if (!useTypeScript) {
    let javascript = useJavascript.transpile(contents, {
      cwd: config$1.rootDirectory,
      filename: isServerEntry ? defaultEntryServer : defaultEntryClient
    });
    await fse__namespace.writeFile(outputFile, javascript, "utf-8");
  } else {
    await fse__namespace.writeFile(outputFile, contents, "utf-8");
  }
  console.log(colors.blue(`Entry file ${entry} created at ${path__namespace.relative(config$1.rootDirectory, outputFile)}.`));
}
async function checkForEntry(rootDirectory, appDirectory, entries) {
  for (let entry of entries) {
    let entryPath = path__namespace.resolve(appDirectory, entry);
    let exists = await fse__namespace.pathExists(entryPath);
    if (exists) {
      let relative = path__namespace.relative(rootDirectory, entryPath);
      console.error(colors.error(`Entry file ${relative} already exists.`));
      return process.exit(1);
    }
  }
}
async function createServerEntry(rootDirectory, appDirectory, inputFile) {
  await checkForEntry(rootDirectory, appDirectory, serverEntries);
  let contents = await fse__namespace.readFile(inputFile, "utf-8");
  return contents;
}
async function createClientEntry(rootDirectory, appDirectory, inputFile) {
  await checkForEntry(rootDirectory, appDirectory, clientEntries);
  let contents = await fse__namespace.readFile(inputFile, "utf-8");
  return contents;
}
let parseMode = mode => {
  if (mode === undefined) return undefined;
  if (mode === "development") return mode;
  if (mode === "production") return mode;
  if (mode === "test") return mode;
  console.error(`Unrecognized mode: ${mode}`);
  process.exit(1);
};
let findPort = async () => getPort__default["default"]({
  port: getPort.makeRange(3001, 3100)
});
let resolveDevBuild = async (config, flags = {}) => {
  let dev = config.future.unstable_dev;
  if (dev === false) throw Error("This should never happen");

  // prettier-ignore
  let httpScheme = flags.httpScheme ?? (dev === true ? undefined : dev.httpScheme) ?? "http";
  // prettier-ignore
  let httpHost = flags.httpHost ?? (dev === true ? undefined : dev.httpHost) ?? "localhost";
  // prettier-ignore
  let httpPort = flags.httpPort ?? (dev === true ? undefined : dev.httpPort) ?? (await findPort());
  // prettier-ignore
  let websocketPort = flags.websocketPort ?? (dev === true ? undefined : dev.websocketPort) ?? (await findPort());
  return {
    httpScheme,
    httpHost,
    httpPort,
    websocketPort
  };
};
let resolveDevServe = async (config, flags = {}) => {
  let dev = config.future.unstable_dev;
  if (dev === false) throw Error("Cannot resolve dev options");
  let {
    httpScheme,
    httpHost,
    httpPort,
    websocketPort
  } = await resolveDevBuild(config, flags);

  // prettier-ignore
  let command = flags.command ?? (dev === true ? undefined : dev.command);
  if (!command) {
    command = `remix-serve ${path__namespace.relative(process.cwd(), config.serverBuildPath)}`;
    let usingRemixAppServer = dependencies.getAppDependencies(config, true)["@remix-run/serve"] !== undefined;
    if (!usingRemixAppServer) {
      console.error([`Remix dev server command defaulted to '${command}', but @remix-run/serve is not installed.`, "If you are using another server, specify how to run it with `-c` or `--command` flag.", "For example, `remix dev -c 'node ./server.js'`"].join("\n"));
      process.exit(1);
    }
  }
  let restart = flags.restart ?? (dev === true ? undefined : dev.restart) ?? true;
  return {
    command,
    httpScheme,
    httpHost,
    httpPort,
    websocketPort,
    restart
  };
};

exports.build = build;
exports.codemod = codemod;
exports.create = create;
exports.dev = dev;
exports.generateEntry = generateEntry;
exports.init = init;
exports.routes = routes;
exports.setup = setup;
exports.watch = watch;
