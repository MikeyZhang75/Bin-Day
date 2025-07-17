import { DateTime } from "luxon";
import {
	extractAddressComponents,
	getSearchAddress,
} from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../councilServices";
import {
	COUNCIL_NAMES,
	CouncilAPIError,
	InvalidResponseError,
	logError,
	safeJsonParse,
} from "./index";

type AlpineShireApiResponse = {
	command: string;
	data?: string;
	settings?: unknown;
	method?: string;
	selector?: string;
}[];

function parseAlpineShireDate(dateText: string): number | null {
	// Extract date from text like "Your next waste collection is in 12 days on Tuesday 29th July 2025."
	const dateMatch = dateText.match(
		/on\s+\w+\s+(\d{1,2})\w{0,2}\s+(\w+)\s+(\d{4})/,
	);
	if (!dateMatch) return null;

	const [, day, month, year] = dateMatch;

	// Parse the date using Luxon (handles month names)
	const parsedDate = DateTime.fromFormat(
		`${day} ${month} ${year}`,
		"d MMMM yyyy",
		{ zone: "Australia/Melbourne" },
	);

	if (!parsedDate.isValid) return null;

	// Return Unix timestamp in seconds
	return Math.floor(parsedDate.toSeconds());
}

function parseAlpineShireWasteData(html: string): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	// Parse Waste Collection date
	const wasteMatch = html.match(
		/views-field-waste-day[\s\S]*?<p class="field-content">([\s\S]*?)<\/p>/,
	);
	if (wasteMatch) {
		dates.landfillWaste = parseAlpineShireDate(wasteMatch[1]);
	}

	// Parse Recycling date
	const recyclingMatch = html.match(
		/views-field-recycling-day[\s\S]*?<p class="field-content">([\s\S]*?)<\/p>/,
	);
	if (recyclingMatch) {
		dates.recycling = parseAlpineShireDate(recyclingMatch[1]);
	}

	// Parse FOGO (Food Organics Garden Organics) date
	const fogoMatch = html.match(
		/views-field-fogo-day[\s\S]*?<p class="field-content">([\s\S]*?)<\/p>/,
	);
	if (fogoMatch) {
		dates.foodAndGardenWaste = parseAlpineShireDate(fogoMatch[1]);
	}

	// Alpine Shire doesn't seem to have hard waste in the regular schedule
	// It's typically booked separately

	return dates;
}

export async function fetchAlpineShireData(
	placeDetails: GooglePlaceDetails,
): Promise<WasteCollectionDates> {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);

	// Construct the address string for Alpine Shire API
	// Format: "1/27 Toorak Road Bright" (subpremise/streetNumber route locality)
	const addressString = getSearchAddress(addressComponents);

	// Construct the URL with the address parameter
	const url = `https://www.alpineshire.vic.gov.au/views/ajax?address=${encodeURIComponent(
		addressString,
	)}&view_name=address_lookup&view_display_id=block_1&view_base_path=address-lookup`;

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				Accept: "application/json, text/javascript, */*; q=0.01",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"sec-ch-ua-platform": '"macOS"',
				"X-Requested-With": "XMLHttpRequest",
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"sec-ch-ua-mobile": "?0",
				"Sec-Fetch-Site": "same-origin",
				"Sec-Fetch-Mode": "cors",
				"Sec-Fetch-Dest": "empty",
				Referer:
					"https://www.alpineshire.vic.gov.au/residents-ratepayers/waste-recycling",
				"Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
			},
		});

		if (!response.ok) {
			throw new CouncilAPIError(COUNCIL_NAMES.ALPINE_SHIRE, response.status);
		}

		const data = await safeJsonParse<AlpineShireApiResponse>(response);

		// Find the insert command that contains the HTML with collection dates
		const insertCommand = data.find(
			(item) =>
				item.command === "insert" &&
				item.data &&
				item.data.includes("view-content"),
		);

		if (!insertCommand || !insertCommand.data) {
			throw new InvalidResponseError("No collection data found in response");
		}

		// Parse the HTML content to extract dates
		const wasteCollectionDates = parseAlpineShireWasteData(insertCommand.data);
		return wasteCollectionDates;
	} catch (error) {
		logError(COUNCIL_NAMES.ALPINE_SHIRE, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof InvalidResponseError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.ALPINE_SHIRE);
	}
}
