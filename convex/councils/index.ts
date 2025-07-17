// Centralized council types and constants

export const COUNCIL_NAMES = {
	CITY_OF_MONASH: "City of Monash",
	ALPINE_SHIRE: "Alpine Shire",
	CITY_OF_BALLARAT: "City of Ballarat",
	BANYULE_CITY: "Banyule City",
	GANNAWARRA_SHIRE: "Gannawarra Shire",
	BAW_BAW_SHIRE: "Baw Baw Shire",
	BAYSIDE_CITY: "Bayside City",
} as const;

export type CouncilName = (typeof COUNCIL_NAMES)[keyof typeof COUNCIL_NAMES];
