import { v } from "convex/values";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { action } from "./_generated/server";
import { fetchAlpineShireData } from "./councils/alpineShire";
import { fetchBallaratData } from "./councils/ballarat";
import { fetchBanyuleData } from "./councils/banyule";
import { fetchBawBawShireData } from "./councils/bawBawShire";
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
	string,
	(placeDetails: GooglePlaceDetails) => Promise<WasteCollectionDates>
> = {
	"City of Monash": fetchMonashData,
	"Alpine Shire": fetchAlpineShireData,
	"City of Ballarat": fetchBallaratData,
	"Banyule City": fetchBanyuleData,
	"Gannawarra Shire": fetchGannawarraData,
	"Baw Baw Shire": fetchBawBawShireData,
};

export const getCouncilData = action({
	args: {
		council: v.string(),
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

		// Normalize council name for matching
		const normalizedCouncil = council.trim();

		// Check if we have a handler for this council
		const handler = councilHandlers[normalizedCouncil];

		if (!handler) {
			console.log(`No handler found for council: ${normalizedCouncil}`);
			return {
				supported: false,
				council: normalizedCouncil,
				message: `Council "${normalizedCouncil}" is not currently supported`,
				result: null,
			} as CouncilData;
		}

		try {
			const result = await handler(placeDetails);
			return {
				supported: true,
				council: normalizedCouncil,
				message: "OK",
				result,
			} as CouncilData;
		} catch (error) {
			console.error(`Error fetching data for ${normalizedCouncil}:`, error);
			throw error;
		}
	},
});
