import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Monash-specific regex patterns for waste types
const monashWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	hardWaste:
		/one-off-service[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMonashData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.CITY_OF_MONASH,
		{
			searchApiUrl: "https://www.monash.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.monash.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: monashWastePatterns,
		},
	);
}
