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
		rows: {
			controls: {
				caption: string;
				templateId: string;
				type: string;
				queryParameter: string;
			}[];
		}[];
	}[];
};

type ComboContentsResponse = {
	header: {
		warnings: string[];
		authenticationRequired: boolean;
	};
	items: {
		key: string;
	}[];
};

type SearchResponse = {
	header: {
		warnings: string[];
		authenticationRequired: boolean;
	};
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
		info2: unknown | null;
		info3: unknown | null;
		databaseConstraints: unknown[];
	};
};

async function getSession(): Promise<{
	sessionId: string;
	wasteModuleId: string;
}> {
	const response = await fetch(
		"https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/Projects/?configId=9d473bd9-fbfa-4258-a7fd-297b913b135f&appType=MapBuilder&project=60a6ba9d-15f2-4049-bac4-d7e2965607dd&datasetCode=&includeDisabledModules=true",
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
				origin: "https://campaspe.spatial.t1cloud.com",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"sec-fetch-storage-access": "active",
				referer:
					"https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/frontend/mapbuilder/default.htm?configId=9d473bd9-fbfa-4258-a7fd-297b913b135f&liteConfigId=ca2d5b3c-5654-4055-87a5-243521716da4&title=V2FzdGUlMjBDb2xsZWN0aW9uJTIwTWFw",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.CAMPASPE_SHIRE, response.status);
	}

	const sessionId = response.headers.get("x-intramaps-session");
	if (!sessionId) {
		throw new InvalidResponseError("No session ID returned");
	}

	const data = await safeJsonParse<SessionResponse>(response);

	// Find the WasteCollection module
	const wasteModule = data.moduleList.find(
		(module) => module.name === "WasteCollection",
	);
	if (!wasteModule) {
		throw new InvalidResponseError("WasteCollection module not found");
	}

	return { sessionId, wasteModuleId: wasteModule.id };
}

async function getFormTemplateId(
	sessionId: string,
	wasteModuleId: string,
): Promise<{ formTemplateId: string; comboTemplateId: string }> {
	const response = await fetch(
		`https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/Modules/?IntraMapsSession=${sessionId}`,
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
				origin: "https://campaspe.spatial.t1cloud.com",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"sec-fetch-storage-access": "active",
				referer:
					"https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/frontend/mapbuilder/default.htm?configId=9d473bd9-fbfa-4258-a7fd-297b913b135f&liteConfigId=ca2d5b3c-5654-4055-87a5-243521716da4&title=V2FzdGUlMjBDb2xsZWN0aW9uJTIwTWFw",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				module: wasteModuleId,
				includeBasemaps: true,
			}),
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.CAMPASPE_SHIRE, response.status);
	}

	const data = await safeJsonParse<FormResponse>(response);

	// Find the Address form
	const addressForm = data.forms.find((form) => form.name === "Address");

	if (!addressForm) {
		throw new InvalidResponseError("Address form not found");
	}

	// Find the combo control to get its templateId
	const comboControl = addressForm.rows[0]?.controls.find(
		(control) => control.type === "combo",
	);

	if (!comboControl) {
		throw new InvalidResponseError("Address combo control not found");
	}

	return {
		formTemplateId: addressForm.templateId,
		comboTemplateId: comboControl.templateId,
	};
}

async function getAddressSuggestions(
	sessionId: string,
	comboTemplateId: string,
	query: string,
): Promise<string[]> {
	const response = await fetch(
		`https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/Search/ComboContents?IntraMapsSession=${sessionId}`,
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
				origin: "https://campaspe.spatial.t1cloud.com",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"sec-fetch-storage-access": "active",
				referer:
					"https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/frontend/mapbuilder/default.htm?configId=9d473bd9-fbfa-4258-a7fd-297b913b135f&liteConfigId=ca2d5b3c-5654-4055-87a5-243521716da4&title=V2FzdGUlMjBDb2xsZWN0aW9uJTIwTWFw",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				templateId: comboTemplateId,
				queryParameter: query,
				selectionLayersFilter: "d9cf7936-4f30-421e-a2e2-565f7d936cab",
			}),
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.CAMPASPE_SHIRE, response.status);
	}

	const data = await safeJsonParse<ComboContentsResponse>(response);

	return data.items.map((item) => item.key);
}

