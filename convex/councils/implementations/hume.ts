import type { GooglePlaceDetails } from "@/types/googlePlaces";
import {
	COUNCIL_NAMES,
	processCouncilData,
	type WasteTypeRegexPatterns,
} from "../core";

// Hume-specific regex patterns for waste types
const humeWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<h3>Garbage<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<h3>Food and garden<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	// Hume doesn't show hard waste or glass in the regular schedule
};

export async function fetchHumeData(placeDetails: GooglePlaceDetails) {
	// Note: Hume API returns null for LatLon like Gannawarra
	// Distance calculation will be automatically skipped when LatLon is null
	return processCouncilData(placeDetails, COUNCIL_NAMES.HUME_CITY, {
		searchApiUrl: "https://www.hume.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.hume.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: humeWastePatterns,
	});
}
