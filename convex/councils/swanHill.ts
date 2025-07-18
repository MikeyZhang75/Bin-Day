import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// SwanHill-specific regex patterns for waste types
// Test results show: General waste, Green waste, Recycling
const swanHillWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3[^>]*>General waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	recycling:
		/<h3[^>]*>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	foodAndGardenWaste:
		/<h3[^>]*>Green waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
};

export async function fetchSwanHillData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.SWAN_HILL_CITY, {
		searchApiUrl: "https://www.swanhill.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.swanhill.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: swanHillWastePatterns,
	});
}
