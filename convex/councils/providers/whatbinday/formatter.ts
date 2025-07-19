// WhatBinDay address formatter

import { extractAddressComponents } from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WhatBinDayAddress } from "./types";

export function formatAddressForAPI(placeDetails: GooglePlaceDetails): string {
	const addressComponents = extractAddressComponents(placeDetails);

	const address: WhatBinDayAddress = {
		address: {
			street_number: addressComponents.streetNumber || "",
			route: addressComponents.route || "",
			locality: addressComponents.locality || "",
			administrative_area_level_1: "Victoria",
			postal_code: addressComponents.postalCode || "",
			part: "",
			subpremise: addressComponents.subpremise || "",
			formatted_address: placeDetails.formatted_address,
		},
		geometry: {
			location: {
				lat: placeDetails.geometry.location.lat,
				lng: placeDetails.geometry.location.lng,
			},
		},
	};

	return JSON.stringify(address);
}
