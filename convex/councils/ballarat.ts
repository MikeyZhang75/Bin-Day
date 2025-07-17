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

type BallaratApiResponse = {
	nhits: number;
	parameters: {
		dataset: string[];
		q: string;
		rows: number;
		sort: string[];
		timezone: string;
		lang: string;
	};
	records: {
		datasetid: string;
		recordid: string;
		fields: {
			propnum: string;
			address: string;
			suburb: string;
			collectionday: string;
			collection_day: string;
			street: string;
			service_type: string;
			zone: number;
			nextwaste: string;
			nextrecycle: string;
			nextgreen: string;
		};
		geometry?: {
			type: string;
			coordinates: [number, number];
		};
		record_timestamp: string;
	}[];
};

function parseBallaratDate(dateString: string): number | null {
	// Parse date string like "2025-07-28" to Unix timestamp
	const parsedDate = DateTime.fromISO(dateString, {
		zone: "Australia/Melbourne",
	});

	if (!parsedDate.isValid) return null;

	// Return Unix timestamp in seconds
	return Math.floor(parsedDate.toSeconds());
}

function parseBallaratWasteData(
	record: BallaratApiResponse["records"][0],
): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	// Parse waste collection dates
	if (record.fields.nextwaste) {
		dates.landfillWaste = parseBallaratDate(record.fields.nextwaste);
	}

	if (record.fields.nextrecycle) {
		dates.recycling = parseBallaratDate(record.fields.nextrecycle);
	}

	if (record.fields.nextgreen) {
		dates.foodAndGardenWaste = parseBallaratDate(record.fields.nextgreen);
	}

	// Ballarat doesn't provide hard waste in the regular collection schedule
	// It's typically booked separately

	return dates;
}

export async function fetchBallaratData(
	placeDetails: GooglePlaceDetails,
): Promise<WasteCollectionDates> {
	// Extract address components using the utility function
	const addressComponents = extractAddressComponents(placeDetails);

	// Construct the full address string for Ballarat API search
	// Format: "3/9A Clarke Street, Miners Rest VIC 3352"
	const fullAddress = getSearchAddress(addressComponents);

	// Construct the URL with query parameters
	const params = new URLSearchParams({
		sort: "propnum",
		q: fullAddress,
		rows: "100",
		dataset: "waste-collection-days",
		timezone: "Australia/Melbourne",
		lang: "en",
	});

	const url = `https://data.ballarat.vic.gov.au/api/records/1.0/search/?${params.toString()}`;

	try {
		const response = await fetch(url, {
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				Accept: "application/json, text/plain, */*",
				"Accept-Encoding": "gzip, deflate, br, zstd",
			},
		});

		if (!response.ok) {
			throw new CouncilAPIError(
				COUNCIL_NAMES.CITY_OF_BALLARAT,
				response.status,
			);
		}

		const data = await safeJsonParse<BallaratApiResponse>(response);

		// Check if we have any records
		if (!data.records || data.records.length === 0) {
			throw new AddressNotFoundError();
		}

		// Parse the first record (should be the most relevant match)
		const wasteCollectionDates = parseBallaratWasteData(data.records[0]);
		return wasteCollectionDates;
	} catch (error) {
		logError(COUNCIL_NAMES.CITY_OF_BALLARAT, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof AddressNotFoundError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.CITY_OF_BALLARAT);
	}
}
