import type { GooglePlaceDetails } from "@/types/googlePlaces";
import {
	COUNCIL_NAMES,
	processCouncilData,
	type WasteTypeRegexPatterns,
} from "../core";

// SouthernGrampians-specific regex patterns for waste types
const southernGrampiansWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchSouthernGrampiansData(
	placeDetails: GooglePlaceDetails,
) {
	// @ts-expect-error - SOUTHERN_GRAMPIANS is not defined
	return processCouncilData(placeDetails, COUNCIL_NAMES.SOUTHERN_GRAMPIANS, {
		searchApiUrl: "https://www.sthgrampians.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.sthgrampians.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: southernGrampiansWastePatterns,
	});
}
