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
/**
 * A React component that is rendered when the server throws a Response.
 *
 * @deprecated Please enable the v2_errorBoundary flag
 *
 * @see https://remix.run/route/catch-boundary
 */

/**
 * A React component that is rendered when there is an error on a route.
 *
 * @deprecated Please enable the v2_errorBoundary flag
 *
 * @see https://remix.run/route/error-boundary
 */

/**
 * V2 version of the ErrorBoundary that eliminates the distinction between
 * Error and Catch Boundaries and behaves like RR 6.4 errorElement and captures
 * errors with useRouteError()
 */

/**
 * A function that defines `<link>` tags to be inserted into the `<head>` of
 * the document on route transitions.
 *
 * @see https://remix.run/route/meta
 */

/**
 * A function that returns an object of name + content pairs to use for
 * `<meta>` tags for a route. These tags will be merged with (and take
 * precedence over) tags from parent routes.
 *
 * @see https://remix.run/route/meta
 */

// TODO: Replace in v2

/**
 * A name/content pair used to render `<meta>` tags in a meta function for a
 * route. The value can be either a string, which will render a single `<meta>`
 * tag, or an array of strings that will render multiple tags with the same
 * `name` attribute.
 */

// TODO: Replace in v2

/**
 * A React component that is rendered for a route.
 */

/**
 * An arbitrary object that is associated with a route.
 *
 * @see https://remix.run/route/handle
 */

async function loadRouteModule(route, routeModulesCache) {
  if (route.id in routeModulesCache) {
    return routeModulesCache[route.id];
  }
  try {
    let routeModule = await import( /* webpackIgnore: true */route.module);
    routeModulesCache[route.id] = routeModule;
    return routeModule;
  } catch (error) {
    // User got caught in the middle of a deploy and the CDN no longer has the
    // asset we're trying to import! Reload from the server and the user
    // (should) get the new manifest--unless the developer purged the static
    // assets, the manifest path, but not the documents 😬
    window.location.reload();
    return new Promise(() => {
      // check out of this hook cause the DJs never gonna re[s]olve this
    });
  }
}

/**
 * @deprecated The `unstable_shouldReload` function has been removed, so this
 * function will never run and route data will be revalidated on every request.
 * Please update the function name to `shouldRevalidate` and use the
 * `ShouldRevalidateFunction` interface.
 */

export { loadRouteModule };
