import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Melton-specific regex patterns for waste types
const meltonWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Food and Green Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMeltonData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(placeDetails, COUNCIL_NAMES.MELTON_CITY, {
		searchApiUrl: "https://www.melton.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.melton.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: meltonWastePatterns,
	});
}
