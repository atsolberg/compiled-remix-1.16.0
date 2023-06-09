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
var module$1 = require('module');
var esbuild = require('esbuild');
var esbuildPluginPolyfillNode = require('esbuild-plugin-polyfill-node');
var dependencies = require('../../dependencies.js');
var loaders = require('../utils/loaders.js');
var routes = require('./plugins/routes.js');
var routes_unstable = require('./plugins/routes_unstable.js');
var cssImports = require('../plugins/cssImports.js');
var absoluteCssUrlsPlugin = require('../plugins/absoluteCssUrlsPlugin.js');
var deprecatedRemixPackage = require('../plugins/deprecatedRemixPackage.js');
var emptyModules = require('../plugins/emptyModules.js');
var mdx = require('../plugins/mdx.js');
var external = require('../plugins/external.js');
var cssBundleUpdate = require('./plugins/cssBundleUpdate.js');
var cssModuleImports = require('../plugins/cssModuleImports.js');
var cssSideEffectImports = require('../plugins/cssSideEffectImports.js');
var vanillaExtract = require('../plugins/vanillaExtract.js');
var invariant = require('../../invariant.js');
var hmr = require('./plugins/hmr.js');
var tsconfig = require('../utils/tsconfig.js');
var detectPackageManager = require('../../cli/detectPackageManager.js');

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
var esbuild__namespace = /*#__PURE__*/_interopNamespace(esbuild);

