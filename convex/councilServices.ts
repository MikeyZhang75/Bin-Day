import { v } from "convex/values";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { action } from "./_generated/server";
import { COUNCIL_NAMES, type CouncilName } from "./councils";
import { fetchAlpineShireData } from "./councils/alpineShire";
import { fetchBallaratData } from "./councils/ballarat";
import { fetchBanyuleData } from "./councils/banyule";
import { fetchBawBawShireData } from "./councils/bawBawShire";
import { fetchBaysideData } from "./councils/bayside";
import { fetchCampaspeData } from "./councils/campaspe";
import { fetchDandenongData } from "./councils/dandenong";
import { fetchGannawarraData } from "./councils/gannawarra";
import { fetchHumeData } from "./councils/hume";
import { fetchKingstonData } from "./councils/kingston";
import { fetchLoddonData } from "./councils/loddon";
import { fetchMacedonRangesData } from "./councils/macedonRanges";
import { fetchMansfieldData } from "./councils/mansfield";
import { fetchMaribyrnongData } from "./councils/maribyrnong";
import { fetchMaroondahData } from "./councils/maroondah";
import { fetchMeltonData } from "./councils/melton";
import { fetchMilduraData } from "./councils/mildura";
import { fetchMonashData } from "./councils/monash";
import { fetchMooraboolData } from "./councils/moorabool";
import { fetchMorningtonPeninsulaData } from "./councils/morningtonPeninsula";
import { fetchMountAlexanderData } from "./councils/mountAlexander";
import { fetchMoyneData } from "./councils/moyne";
import { fetchNillumbikData } from "./councils/nillumbik";
import { fetchPyreneesData } from "./councils/pyrenees";
import { fetchSheppartonData } from "./councils/shepparton";
// import { fetchSouthernGrampiansData } from "./councils/southernGrampians";
import { fetchStonningtonData } from "./councils/stonnington";
import { fetchSurfCoastData } from "./councils/surfCoast";
import { fetchSwanHillData } from "./councils/swanHill";
import { fetchWangarattaData } from "./councils/wangaratta";
import { fetchWhittleseaData } from "./councils/whittlesea";
import { fetchYarraRangesData } from "./councils/yarraRanges";

export type WasteCollectionDates = {
	landfillWaste: number | null;
	recycling: number | null;
	foodAndGardenWaste: number | null;
	hardWaste: number | null;
	glass: number | null;
};

export type CouncilData = {
	supported: boolean;
	council: string;
	message: string;
	result: WasteCollectionDates | null;
};

// Council-specific API handlers
const councilHandlers: Record<
	CouncilName,
	(placeDetails: GooglePlaceDetails) => Promise<WasteCollectionDates>
> = {
	[COUNCIL_NAMES.CITY_OF_MONASH]: fetchMonashData,
	[COUNCIL_NAMES.ALPINE_SHIRE]: fetchAlpineShireData,
	[COUNCIL_NAMES.CITY_OF_BALLARAT]: fetchBallaratData,
	[COUNCIL_NAMES.BANYULE_CITY]: fetchBanyuleData,
	[COUNCIL_NAMES.GANNAWARRA_SHIRE]: fetchGannawarraData,
	[COUNCIL_NAMES.BAW_BAW_SHIRE]: fetchBawBawShireData,
	[COUNCIL_NAMES.BAYSIDE_CITY]: fetchBaysideData,
	[COUNCIL_NAMES.CAMPASPE_SHIRE]: fetchCampaspeData,
	[COUNCIL_NAMES.GREATER_DANDENONG]: fetchDandenongData,
	[COUNCIL_NAMES.SHEPPARTON]: fetchSheppartonData,
	[COUNCIL_NAMES.HUME_CITY]: fetchHumeData,
	[COUNCIL_NAMES.KINGSTON_CITY]: fetchKingstonData,
	[COUNCIL_NAMES.LODDON_SHIRE]: fetchLoddonData,
	[COUNCIL_NAMES.MACEDON_RANGES]: fetchMacedonRangesData,
	[COUNCIL_NAMES.MANSFIELD_SHIRE]: fetchMansfieldData,
	[COUNCIL_NAMES.MARIBYRNONG_CITY]: fetchMaribyrnongData,
	[COUNCIL_NAMES.MAROONDAH_CITY]: fetchMaroondahData,
	[COUNCIL_NAMES.MELTON_CITY]: fetchMeltonData,
	[COUNCIL_NAMES.MILDURA_CITY]: fetchMilduraData,
	[COUNCIL_NAMES.MOORABOOL_SHIRE]: fetchMooraboolData,
	[COUNCIL_NAMES.MORNINGTON_PENINSULA]: fetchMorningtonPeninsulaData,
	[COUNCIL_NAMES.MOUNT_ALEXANDER]: fetchMountAlexanderData,
	[COUNCIL_NAMES.MOYNE_SHIRE]: fetchMoyneData,
	[COUNCIL_NAMES.NILLUMBIK_SHIRE]: fetchNillumbikData,
	[COUNCIL_NAMES.PYRENEES_SHIRE]: fetchPyreneesData,
	// [COUNCIL_NAMES.SOUTHERN_GRAMPIANS]: fetchSouthernGrampiansData,
	[COUNCIL_NAMES.STONNINGTON_CITY]: fetchStonningtonData,
	[COUNCIL_NAMES.SURF_COAST_SHIRE]: fetchSurfCoastData,
	[COUNCIL_NAMES.SWAN_HILL_CITY]: fetchSwanHillData,
	[COUNCIL_NAMES.WANGARATTA_CITY]: fetchWangarattaData,
	[COUNCIL_NAMES.WHITTLESEA_CITY]: fetchWhittleseaData,
	[COUNCIL_NAMES.YARRA_RANGES]: fetchYarraRangesData,
};

