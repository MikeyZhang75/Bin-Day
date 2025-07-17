import { DateTime } from "luxon";
import {
	extractAddressComponents,
	getSearchAddress,
} from "@/lib/addressExtractor";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../councilServices";
import { COUNCIL_NAMES } from "../councils";

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
					source?: {
						binding: boolean;
						column: string;
						defaultValue: string;
						value: string;
					};
					tooltip?: {
						binding: boolean;
						column: string;
						defaultValue: string;
						value: string;
					};
					enableLink?: boolean;
					linkUrl?: {
						binding: boolean;
						column: string;
						defaultValue: string;
						value: string;
					};
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
	};
};

async function getSession(): Promise<{
	sessionId: string;
	wasteModuleId: string;
}> {
	const response = await fetch(
		"https://webmaps.bawbawshire.vic.gov.au/IntraMaps98/ApplicationEngine/Projects/?configId=00000000-0000-0000-0000-000000000000&appType=MapBuilder&project=700a73fd-2c9c-4b15-962f-07e74d32c0b5&datasetCode=",
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
				origin: "https://webmaps.bawbawshire.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to get session: ${response.status}`);
	}

	const sessionId = response.headers.get("x-intramaps-session");
	if (!sessionId) {
		throw new Error("No session ID returned");
	}

	const data = (await response.json()) as SessionResponse;

	// Find the BawBawNearMe_Waste module
	const wasteModule = data.moduleList.find(
		(module) => module.name === "BawBawNearMe_Waste",
	);
	if (!wasteModule) {
		throw new Error("BawBawNearMe_Waste module not found");
	}

	return { sessionId, wasteModuleId: wasteModule.id };
}

async function getFormTemplateId(
	sessionId: string,
	wasteModuleId: string,
): Promise<string> {
	const response = await fetch(
		`https://webmaps.bawbawshire.vic.gov.au/IntraMaps98/ApplicationEngine/Modules/?IntraMapsSession=${sessionId}`,
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
				origin: "https://webmaps.bawbawshire.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				module: wasteModuleId,
			}),
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to get form: ${response.status}`);
	}

	const data = (await response.json()) as FormResponse;

	// Find the form with name containing "address[Address]"
	const addressForm = data.forms.find((form) =>
		form.name.includes("address[Address]"),
	);

	if (!addressForm) {
		throw new Error("Address form not found");
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
		`https://webmaps.bawbawshire.vic.gov.au/IntraMaps98/ApplicationEngine/Search/?infoPanelWidth=0&mode=Refresh&form=${formTemplateId}&resubmit=false&IntraMapsSession=${sessionId}`,
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
				origin: "https://webmaps.bawbawshire.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				fields: [address],
			}),
		},
	);

	if (!response.ok) {
		throw new Error(`Failed to search address: ${response.status}`);
	}

	const data = (await response.json()) as AddressSearchResponse;

	if (!data.fullText || data.fullText.length === 0) {
		throw new Error("No results found for this address");
	}

	const firstResult = data.fullText[0];
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
		`https://webmaps.bawbawshire.vic.gov.au/IntraMaps98/ApplicationEngine/Search/Refine/Set?IntraMapsSession=${sessionId}`,
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
				origin: "https://webmaps.bawbawshire.vic.gov.au",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
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
		throw new Error(`Failed to get waste info: ${response.status}`);
	}

	const data = (await response.json()) as WasteInfoResponse;

	return data;
}

function getNextCollectionDate(collectionDay: string): number | null {
	// Extract the day name from strings like "Thursday (Declared)"
	const dayMatch = collectionDay.match(/^(\w+)/);
	if (!dayMatch) return null;

	const dayName = dayMatch[1];
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
	// Parse date string like "31/07/2025" to Unix timestamp
	const match = dateString.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
	if (!match) return null;

	const [, day, month, year] = match;

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

	return Math.floor(melbourneDate.toSeconds());
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
		console.error("Invalid response structure: missing fields");
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
			case "General Rubbish Collection Day":
				dates.landfillWaste = getNextCollectionDate(value);
				break;
			case "Next Mixed Recycling Date":
				dates.recycling = parseDateString(value);
				break;
			case "Next Garden Organics Date":
				dates.foodAndGardenWaste = parseDateString(value);
				break;
			case "Next Glass Recycling Date":
				dates.glass = parseDateString(value);
				break;
		}
	}

	return dates;
}

export async function fetchBawBawShireData(placeDetails: GooglePlaceDetails) {
	const addressComponents = extractAddressComponents(placeDetails);
	const searchQuery = getSearchAddress(
		addressComponents,
		COUNCIL_NAMES.BAW_BAW_SHIRE,
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
		console.error("Baw Baw Shire API error:", error);
		throw new Error("Failed to fetch data from Baw Baw Shire council");
	}
}
