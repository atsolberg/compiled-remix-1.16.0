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

exports.RoutesFormat = void 0;
(function (RoutesFormat) {
  RoutesFormat["json"] = "json";
  RoutesFormat["jsx"] = "jsx";
})(exports.RoutesFormat || (exports.RoutesFormat = {}));
function isRoutesFormat(format) {
  return format === exports.RoutesFormat.json || format === exports.RoutesFormat.jsx;
}
function formatRoutes(routeManifest, format) {
  switch (format) {
    case exports.RoutesFormat.json:
      return formatRoutesAsJson(routeManifest);
    case exports.RoutesFormat.jsx:
      return formatRoutesAsJsx(routeManifest);
  }
}
function formatRoutesAsJson(routeManifest) {
  function handleRoutesRecursive(parentId) {
    let routes = Object.values(routeManifest).filter(route => route.parentId === parentId);
    let children = [];
    for (let route of routes) {
      children.push({
        id: route.id,
        index: route.index,
        path: route.path,
        caseSensitive: route.caseSensitive,
        file: route.file,
        children: handleRoutesRecursive(route.id)
      });
    }
    if (children.length > 0) {
      return children;
    }
    return undefined;
  }
  return JSON.stringify(handleRoutesRecursive() || null, null, 2);
}
function formatRoutesAsJsx(routeManifest) {
  let output = "<Routes>";
  function handleRoutesRecursive(parentId, level = 1) {
    let routes = Object.values(routeManifest).filter(route => route.parentId === parentId);
    let indent = Array(level * 2).fill(" ").join("");
    for (let route of routes) {
      output += "\n" + indent;
      output += `<Route${route.path ? ` path=${JSON.stringify(route.path)}` : ""}${route.index ? " index" : ""}${route.file ? ` file=${JSON.stringify(route.file)}` : ""}>`;
      if (handleRoutesRecursive(route.id, level + 1)) {
        output += "\n" + indent;
        output += "</Route>";
      } else {
        output = output.slice(0, -1) + " />";
      }
    }
    return routes.length > 0;
  }
  handleRoutesRecursive();
  output += "\n</Routes>";
  return output;
}

exports.formatRoutes = formatRoutes;
exports.formatRoutesAsJson = formatRoutesAsJson;
exports.formatRoutesAsJsx = formatRoutesAsJsx;
exports.isRoutesFormat = isRoutesFormat;
