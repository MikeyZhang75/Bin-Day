import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Banyule-specific regex patterns for waste types
const banyuleWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<h3>Rubbish<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<h3>FOGO<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	// Banyule doesn't typically show hard waste in regular schedule
};

export async function fetchBanyuleData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(placeDetails, COUNCIL_NAMES.BANYULE_CITY, {
		searchApiUrl: "https://www.banyule.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.banyule.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: banyuleWastePatterns,
	});
}
