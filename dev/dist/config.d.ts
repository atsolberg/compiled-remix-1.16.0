import type { RouteManifest, DefineRoutesFunction } from "./config/routes";
import { ServerMode } from "./config/serverModes";
export interface RemixMdxConfig {
    rehypePlugins?: any[];
    remarkPlugins?: any[];
}
export type RemixMdxConfigFunction = (filename: string) => Promise<RemixMdxConfig | undefined> | RemixMdxConfig | undefined;
export type ServerBuildTarget = "node-cjs" | "arc" | "netlify" | "vercel" | "cloudflare-pages" | "cloudflare-workers" | "deno";
export type ServerModuleFormat = "esm" | "cjs";
export type ServerPlatform = "node" | "neutral";
type Dev = {
    port?: number;
    command?: string;
    httpScheme?: string;
    httpHost?: string;
    httpPort?: number;
    websocketPort?: number;
    restart?: boolean;
};
interface FutureConfig {
    unstable_dev: boolean | Dev;
    /** @deprecated Use the `postcss` config option instead */
    unstable_postcss: boolean;
    /** @deprecated Use the `tailwind` config option instead */
    unstable_tailwind: boolean;
    v2_errorBoundary: boolean;
    v2_meta: boolean;
    v2_normalizeFormMethod: boolean;
    v2_routeConvention: boolean;
}
/**
 * The user-provided config in `remix.config.js`.
 */
export interface AppConfig {
    /**
     * The path to the `app` directory, relative to `remix.config.js`. Defaults
     * to `"app"`.
     */
    appDirectory?: string;
    /**
     * The path to a directory Remix can use for caching things in development,
     * relative to `remix.config.js`. Defaults to `".cache"`.
     */
    cacheDirectory?: string;
    /**
     * A function for defining custom routes, in addition to those already defined
     * using the filesystem convention in `app/routes`. Both sets of routes will
     * be merged.
     */
    routes?: (defineRoutes: DefineRoutesFunction) => Promise<ReturnType<DefineRoutesFunction>>;
    /**
     * The path to the browser build, relative to `remix.config.js`. Defaults to
     * "public/build".
     */
    assetsBuildDirectory?: string;
    /**
     * The path to the browser build, relative to remix.config.js. Defaults to
     * "public/build".
     *
     * @deprecated Use `{@link AppConfig.assetsBuildDirectory}` instead
     */
    browserBuildDirectory?: string;
    /**
     * The URL prefix of the browser build with a trailing slash. Defaults to
     * `"/build/"`. This is the path the browser will use to find assets.
     */
    publicPath?: string;
    /**
     * The port number to use for the dev server. Defaults to 8002.
     */
    devServerPort?: number;
    /**
     * The delay, in milliseconds, before the dev server broadcasts a reload
     * event. There is no delay by default.
     */
    devServerBroadcastDelay?: number;
    /**
     * Additional MDX remark / rehype plugins.
     */
    mdx?: RemixMdxConfig | RemixMdxConfigFunction;
    /**
     * Whether to process CSS using PostCSS if `postcss.config.js` is present.
     * Defaults to `false`.
     */
    postcss?: boolean;
    /**
     * A server entrypoint, relative to the root directory that becomes your
     * server's main module. If specified, Remix will compile this file along with
     * your application into a single file to be deployed to your server. This
     * file can use either a `.js` or `.ts` file extension.
     */
    server?: string;
    /**
     * The path to the server build, relative to `remix.config.js`. Defaults to
     * "build".
     *
     * @deprecated Use {@link AppConfig.serverBuildPath} instead.
     */
    serverBuildDirectory?: string;
    /**
     * The path to the server build file, relative to `remix.config.js`. This file
     * should end in a `.js` extension and should be deployed to your server.
     */
    serverBuildPath?: string;
    /**
     * The target of the server build. Defaults to "node-cjs".
     *
     * @deprecated Use a combination of `{@link AppConfig.publicPath}`, `{@link AppConfig.serverBuildPath}`, `{@link AppConfig.serverConditions}`, `{@link AppConfig.serverDependenciesToBundle}`, `{@link AppConfig.serverMainFields}`, `{@link AppConfig.serverMinify}`, `{@link AppConfig.serverModuleFormat}` and/or `{@link AppConfig.serverPlatform}` instead.
     */
    serverBuildTarget?: ServerBuildTarget;
    /**
     * The order of conditions to use when resolving server dependencies'
     * `exports` field in `package.json`.
     *
     * For more information, see: https://esbuild.github.io/api/#conditions
     */
    serverConditions?: string[];
    /**
     * A list of patterns that determined if a module is transpiled and included
     * in the server bundle. This can be useful when consuming ESM only packages
     * in a CJS build.
     */
    serverDependenciesToBundle?: "all" | Array<string | RegExp>;
    /**
     * The order of main fields to use when resolving server dependencies.
     * Defaults to `["main", "module"]`.
     *
     * For more information, see: https://esbuild.github.io/api/#main-fields
     */
    serverMainFields?: string[];
    /**
     * Whether to minify the server build in production or not.
     * Defaults to `false`.
     */
    serverMinify?: boolean;
    /**
     * The output format of the server build. Defaults to "cjs".
     */
    serverModuleFormat?: ServerModuleFormat;
    /**
     * The platform the server build is targeting. Defaults to "node".
     */
    serverPlatform?: ServerPlatform;
    /**
     * Whether to support Tailwind functions and directives in CSS files if `tailwindcss` is installed.
     * Defaults to `false`.
     */
    tailwind?: boolean;
    /**
     * A list of filenames or a glob patterns to match files in the `app/routes`
     * directory that Remix will ignore. Matching files will not be recognized as
     * routes.
     */
    ignoredRouteFiles?: string[];
    /**
     * A function for defining custom directories to watch while running `remix dev`, in addition to `appDirectory`.
     */
    watchPaths?: string | string[] | (() => Promise<string | string[]> | string | string[]);
    future?: Partial<FutureConfig>;
}
/**
 * Fully resolved configuration object we use throughout Remix.
 */
