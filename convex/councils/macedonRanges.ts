import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// Macedon Ranges-specific regex patterns for waste types
const macedonRangesWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>General waste\/rubbish bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>FOGO bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	glass:
		/<h3>Glass-only bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMacedonRangesData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.MACEDON_RANGES, {
		searchApiUrl: "https://www.mrsc.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.mrsc.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: macedonRangesWastePatterns,
	});
}
