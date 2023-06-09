import type { DataRouteObject } from "react-router-dom";
import type { RouteModules } from "./routeModules";
import type { FutureConfig } from "./entry";
export interface RouteManifest<Route> {
    [routeId: string]: Route;
}
interface Route {
    index?: boolean;
    caseSensitive?: boolean;
    id: string;
    parentId?: string;
    path?: string;
}
export interface EntryRoute extends Route {
    hasAction: boolean;
    hasLoader: boolean;
    hasCatchBoundary: boolean;
    hasErrorBoundary: boolean;
    imports?: string[];
    module: string;
    parentId?: string;
}
export declare function createServerRoutes(manifest: RouteManifest<EntryRoute>, routeModules: RouteModules, future: FutureConfig, parentId?: string, routesByParentId?: Record<string, Omit<EntryRoute, "children">[]>): DataRouteObject[];
export declare function createClientRoutesWithHMRRevalidationOptOut(needsRevalidation: boolean, manifest: RouteManifest<EntryRoute>, routeModulesCache: RouteModules, future: FutureConfig): DataRouteObject[];
export declare function createClientRoutes(manifest: RouteManifest<EntryRoute>, routeModulesCache: RouteModules, future: FutureConfig, parentId?: string, routesByParentId?: Record<string, Omit<EntryRoute, "children">[]>, needsRevalidation?: boolean | undefined): DataRouteObject[];
export {};