function getNpmPackageName(id) {
  let split = id.split("/");
  let packageName = split[0];
  if (packageName.startsWith("@")) packageName += `/${split[1]}`;
  return packageName;
}
function isBareModuleId(id) {
  return !id.startsWith("node:") && !id.startsWith(".") && !path__namespace.isAbsolute(id);
}
function isNodeBuiltIn(packageName) {
  return module$1.builtinModules.includes(packageName);
}
const getExternals = remixConfig => {
  // For the browser build, exclude node built-ins that don't have a
  // browser-safe alternative installed in node_modules. Nothing should
  // *actually* be external in the browser build (we want to bundle all deps) so
  // this is really just making sure we don't accidentally have any dependencies
  // on node built-ins in browser bundles.
  let dependencies$1 = Object.keys(dependencies.getAppDependencies(remixConfig));
  let fakeBuiltins = module$1.builtinModules.filter(mod => dependencies$1.includes(mod));
  if (fakeBuiltins.length > 0) {
    throw new Error(`It appears you're using a module that is built in to node, but you installed it as a dependency which could cause problems. Please remove ${fakeBuiltins.join(", ")} before continuing.`);
  }
  return module$1.builtinModules.filter(mod => !dependencies$1.includes(mod));
};
const createEsbuildConfig = (ctx, onLoader, channels) => {
  let entryPoints = {
    "entry.client": ctx.config.entryClientFilePath
  };
  let routeModulePaths = new Map();
  for (let id of Object.keys(ctx.config.routes)) {
    entryPoints[id] = ctx.config.routes[id].file;
    if (ctx.config.future.unstable_dev) {
      // In V2 we are doing AST transforms to remove server code, this means we
      // have to re-map all route modules back to the same module in the graph
      // otherwise we will have duplicate modules in the graph. We have to resolve
      // the path as we get the relative for the entrypoint and absolute for imports
      // from other modules.
      routeModulePaths.set(ctx.config.routes[id].file, ctx.config.routes[id].file);
      routeModulePaths.set(path__namespace.resolve(ctx.config.appDirectory, ctx.config.routes[id].file), ctx.config.routes[id].file);
    } else {
      // All route entry points are virtual modules that will be loaded by the
      // browserEntryPointsPlugin. This allows us to tree-shake server-only code
      // that we don't want to run in the browser (i.e. action & loader).
      entryPoints[id] += "?browser";
    }
  }
  if (ctx.options.mode === "development" && ctx.config.future.unstable_dev !== false) {
    let defaultsDirectory = path__namespace.resolve(__dirname, "..", "..", "config", "defaults");
    entryPoints["__remix_entry_dev"] = path__namespace.join(defaultsDirectory, "entry.dev.ts");
  }
  let matchPath = ctx.config.tsconfigPath ? tsconfig.createMatchPath(ctx.config.tsconfigPath) : undefined;
  function resolvePath(id) {
    if (!matchPath) {
      return id;
    }
    return matchPath(id, undefined, undefined, [".ts", ".tsx", ".js", ".jsx"]) || id;
  }
  let plugins = [deprecatedRemixPackage.deprecatedRemixPackagePlugin(ctx), cssModuleImports.cssModulesPlugin(ctx, {
    outputCss: false
  }), vanillaExtract.vanillaExtractPlugin(ctx, {
    outputCss: false
  }), cssSideEffectImports.cssSideEffectImportsPlugin(ctx), cssImports.cssFilePlugin(ctx), absoluteCssUrlsPlugin.absoluteCssUrlsPlugin(), external.externalPlugin(/^https?:\/\//, {
    sideEffects: false
  }), ctx.config.future.unstable_dev ? routes_unstable.browserRouteModulesPlugin(ctx, routeModulePaths, onLoader) : routes.browserRouteModulesPlugin(ctx, /\?browser$/), mdx.mdxPlugin(ctx), emptyModules.emptyModulesPlugin(ctx, /\.server(\.[jt]sx?)?$/), esbuildPluginPolyfillNode.polyfillNode(), external.externalPlugin(/^node:.*/, {
    sideEffects: false
  }), {
    // TODO: should be removed when error handling for compiler is improved
    name: "warn-on-unresolved-imports",
    setup: build => {
      build.onResolve({
        filter: /.*/
      }, args => {
        if (!isBareModuleId(resolvePath(args.path))) {
          return undefined;
        }
        if (args.path === "remix:hmr") {
          return undefined;
        }
        let packageName = getNpmPackageName(args.path);
        let pkgManager = detectPackageManager.detectPackageManager() ?? "npm";
        if (ctx.options.onWarning && !isNodeBuiltIn(packageName) && !/\bnode_modules\b/.test(args.importer) && (
        // Silence spurious warnings when using Yarn PnP. Yarn PnP doesn’t use
        // a `node_modules` folder to keep its dependencies, so the above check
        // will always fail.
        pkgManager === "npm" || pkgManager === "yarn" && process.versions.pnp == null)) {
          try {
            require.resolve(args.path);
          } catch (error) {
            ctx.options.onWarning(`The path "${args.path}" is imported in ` + `${path__namespace.relative(process.cwd(), args.importer)} but ` + `"${args.path}" was not found in your node_modules. ` + `Did you forget to install it?`, args.path);
          }
        }
        return undefined;
      });
    }
  }];
  if (ctx.options.mode === "development" && ctx.config.future.unstable_dev) {
    plugins.push(hmr.hmrPlugin(ctx));
    plugins.push(cssBundleUpdate.cssBundleUpdatePlugin(channels));
  }
  return {
    entryPoints,
    outdir: ctx.config.assetsBuildDirectory,
    platform: "browser",
    format: "esm",
    external: getExternals(ctx.config),
    loader: loaders.loaders,
    bundle: true,
    logLevel: "silent",
    splitting: true,
    sourcemap: ctx.options.sourcemap,
    // As pointed out by https://github.com/evanw/esbuild/issues/2440, when tsconfig is set to
    // `undefined`, esbuild will keep looking for a tsconfig.json recursively up. This unwanted
    // behavior can only be avoided by creating an empty tsconfig file in the root directory.
    tsconfig: ctx.config.tsconfigPath,
    mainFields: ["browser", "module", "main"],
    treeShaking: true,
    minify: ctx.options.mode === "production",
    entryNames: "[dir]/[name]-[hash]",
    chunkNames: "_shared/[name]-[hash]",
    assetNames: "_assets/[name]-[hash]",
    publicPath: ctx.config.publicPath,
    define: {
      "process.env.NODE_ENV": JSON.stringify(ctx.options.mode),
      "process.env.REMIX_DEV_SERVER_WS_PORT": JSON.stringify(ctx.config.devServerPort)
    },
    jsx: "automatic",
    jsxDev: ctx.options.mode !== "production",
    plugins,
    supported: {
      "import-meta": true
    }
  };
};
const create = async (ctx, channels) => {
  let hmrRoutes = {};
  let onLoader = (filename, code) => {
    let key = path__namespace.relative(ctx.config.rootDirectory, filename);
    hmrRoutes[key] = {
      loaderHash: code
    };
  };
  let compiler = await esbuild__namespace.context({
    ...createEsbuildConfig(ctx, onLoader, channels),
    metafile: true
  });
  let compile = async () => {
    hmrRoutes = {};
    let {
      metafile
    } = await compiler.rebuild();
    let hmr = undefined;
    if (ctx.options.mode === "development" && ctx.config.future.unstable_dev) {
      var _Object$entries$find;
      let hmrRuntimeOutput = (_Object$entries$find = Object.entries(metafile.outputs).find(([_, output]) => output.inputs["hmr-runtime:remix:hmr"])) === null || _Object$entries$find === void 0 ? void 0 : _Object$entries$find[0];
      invariant["default"](hmrRuntimeOutput, "Expected to find HMR runtime in outputs");
      let hmrRuntime = ctx.config.publicPath + path__namespace.relative(ctx.config.assetsBuildDirectory, path__namespace.resolve(hmrRuntimeOutput));
      hmr = {
        runtime: hmrRuntime,
        routes: hmrRoutes,
        timestamp: Date.now()
      };
    }
    return {
      metafile,
      hmr
    };
  };
  return {
    compile,
    cancel: compiler.cancel,
    dispose: compiler.dispose
  };
};

exports.create = create;