async function searchAddress(
	sessionId: string,
	formTemplateId: string,
	address: string,
): Promise<SearchResponse> {
	const response = await fetch(
		`https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/Search/?infoPanelWidth=0&mode=Refresh&form=${formTemplateId}&resubmit=false&selectionLayersFilter=d9cf7936-4f30-421e-a2e2-565f7d936cab&IntraMapsSession=${sessionId}`,
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
				origin: "https://campaspe.spatial.t1cloud.com",
				"sec-fetch-site": "same-origin",
				"sec-fetch-mode": "cors",
				"sec-fetch-dest": "empty",
				"sec-fetch-storage-access": "active",
				referer:
					"https://campaspe.spatial.t1cloud.com/spatial/IntraMaps/ApplicationEngine/frontend/mapbuilder/default.htm?configId=9d473bd9-fbfa-4258-a7fd-297b913b135f&liteConfigId=ca2d5b3c-5654-4055-87a5-243521716da4&title=V2FzdGUlMjBDb2xsZWN0aW9uJTIwTWFw",
				"accept-language": "en-GB,en-US;q=0.9,en;q=0.8,zh-CN;q=0.7,zh;q=0.6",
				priority: "u=1, i",
			},
			body: JSON.stringify({
				fields: [address],
			}),
		},
	);

	if (!response.ok) {
		throw new CouncilAPIError(COUNCIL_NAMES.CAMPASPE_SHIRE, response.status);
	}

	const data = await safeJsonParse<SearchResponse>(response);

	if (!data.infoPanels?.info1?.feature) {
		throw new AddressNotFoundError();
	}

	return data;
}

function parseDateString(dateString: string): number | null {
	// Parse date string like "Tuesday, 22 July 2025" to Unix timestamp
	const match = dateString.match(/\w+,\s+(\d{1,2})\s+(\w+)\s+(\d{4})/);
	if (!match) return null;

	const [, dayStr, monthStr, yearStr] = match;

	const monthMap: Record<string, number> = {
		January: 1,
		February: 2,
		March: 3,
		April: 4,
		May: 5,
		June: 6,
		July: 7,
		August: 8,
		September: 9,
		October: 10,
		November: 11,
		December: 12,
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

function parseWasteInfoResponse(data: SearchResponse): WasteCollectionDates {
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
			case "Next Waste Collection":
				dates.landfillWaste = parseDateString(value);
				break;
			case "Next Recycle Collection":
				dates.recycling = parseDateString(value);
				break;
			case "Next Organics Collection":
				dates.foodAndGardenWaste = parseDateString(value);
				break;
		}
	}

	return dates;
}

export async function fetchCampaspeData(placeDetails: GooglePlaceDetails) {
	const addressComponents = extractAddressComponents(placeDetails);
	const searchQuery = getSearchAddress(
		addressComponents,
		COUNCIL_NAMES.CAMPASPE_SHIRE,
	);

	try {
		// Step 1: Get session and waste module ID
		const { sessionId, wasteModuleId } = await getSession();

		// Step 2: Get form template ID and combo template ID
		const { formTemplateId, comboTemplateId } = await getFormTemplateId(
			sessionId,
			wasteModuleId,
		);

		// Step 3: Get address suggestions
		const suggestions = await getAddressSuggestions(
			sessionId,
			comboTemplateId,
			searchQuery,
		);

		if (suggestions.length === 0) {
			throw new AddressNotFoundError();
		}

		// Step 4: Use the first suggestion
		const selectedAddress = suggestions[0];

		// Step 5: Search for the selected address
		const wasteInfo = await searchAddress(
			sessionId,
			formTemplateId,
			selectedAddress,
		);

		// Parse and return the waste collection dates
		return parseWasteInfoResponse(wasteInfo);
	} catch (error) {
		logError(COUNCIL_NAMES.CAMPASPE_SHIRE, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof AddressNotFoundError ||
			error instanceof InvalidResponseError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.CAMPASPE_SHIRE);
	}
}
