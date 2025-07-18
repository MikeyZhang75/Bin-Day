import { DateTime } from "luxon";
import type { GooglePlaceDetails } from "@/types/googlePlaces";
import type { WasteCollectionDates } from "../../councilServices";
import {
	COUNCIL_NAMES,
	CouncilAPIError,
	InvalidResponseError,
	logError,
} from "../core";

// Zone configuration with bin collection reference dates
const ZONE_CONFIG: Record<
	string,
	{
		description: string;
		greenBin: string;
		yellowBin: string;
		redBin: string;
		purpleBin: string;
	}
> = {
	"Monday A": {
		description: "Shepparton South-West",
		greenBin: "2024-04-01",
		yellowBin: "2024-04-01",
		redBin: "2024-04-08",
		purpleBin: "2024-06-10",
	},
	"Monday B": {
		description: "Rural North-West",
		greenBin: "2024-04-01",
		yellowBin: "2024-04-08",
		redBin: "2024-04-01",
		purpleBin: "2024-06-03",
	},
	"Monday C": {
		description: "Shepparton South-East",
		greenBin: "2024-04-01",
		yellowBin: "2024-04-01",
		redBin: "2024-04-08",
		purpleBin: "2024-06-24",
	},
	"Monday D": {
		description: "Rural South-West",
		greenBin: "2024-04-01",
		yellowBin: "2024-04-08",
		redBin: "2024-04-01",
		purpleBin: "2024-06-17",
	},
	"Tuesday A": {
		description: "Shepparton South-East and Rural East",
		greenBin: "2024-04-02",
		yellowBin: "2024-04-02",
		redBin: "2024-04-09",
		purpleBin: "2024-06-11",
	},
	"Tuesday B": {
		description: "Shepparton North-Central",
		greenBin: "2024-04-02",
		yellowBin: "2024-04-09",
		redBin: "2024-04-02",
		purpleBin: "2024-06-04",
	},
	"Tuesday C": {
		description: "Rural South-East",
		greenBin: "2024-04-02",
		yellowBin: "2024-04-02",
		redBin: "2024-04-09",
		purpleBin: "2024-06-25",
	},
	"Tuesday D": {
		description: "Shepparton South-Central",
		greenBin: "2024-04-02",
		yellowBin: "2024-04-09",
		redBin: "2024-04-02",
		purpleBin: "2024-06-18",
	},
	"Wednesday A": {
		description: "Mooroopna",
		greenBin: "2024-04-03",
		yellowBin: "2024-04-03",
		redBin: "2024-04-10",
		purpleBin: "2024-06-12",
	},
	"Wednesday B": {
		description: "Tatura North and Midland Highway",
		greenBin: "2024-04-03",
		yellowBin: "2024-04-10",
		redBin: "2024-04-03",
		purpleBin: "2024-06-05",
	},
	"Wednesday C": {
		description: "Mooroopna West",
		greenBin: "2024-04-03",
		yellowBin: "2024-04-03",
		redBin: "2024-04-10",
		purpleBin: "2024-06-26",
	},
	"Wednesday D": {
		description: "Tatura South",
		greenBin: "2024-04-03",
		yellowBin: "2024-04-10",
		redBin: "2024-04-03",
		purpleBin: "2024-06-19",
	},
	"Thursday A": {
		description: "Kialla West",
		greenBin: "2024-04-04",
		yellowBin: "2024-04-04",
		redBin: "2024-04-11",
		purpleBin: "2024-06-13",
	},
	"Thursday B": {
		description: "Shepparton North-East",
		greenBin: "2024-04-04",
		yellowBin: "2024-04-11",
		redBin: "2024-04-04",
		purpleBin: "2024-06-06",
	},
	"Thursday C": {
		description: "Kialla",
		greenBin: "2024-04-04",
		yellowBin: "2024-04-04",
		redBin: "2024-04-11",
		purpleBin: "2024-06-27",
	},
	"Thursday D": {
		description: "Shepparton East",
		greenBin: "2024-04-04",
		yellowBin: "2024-04-11",
		redBin: "2024-04-04",
		purpleBin: "2024-06-20",
	},
	"Friday A": {
		description: "Shepparton North-West",
		greenBin: "2024-04-05",
		yellowBin: "2024-04-05",
		redBin: "2024-04-12",
		purpleBin: "2024-06-14",
	},
	"Friday B": {
		description: "Rural North",
		greenBin: "2024-04-05",
		yellowBin: "2024-04-12",
		redBin: "2024-04-05",
		purpleBin: "2024-06-07",
	},
	"Friday C": {
		description: "Shepparton North-West-West",
		greenBin: "2024-04-05",
		yellowBin: "2024-04-05",
		redBin: "2024-04-12",
		purpleBin: "2024-06-28",
	},
	"Friday D": {
		description: "Shepparton North",
		greenBin: "2024-04-05",
		yellowBin: "2024-04-12",
		redBin: "2024-04-05",
		purpleBin: "2024-06-21",
	},
};

// Collection schedules
const WEEKLY_INTERVAL = 7;
const FORTNIGHTLY_INTERVAL = 14;
const FOUR_WEEKLY_INTERVAL = 28;

// Christmas 2024 offset dates
const CHRISTMAS_2024_START = DateTime.fromISO("2024-12-25", {
	zone: "Australia/Melbourne",
});
const CHRISTMAS_2024_END = DateTime.fromISO("2025-01-05", {
	zone: "Australia/Melbourne",
});

