/**
 * @remix-run/react v1.16.0
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

var React = require('react');
var reactRouterDom = require('react-router-dom');
var components = require('./components.js');
var errorBoundaries = require('./errorBoundaries.js');
var errors = require('./errors.js');
var routes = require('./routes.js');

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

var React__namespace = /*#__PURE__*/_interopNamespace(React);

/* eslint-disable prefer-let/prefer-let */

let router;

/**
 * The entry point for a Remix app when it is rendered in the browser (in
 * `app/entry.client.js`). This component is used by React to hydrate the HTML
 * that was received from the server.
 */
function RemixBrowser(_props) {
  if (!router) {
    let routes$1 = routes.createClientRoutes(window.__remixManifest.routes, window.__remixRouteModules, window.__remixContext.future);
    let hydrationData = window.__remixContext.state;
    if (hydrationData && hydrationData.errors) {
      hydrationData = {
        ...hydrationData,
        errors: errors.deserializeErrors(hydrationData.errors)
      };
    }
    router = reactRouterDom.createBrowserRouter(routes$1, {
      hydrationData,
      future: {
        // Pass through the Remix future flag to avoid a v1 breaking change in
        // useNavigation() - users can control the casing via the flag in v1.
        // useFetcher still always uppercases in the back-compat layer in v1.
        // In v2 we can just always pass true here and remove the back-compat
        // layer
        v7_normalizeFormMethod: window.__remixContext.future.v2_normalizeFormMethod
      }
    });
  }
  let [location, setLocation] = React__namespace.useState(router.state.location);
  React__namespace.useLayoutEffect(() => {
    return router.subscribe(newState => {
      if (newState.location !== location) {
        setLocation(newState.location);
      }
    });
  }, [location]);

  // We need to include a wrapper RemixErrorBoundary here in case the root error
  // boundary also throws and we need to bubble up outside of the router entirely.
  // Then we need a stateful location here so the user can back-button navigate
  // out of there
  return /*#__PURE__*/React__namespace.createElement(components.RemixContext.Provider, {
    value: {
      manifest: window.__remixManifest,
      routeModules: window.__remixRouteModules,
      future: window.__remixContext.future
    }
  }, /*#__PURE__*/React__namespace.createElement(errorBoundaries.RemixErrorBoundary, {
    location: location,
    component: errorBoundaries.RemixRootDefaultErrorBoundary
  }, /*#__PURE__*/React__namespace.createElement(reactRouterDom.RouterProvider, {
    router: router,
    fallbackElement: null
  })));
}

exports.RemixBrowser = RemixBrowser;