export interface RemixConfig {
    /**
     * The absolute path to the root of the Remix project.
     */
    rootDirectory: string;
    /**
     * The absolute path to the application source directory.
     */
    appDirectory: string;
    /**
     * The absolute path to the cache directory.
     */
    cacheDirectory: string;
    /**
     * The path to the entry.client file, relative to `config.appDirectory`.
     */
    entryClientFile: string;
    /**
     * The absolute path to the entry.client file.
     */
    entryClientFilePath: string;
    /**
     * The path to the entry.server file, relative to `config.appDirectory`.
     */
    entryServerFile: string;
    /**
     * The absolute path to the entry.server file.
     */
    entryServerFilePath: string;
    /**
     * An object of all available routes, keyed by route id.
     */
    routes: RouteManifest;
    /**
     * The absolute path to the assets build directory.
     */
    assetsBuildDirectory: string;
    /**
     * the original relative path to the assets build directory
     */
    relativeAssetsBuildDirectory: string;
    /**
     * The URL prefix of the public build with a trailing slash.
     */
    publicPath: string;
    /**
     * The port number to use for the dev (asset) server.
     */
    devServerPort: number;
    /**
     * The delay before the dev (asset) server broadcasts a reload event.
     */
    devServerBroadcastDelay: number;
    /**
     * Additional MDX remark / rehype plugins.
     */
    mdx?: RemixMdxConfig | RemixMdxConfigFunction;
    /**
     * Whether to process CSS using PostCSS if `postcss.config.js` is present.
     * Defaults to `false`.
     */
    postcss: boolean;
    /**
     * The path to the server build file. This file should end in a `.js`.
     */
    serverBuildPath: string;
    /**
     * The target of the server build. Defaults to "node-cjs".
     *
     * @deprecated Use a combination of `{@link AppConfig.publicPath}`, `{@link AppConfig.serverBuildPath}`, `{@link AppConfig.serverConditions}`, `{@link AppConfig.serverDependenciesToBundle}`, `{@link AppConfig.serverMainFields}`, `{@link AppConfig.serverMinify}`, `{@link AppConfig.serverModuleFormat}` and/or `{@link AppConfig.serverPlatform}` instead.   */
    serverBuildTarget?: ServerBuildTarget;
    /**
     * The default entry module for the server build if a {@see AppConfig.server}
     * is not provided.
     */
    serverBuildTargetEntryModule: string;
    /**
     * The order of conditions to use when resolving server dependencies'
     * `exports` field in `package.json`.
     *
     * For more information, see: https://esbuild.github.io/api/#conditions
     */
    serverConditions?: string[];
    /**
     * A list of patterns that determined if a module is transpiled and included
     * in the server bundle. This can be useful when consuming ESM only packages
     * in a CJS build.
     */
    serverDependenciesToBundle: "all" | Array<string | RegExp>;
    /**
     * A server entrypoint relative to the root directory that becomes your
     * server's main module.
     */
    serverEntryPoint?: string;
    /**
     * The order of main fields to use when resolving server dependencies.
     * Defaults to `["main", "module"]`.
     *
     * For more information, see: https://esbuild.github.io/api/#main-fields
     */
    serverMainFields: string[];
    /**
     * Whether to minify the server build in production or not.
     * Defaults to `false`.
     */
    serverMinify: boolean;
    /**
     * The mode to use to run the server.
     */
    serverMode: ServerMode;
    /**
     * The output format of the server build. Defaults to "cjs".
     */
    serverModuleFormat: ServerModuleFormat;
    /**
     * The platform the server build is targeting. Defaults to "node".
     */
    serverPlatform: ServerPlatform;
    /**
     * Whether to support Tailwind functions and directives in CSS files if `tailwindcss` is installed.
     * Defaults to `false`.
     */
    tailwind: boolean;
    /**
     * A list of directories to watch.
     */
    watchPaths: string[];
    /**
     * The path for the tsconfig file, if present on the root directory.
     */
    tsconfigPath: string | undefined;
    future: FutureConfig;
}
/**
 * Returns a fully resolved config object from the remix.config.js in the given
 * root directory.
 */
export declare function readConfig(remixRoot?: string, serverMode?: ServerMode): Promise<RemixConfig>;
export declare function findConfig(dir: string, basename: string, extensions: string[]): string | undefined;
export declare let browserBuildDirectoryWarning: string;
export declare let serverBuildDirectoryWarning: string;
export declare let serverBuildTargetWarning: string;
export declare const serverModuleFormatWarning: string;
export declare let flatRoutesWarning: string;
export declare const errorBoundaryWarning: string;
export declare const formMethodWarning: string;
export declare const metaWarning: string;
export {};
