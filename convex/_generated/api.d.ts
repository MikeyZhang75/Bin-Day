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
import type * as councils_dandenong from "../councils/dandenong.js";
import type * as councils_errors from "../councils/errors.js";
import type * as councils_gannawarra from "../councils/gannawarra.js";
import type * as councils_hume from "../councils/hume.js";
import type * as councils_index from "../councils/index.js";
import type * as councils_kingston from "../councils/kingston.js";
import type * as councils_loddon from "../councils/loddon.js";
import type * as councils_macedonRanges from "../councils/macedonRanges.js";
import type * as councils_mansfield from "../councils/mansfield.js";
import type * as councils_maribyrnong from "../councils/maribyrnong.js";
import type * as councils_maroondah from "../councils/maroondah.js";
import type * as councils_melton from "../councils/melton.js";
import type * as councils_mildura from "../councils/mildura.js";
import type * as councils_monash from "../councils/monash.js";
import type * as councils_moorabool from "../councils/moorabool.js";
import type * as councils_morningtonPeninsula from "../councils/morningtonPeninsula.js";
import type * as councils_mountAlexander from "../councils/mountAlexander.js";
import type * as councils_moyne from "../councils/moyne.js";
import type * as councils_nillumbik from "../councils/nillumbik.js";
import type * as councils_pyrenees from "../councils/pyrenees.js";
import type * as councils_shepparton from "../councils/shepparton.js";
import type * as councils_southernGrampians from "../councils/southernGrampians.js";
import type * as councils_stonnington from "../councils/stonnington.js";
import type * as councils_surfCoast from "../councils/surfCoast.js";
import type * as councils_swanHill from "../councils/swanHill.js";
import type * as councils_types from "../councils/types.js";
import type * as councils_utils from "../councils/utils.js";
import type * as councils_wangaratta from "../councils/wangaratta.js";
import type * as councils_whittlesea from "../councils/whittlesea.js";
import type * as councils_yarraRanges from "../councils/yarraRanges.js";
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
  "councils/dandenong": typeof councils_dandenong;
  "councils/errors": typeof councils_errors;
  "councils/gannawarra": typeof councils_gannawarra;
  "councils/hume": typeof councils_hume;
  "councils/index": typeof councils_index;
  "councils/kingston": typeof councils_kingston;
  "councils/loddon": typeof councils_loddon;
  "councils/macedonRanges": typeof councils_macedonRanges;
  "councils/mansfield": typeof councils_mansfield;
  "councils/maribyrnong": typeof councils_maribyrnong;
  "councils/maroondah": typeof councils_maroondah;
  "councils/melton": typeof councils_melton;
  "councils/mildura": typeof councils_mildura;
  "councils/monash": typeof councils_monash;
  "councils/moorabool": typeof councils_moorabool;
  "councils/morningtonPeninsula": typeof councils_morningtonPeninsula;
  "councils/mountAlexander": typeof councils_mountAlexander;
  "councils/moyne": typeof councils_moyne;
  "councils/nillumbik": typeof councils_nillumbik;
  "councils/pyrenees": typeof councils_pyrenees;
  "councils/shepparton": typeof councils_shepparton;
  "councils/southernGrampians": typeof councils_southernGrampians;
  "councils/stonnington": typeof councils_stonnington;
  "councils/surfCoast": typeof councils_surfCoast;
  "councils/swanHill": typeof councils_swanHill;
  "councils/types": typeof councils_types;
  "councils/utils": typeof councils_utils;
  "councils/wangaratta": typeof councils_wangaratta;
  "councils/whittlesea": typeof councils_whittlesea;
  "councils/yarraRanges": typeof councils_yarraRanges;
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
