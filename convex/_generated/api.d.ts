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
import type * as councils_banyule from "../councils/banyule.js";
import type * as councils_bawBawShire from "../councils/bawBawShire.js";
import type * as councils_bayside from "../councils/bayside.js";
import type * as councils_campaspe from "../councils/campaspe.js";
import type * as councils_errors from "../councils/errors.js";
import type * as councils_gannawarra from "../councils/gannawarra.js";
import type * as councils_index from "../councils/index.js";
import type * as councils_monash from "../councils/monash.js";
import type * as councils_types from "../councils/types.js";
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
  "councils/banyule": typeof councils_banyule;
  "councils/bawBawShire": typeof councils_bawBawShire;
  "councils/bayside": typeof councils_bayside;
  "councils/campaspe": typeof councils_campaspe;
  "councils/errors": typeof councils_errors;
  "councils/gannawarra": typeof councils_gannawarra;
  "councils/index": typeof councils_index;
  "councils/monash": typeof councils_monash;
  "councils/types": typeof councils_types;
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
