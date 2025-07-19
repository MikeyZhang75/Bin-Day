// Granicus HTML parsing utilities

import { DateTime } from "luxon";
import type { WasteCollectionDates } from "../../../councilServices";
import type { WasteTypeRegexPatterns } from "./types";

export function parseGranicusWasteCollectionDates(
	html: string,
	patterns: WasteTypeRegexPatterns,
): WasteCollectionDates {
	const dates: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	// Parse each waste type using provided patterns
	if (patterns.landfillWaste) {
		const match = html.match(patterns.landfillWaste);
		if (match) {
			dates.landfillWaste = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.recycling) {
		const match = html.match(patterns.recycling);
		if (match) {
			dates.recycling = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.foodAndGardenWaste) {
		const match = html.match(patterns.foodAndGardenWaste);
		if (match) {
			dates.foodAndGardenWaste = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.hardWaste) {
		const match = html.match(patterns.hardWaste);
		if (match) {
			dates.hardWaste = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	if (patterns.glass) {
		const match = html.match(patterns.glass);
		if (match) {
			dates.glass = parseDateToUnixTimestamp(match[1].trim());
		}
	}

	return dates;
}

export function parseDateToUnixTimestamp(dateString: string): number | null {
	// Parse date string like "Fri 25/7/2025" to Unix timestamp
	const match = dateString.match(/\w+\s+(\d{1,2})\/(\d{1,2})\/(\d{4})/);
	if (!match) return null;

	const [, day, month, year] = match;

	// Use Luxon to create a date at midnight in Melbourne timezone
	// Luxon automatically handles DST transitions
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

	// Return Unix timestamp in seconds
	return Math.floor(melbourneDate.toSeconds());
}
