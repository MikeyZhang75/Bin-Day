// WhatBinDay API integration

import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../../../councilServices";
import {
	AddressNotFoundError,
	CouncilAPIError,
	type CouncilName,
} from "../../core";
import {
	isWhatBinDayCouncil,
	WHATBINDAY_API_KEYS,
	WHATBINDAY_API_URL,
	WHATBINDAY_HEADERS,
} from "./constants";
import { formatAddressForAPI } from "./formatter";
import { parseHtmlResponse } from "./parser";

export async function processWhatBinDayCouncilData(
	placeDetails: GooglePlaceDetails,
	councilName: CouncilName,
): Promise<WasteCollectionDates> {
	// Verify this council uses WhatBinDay
	if (!isWhatBinDayCouncil(councilName)) {
		throw new Error(`${councilName} is not configured to use WhatBinDay API`);
	}

	// Now TypeScript knows councilName is a valid key for WHATBINDAY_API_KEYS
	const apiKey = WHATBINDAY_API_KEYS[councilName];
	if (!apiKey) {
		throw new Error(`No API key configured for council: ${councilName}`);
	}

	try {
		// Format the address for the API
		const addressJson = formatAddressForAPI(placeDetails);

		// Prepare form data with defaults
		const formData = new URLSearchParams({
			apiKey,
			address: addressJson,
			agendaResultLimit: "3",
			dateFormat: "EEEE dd MMM yyyy",
			generalBinImage: "",
			recycleBinImage: "",
			greenBinImage: "",
			glassBinImage: "",
			paperBinImage: "",
			displayFormat: "calendar",
			calendarStart: "",
			calendarFutureMonths: "2",
			calendarPrintBannerImgUrl: "",
			calendarPrintAdditionalCss: "",
			regionDisplay: "false",
			notes: "",
		});

		const response = await fetch(WHATBINDAY_API_URL, {
			method: "POST",
			headers: {
				...WHATBINDAY_HEADERS,
				Referer: `https://console.whatbinday.com/search/iframe/${apiKey}`,
			},
			body: formData.toString(),
		});

		if (!response.ok) {
			throw new CouncilAPIError(councilName, response.status);
		}

		const html = await response.text();

		// Check if we got a valid response
		if (!html.includes("WBD-bin-calendar")) {
			if (html.includes("No results found")) {
				throw new AddressNotFoundError();
			}
			throw new CouncilAPIError(councilName);
		}

		// Parse HTML response and return waste collection dates
		return parseHtmlResponse(html);
	} catch (error) {
		if (
			error instanceof AddressNotFoundError ||
			error instanceof CouncilAPIError
		) {
			throw error;
		}

		console.error(`Error fetching ${councilName} waste data:`, error);
		throw new CouncilAPIError(councilName);
	}
}
