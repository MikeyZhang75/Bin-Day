import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Moyne-specific regex patterns for waste types
// Test results show: FOGO, Glass Only, Landfill, Recycling
const moyneWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3[^>]*>Landfill<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	recycling:
		/<h3[^>]*>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	foodAndGardenWaste:
		/<h3[^>]*>FOGO<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	glass:
		/<h3[^>]*>Glass Only<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
};

export async function fetchMoyneData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(placeDetails, COUNCIL_NAMES.MOYNE_SHIRE, {
		searchApiUrl: "https://www.moyne.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.moyne.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: moyneWastePatterns,
	});
}
