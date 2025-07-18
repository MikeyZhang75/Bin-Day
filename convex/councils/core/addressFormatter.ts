// Council-specific address formatting utilities
import type { ExtractedAddressComponents } from "@/lib/addressExtractor";
import { COUNCIL_NAMES, type CouncilName } from "./types";

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
