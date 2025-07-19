import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { COUNCIL_NAMES } from "../core";
import { processWhatBinDayCouncilData } from "../providers/whatbinday";

export async function fetchStrathbogieData(placeDetails: GooglePlaceDetails) {
	return processWhatBinDayCouncilData(
		placeDetails,
		COUNCIL_NAMES.STRATHBOGIE_SHIRE,
	);
}
