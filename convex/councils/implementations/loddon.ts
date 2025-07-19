import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Loddon-specific regex patterns for waste types
const loddonWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling[\s\S]*?<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchLoddonData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(placeDetails, COUNCIL_NAMES.LODDON_SHIRE, {
		searchApiUrl: "https://www.loddon.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.loddon.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: loddonWastePatterns,
	});
}
