import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import { processWhatBinDayCouncilData } from "../providers/whatbinday";

export async function fetchColacOtwayData(placeDetails: GooglePlaceDetails) {
	// Simply use the WhatBinDay provider with the council name
	// The API key is already configured in the provider's constants
	return processWhatBinDayCouncilData(placeDetails, COUNCIL_NAMES.COLAC_OTWAY);
}
