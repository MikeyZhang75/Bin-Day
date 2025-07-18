import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// Nillumbik-specific regex patterns for waste types
const nillumbikWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>Landfill \(red lid\)<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling \(yellow lid\)<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Green waste \(green lid\)<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchNillumbikData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.NILLUMBIK_SHIRE, {
		searchApiUrl: "https://www.nillumbik.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.nillumbik.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: nillumbikWastePatterns,
	});
}
