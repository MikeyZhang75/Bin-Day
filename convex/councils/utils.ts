import { DateTime } from "luxon";
import {
	extractAddressComponents,
	getSearchAddress,
} from "@/lib/addressExtractor";
import { calculateDistance } from "@/lib/distance";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../councilServices";
import {
	AddressNotFoundError,
	CouncilAPIError,
	logError,
	safeJsonParse,
} from "./index";

// Common type for API responses from councils using the same backend system
export type CouncilApiResponse = {
	Items: {
		Id: string;
		AddressSingleLine: string;
		MunicipalSubdivision: string;
		Distance: number;
		Score: number;
		LatLon: [number, number] | null;
	}[];
	Offset: number;
	Limit: number;
	Total: number;
};

export type WasteServicesResponse = {
	success: boolean;
	responseContent: string;
};

// Regex patterns for waste collection types
export type WasteTypeRegexPatterns = {
	landfillWaste?: RegExp;
	recycling?: RegExp;
	foodAndGardenWaste?: RegExp;
	hardWaste?: RegExp;
	glass?: RegExp;
};

export function parseDateToUnixTimestamp(dateString: string): number | null {
	// Parse date string like "Fri 25/7/2025" to Unix timestamp
	const match = dateString.match(/\w+\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
	if (!match) return null;

	const [, day, month, year] = match;

	// Use Luxon to create a date at midnight in Melbourne timezone
	// Luxon automatically handles DST transitions
	const melbourneDate = DateTime.fromObject(
		{
			year: Number.parseInt(year),
			month: Number.parseInt(month),
			day: Number.parseInt(day),
			hour: 0,
			minute: 0,
			second: 0,
		},
		{ zone: "Australia/Melbourne" },
	);

	// Return Unix timestamp in seconds
	return Math.floor(melbourneDate.toSeconds());
}

export function parseWasteCollectionDates(
	html: string,
	patterns: WasteTypeRegexPatterns,
): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	// Parse each waste type using provided patterns
	if (patterns.landfillWaste) {
		const match = html.match(patterns.landfillWaste);
		if (match) {
			dates.landfillWaste = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.recycling) {
		const match = html.match(patterns.recycling);
		if (match) {
			dates.recycling = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.foodAndGardenWaste) {
		const match = html.match(patterns.foodAndGardenWaste);
		if (match) {
			dates.foodAndGardenWaste = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.hardWaste) {
		const match = html.match(patterns.hardWaste);
		if (match) {
			dates.hardWaste = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.glass) {
		const match = html.match(patterns.glass);
		if (match) {
			dates.glass = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	return dates;
}

export async function searchCouncilAddress(
	searchQuery: string,
	councilApiUrl: string,
	headers: HeadersInit,
	councilName: string,
) {
	const url = `${councilApiUrl}?keywords=${encodeURIComponent(searchQuery)}`;

	const response = await fetch(url, {
		method: "GET",
		headers,
	});

	if (!response.ok) {
		throw new CouncilAPIError(councilName, response.status);
	}

	const data = await safeJsonParse<CouncilApiResponse>(response);

	return data;
}

export async function fetchWasteServices(
	geolocationId: string,
	wasteServicesUrl: string,
	headers: HeadersInit,
	councilName: string,
) {
	const url = `${wasteServicesUrl}?geolocationid=${geolocationId}&ocsvclang=en-AU`;

	const wasteServicesResponse = await fetch(url, {
		method: "GET",
		headers,
	});

	if (!wasteServicesResponse.ok) {
		throw new CouncilAPIError(councilName, wasteServicesResponse.status);
	}

	const wasteServicesData = await safeJsonParse<WasteServicesResponse>(
		wasteServicesResponse,
	);

	return wasteServicesData;
}

export async function processCouncilData(
	placeDetails: GooglePlaceDetails,
	councilName: string,
	config: {
		searchApiUrl: string;
		wasteServicesUrl: string;
		searchHeaders: HeadersInit;
		wasteHeaders: HeadersInit;
		wasteTypePatterns: WasteTypeRegexPatterns;
	},
) {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);
	// Construct search query, only including subpremise if it exists
	const searchQuery = getSearchAddress(addressComponents);

	try {
		// Search for the address
		const addressData = await searchCouncilAddress(
			searchQuery,
			config.searchApiUrl,
			config.searchHeaders,
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
		const wasteServicesData = await fetchWasteServices(
			selectedItem.Id,
			config.wasteServicesUrl,
			config.wasteHeaders,
			councilName,
		);

		// Parse waste collection dates from HTML content
		const wasteCollectionDates = parseWasteCollectionDates(
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
