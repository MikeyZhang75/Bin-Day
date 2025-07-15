import { v } from "convex/values";
import type {
	GoogleAutocompleteResponse,
	GooglePlaceDetailsResponse,
} from "@/types/googlePlaces";
import { action } from "./_generated/server";

// Store the API key securely in environment variables
const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

export const autocomplete = action({
	args: {
		input: v.string(),
		sessionToken: v.string(),
	},
	handler: async (_, args) => {
		const { input, sessionToken } = args;

		if (!GOOGLE_PLACES_API_KEY) {
			throw new Error("Google Places API key not configured");
		}

		const params = new URLSearchParams({
			input,
			key: GOOGLE_PLACES_API_KEY,
			sessiontoken: sessionToken,
			components: "country:au",
			types: "address",
		});

		const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?${params}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
				console.error(
					"Google Places API error:",
					data.status,
					data.error_message,
				);
				throw new Error(data.error_message || "Failed to fetch predictions");
			}

			return {
				predictions: data.predictions || [],
				status: data.status,
			} as GoogleAutocompleteResponse;
		} catch (error) {
			console.error("Autocomplete error:", error);
			throw new Error("Failed to fetch address predictions");
		}
	},
});

export const placeDetails = action({
	args: {
		placeId: v.string(),
		sessionToken: v.string(),
	},
	handler: async (_, args) => {
		const { placeId, sessionToken } = args;

		if (!GOOGLE_PLACES_API_KEY) {
			throw new Error("Google Places API key not configured");
		}

		const params = new URLSearchParams({
			place_id: placeId,
			key: GOOGLE_PLACES_API_KEY,
			sessiontoken: sessionToken,
			fields: "formatted_address,address_components,geometry",
		});

		const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (data.status !== "OK") {
				console.error(
					"Google Places API error:",
					data.status,
					data.error_message,
				);
				throw new Error(data.error_message || "Failed to fetch place details");
			}

			return {
				result: data.result,
				status: data.status,
			} as GooglePlaceDetailsResponse;
		} catch (error) {
			console.error("Place details error:", error);
			throw new Error("Failed to fetch place details");
		}
	},
});
