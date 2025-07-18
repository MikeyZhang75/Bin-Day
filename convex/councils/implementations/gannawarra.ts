import type { GooglePlaceDetails } from "@/types/googlePlaces";
import {
	COUNCIL_NAMES,
	processCouncilData,
	type WasteTypeRegexPatterns,
} from "../core";

// Gannawarra-specific regex patterns for waste types
const gannawarraWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<h3>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<h3>Green Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	// Gannawarra doesn't typically show hard waste in regular schedule
};

export async function fetchGannawarraData(placeDetails: GooglePlaceDetails) {
	// Note: Gannawarra API returns null for LatLon in some cases
	// Distance calculation will be automatically skipped when LatLon is null
	return processCouncilData(placeDetails, COUNCIL_NAMES.GANNAWARRA_SHIRE, {
		searchApiUrl: "https://www.gannawarra.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.gannawarra.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: gannawarraWastePatterns,
	});
}
