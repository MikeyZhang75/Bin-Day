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
import { fetchMonashData } from "./councils/monash";

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
			console.log(`No handler found for council: ${council}`);
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
