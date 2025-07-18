// Type imports
import type { GooglePlaceDetails } from "@/types/googlePlaces";

export interface ExtractedAddressComponents {
	subpremise: string; // 1
	streetNumber: string; //26A
	route: string; // Ormond Road
	locality: string; // Clayton
	administrativeAreaLevel1: string; // Victoria
	administrativeAreaLevel2: string; // City of Monash
	country: string; // Australia
	postalCode: string; // 3168
	formattedAddress: string; // 26A Ormond Road, Clayton VIC 3168, Australia
	location: {
		lat: number;
		lng: number;
	};
}

/**
 * Extracts address components from Google Place Details
 * @param placeDetails - Google Place Details object
 * @returns Extracted address components in a structured format
 */
export function extractAddressComponents(
	placeDetails: GooglePlaceDetails,
): ExtractedAddressComponents {
	const findComponent = (types: string[], shortName?: boolean): string => {
		const component = placeDetails.address_components.find((component) =>
			types.some((type) => component.types.includes(type)),
		);
		return shortName ? component?.short_name || "" : component?.long_name || "";
	};

	return {
		subpremise: findComponent(["subpremise"]),
		streetNumber: findComponent(["street_number"]),
		route: findComponent(["route"]),
		locality: findComponent(["locality"]),
		administrativeAreaLevel1: findComponent(
			["administrative_area_level_1"],
			true,
		),
		administrativeAreaLevel2: findComponent(["administrative_area_level_2"]),
		country: findComponent(["country"]),
		postalCode: findComponent(["postal_code"]),
		formattedAddress: placeDetails.formatted_address,
		location: {
			lat: placeDetails.geometry.location.lat,
			lng: placeDetails.geometry.location.lng,
		},
	};
}
