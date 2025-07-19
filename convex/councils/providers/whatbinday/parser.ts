// WhatBinDay HTML parser

import { DateTime } from "luxon";
import type { WasteCollectionDates } from "../../../councilServices";
import { AddressNotFoundError } from "../../core";
import type { ParsedBinEvent } from "./types";

const MONTH_MAP: Record<string, number> = {
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

const BIN_TYPE_MAP: Record<string, keyof WasteCollectionDates> = {
	Landfill: "landfillWaste",
	Recycle: "recycling",
	Green: "foodAndGardenWaste",
	Glass: "glass",
};

function parseBinEvents(html: string): ParsedBinEvent[] {
	const events: ParsedBinEvent[] = [];

	// Extract month and year from calendar headings
	const monthYearRegex = /<h3 class="WBD-cal-heading">([\w\s]+)<\/h3>/g;
	const monthYearMatches = [...html.matchAll(monthYearRegex)];

	// For each month section
	for (const monthMatch of monthYearMatches) {
		const monthYear = monthMatch[1]; // e.g., "July 2025"
		const [monthName, year] = monthYear.split(" ");

		// Find the calendar div for this month
		const monthIndex = monthMatch.index || 0;
		const nextMonthIndex = html.indexOf(
			'<h3 class="WBD-cal-heading">',
			monthIndex + 1,
		);
		const monthSection = html.substring(
			monthIndex,
			nextMonthIndex > 0 ? nextMonthIndex : undefined,
		);

		// Find all days with events - look for complete table structure within each event day
		const eventDayRegex =
			/<span[^>]*class="[^"]*WBD-cal-date[^>]*WBD-cal-event-day[^>]*"[^>]*>[\s\S]*?<div class="WBD-cal-day-number">(\d+)<\/div>[\s\S]*?<table>([\s\S]*?)<\/table>[\s\S]*?<\/span>/g;
		const eventDayMatches = [...monthSection.matchAll(eventDayRegex)];

		for (const match of eventDayMatches) {
			const day = Number.parseInt(match[1]);
			const tableContent = match[2];

			// Extract bin types from the table cells
			const binTypes: string[] = [];

			// Find all td elements with bin classes in the table content
			const binCellRegex =
				/<td[^>]*class="[^"]*WBD-cal-event-item-(\w+)"[^>]*>/g;
			const binCells = [...tableContent.matchAll(binCellRegex)];

			for (const cellMatch of binCells) {
				const binClass = cellMatch[1];
				switch (binClass) {
					case "WasteBin":
						binTypes.push("Landfill");
						break;
					case "RecycleBin":
						binTypes.push("Recycle");
						break;
					case "GreenBin":
						binTypes.push("Green");
						break;
					case "GlassBin":
						binTypes.push("Glass");
						break;
				}
			}

			if (binTypes.length > 0) {
				const month = MONTH_MAP[monthName];
				if (month) {
					const date = DateTime.fromObject(
						{
							year: Number.parseInt(year),
							month: month,
							day: day,
							hour: 0,
							minute: 0,
							second: 0,
						},
						{ zone: "Australia/Melbourne" },
					);

					events.push({ date, binTypes });
				}
			}
		}
	}

	return events;
}

export function parseHtmlResponse(html: string): WasteCollectionDates {
	// Initialize result
	const result: WasteCollectionDates = {
		landfillWaste: null,
		recycling: null,
		foodAndGardenWaste: null,
		hardWaste: null,
		glass: null,
	};

	// Parse HTML response
	const events = parseBinEvents(html);

	if (events.length === 0) {
		throw new AddressNotFoundError();
	}

	const now = DateTime.now().setZone("Australia/Melbourne");

	for (const event of events) {
		// Skip past events
		if (event.date < now) {
			continue;
		}

		const eventTimestamp = Math.floor(event.date.toSeconds());

		for (const binType of event.binTypes) {
			const wasteType = BIN_TYPE_MAP[binType];
			if (!wasteType) {
				console.warn(`Unknown bin type: ${binType}`);
				continue;
			}

			// Update if this is the nearest date for this waste type
			if (result[wasteType] === null || eventTimestamp < result[wasteType]) {
				result[wasteType] = eventTimestamp;
			}
		}
	}

	return result;
}
