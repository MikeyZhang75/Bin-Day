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
import type * as councils_core_errors from "../councils/core/errors.js";
import type * as councils_core_index from "../councils/core/index.js";
import type * as councils_core_types from "../councils/core/types.js";
import type * as councils_core_utils from "../councils/core/utils.js";
import type * as councils_implementations_alpineShire from "../councils/implementations/alpineShire.js";
import type * as councils_implementations_ballarat from "../councils/implementations/ballarat.js";
import type * as councils_implementations_banyule from "../councils/implementations/banyule.js";
import type * as councils_implementations_bawBawShire from "../councils/implementations/bawBawShire.js";
import type * as councils_implementations_bayside from "../councils/implementations/bayside.js";
import type * as councils_implementations_campaspe from "../councils/implementations/campaspe.js";
import type * as councils_implementations_dandenong from "../councils/implementations/dandenong.js";
import type * as councils_implementations_gannawarra from "../councils/implementations/gannawarra.js";
import type * as councils_implementations_hume from "../councils/implementations/hume.js";
import type * as councils_implementations_kingston from "../councils/implementations/kingston.js";
import type * as councils_implementations_loddon from "../councils/implementations/loddon.js";
import type * as councils_implementations_macedonRanges from "../councils/implementations/macedonRanges.js";
import type * as councils_implementations_mansfield from "../councils/implementations/mansfield.js";
import type * as councils_implementations_maribyrnong from "../councils/implementations/maribyrnong.js";
import type * as councils_implementations_maroondah from "../councils/implementations/maroondah.js";
import type * as councils_implementations_melton from "../councils/implementations/melton.js";
import type * as councils_implementations_mildura from "../councils/implementations/mildura.js";
import type * as councils_implementations_monash from "../councils/implementations/monash.js";
import type * as councils_implementations_moorabool from "../councils/implementations/moorabool.js";
import type * as councils_implementations_morningtonPeninsula from "../councils/implementations/morningtonPeninsula.js";
import type * as councils_implementations_mountAlexander from "../councils/implementations/mountAlexander.js";
import type * as councils_implementations_moyne from "../councils/implementations/moyne.js";
import type * as councils_implementations_nillumbik from "../councils/implementations/nillumbik.js";
import type * as councils_implementations_pyrenees from "../councils/implementations/pyrenees.js";
import type * as councils_implementations_shepparton from "../councils/implementations/shepparton.js";
import type * as councils_implementations_southernGrampians from "../councils/implementations/southernGrampians.js";
import type * as councils_implementations_stonnington from "../councils/implementations/stonnington.js";
import type * as councils_implementations_surfCoast from "../councils/implementations/surfCoast.js";
import type * as councils_implementations_swanHill from "../councils/implementations/swanHill.js";
import type * as councils_implementations_wangaratta from "../councils/implementations/wangaratta.js";
import type * as councils_implementations_whittlesea from "../councils/implementations/whittlesea.js";
import type * as councils_implementations_yarraRanges from "../councils/implementations/yarraRanges.js";
import type * as councils_index from "../councils/index.js";
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
  "councils/core/errors": typeof councils_core_errors;
  "councils/core/index": typeof councils_core_index;
  "councils/core/types": typeof councils_core_types;
  "councils/core/utils": typeof councils_core_utils;
  "councils/implementations/alpineShire": typeof councils_implementations_alpineShire;
  "councils/implementations/ballarat": typeof councils_implementations_ballarat;
  "councils/implementations/banyule": typeof councils_implementations_banyule;
  "councils/implementations/bawBawShire": typeof councils_implementations_bawBawShire;
  "councils/implementations/bayside": typeof councils_implementations_bayside;
  "councils/implementations/campaspe": typeof councils_implementations_campaspe;
  "councils/implementations/dandenong": typeof councils_implementations_dandenong;
  "councils/implementations/gannawarra": typeof councils_implementations_gannawarra;
  "councils/implementations/hume": typeof councils_implementations_hume;
  "councils/implementations/kingston": typeof councils_implementations_kingston;
  "councils/implementations/loddon": typeof councils_implementations_loddon;
  "councils/implementations/macedonRanges": typeof councils_implementations_macedonRanges;
  "councils/implementations/mansfield": typeof councils_implementations_mansfield;
  "councils/implementations/maribyrnong": typeof councils_implementations_maribyrnong;
  "councils/implementations/maroondah": typeof councils_implementations_maroondah;
  "councils/implementations/melton": typeof councils_implementations_melton;
  "councils/implementations/mildura": typeof councils_implementations_mildura;
  "councils/implementations/monash": typeof councils_implementations_monash;
  "councils/implementations/moorabool": typeof councils_implementations_moorabool;
  "councils/implementations/morningtonPeninsula": typeof councils_implementations_morningtonPeninsula;
  "councils/implementations/mountAlexander": typeof councils_implementations_mountAlexander;
  "councils/implementations/moyne": typeof councils_implementations_moyne;
  "councils/implementations/nillumbik": typeof councils_implementations_nillumbik;
  "councils/implementations/pyrenees": typeof councils_implementations_pyrenees;
  "councils/implementations/shepparton": typeof councils_implementations_shepparton;
  "councils/implementations/southernGrampians": typeof councils_implementations_southernGrampians;
  "councils/implementations/stonnington": typeof councils_implementations_stonnington;
  "councils/implementations/surfCoast": typeof councils_implementations_surfCoast;
  "councils/implementations/swanHill": typeof councils_implementations_swanHill;
  "councils/implementations/wangaratta": typeof councils_implementations_wangaratta;
  "councils/implementations/whittlesea": typeof councils_implementations_whittlesea;
  "councils/implementations/yarraRanges": typeof councils_implementations_yarraRanges;
  "councils/index": typeof councils_index;
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
