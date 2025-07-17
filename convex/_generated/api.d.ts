/* eslint-disable */
/**
 * Generated `api` utility.
 *
 * THIS CODE IS AUTOMATICALLY GENERATED.
 *
 * To regenerate, run `npx convex dev`.
 * @module
 */

import type {
  ApiFromModules,
  FilterApi,
  FunctionReference,
} from "convex/server";
import type * as councilServices from "../councilServices.js";
import type * as councils_alpineShire from "../councils/alpineShire.js";
import type * as councils_ballarat from "../councils/ballarat.js";
import type * as councils_monash from "../councils/monash.js";
import type * as googlePlaces from "../googlePlaces.js";

/**
 * A utility for referencing Convex functions in your app's API.
 *
 * Usage:
 * ```js
 * const myFunctionReference = api.myModule.myFunction;
 * ```
 */
declare const fullApi: ApiFromModules<{
  councilServices: typeof councilServices;
  "councils/alpineShire": typeof councils_alpineShire;
  "councils/ballarat": typeof councils_ballarat;
  "councils/monash": typeof councils_monash;
  googlePlaces: typeof googlePlaces;
}>;
export declare const api: FilterApi<
  typeof fullApi,
  FunctionReference<any, "public">
>;
export declare const internal: FilterApi<
  typeof fullApi,
  FunctionReference<any, "internal">
>;
