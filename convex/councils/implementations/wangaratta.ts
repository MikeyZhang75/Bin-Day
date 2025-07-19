import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Wangaratta-specific regex patterns for waste types
// Test results show: General Waste, Recycling
const wangarattaWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3[^>]*>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	recycling:
		/<h3[^>]*>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
};

export async function fetchWangarattaData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.WANGARATTA_CITY,
		{
			searchApiUrl: "https://www.wangaratta.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.wangaratta.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: wangarattaWastePatterns,
		},
	);
}
