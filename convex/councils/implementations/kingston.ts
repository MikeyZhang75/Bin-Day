import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Kingston-specific regex patterns for waste types
const kingstonWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	hardWaste:
		/hard-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchKingstonData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(placeDetails, COUNCIL_NAMES.KINGSTON_CITY, {
		searchApiUrl: "https://www.kingston.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.kingston.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: kingstonWastePatterns,
	});
}
