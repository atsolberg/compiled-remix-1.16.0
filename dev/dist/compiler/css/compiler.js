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

var module$1 = require('module');
var esbuild = require('esbuild');
var esbuildPluginPolyfillNode = require('esbuild-plugin-polyfill-node');
var dependencies = require('../../dependencies.js');
var loaders = require('../utils/loaders.js');
var cssImports = require('../plugins/cssImports.js');
var absoluteCssUrlsPlugin = require('../plugins/absoluteCssUrlsPlugin.js');
var emptyModules = require('../plugins/emptyModules.js');
var mdx = require('../plugins/mdx.js');
var external = require('../plugins/external.js');
var cssModuleImports = require('../plugins/cssModuleImports.js');
var cssSideEffectImports = require('../plugins/cssSideEffectImports.js');
var vanillaExtract = require('../plugins/vanillaExtract.js');
var bundleEntry = require('./plugins/bundleEntry.js');
var bundle = require('./bundle.js');

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

var esbuild__namespace = /*#__PURE__*/_interopNamespace(esbuild);

const getExternals = config => {
  // For the browser build, exclude node built-ins that don't have a
  // browser-safe alternative installed in node_modules. Nothing should
  // *actually* be external in the browser build (we want to bundle all deps) so
  // this is really just making sure we don't accidentally have any dependencies
  // on node built-ins in browser bundles.
  let dependencies$1 = Object.keys(dependencies.getAppDependencies(config));
  let fakeBuiltins = module$1.builtinModules.filter(mod => dependencies$1.includes(mod));
  if (fakeBuiltins.length > 0) {
    throw new Error(`It appears you're using a module that is built in to node, but you installed it as a dependency which could cause problems. Please remove ${fakeBuiltins.join(", ")} before continuing.`);
  }
  return module$1.builtinModules.filter(mod => !dependencies$1.includes(mod));
};
const createEsbuildConfig = ctx => {
  return {
    entryPoints: {
      "css-bundle": bundleEntry.cssBundleEntryModuleId
    },
    outdir: ctx.config.assetsBuildDirectory,
    platform: "browser",
    format: "esm",
    external: getExternals(ctx.config),
    loader: loaders.loaders,
    bundle: true,
    logLevel: "silent",
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
    plugins: [bundleEntry.cssBundleEntryModulePlugin(ctx), cssModuleImports.cssModulesPlugin(ctx, {
      outputCss: true
    }), vanillaExtract.vanillaExtractPlugin(ctx, {
      outputCss: true
    }), cssSideEffectImports.cssSideEffectImportsPlugin(ctx), cssImports.cssFilePlugin(ctx), absoluteCssUrlsPlugin.absoluteCssUrlsPlugin(), external.externalPlugin(/^https?:\/\//, {
      sideEffects: false
    }), mdx.mdxPlugin(ctx), emptyModules.emptyModulesPlugin(ctx, /\.server(\.[jt]sx?)?$/), esbuildPluginPolyfillNode.polyfillNode(), external.externalPlugin(/^node:.*/, {
      sideEffects: false
    })],
    supported: {
      "import-meta": true
    }
  };
};
let create = async ctx => {
  let compiler = await esbuild__namespace.context({
    ...createEsbuildConfig(ctx),
    write: false
  });
  let compile = async () => {
    let {
      outputFiles
    } = await compiler.rebuild();
    let bundle$1 = outputFiles.find(outputFile => bundle.isBundle(ctx, outputFile, ".css"));
    return {
      bundle: bundle$1,
      outputFiles
    };
  };
  return {
    compile,
    cancel: compiler.cancel,
    dispose: compiler.dispose
  };
};

exports.create = create;