export const getCouncilData = action({
	args: {
		council: v.union(
			v.literal(COUNCIL_NAMES.CITY_OF_MONASH),
			v.literal(COUNCIL_NAMES.ALPINE_SHIRE),
			v.literal(COUNCIL_NAMES.CITY_OF_BALLARAT),
			v.literal(COUNCIL_NAMES.BANYULE_CITY),
			v.literal(COUNCIL_NAMES.GANNAWARRA_SHIRE),
			v.literal(COUNCIL_NAMES.BAW_BAW_SHIRE),
			v.literal(COUNCIL_NAMES.BAYSIDE_CITY),
			v.literal(COUNCIL_NAMES.CAMPASPE_SHIRE),
			v.literal(COUNCIL_NAMES.GREATER_DANDENONG),
			v.literal(COUNCIL_NAMES.SHEPPARTON),
			v.literal(COUNCIL_NAMES.HUME_CITY),
			v.literal(COUNCIL_NAMES.KINGSTON_CITY),
			v.literal(COUNCIL_NAMES.LODDON_SHIRE),
			v.literal(COUNCIL_NAMES.MACEDON_RANGES),
			v.literal(COUNCIL_NAMES.MANSFIELD_SHIRE),
			v.literal(COUNCIL_NAMES.MARIBYRNONG_CITY),
			v.literal(COUNCIL_NAMES.MAROONDAH_CITY),
			v.literal(COUNCIL_NAMES.MELTON_CITY),
			v.literal(COUNCIL_NAMES.MILDURA_CITY),
			v.literal(COUNCIL_NAMES.MOORABOOL_SHIRE),
			v.literal(COUNCIL_NAMES.MORNINGTON_PENINSULA),
			v.literal(COUNCIL_NAMES.MOUNT_ALEXANDER),
			v.literal(COUNCIL_NAMES.MOYNE_SHIRE),
			v.literal(COUNCIL_NAMES.NILLUMBIK_SHIRE),
			v.literal(COUNCIL_NAMES.PYRENEES_SHIRE),
			// v.literal(COUNCIL_NAMES.SOUTHERN_GRAMPIANS),
			v.literal(COUNCIL_NAMES.STONNINGTON_CITY),
			v.literal(COUNCIL_NAMES.SURF_COAST_SHIRE),
			v.literal(COUNCIL_NAMES.SWAN_HILL_CITY),
			v.literal(COUNCIL_NAMES.WANGARATTA_CITY),
			v.literal(COUNCIL_NAMES.WHITTLESEA_CITY),
			v.literal(COUNCIL_NAMES.YARRA_RANGES),
		),
		placeDetails: v.object({
			address_components: v.array(
				v.object({
					long_name: v.string(),
					short_name: v.string(),
					types: v.array(v.string()),
				}),
			),
			formatted_address: v.string(),
			geometry: v.object({
				location: v.object({
					lat: v.number(),
					lng: v.number(),
				}),
				viewport: v.optional(
					v.object({
						northeast: v.object({
							lat: v.number(),
							lng: v.number(),
						}),
						southwest: v.object({
							lat: v.number(),
							lng: v.number(),
						}),
					}),
				),
			}),
		}),
	},
	handler: async (_, args) => {
		const { council, placeDetails } = args;

		// The council parameter is already validated by Convex schema
		// No need to normalize since it's a literal union type
		const handler = councilHandlers[council];

		if (!handler) {
			return {
				supported: false,
				council: council,
				message: `Council "${council}" is not currently supported`,
				result: null,
			} as CouncilData;
		}

		try {
			const result = await handler(placeDetails);
			return {
				supported: true,
				council: council,
				message: "OK",
				result,
			} as CouncilData;
		} catch (error) {
			console.error(`Error fetching data for ${council}:`, error);
			throw error;
		}
	},
});
