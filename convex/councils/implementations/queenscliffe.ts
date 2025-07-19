import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import { processWhatBinDayCouncilData } from "../providers/whatbinday";

export async function fetchQueenscliffeData(placeDetails: GooglePlaceDetails) {
	return processWhatBinDayCouncilData(placeDetails, COUNCIL_NAMES.QUEENSCLIFFE);
}
