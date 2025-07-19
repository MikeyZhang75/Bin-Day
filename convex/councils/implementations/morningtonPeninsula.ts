import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// MorningtonPeninsula-specific regex patterns for waste types
const morningtonPeninsulaWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3>Household rubbish bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/<h3>Recycling bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/<h3>Green waste bin<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMorningtonPeninsulaData(
	placeDetails: GooglePlaceDetails,
) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.MORNINGTON_PENINSULA,
		{
			searchApiUrl: "https://www.mornpen.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.mornpen.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: morningtonPeninsulaWastePatterns,
		},
	);
}
