import { DateTime } from "luxon";
import { extractAddressComponents } from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../../councilServices";
import {
	AddressNotFoundError,
	COUNCIL_NAMES,
	CouncilAPIError,
	InvalidResponseError,
	logError,
	safeJsonParse,
} from "../core";
import { getSearchAddress } from "../core/addressFormatter";

type SessionResponse = {
	id: string;
	name: string;
	modules: string[];
	moduleList: {
		id: string;
		name: string;
	}[];
	authorisation: {
		username: string;
		authenticationProvider: string;
		displayName: string;
	};
};

type FormResponse = {
	name: string;
	forms: {
		name: string;
		templateId: string;
		type: string;
		subType: string;
	}[];
};

type AddressSearchResponse = {
	header: {
		warning: string;
		authUser: string;
		sessionId: string;
	};
	fullText: {
		selectionLayer: string;
		mapKey: string;
		dbKey: string;
		displayValue: string;
	}[];
	origin: string;
};

type WasteInfoResponse = {
	header: {
		warning: string | null;
		authUser: string;
		sessionId: string;
	};
	fullText: string | null;
	extent: {
		unit: string;
		bounds: {
			x1: number;
			y1: number;
			x2: number;
			y2: number;
		};
		epsg: string;
	};
	origin: string;
	selectionLayers: {
		name: string;
		alias: string;
		current: boolean;
	}[];
	infoPanels: {
		info1: {
			count: number;
			index: number;
			mapkey: string;
			layerAlias: string;
			caption: string;
			feature: {
				mapkey: string;
				fields: {
					value: {
						binding: boolean;
						column: string;
						defaultValue: string;
						value: string;
					};
					inlineLinks?: boolean;
					caption: string;
					type: string;
					id: string;
					name: string;
				}[];
				x: number;
				y: number;
				epsg: string;
			};
		};
		info2: {
			count: number;
			index: number;
			dbkey: string;
			caption: string;
			feature: unknown | null;
			fields: {
				value: {
					binding: boolean;
					column: string;
					defaultValue: string;
					value: string;
				};
				inlineLinks: boolean;
				caption: string;
				type: string;
				id: string;
				name: string;
			}[];
		};
		info3: unknown | null;
		databaseConstraints: unknown | null;
	};
};

async function getSession(): Promise<{
	sessionId: string;
	wasteModuleId: string;
}> {
	const response = await fetch(
		"https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/Projects/?configId=7a287c70-ea2d-4abd-943c-8bf55cf09fe5&appType=MapBuilder&project=1c8f869f-fa4a-4c39-b7bb-94641ee61597&datasetCode=",
		{
			method: "POST",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"sec-ch-ua-platform": '"macOS"',
				"x-requested-with": "XMLHttpRequest",
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"content-type": "application/json",
				"sec-ch-ua-mobile": "?0",
				origin: "https://gis.bayside.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				referer:
					"https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/frontend/mapbuilder/?liteConfigId=fbae1445-1186-4c12-8202-8dc02948e640&configId=7a287c70-ea2d-4abd-943c-8bf55cf09fe5",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.BAYSIDE_CITY, response.status);
	}

	const sessionId = response.headers.get("x-intramaps-session");
	if (!sessionId) {
		throw new InvalidResponseError("No session ID returned");
	}

	const data = await safeJsonParse<SessionResponse>(response);

	// Find the Waste module
	const wasteModule = data.moduleList.find((module) => module.name === "Waste");
	if (!wasteModule) {
		throw new InvalidResponseError("Waste module not found");
	}

	return { sessionId, wasteModuleId: wasteModule.id };
}

