export declare const runtimes: readonly ["cloudflare", "node"];
export type Runtime = typeof runtimes[number];
export declare const isRuntime: (maybe: string) => maybe is "node" | "cloudflare";
declare const adapters: readonly ["architect", "cloudflare-pages", "cloudflare-workers", "express", "netlify", "vercel"];
export type Adapter = typeof adapters[number];
export declare const isAdapter: (maybe: string) => maybe is "netlify" | "vercel" | "cloudflare-pages" | "cloudflare-workers" | "express" | "architect";
declare const renderers: readonly ["react"];
export type Renderer = typeof renderers[number];
export type RemixPackage = "remix" | `@remix-run/${Runtime | Adapter | Renderer}`;
export declare const isRemixPackage: (pkgName: string) => pkgName is RemixPackage;
export {};
