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
	InvalidResponseError,
	logError,
	safeJsonParse,
} from "./index";

type AddressSearchItem = {
	name: string;
	caption: string;
	value: string;
}[];

type AddressSearchResponse = AddressSearchItem[];

type WasteInfoItem = {
	name: string;
	caption: string;
	value: string;
}[];

type WasteInfoResponse = WasteInfoItem[];

const API_KEY = "05dbdab3-8568-4d7e-83e0-22cc06a09f7f";
const FORM_ID = "35f43a60-983b-4c11-ac56-8b1d10e8389f";
const WASTE_INFO_FORM_ID = "1ee8052a-e624-45c6-8aee-a2bb990f6a8c";

async function searchAddress(address: string): Promise<string> {
	const response = await fetch(
		`https://maps.greaterdandenong.com/IntraMaps21B/ApplicationEngine/Integration/api/search/?ConfigId=00000000-0000-0000-0000-000000000000&fields=${encodeURIComponent(address)}&form=${FORM_ID}`,
		{
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				Accept: "application/json, text/javascript, */*; q=0.01",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"sec-ch-ua-platform": '"macOS"',
				authorization: `apikey ${API_KEY}`,
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"content-type": "application/json",
				"sec-ch-ua-mobile": "?0",
				Origin: "https://www.greaterdandenong.vic.gov.au",
				"Sec-Fetch-Site": "cross-site",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Dest": "empty",
				Referer: "https://www.greaterdandenong.vic.gov.au/find-my-bin-day",
				"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
			},
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.GREATER_DANDENONG, response.status);
	}

	const data = await safeJsonParse<AddressSearchResponse>(response);

	if (!data || data.length === 0) {
		throw new AddressNotFoundError();
	}

	// Find the mapkey from the first result
	const firstResult = data[0];
	const mapkeyItem = firstResult.find((item) => item.name === "mapkey");

	if (!mapkeyItem) {
		throw new InvalidResponseError("No mapkey found in search results");
	}

	return mapkeyItem.value;
}

async function getWasteInfo(mapkey: string): Promise<WasteInfoResponse> {
	const response = await fetch(
		`https://maps.greaterdandenong.com/IntraMaps21B/ApplicationEngine/Integration/api/search/?ConfigId=00000000-0000-0000-0000-000000000000&fields=${mapkey}&form=${WASTE_INFO_FORM_ID}`,
		{
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				Accept: "application/json, text/javascript, */*; q=0.01",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"sec-ch-ua-platform": '"macOS"',
				authorization: `apikey ${API_KEY}`,
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"content-type": "application/json",
				"sec-ch-ua-mobile": "?0",
				Origin: "https://www.greaterdandenong.vic.gov.au",
				"Sec-Fetch-Site": "cross-site",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Dest": "empty",
				Referer: "https://www.greaterdandenong.vic.gov.au/find-my-bin-day",
				"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
			},
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.GREATER_DANDENONG, response.status);
	}

	const data = await safeJsonParse<WasteInfoResponse>(response);

	if (!data || data.length === 0) {
		throw new InvalidResponseError("No waste info returned");
	}

	return data;
}

function parseDateString(dateString: string): number | null {
	// Parse date string like "WEDNESDAY, 23 Jul 2025" to Unix timestamp
	// Extract just the date part
	const dateMatch = dateString.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/);
	if (!dateMatch) return null;

	const [, dayStr, monthStr, yearStr] = dateMatch;

	const monthMap: Record<string, number> = {
		Jan: 1,
		Feb: 2,
		Mar: 3,
		Apr: 4,
		May: 5,
		Jun: 6,
		Jul: 7,
		Aug: 8,
		Sep: 9,
		Oct: 10,
		Nov: 11,
		Dec: 12,
	};

	const month = monthMap[monthStr];
	if (!month) return null;

	const day = Number.parseInt(dayStr);
	const year = Number.parseInt(yearStr);

	// Validate date values
	if (day < 1 || day > 31 || year < 2020 || year > 2100) return null;

	const melbourneDate = DateTime.fromObject(
		{
			year: year,
			month: month,
			day: day,
			hour: 0,
			minute: 0,
			second: 0,
		},
		{ zone: "Australia/Melbourne" },
	);

	return Math.floor(melbourneDate.toSeconds());
}

function getNextCollectionDate(collectionDay: string): number | null {
	// Extract the day name from strings like "WEDNESDAY"
	const dayName = collectionDay.trim();

	const dayMap: Record<string, number> = {
		MONDAY: 1,
		TUESDAY: 2,
		WEDNESDAY: 3,
		THURSDAY: 4,
		FRIDAY: 5,
		SATURDAY: 6,
		SUNDAY: 7,
	};

	const targetDay = dayMap[dayName.toUpperCase()];
	if (!targetDay) return null;

	// Get current date in Melbourne timezone
	const now = DateTime.now().setZone("Australia/Melbourne");
	const currentDay = now.weekday;

	// Calculate days until next collection (inclusive - if today is collection day, show today)
	let daysUntilCollection: number;
	if (currentDay <= targetDay) {
		daysUntilCollection = targetDay - currentDay;
	} else {
		daysUntilCollection = 7 - currentDay + targetDay;
	}

	// Get the next collection date at midnight
	const nextCollection = now.plus({ days: daysUntilCollection }).startOf("day");

	return Math.floor(nextCollection.toSeconds());
}

function parseWasteInfoResponse(data: WasteInfoResponse): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	if (!data || data.length === 0) {
		return dates;
	}

	// The response contains a single array with all fields
	const fields = data[0];
	if (!fields) {
		return dates;
	}

	for (const field of fields) {
		const caption = field.caption;
		const value = field.value;

		switch (caption) {
			case "waste day":
				// This contains the general waste collection day (e.g., "WEDNESDAY")
				dates.landfillWaste = getNextCollectionDate(value);
				break;
			case "garden day":
				// Parse "WEDNESDAY, 23 Jul 2025"
				dates.foodAndGardenWaste = parseDateString(value);
				break;
			case "recycle day":
				// Parse "WEDNESDAY, 30 Jul 2025"
				dates.recycling = parseDateString(value);
				break;
			// Note: No glass or hard waste info in the response example
		}
	}

	return dates;
}

export async function fetchDandenongData(placeDetails: GooglePlaceDetails) {
	const addressComponents = extractAddressComponents(placeDetails);
	const searchQuery = getSearchAddress(
		addressComponents,
		COUNCIL_NAMES.GREATER_DANDENONG,
	);

	try {
		// Step 1: Search for address to get mapkey
		const mapkey = await searchAddress(searchQuery);

		// Step 2: Get waste collection info using mapkey
		const wasteInfo = await getWasteInfo(mapkey);

		// Parse and return the waste collection dates
		return parseWasteInfoResponse(wasteInfo);
	} catch (error) {
		logError(COUNCIL_NAMES.GREATER_DANDENONG, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof AddressNotFoundError ||
			error instanceof InvalidResponseError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.GREATER_DANDENONG);
	}
}
