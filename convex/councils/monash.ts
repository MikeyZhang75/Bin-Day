import { DateTime } from "luxon";
import {
	extractAddressComponents,
	getSearchAddress,
} from "@/lib/addressExtractor";
import { calculateDistance } from "@/lib/distance";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../councilServices";

type MonashApiResponse = {
	Items: {
		Id: string;
		AddressSingleLine: string;
		MunicipalSubdivision: string;
		Distance: number;
		Score: number;
		LatLon: [number, number];
	}[];
};

type WasteServicesResponse = {
	success: boolean;
	responseContent: string;
};

function parseDateToUnixTimestamp(dateString: string): number | null {
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

function parseWasteCollectionDates(html: string): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
	};

	// Parse Landfill Waste date
	const landfillMatch = html.match(
		/general-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (landfillMatch) {
		dates.landfillWaste = parseDateToUnixTimestamp(landfillMatch[1].trim());
	}

	// Parse Recycling date
	const recyclingMatch = html.match(
		/recycling[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (recyclingMatch) {
		dates.recycling = parseDateToUnixTimestamp(recyclingMatch[1].trim());
	}

	// Parse Food and Garden Waste date
	const foodGardenMatch = html.match(
		/green-waste[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (foodGardenMatch) {
		dates.foodAndGardenWaste = parseDateToUnixTimestamp(
			foodGardenMatch[1].trim(),
		);
	}

	// Parse Hard Waste date
	const hardWasteMatch = html.match(
		/one-off-service[\s\S]*?<div class="next-service">\s*([\s\S]*?)\s*<\/div>/,
	);
	if (hardWasteMatch) {
		dates.hardWaste = parseDateToUnixTimestamp(hardWasteMatch[1].trim());
	}

	return dates;
}

async function searchMonashAddress(searchQuery: string) {
	const url = `https://www.monash.vic.gov.au/api/v1/myarea/search?keywords=${encodeURIComponent(searchQuery)}`;

	const response = await fetch(url, {
		method: "GET",
		headers: {
			"User-Agent":
				"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
			Accept: "text/plain, */*; q=0.01",
			"Accept-Language": "en-US,en;q=0.9",
			"Accept-Encoding": "gzip, deflate, br",
			Referer: "https://www.monash.vic.gov.au/",
			Origin: "https://www.monash.vic.gov.au",
			"X-Requested-With": "XMLHttpRequest",
			"Sec-Fetch-Dest": "empty",
			"Sec-Fetch-Mode": "cors",
			"Sec-Fetch-Site": "same-origin",
		},
	});

	if (!response.ok) {
		throw new Error(`HTTP error! status: ${response.status}`);
	}

	const data = (await response.json()) as MonashApiResponse;

	return data;
}

async function fetchWasteServices(geolocationId: string) {
	const wasteServicesUrl = `https://www.monash.vic.gov.au/ocapi/Public/myarea/wasteservices?geolocationid=${geolocationId}&ocsvclang=en-AU`;

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
			referer:
				"https://www.monash.vic.gov.au/Waste-Sustainability/Bin-Collection/When-we-collect-your-bins",
			"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
			priority: "u=1, i",
		},
	});

	const wasteServicesData =
		(await wasteServicesResponse.json()) as WasteServicesResponse;

	return wasteServicesData;
}

export async function fetchMonashData(placeDetails: GooglePlaceDetails) {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);
	// Construct search query, only including subpremise if it exists
	const searchQuery = getSearchAddress(addressComponents);

	try {
		// Search for the address
		const addressData = await searchMonashAddress(searchQuery);

		// Extract the ID from the response
		if (!addressData || addressData.Items.length === 0) {
			throw new Error("No results found for this address");
		}

		// Calculate distances for each item
		const userLat = placeDetails.geometry.location.lat;
		const userLng = placeDetails.geometry.location.lng;

		// Create a record of id:distance for each item
		const distanceRecord: Record<string, number> = {};
		const itemsWithDistances = addressData.Items.map((item) => {
			const distance = calculateDistance(
				userLat,
				userLng,
				item.LatLon[0],
				item.LatLon[1],
			);
			distanceRecord[item.Id] = distance;
			return { ...item, calculatedDistance: distance };
		});

		// Sort items by calculated distance (closest first)
		itemsWithDistances.sort(
			(a, b) => a.calculatedDistance - b.calculatedDistance,
		);

		// Get the closest item
		const closestItem = itemsWithDistances[0];

		// Fetch waste collection services data
		const wasteServicesData = await fetchWasteServices(closestItem.Id);

		// Parse waste collection dates from HTML content
		const wasteCollectionDates = parseWasteCollectionDates(
			wasteServicesData.responseContent,
		);

		return wasteCollectionDates;
	} catch (error) {
		console.error("Monash API error:", error);
		throw new Error("Failed to fetch data from Monash council");
	}
}