function getNextCollectionDate(
	referenceDate: DateTime,
	interval: number,
	currentDate: DateTime,
	isChristmasAffected: boolean,
): DateTime | null {
	// Calculate how many intervals have passed since reference date
	const daysSinceReference = Math.floor(
		currentDate.diff(referenceDate, "days").days,
	);
	const intervalsSinceReference = Math.floor(daysSinceReference / interval);

	// Calculate next collection date
	let nextDate = referenceDate.plus({
		days: (intervalsSinceReference + 1) * interval,
	});

	// If the next date is in the past, move to the next interval
	if (nextDate < currentDate) {
		nextDate = nextDate.plus({ days: interval });
	}

	// Apply Christmas offset for Wednesday, Thursday, Friday zones
	if (
		isChristmasAffected &&
		nextDate >= CHRISTMAS_2024_START &&
		nextDate < CHRISTMAS_2024_END
	) {
		nextDate = nextDate.plus({ days: 1 });
	}

	return nextDate;
}

function getNextBinDates(
	zoneName: string,
	currentDate: DateTime = DateTime.now().setZone("Australia/Melbourne"),
): WasteCollectionDates {
	const zoneConfig = ZONE_CONFIG[zoneName];
	if (!zoneConfig) {
		throw new InvalidResponseError(`Unknown zone: ${zoneName}`);
	}

	// Check if this zone is affected by Christmas changes (Wednesday, Thursday, Friday zones)
	const isChristmasAffected =
		zoneName.includes("Wednesday") ||
		zoneName.includes("Thursday") ||
		zoneName.includes("Friday");

	// Parse reference dates
	const greenBinRef = DateTime.fromISO(zoneConfig.greenBin, {
		zone: "Australia/Melbourne",
	});
	const yellowBinRef = DateTime.fromISO(zoneConfig.yellowBin, {
		zone: "Australia/Melbourne",
	});
	const redBinRef = DateTime.fromISO(zoneConfig.redBin, {
		zone: "Australia/Melbourne",
	});
	const purpleBinRef = DateTime.fromISO(zoneConfig.purpleBin, {
		zone: "Australia/Melbourne",
	});

	// Calculate next collection dates
	const greenBinNext = getNextCollectionDate(
		greenBinRef,
		WEEKLY_INTERVAL,
		currentDate,
		isChristmasAffected,
	);
	const yellowBinNext = getNextCollectionDate(
		yellowBinRef,
		FORTNIGHTLY_INTERVAL,
		currentDate,
		isChristmasAffected,
	);
	const redBinNext = getNextCollectionDate(
		redBinRef,
		FORTNIGHTLY_INTERVAL,
		currentDate,
		isChristmasAffected,
	);
	const purpleBinNext = getNextCollectionDate(
		purpleBinRef,
		FOUR_WEEKLY_INTERVAL,
		currentDate,
		isChristmasAffected,
	);

	return {
		landfillWaste: redBinNext ? Math.floor(redBinNext.toSeconds()) : null,
		recycling: yellowBinNext ? Math.floor(yellowBinNext.toSeconds()) : null,
		foodAndGardenWaste: greenBinNext
			? Math.floor(greenBinNext.toSeconds())
			: null,
		hardWaste: null, // Shepparton doesn't have regular hard waste collection
		glass: purpleBinNext ? Math.floor(purpleBinNext.toSeconds()) : null,
	};
}

export async function fetchSheppartonData(
	placeDetails: GooglePlaceDetails,
	zoneName?: string,
): Promise<WasteCollectionDates> {
	try {
		// For testing purposes, if a zone name is provided, use it directly
		if (zoneName && ZONE_CONFIG[zoneName]) {
			return getNextBinDates(zoneName);
		}

		// Extract coordinates from place details
		const lat = placeDetails.geometry.location.lat;
		const lng = placeDetails.geometry.location.lng;

		// Call Shepparton's API to determine the zone
		const zoneApiUrl = `https://greatershepparton.com.au/external/gis-api/bin-zone-name-from-location?latitude=${lat}&longitude=${lng}`;

		const response = await fetch(zoneApiUrl, {
			method: "GET",
			headers: {
				"User-Agent":
					"Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36",
				"Accept-Encoding": "gzip, deflate, br, zstd",
			},
		});

		if (!response.ok) {
			throw new InvalidResponseError(
				`Failed to fetch zone data: ${response.status} ${response.statusText}`,
			);
		}

		// The API returns a simple string with the zone name in quotes
		const zoneText = await response.text();
		const detectedZone = zoneText.replace(/"/g, "").trim();

		if (!detectedZone || !ZONE_CONFIG[detectedZone]) {
			throw new InvalidResponseError(
				`Invalid zone returned from API: ${detectedZone}`,
			);
		}

		// Use the detected zone to calculate collection dates
		return getNextBinDates(detectedZone);
	} catch (error) {
		logError(COUNCIL_NAMES.SHEPPARTON, error);
		if (
			error instanceof CouncilAPIError ||
			error instanceof InvalidResponseError
		) {
			throw error;
		}
		throw new CouncilAPIError(COUNCIL_NAMES.SHEPPARTON);
	}
}

// Export for testing
export { getNextBinDates, ZONE_CONFIG };
