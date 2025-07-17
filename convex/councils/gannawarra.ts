import { DateTime } from "luxon";
import {
	extractAddressComponents,
	getSearchAddress,
} from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../councilServices";
import {
	AddressNotFoundError,
	COUNCIL_NAMES,
	CouncilAPIError,
	logError,
	safeJsonParse,
} from "./index";

type GannawarraApiResponse = {
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

type WasteServicesResponse = {
	success: boolean;
	responseContent: string;
};

function parseDateToUnixTimestamp(dateString: string): number | null {
	// Parse date string like "Wed 23/7/2025" to Unix timestamp
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

function parseWasteCollectionDates(html: string): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	// Parse General Waste (Landfill Waste) date
	// Gannawarra uses "general-waste" class and "General Waste" as the title
	const generalWasteMatch = html.match(
		/general-waste[\s\S]*?<h3>General Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (generalWasteMatch) {
		dates.landfillWaste = parseDateToUnixTimestamp(generalWasteMatch[1].trim());
	}

	// Parse Recycling date
	const recyclingMatch = html.match(
		/recycling[\s\S]*?<h3>Recycling<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (recyclingMatch) {
		dates.recycling = parseDateToUnixTimestamp(recyclingMatch[1].trim());
	}

	// Parse Green Waste (Food and Garden Waste) date
	// Gannawarra uses "green-waste" class and "Green Waste" as the title
	const greenWasteMatch = html.match(
		/green-waste[\s\S]*?<h3>Green Waste<\/h3>[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (greenWasteMatch) {
		dates.foodAndGardenWaste = parseDateToUnixTimestamp(
			greenWasteMatch[1].trim(),
		);
	}

	// Gannawarra doesn't typically show hard waste in regular schedule
	// It's usually booked separately

	return dates;
}

async function searchGannawarraAddress(searchQuery: string) {
	const url = `https://www.gannawarra.vic.gov.au/api/v1/myarea/search?keywords=${encodeURIComponent(searchQuery)}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
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
			referer: "https://www.gannawarra.vic.gov.au/My-Neighbourhood",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
			priority: "u=1, i",
		},
	});

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.GANNAWARRA_SHIRE, response.status);
	}

	const data = await safeJsonParse<GannawarraApiResponse>(response);

	return data;
}

async function fetchWasteServices(geolocationId: string) {
	const wasteServicesUrl = `https://www.gannawarra.vic.gov.au/ocapi/Public/myarea/wasteservices?geolocationid=${geolocationId}&ocsvclang=en-AU`;

	const wasteServicesResponse = await fetch(wasteServicesUrl, {
		method: "GET",
		headers: {
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
			referer: "https://www.gannawarra.vic.gov.au/My-Neighbourhood",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
			priority: "u=1, i",
		},
	});

	if (!wasteServicesResponse.ok) {
		throw new CouncilAPIError(
			COUNCIL_NAMES.GANNAWARRA_SHIRE,
			wasteServicesResponse.status,
		);
	}

	const wasteServicesData = await safeJsonParse<WasteServicesResponse>(
		wasteServicesResponse,
	);

	return wasteServicesData;
}

export async function fetchGannawarraData(placeDetails: GooglePlaceDetails) {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);
	// Construct search query, only including subpremise if it exists
	const searchQuery = getSearchAddress(addressComponents);

	try {
		// Search for the address
		const addressData = await searchGannawarraAddress(searchQuery);

		// Extract the ID from the response
		if (!addressData || addressData.Items.length === 0) {
			throw new AddressNotFoundError();
		}

		// Note: Gannawarra API returns null for LatLon in some cases
		// We need to handle this differently than other councils

		// Since LatLon might be null, we can't calculate distances
		// Just use the first result (which has the highest score)
		const selectedItem = addressData.Items[0];

		// If we have location data from Google Places and the council API has lat/lon,
		// we could calculate distances, but since Gannawarra often returns null,
		// we'll just use the first result which should be the best match based on score

		// Fetch waste collection services data
		const wasteServicesData = await fetchWasteServices(selectedItem.Id);

		// Parse waste collection dates from HTML content
		const wasteCollectionDates = parseWasteCollectionDates(
			wasteServicesData.responseContent,
		);

		return wasteCollectionDates;
	} catch (error) {
		logError(COUNCIL_NAMES.GANNAWARRA_SHIRE, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof AddressNotFoundError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.GANNAWARRA_SHIRE);
	}
}
