import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// Maroondah-specific regex patterns for waste types
const maroondahWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	glass: /glass[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMaroondahData(placeDetails: GooglePlaceDetails) {
	// Note: Maroondah API returns null for LatLon like Gannawarra
	return processCouncilData(placeDetails, COUNCIL_NAMES.MAROONDAH_CITY, {
		searchApiUrl: "https://www.maroondah.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.maroondah.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: maroondahWastePatterns,
	});
}
