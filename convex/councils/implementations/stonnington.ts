import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Stonnington-specific regex patterns for waste types
const stonningtonWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>General waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Food and green waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	hardWaste:
		/<h3>Hard waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchStonningtonData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.STONNINGTON_CITY,
		{
			searchApiUrl: "https://www.stonnington.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.stonnington.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: stonningtonWastePatterns,
		},
	);
}
