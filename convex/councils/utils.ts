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
	type CouncilName,
} from "./index";

// Default headers that are common across all councils
const DEFAULT_SEARCH_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
	Accept: "text/plain, */*; q=0.01",
	"Accept-Encoding": "gzip, deflate, br, zstd",
	"sec-ch-ua-platform": '"macOS"',
	"x-requested-with": "XMLHttpRequest",
	"sec-ch-ua":
		'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
	"sec-ch-ua-mobile": "?0",
	"sec-fetch-site": "same-origin",
	"sec-fetch-mode": "cors",
	"sec-fetch-dest": "empty",
	"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
	priority: "u=1, i",
};

const DEFAULT_WASTE_HEADERS = {
	"User-Agent":
		"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
	Accept: "application/json, text/javascript, */*; q=0.01",
	"Accept-Encoding": "gzip, deflate, br, zstd",
	"sec-ch-ua-platform": '"macOS"',
	"x-requested-with": "XMLHttpRequest",
	"sec-ch-ua":
		'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
	"sec-ch-ua-mobile": "?0",
	"sec-fetch-site": "same-origin",
	"sec-fetch-mode": "cors",
	"sec-fetch-dest": "empty",
	"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
	priority: "u=1, i",
};

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
	councilName: string,
) {
	const url = `${councilApiUrl}?keywords=${encodeURIComponent(searchQuery)}`;

	const response = await fetch(url, {
		method: "GET",
		headers: DEFAULT_SEARCH_HEADERS,
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
	councilName: string,
) {
	const url = `${wasteServicesUrl}?geolocationid=${geolocationId}&ocsvclang=en-AU`;

	const wasteServicesResponse = await fetch(url, {
		method: "GET",
		headers: DEFAULT_WASTE_HEADERS,
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
	councilName: CouncilName,
	config: {
		searchApiUrl: string;
		wasteServicesUrl: string;
		wasteTypePatterns: WasteTypeRegexPatterns;
	},
) {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);
	// Construct search query, only including subpremise if it exists
	const searchQuery = getSearchAddress(addressComponents, councilName);

	try {
		// Search for the address
		const addressData = await searchCouncilAddress(
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
		const wasteServicesData = await fetchWasteServices(
			selectedItem.Id,
			config.wasteServicesUrl,
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
