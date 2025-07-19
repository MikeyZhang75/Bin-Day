// Council implementations index - auto-exports all council handlers

import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../../councilServices";
import { COUNCIL_NAMES, type CouncilName } from "../core";

// Import all council implementations
import { fetchAlpineShireData } from "./alpineShire";
import { fetchBallaratData } from "./ballarat";
import { fetchBanyuleData } from "./banyule";
import { fetchBawBawShireData } from "./bawBawShire";
import { fetchBaysideData } from "./bayside";
import { fetchCampaspeData } from "./campaspe";
import { fetchColacOtwayData } from "./colacOtway";
import { fetchDandenongData } from "./dandenong";
import { fetchGannawarraData } from "./gannawarra";
import { fetchHumeData } from "./hume";
import { fetchKingstonData } from "./kingston";
import { fetchLoddonData } from "./loddon";
import { fetchMacedonRangesData } from "./macedonRanges";
import { fetchMansfieldData } from "./mansfield";
import { fetchMaribyrnongData } from "./maribyrnong";
import { fetchMaroondahData } from "./maroondah";
import { fetchMeltonData } from "./melton";
import { fetchMilduraData } from "./mildura";
import { fetchMonashData } from "./monash";
import { fetchMooraboolData } from "./moorabool";
import { fetchMorningtonPeninsulaData } from "./morningtonPeninsula";
import { fetchMountAlexanderData } from "./mountAlexander";
import { fetchMoyneData } from "./moyne";
import { fetchNillumbikData } from "./nillumbik";
import { fetchPyreneesData } from "./pyrenees";
import { fetchSheppartonData } from "./shepparton";
// import { fetchSouthernGrampiansData } from "./southernGrampians";
import { fetchStonningtonData } from "./stonnington";
import { fetchSurfCoastData } from "./surfCoast";
import { fetchSwanHillData } from "./swanHill";
import { fetchWangarattaData } from "./wangaratta";
import { fetchWhittleseaData } from "./whittlesea";
import { fetchYarraRangesData } from "./yarraRanges";

// Council handler mapping
export const councilHandlers: Record<
	CouncilName,
	(placeDetails: GooglePlaceDetails) => Promise<WasteCollectionDates>
> = {
	[COUNCIL_NAMES.ALPINE_SHIRE]: fetchAlpineShireData,
	[COUNCIL_NAMES.CITY_OF_BALLARAT]: fetchBallaratData,
	[COUNCIL_NAMES.BANYULE_CITY]: fetchBanyuleData,
	[COUNCIL_NAMES.BAW_BAW_SHIRE]: fetchBawBawShireData,
	[COUNCIL_NAMES.BAYSIDE_CITY]: fetchBaysideData,
	[COUNCIL_NAMES.CAMPASPE_SHIRE]: fetchCampaspeData,
	[COUNCIL_NAMES.COLAC_OTWAY]: fetchColacOtwayData,
	[COUNCIL_NAMES.GREATER_DANDENONG]: fetchDandenongData,
	[COUNCIL_NAMES.GANNAWARRA_SHIRE]: fetchGannawarraData,
	[COUNCIL_NAMES.HUME_CITY]: fetchHumeData,
	[COUNCIL_NAMES.KINGSTON_CITY]: fetchKingstonData,
	[COUNCIL_NAMES.LODDON_SHIRE]: fetchLoddonData,
	[COUNCIL_NAMES.MACEDON_RANGES]: fetchMacedonRangesData,
	[COUNCIL_NAMES.MANSFIELD_SHIRE]: fetchMansfieldData,
	[COUNCIL_NAMES.MARIBYRNONG_CITY]: fetchMaribyrnongData,
	[COUNCIL_NAMES.MAROONDAH_CITY]: fetchMaroondahData,
	[COUNCIL_NAMES.MELTON_CITY]: fetchMeltonData,
	[COUNCIL_NAMES.MILDURA_CITY]: fetchMilduraData,
	[COUNCIL_NAMES.CITY_OF_MONASH]: fetchMonashData,
	[COUNCIL_NAMES.MOORABOOL_SHIRE]: fetchMooraboolData,
	[COUNCIL_NAMES.MORNINGTON_PENINSULA]: fetchMorningtonPeninsulaData,
	[COUNCIL_NAMES.MOUNT_ALEXANDER]: fetchMountAlexanderData,
	[COUNCIL_NAMES.MOYNE_SHIRE]: fetchMoyneData,
	[COUNCIL_NAMES.NILLUMBIK_SHIRE]: fetchNillumbikData,
	[COUNCIL_NAMES.PYRENEES_SHIRE]: fetchPyreneesData,
	[COUNCIL_NAMES.SHEPPARTON]: fetchSheppartonData,
	// [COUNCIL_NAMES.SOUTHERN_GRAMPIANS]: fetchSouthernGrampiansData,
	[COUNCIL_NAMES.STONNINGTON_CITY]: fetchStonningtonData,
	[COUNCIL_NAMES.SURF_COAST_SHIRE]: fetchSurfCoastData,
	[COUNCIL_NAMES.SWAN_HILL_CITY]: fetchSwanHillData,
	[COUNCIL_NAMES.WANGARATTA_CITY]: fetchWangarattaData,
	[COUNCIL_NAMES.WHITTLESEA_CITY]: fetchWhittleseaData,
	[COUNCIL_NAMES.YARRA_RANGES]: fetchYarraRangesData,
};

// Helper to get all supported council names (for schema generation)
export const getSupportedCouncilNames = (): CouncilName[] => {
	return Object.keys(councilHandlers) as CouncilName[];
};

// Re-export all council data fetchers for backwards compatibility if needed
export {
	fetchAlpineShireData,
	fetchBallaratData,
	fetchBanyuleData,
	fetchBawBawShireData,
	fetchBaysideData,
	fetchCampaspeData,
	fetchColacOtwayData,
	fetchDandenongData,
	fetchGannawarraData,
	fetchHumeData,
	fetchKingstonData,
	fetchLoddonData,
	fetchMacedonRangesData,
	fetchMansfieldData,
	fetchMaribyrnongData,
	fetchMaroondahData,
	fetchMeltonData,
	fetchMilduraData,
	fetchMonashData,
	fetchMooraboolData,
	fetchMorningtonPeninsulaData,
	fetchMountAlexanderData,
	fetchMoyneData,
	fetchNillumbikData,
	fetchPyreneesData,
	fetchSheppartonData,
	// fetchSouthernGrampiansData,
	fetchStonningtonData,
	fetchSurfCoastData,
	fetchSwanHillData,
	fetchWangarattaData,
	fetchWhittleseaData,
	fetchYarraRangesData,
};
