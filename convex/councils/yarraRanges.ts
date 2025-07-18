import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// YarraRanges-specific regex patterns for waste types
// Test results show: FOGO, Recycling Collection, Rubbish Collection
const yarraRangesWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3[^>]*>Rubbish Collection<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	recycling:
		/<h3[^>]*>Recycling Collection<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	foodAndGardenWaste:
		/<h3[^>]*>FOGO<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
};

export async function fetchYarraRangesData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.YARRA_RANGES, {
		searchApiUrl: "https://www.yarraranges.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.yarraranges.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: yarraRangesWastePatterns,
	});
}
