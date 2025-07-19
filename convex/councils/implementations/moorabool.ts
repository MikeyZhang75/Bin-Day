import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Moorabool-specific regex patterns for waste types
const mooraboolWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>Garbage collection<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling collection<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Green waste collection<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMooraboolData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.MOORABOOL_SHIRE,
		{
			searchApiUrl: "https://www.moorabool.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.moorabool.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: mooraboolWastePatterns,
		},
	);
}
