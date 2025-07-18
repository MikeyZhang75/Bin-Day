import type { GooglePlaceDetails } from "@/types/googlePlaces";
import {
	COUNCIL_NAMES,
	processCouncilData,
	type WasteTypeRegexPatterns,
} from "../core";

// SurfCoast-specific regex patterns for waste types
// Test results show: FOGO, Glass Only, Landfill, Recycling
const surfCoastWastePatterns: WasteTypeRegexPatterns = {
	landfillWaste:
		/<h3[^>]*>Landfill<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	recycling:
		/<h3[^>]*>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	foodAndGardenWaste:
		/<h3[^>]*>FOGO<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
	glass:
		/<h3[^>]*>Glass Only<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/i,
};

export async function fetchSurfCoastData(placeDetails: GooglePlaceDetails) {
	return processCouncilData(placeDetails, COUNCIL_NAMES.SURF_COAST_SHIRE, {
		searchApiUrl: "https://www.surfcoast.vic.gov.au/api/v1/myarea/search",
		wasteServicesUrl:
			"https://www.surfcoast.vic.gov.au/ocapi/Public/myarea/wasteservices",
		wasteTypePatterns: surfCoastWastePatterns,
	});
}
