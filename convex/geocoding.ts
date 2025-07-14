import { v } from "convex/values";
import { action } from "./_generated/server";

export const suggestAddress = action({
	args: {
		address: v.string(),
	},
	handler: async (_, args) => {
		const { address } = args;
		const countryCode = "AUS";
		const maxSuggestions = 3;

		const params = new URLSearchParams({
			text: address,
			countryCode,
			maxSuggestions: maxSuggestions.toString(),
			f: "json",
		});

		const url = `https://geocode.arcgis.com/arcgis/rest/services/World/GeocodeServer/suggest?${params}`;

		try {
			const response = await fetch(url);
			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();

			if (!data.suggestions || !Array.isArray(data.suggestions)) {
				return { suggestions: [] };
			}

			// Return the formatted suggestions
			return {
				suggestions: data.suggestions.map((suggestion: {
					text: string;
					magicKey: string;
					isCollection?: boolean;
				}) => ({
					text: suggestion.text,
					magicKey: suggestion.magicKey,
					isCollection: suggestion.isCollection || false,
				})),
			};
		} catch (error) {
			console.error("Geocoding error:", error);
			throw new Error("Failed to fetch address suggestions");
		}
	},
});