async function getFormTemplateId(
	sessionId: string,
	wasteModuleId: string,
): Promise<string> {
	const response = await fetch(
		`https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/Modules/?IntraMapsSession=${sessionId}`,
		{
			method: "POST",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"Content-Type": "application/json",
				"sec-ch-ua-platform": '"macOS"',
				"x-requested-with": "XMLHttpRequest",
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"sec-ch-ua-mobile": "?0",
				origin: "https://gis.bayside.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				referer:
					"https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/frontend/mapbuilder/?liteConfigId=fbae1445-1186-4c12-8202-8dc02948e640&configId=7a287c70-ea2d-4abd-943c-8bf55cf09fe5",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				module: wasteModuleId,
				includeWktInSelection: true,
				includeBasemaps: false,
			}),
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.BAYSIDE_CITY, response.status);
	}

	const data = await safeJsonParse<FormResponse>(response);

	// Find the address search form
	const addressForm = data.forms.find(
		(form) => form.name === "MapBuilder Address Search",
	);

	if (!addressForm) {
		throw new InvalidResponseError("Address form not found");
	}

	return addressForm.templateId;
}

async function searchAddress(
	sessionId: string,
	formTemplateId: string,
	address: string,
): Promise<{
	selectionLayer: string;
	mapKey: string;
	dbKey: string;
}> {
	const response = await fetch(
		`https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/Search/?infoPanelWidth=0&mode=Refresh&form=${formTemplateId}&resubmit=false&IntraMapsSession=${sessionId}`,
		{
			method: "POST",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"Content-Type": "application/json",
				"sec-ch-ua-platform": '"macOS"',
				"x-requested-with": "XMLHttpRequest",
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"sec-ch-ua-mobile": "?0",
				origin: "https://gis.bayside.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				referer:
					"https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/frontend/mapbuilder/?liteConfigId=fbae1445-1186-4c12-8202-8dc02948e640&configId=7a287c70-ea2d-4abd-943c-8bf55cf09fe5",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				fields: [address],
			}),
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.BAYSIDE_CITY, response.status);
	}

	const data = await safeJsonParse<AddressSearchResponse>(response);

	if (!data.fullText || data.fullText.length === 0) {
		throw new AddressNotFoundError();
	}

	const firstResult = data.fullText[0];
	if (!firstResult) {
		throw new InvalidResponseError(
			"Invalid response: no address data in results",
		);
	}

	return {
		selectionLayer: firstResult.selectionLayer,
		mapKey: firstResult.mapKey,
		dbKey: firstResult.dbKey,
	};
}

async function getWasteInfo(
	sessionId: string,
	selectionLayer: string,
	mapKey: string,
	dbKey: string,
): Promise<WasteInfoResponse> {
	const response = await fetch(
		`https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/Search/Refine/Set?IntraMapsSession=${sessionId}`,
		{
			method: "POST",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				"Accept-Encoding": "gzip, deflate, br, zstd",
				"Content-Type": "application/json",
				"sec-ch-ua-platform": '"macOS"',
				"x-requested-with": "XMLHttpRequest",
				"sec-ch-ua":
					'"Not)A;Brand";v="8", "Chromium";v="138", "Google Chrome";v="138"',
				"sec-ch-ua-mobile": "?0",
				origin: "https://gis.bayside.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				referer:
					"https://gis.bayside.vic.gov.au/IntraMaps910/ApplicationEngine/frontend/mapbuilder/?liteConfigId=fbae1445-1186-4c12-8202-8dc02948e640&configId=7a287c70-ea2d-4abd-943c-8bf55cf09fe5",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				selectionLayer,
				mapKey,
				infoPanelWidth: 0,
				mode: "Refresh",
				dbKey,
				zoomType: "current",
			}),
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.BAYSIDE_CITY, response.status);
	}

	const data = await safeJsonParse<WasteInfoResponse>(response);

	return data;
}

