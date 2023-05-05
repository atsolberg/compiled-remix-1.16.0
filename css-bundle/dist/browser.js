/**
 * @remix-run/css-bundle v1.16.0
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

let assetsManifest = window.__remixManifest;
// Injected by `cssBundleUpdatePlugin` on rebuilds
let updatedHref = typeof __INJECT_CSS_BUNDLE_HREF__ === "string" ? __INJECT_CSS_BUNDLE_HREF__ : undefined;
const cssBundleHref = updatedHref || assetsManifest.cssBundleHref;

exports.cssBundleHref = cssBundleHref;
