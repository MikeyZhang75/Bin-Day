import type { GooglePlaceDetails } from "@/types/googlePlaces";
import {
	COUNCIL_NAMES,
	processCouncilData,
	type WasteTypeRegexPatterns,
} from "../core";

// Maribyrnong-specific regex patterns for waste types
const maribyrnongWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Green Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMaribyrnongData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.MARIBYRNONG_CITY, {
		searchApiUrl: "https://www.maribyrnong.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.maribyrnong.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: maribyrnongWastePatterns,
	});
}
