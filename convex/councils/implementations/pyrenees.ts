import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Pyrenees-specific regex patterns for waste types
// Test results show: General Waste, Glass, Green Waste, Recycling
const pyreneesWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3[^>]*>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	recycling:
		/<h3[^>]*>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	foodAndGardenWaste:
		/<h3[^>]*>Green Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	glass:
		/<h3[^>]*>Glass<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
};

export async function fetchPyreneesData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.PYRENEES_SHIRE,
		{
			searchApiUrl: "https://www.pyrenees.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.pyrenees.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: pyreneesWastePatterns,
		},
	);
}
