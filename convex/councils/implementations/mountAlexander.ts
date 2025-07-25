import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import {
	processGranicusCouncilData,
	type WasteTypeRegexPatterns,
} from "../providers/granicus";

// MountAlexander-specific regex patterns for waste types
const mountAlexanderWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	recycling:
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	foodAndGardenWaste:
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
};

export async function fetchMountAlexanderData(
	placeDetails: GooglePlaceDetails,
) {
	return processGranicusCouncilData(
		placeDetails,
		COUNCIL_NAMES.MOUNT_ALEXANDER,
		{
			searchApiUrl:
				"https://www.mountalexander.vic.gov.au/api/v1/myarea/search",
			wasteServicesUrl:
				"https://www.mountalexander.vic.gov.au/ocapi/Public/myarea/wasteservices",
			wasteTypePatterns: mountAlexanderWastePatterns,
		},
	);
}
