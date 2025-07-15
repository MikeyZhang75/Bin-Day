import { v } from "convex/values";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import { action } from "./_generated/server";

export type CouncilDataResult = {
	id: string | null;
	data: unknown;
	message?: string;
};

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
// Council-specific API handlers
const councilHandlers: Record<
	string,
	(placeDetails: GooglePlaceDetails) => Promise<CouncilDataResult>
> = {
	"City of Monash": fetchMonashData,
};

async function fetchMonashData(placeDetails: GooglePlaceDetails) {
	// Extract address components
	const streetNumber =
		placeDetails.address_components.find((component) =>
			component.types.includes("street_number"),
		)?.long_name || "";

	const route =
		placeDetails.address_components.find((component) =>
			component.types.includes("route"),
		)?.long_name || "";

	const locality =
		placeDetails.address_components.find((component) =>
			component.types.includes("locality"),
		)?.long_name || "";

	// Construct search query: street_number + route + locality
	const searchQuery = `${streetNumber} ${route} ${locality}`.trim();

	const url = `https://www.monash.vic.gov.au/api/v1/myarea/search?keywords=${encodeURIComponent(searchQuery)}`;

	console.log("searchQuery", searchQuery);
	console.log("url", url);

	try {
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
		console.log("Monash API response:", data);

		// Extract the ID from the response
		// The API returns an object with Items array
		if (data && data.Items.length > 0) {
			const firstResult = data.Items[0];
			return {
				id: firstResult.Id,
				data: {
					addressSingleLine: firstResult.AddressSingleLine,
					municipalSubdivision: firstResult.MunicipalSubdivision,
					latLon: firstResult.LatLon,
					score: firstResult.Score,
				},
			};
		}

		return {
			id: null,
			data: null,
			message: "No results found for this address",
		};
	} catch (error) {
		console.error("Monash API error:", error);
		throw new Error("Failed to fetch data from Monash council");
	}
}

export const getCouncilData = action({
	args: {
		council: v.string(),
		placeDetails: v.object({
			address_components: v.array(
				v.object({
					long_name: v.string(),
					short_name: v.string(),
					types: v.array(v.string()),
				}),
			),
			formatted_address: v.string(),
			geometry: v.object({
				location: v.object({
					lat: v.number(),
					lng: v.number(),
				}),
				viewport: v.optional(
					v.object({
						northeast: v.object({
							lat: v.number(),
							lng: v.number(),
						}),
						southwest: v.object({
							lat: v.number(),
							lng: v.number(),
						}),
					}),
				),
			}),
		}),
	},
	handler: async (_, args) => {
		const { council, placeDetails } = args;

		// Normalize council name for matching
		const normalizedCouncil = council.trim();

		// Check if we have a handler for this council
		const handler = councilHandlers[normalizedCouncil];

		if (!handler) {
			console.log(`No handler found for council: ${normalizedCouncil}`);
			return {
				supported: false,
				council: normalizedCouncil,
				message: `Council "${normalizedCouncil}" is not currently supported`,
			};
		}

		try {
			const result = await handler(placeDetails);
			return {
				supported: true,
				council: normalizedCouncil,
				...result,
			};
		} catch (error) {
			console.error(`Error fetching data for ${normalizedCouncil}:`, error);
			throw error;
		}
	},
});
