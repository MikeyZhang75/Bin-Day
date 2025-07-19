import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// Mansfield-specific regex patterns for waste types
const mansfieldWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Green Bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMansfieldData(placeDetails: GooglePlaceDetails) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.MANSFIELD_SHIRE,
		{
			searchApiUrl: "https://www.mansfield.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.mansfield.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: mansfieldWastePatterns,
		},
	);
}