function getNextCollectionDate(
	collectionDay: string,
	isWeekly = false,
): number | null {
	// Extract the day name from strings like "Thursday; Area 1 - General" or "Weekly on Thursdays"
	let dayName: string | null = null;

	if (isWeekly) {
		const weeklyMatch = collectionDay.match(/Weekly on (\w+)s?/i);
		if (weeklyMatch) {
			dayName = weeklyMatch[1].replace(/s$/, ""); // Remove trailing 's' from "Thursdays"
		}
	} else {
		const dayMatch = collectionDay.match(/^(\w+)/);
		if (dayMatch) {
			dayName = dayMatch[1];
		}
	}

	if (!dayName) return null;

	const dayMap: Record<string, number> = {
		Monday: 1,
		Tuesday: 2,
		Wednesday: 3,
		Thursday: 4,
		Friday: 5,
		Saturday: 6,
		Sunday: 7,
	};

	const targetDay = dayMap[dayName];
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

function parseDateString(dateString: string): number | null {
	// Parse date string like "17 Jul 2025" or "24 Jul 2025" to Unix timestamp
	// Also handle variations like "17 July 2025" or "17/07/2025"

	// Try format: "17 Jul 2025" or "17 July 2025"
	const monthNameMatch = dateString.match(/(\d{1,2})\s+(\w{3,})\s+(\d{4})/);
	if (monthNameMatch) {
		const [, dayStr, monthStr, yearStr] = monthNameMatch;

		const monthMap: Record<string, number> = {
			// 3-letter abbreviations
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
			// Full month names
			January: 1,
			February: 2,
			March: 3,
			April: 4,
			June: 6,
			July: 7,
			August: 8,
			September: 9,
			October: 10,
			November: 11,
			December: 12,
		};

		const month = monthMap[monthStr] || monthMap[monthStr.substring(0, 3)];
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

	// Try format: "17/07/2025" or "17-07-2025"
	const numericMatch = dateString.match(/(\d{1,2})[/-](\d{1,2})[/-](\d{4})/);
	if (numericMatch) {
		const [, dayStr, monthStr, yearStr] = numericMatch;
		const day = Number.parseInt(dayStr);
		const month = Number.parseInt(monthStr);
		const year = Number.parseInt(yearStr);

		// Validate date values
		if (
			day < 1 ||
			day > 31 ||
			month < 1 ||
			month > 12 ||
			year < 2020 ||
			year > 2100
		)
			return null;

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

	return null;
}

function parseWasteInfoResponse(data: WasteInfoResponse): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	if (!data.infoPanels?.info1?.feature?.fields) {
		return dates;
	}

	const fields = data.infoPanels.info1.feature.fields;

	for (const field of fields) {
		// Skip fields without proper structure
		if (!field.caption || !field.value?.value) {
			continue;
		}

		const caption = field.caption;
		const value = field.value.value;

		switch (caption) {
			case "Bin Collection Day":
				// This contains the general collection day info
				break;
			case "Recycling": {
				// Parse "Fortnightly on Thursday, Next: 24 Jul 2025"
				const recyclingMatch = value.match(/Next:\s*(.+)$/);
				if (recyclingMatch) {
					dates.recycling = parseDateString(recyclingMatch[1]);
				}
				break;
			}
			case "Food & Green Waste":
				// Parse "Weekly on Thursdays"
				dates.foodAndGardenWaste = getNextCollectionDate(value, true);
				break;
			case "Domestic Waste": {
				// Parse "Fortnightly on Thursday, Next: 17 Jul 2025"
				const domesticMatch = value.match(/Next:\s*(.+)$/);
				if (domesticMatch) {
					dates.landfillWaste = parseDateString(domesticMatch[1]);
				}
				break;
			}
		}
	}

	return dates;
}

export async function fetchBaysideData(placeDetails: GooglePlaceDetails) {
	const addressComponents = extractAddressComponents(placeDetails);
	const searchQuery = getSearchAddress(
		addressComponents,
		COUNCIL_NAMES.BAYSIDE_CITY,
	);

	try {
		// Step 1: Get session and waste module ID
		const { sessionId, wasteModuleId } = await getSession();

		// Step 2: Get form template ID
		const formTemplateId = await getFormTemplateId(sessionId, wasteModuleId);

		// Step 3: Search for address
		const { selectionLayer, mapKey, dbKey } = await searchAddress(
			sessionId,
			formTemplateId,
			searchQuery,
		);

		// Step 4: Get waste collection info
		const wasteInfo = await getWasteInfo(
			sessionId,
			selectionLayer,
			mapKey,
			dbKey,
		);

		// Parse and return the waste collection dates
		return parseWasteInfoResponse(wasteInfo);
	} catch (error) {
		logError(COUNCIL_NAMES.BAYSIDE_CITY, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof AddressNotFoundError ||
			error instanceof InvalidResponseError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.BAYSIDE_CITY);
	}
}
