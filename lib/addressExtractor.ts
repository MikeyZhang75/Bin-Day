// Internal absolute imports

// Type imports
import type { CouncilName } from "@/convex/councils";
import { COUNCIL_NAMES } from "@/convex/councils";
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
	const findComponent = (types: string[]): string => {
		const component = placeDetails.address_components.find((component) =>
			types.some((type) => component.types.includes(type)),
		);
		return component?.long_name || "";
	};

	return {
		subpremise: findComponent(["subpremise"]),
		streetNumber: findComponent(["street_number"]),
		route: findComponent(["route"]),
		locality: findComponent(["locality"]),
		administrativeAreaLevel1: findComponent(["administrative_area_level_1"]),
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

/**
 * Gets a formatted address string for search queries
 * @param components - Extracted address components
 * @param council - Optional council name to format address differently
 * @returns Formatted address string for search queries (without state/postcode)
 * @example // Returns "1/26A Ormond Road, Clayton"
 */
export function getSearchAddress(
	components: ExtractedAddressComponents,
	council?: CouncilName,
): string {
	// Construct the address string based on council-specific formatting requirements
	let address = "";

	// Council-specific formatting
	switch (council) {
		case COUNCIL_NAMES.BAW_BAW_SHIRE:
		case COUNCIL_NAMES.BAYSIDE_CITY:
			// These councils exclude locality (suburb) from the search
			address = components.subpremise
				? `${components.subpremise}/${components.streetNumber} ${components.route}`
				: `${components.streetNumber} ${components.route}`;
			// Apply uppercase for these councils
			return address.trim().toUpperCase();

		default:
			// Standard format includes locality for most councils
			address = components.subpremise
				? `${components.subpremise}/${components.streetNumber} ${components.route} ${components.locality}`
				: `${components.streetNumber} ${components.route} ${components.locality}`;
			// No uppercase for default case
			return address.trim();
	}
}
