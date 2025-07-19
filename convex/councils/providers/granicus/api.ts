// Granicus API implementation

import { extractAddressComponents } from "@/lib/addressExtractor";
import { calculateDistance } from "@/lib/distance";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../../../councilServices";
import { getSearchAddress } from "../../core/addressFormatter";
import {
	AddressNotFoundError,
	CouncilAPIError,
	logError,
	safeJsonParse,
} from "../../core/errors";
import type { CouncilName } from "../../core/types";
import { GRANICUS_SEARCH_HEADERS, GRANICUS_WASTE_HEADERS } from "./constants";
import { parseGranicusWasteCollectionDates } from "./parser";
import type {
	GranicusApiResponse,
	GranicusConfig,
	GranicusWasteServicesResponse,
} from "./types";

export async function searchGranicusAddress(
	searchQuery: string,
	councilApiUrl: string,
	councilName: string,
) {
	const url = `${councilApiUrl}?keywords=${encodeURIComponent(searchQuery)}`;

	const response = await fetch(url, {
		method: "GET",
		headers: GRANICUS_SEARCH_HEADERS,
	});

	if (!response.ok) {
		throw new CouncilAPIError(councilName, response.status);
	}

	const data = await safeJsonParse<GranicusApiResponse>(response);

	return data;
}

export async function fetchGranicusWasteServices(
	geolocationId: string,
	wasteServicesUrl: string,
	councilName: string,
) {
	const url = `${wasteServicesUrl}?geolocationid=${geolocationId}&ocsvclang=en-AU`;

	const wasteServicesResponse = await fetch(url, {
		method: "GET",
		headers: GRANICUS_WASTE_HEADERS,
	});

	if (!wasteServicesResponse.ok) {
		throw new CouncilAPIError(councilName, wasteServicesResponse.status);
	}

	const wasteServicesData = await safeJsonParse<GranicusWasteServicesResponse>(
		wasteServicesResponse,
	);

	return wasteServicesData;
}

export async function processGranicusCouncilData(
	placeDetails: GooglePlaceDetails,
	councilName: CouncilName,
	config: GranicusConfig,
): Promise<WasteCollectionDates> {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);
	// Construct search query, only including subpremise if it exists
	const searchQuery = getSearchAddress(addressComponents, councilName);

	try {
		// Search for the address
		const addressData = await searchGranicusAddress(
			searchQuery,
			config.searchApiUrl,
			councilName,
		);

		// Extract the ID from the response
		if (!addressData || addressData.Items.length === 0) {
			throw new AddressNotFoundError();
		}

		let selectedItem = addressData.Items[0];

		// Auto-detect if we should use distance calculation based on LatLon availability
		if (addressData.Items[0].LatLon) {
			// Calculate distances for each item
			const userLat = placeDetails.geometry.location.lat;
			const userLng = placeDetails.geometry.location.lng;

			// Create a record of id:distance for each item
			const itemsWithDistances = addressData.Items.filter(
				(item): item is typeof item & { LatLon: [number, number] } =>
					item.LatLon !== null,
			).map((item) => {
				const distance = calculateDistance(
					userLat,
					userLng,
					item.LatLon[0],
					item.LatLon[1],
				);
				return { ...item, calculatedDistance: distance };
			});

			// Sort items by calculated distance (closest first)
			if (itemsWithDistances.length > 0) {
				itemsWithDistances.sort(
					(a, b) => a.calculatedDistance - b.calculatedDistance,
				);
				selectedItem = itemsWithDistances[0];
			}
		}

		// Fetch waste collection services data
		const wasteServicesData = await fetchGranicusWasteServices(
			selectedItem.Id,
			config.wasteServicesUrl,
			councilName,
		);

		// Parse waste collection dates from HTML content
		const wasteCollectionDates = parseGranicusWasteCollectionDates(
			wasteServicesData.responseContent,
			config.wasteTypePatterns,
		);

		return wasteCollectionDates;
	} catch (error) {
		logError(councilName, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof AddressNotFoundError
		) {
			throw error;
		}
		throw new CouncilAPIError(councilName);
	}
}
