import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "./index";
import { processCouncilData, type WasteTypeRegexPatterns } from "./utils";

// Mildura-specific regex patterns for waste types
const milduraWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>Landfill Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Organics Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	glass:
		/<h3>Glass<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMilduraData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.MILDURA_CITY, {
		searchApiUrl: "https://www.mildura.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.mildura.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: milduraWastePatterns,
	});
}
