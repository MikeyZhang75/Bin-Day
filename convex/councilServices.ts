import { v } from "convex/values";
import { action } from "./_generated/server";
import {
	councilHandlers,
	getSupportedCouncilNames,
} from "./councils/implementations";

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

// Create a union type of all supported council names for Convex schema
const createCouncilUnion = () => {
	const supportedCouncils = getSupportedCouncilNames();
	const literals = supportedCouncils.map((council) => v.literal(council));
	return v.union(...literals);
};

export const getCouncilData = action({
	args: {
		council: createCouncilUnion(),
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
